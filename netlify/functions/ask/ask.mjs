// "Ask Mohammad": one Netlify Function behind POST /api/ask.
//
//   { sessionId, messages: [{ role, content }, ...] }   -> streamed answer (NDJSON)
//   { type: "lead", sessionId, email }                  -> saves a contact email
//   { type: "event", sessionId, event, detail, path, ref, visitorId, tag, seconds, scroll }
//                                                        -> logs a visit, a click or time on a page
//                                                           (also accepted from the sites in EVENT_SITES)
//
// Every limit fails closed: if a counter cannot be read or written, or the
// API key or the twin prompt is missing, the visitor is pointed at the real
// contact link instead of getting an answer.

import Anthropic from '@anthropic-ai/sdk';
import { getStore } from '@netlify/blobs';
import { createHmac } from 'node:crypto';
import { TWIN_READY, SYSTEM_PROMPT, KNOWLEDGE } from './prompt.generated.mjs';

export const config = { path: '/api/ask' };

const MODEL = 'claude-sonnet-5-5';

const num = (name, fallback) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// Mohammad's other sites may send visit, click and leave events here, so one
// table covers all of them. They can never use the chat or the email form.
const EVENT_SITES = ['zayedsoftwarellc.com', 'cfafoothill.com', 'homeworkplanner.app'];
const bareHost = (host) => host.toLowerCase().replace(/^www\./, '');

const LIMITS = {
  // No per-visit question limit. The per-visitor and site-wide daily caps
  // below are what bound cost.
  // The page sends the last 3 exchanges plus the new question. Longer
  // histories (an older copy of the page) are trimmed to the most recent 7.
  historyMessages: 7,
  historyAccepted: 14,
  assistantChars: 1500,
  inputChars: 500,
  maxOutputTokens: num('ASK_MAX_OUTPUT_TOKENS', 700),
  dailyTotal: num('ASK_DAILY_CAP', 300),
  ipPerDay: num('ASK_IP_DAILY_CAP', 40),
  ipPerMinute: num('ASK_IP_MINUTE_CAP', 6),
  leadsPerSession: 2,
  leadsPerIpDay: 5,
  leadsDailyTotal: num('ASK_LEADS_DAILY_CAP', 100),
  eventsPerMinute: 40,
  eventsPerIpDay: 300,
  eventsDailyTotal: num('ASK_EVENTS_DAILY_CAP', 20000),
};

// The UI parses these markers, so the contract lives next to the code that
// depends on it rather than only in twin/system-prompt.md.
const UI_CONTRACT = `This chat widget shows plain text only: no markdown, no asterisks, no headings, no bullet characters. Write web addresses as plain text. The markers described above are the only special syntax the page understands.`;

const MARKER_RE = /\[\[(case:[a-z-]+|resume|contact|lead)\]\]/g;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const closed = (reason) => {
  console.error(`[ask] closed: ${reason}`);
  return json(503, { error: 'closed' });
};

const today = () => new Date().toISOString().slice(0, 10);

/** Visitors are counted by a keyed, daily-rotating hash. The raw IP is never stored or logged. */
function hashIp(ip, secret) {
  return createHmac('sha256', secret).update(`${today()}|${ip}`).digest('hex').slice(0, 32);
}

/** Where the visitor is and what they are on. Country, region and city come from Netlify; no raw IP is kept. */
function visitorInfo(req, context) {
  const ua = (req.headers.get('user-agent') || '').slice(0, 300);
  const device = /bot|crawl|spider|slurp|preview|headless/i.test(ua) ? 'bot'
    : /ipad|tablet/i.test(ua) ? 'tablet'
    : /mobi|iphone|android/i.test(ua) ? 'mobile'
    : 'desktop';
  const geo = context.geo || {};
  return {
    country: geo.country?.code || null,
    region: geo.subdivision?.name || null,
    city: geo.city || null,
    device,
    user_agent: ua || null,
  };
}

const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');

const wholeNumber = (v, max) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : null;
};

/** Name of the network a visitor is on ("Google LLC", "Spectrum"), from a public
    IP lookup. The address is sent to ipwho.is for this and is never stored here. */
async function lookupNetworkName(ip) {
  if (!ip || ip === 'unknown' || /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|f[cd])/i.test(ip)) return null;
  const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,connection`, {
    signal: AbortSignal.timeout(1500),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const c = data?.success ? data.connection : null;
  if (!c) return null;
  return { network: clip(c.org || c.isp, 120) || null, network_domain: clip(c.domain, 120) || null };
}

async function readCount(store, key) {
  const v = await store.get(key, { type: 'json' });
  return v && typeof v.n === 'number' ? v.n : 0;
}

async function bump(store, key, n) {
  await store.setJSON(key, { n: n + 1 });
}

function validateMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > LIMITS.historyAccepted) return null;
  // Keep only the most recent messages; an odd count keeps the visitor's turn first.
  if (raw.length > LIMITS.historyMessages) raw = raw.slice(-LIMITS.historyMessages);
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const m = raw[i];
    const role = i % 2 === 0 ? 'user' : 'assistant';
    if (!m || m.role !== role || typeof m.content !== 'string') return null;
    let content = m.content.trim();
    if (!content) return null;
    if (role === 'user' && content.length > LIMITS.inputChars) return null;
    // Earlier answers come back from the browser, so they are cut to size, not trusted.
    if (role === 'assistant') content = content.slice(0, LIMITS.assistantChars);
    out.push({ role, content });
  }
  if (out[out.length - 1].role !== 'user') return null;
  return out;
}

async function supabaseInsert(table, row) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  // Accepts the project URL with or without the /rest/v1/ ending Supabase shows.
  const base = url.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  const res = await fetch(`${base}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: key,
      // Older JWT-style service_role keys also go in Authorization; the newer
      // sb_secret_ keys are sent in the apikey header only.
      ...(key.startsWith('eyJ') ? { authorization: `Bearer ${key}` } : {}),
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error(`supabase ${table} insert: ${res.status}`);
  return true;
}

// The chat's instructions and knowledge are private, so they are not in the
// repository. They live in one row of the Supabase table ask_twin and are
// read here, then kept in memory for a few minutes. A copy baked in at build
// time (twin/*.md, present only on Mohammad's machine) is used if the table
// cannot be read. With neither, the chat fails closed.
const TWIN_TTL_MS = 5 * 60 * 1000;
let twinCache = null; // { systemPrompt, knowledge, at }

async function fetchTwin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const base = url.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  const res = await fetch(`${base}/rest/v1/ask_twin?id=eq.current&select=system_prompt,knowledge`, {
    headers: {
      apikey: key,
      ...(key.startsWith('eyJ') ? { authorization: `Bearer ${key}` } : {}),
    },
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) throw new Error(`supabase ask_twin read: ${res.status}`);
  const row = (await res.json())[0];
  if (!row?.system_prompt || !row?.knowledge) return null;
  return { systemPrompt: row.system_prompt, knowledge: row.knowledge };
}

async function loadTwin(fetcher = fetchTwin) {
  if (twinCache && Date.now() - twinCache.at < TWIN_TTL_MS) return twinCache;
  try {
    const fresh = await fetcher();
    if (fresh) {
      twinCache = { ...fresh, at: Date.now() };
      return twinCache;
    }
  } catch (err) {
    console.error(`[ask] twin load failed: ${err?.message}`);
  }
  if (twinCache) return twinCache; // a stale copy beats none
  return TWIN_READY ? { systemPrompt: SYSTEM_PROMPT, knowledge: KNOWLEDGE, baked: true } : null;
}

export function createHandler(deps = {}) {
  const getClient = deps.getClient ?? (() => new Anthropic());
  const getLimitStore = deps.getLimitStore ?? (() => getStore('ask-limits'));
  const insert = deps.insert ?? supabaseInsert;
  const hasKey = deps.hasKey ?? (() => Boolean(process.env.ANTHROPIC_API_KEY));
  const lookupNetwork = deps.lookupNetwork ?? lookupNetworkName;
  const hashSecret = deps.hashSecret ?? (() => process.env.ASK_HASH_SECRET || process.env.ANTHROPIC_API_KEY);

  return async function handler(req, context = {}) {
    if (req.method !== 'POST') return json(405, { error: 'method' });

    // Browsers on other sites cannot use this endpoint, except the listed
    // sites, which may only send tracking events.
    let site = '';
    let otherSite = false;
    try { site = bareHost(new URL(req.url).host); } catch {}
    const origin = req.headers.get('origin');
    if (origin) {
      let originHost = '';
      let sameHost = false;
      try {
        originHost = new URL(origin).host;
        sameHost = originHost === new URL(req.url).host;
      } catch {}
      if (!sameHost) {
        if (!EVENT_SITES.includes(bareHost(originHost))) return json(403, { error: 'origin' });
        site = bareHost(originHost);
        otherSite = true;
      }
    }

    let body;
    try {
      const text = await req.text();
      if (text.length > 40000) return json(413, { error: 'too_large' });
      body = JSON.parse(text);
    } catch {
      return json(400, { error: 'bad_request' });
    }

    if (otherSite && body?.type !== 'event') return json(403, { error: 'origin' });

    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : '';
    if (!/^[a-zA-Z0-9-]{16,64}$/.test(sessionId)) return json(400, { error: 'bad_request' });

    const secret = hashSecret();
    if (!secret) return closed('no hash secret / API key');
    const ip = context.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown';
    const ipHash = hashIp(ip, secret);
    const day = today();

    let store;
    try {
      store = getLimitStore();
    } catch (err) {
      return closed(`limit store unavailable: ${err?.message}`);
    }

    const visitor = visitorInfo(req, context);

    // ---------- Visit and click events ----------
    // Tracking never blocks the visitor: every outcome is a quiet 204.
    if (body.type === 'event') {
      const quiet = new Response(null, { status: 204 });
      const event = body.event;
      if (!['visit', 'click', 'leave'].includes(event) || visitor.device === 'bot') return quiet;
      try {
        const key = `ev/${Math.floor(Date.now() / 60000)}/${ipHash}`;
        const dayKey = `evday/${day}/${ipHash}`;
        const allKey = `evtotal/${day}`;
        const [n, perDay, all] = await Promise.all([readCount(store, key), readCount(store, dayKey), readCount(store, allKey)]);
        // Past any of these the event is dropped quietly: per visitor per minute,
        // per visitor per day, and for the whole site per day.
        if (n >= LIMITS.eventsPerMinute || perDay >= LIMITS.eventsPerIpDay || all >= LIMITS.eventsDailyTotal) return quiet;
        await Promise.all([bump(store, key, n), bump(store, dayKey, perDay), bump(store, allKey, all)]);

        // The network name is looked up once per visitor per day, on a page visit.
        let net = null;
        if (event === 'visit') {
          try {
            const netKey = `net/${day}/${ipHash}`;
            net = await store.get(netKey, { type: 'json' });
            if (!net) {
              net = (await lookupNetwork(ip)) || { network: null, network_domain: null };
              await store.setJSON(netKey, net);
            }
          } catch (err) {
            console.error(`[ask] network lookup failed: ${err?.message}`);
          }
        }

        const visitorId = typeof body.visitorId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(body.visitorId) ? body.visitorId : null;
        await insert('ask_events', {
          site: site || null,
          session_id: sessionId,
          ip_hash: ipHash,
          event,
          detail: clip(body.detail, 200) || null,
          path: clip(body.path, 200) || null,
          referrer: clip(body.ref, 300) || null,
          visitor_id: visitorId,
          tag: clip(body.tag, 80).replace(/[^\w.\-\/ ]/g, '') || null,
          seconds: event === 'leave' ? wholeNumber(body.seconds, 3600) : null,
          scroll_pct: event === 'leave' ? wholeNumber(body.scroll, 100) : null,
          network: net?.network || null,
          network_domain: net?.network_domain || null,
          ...visitor,
        });
      } catch (err) {
        console.error(`[ask] event failed: ${err?.message}`);
      }
      return quiet;
    }

    // ---------- Lead capture ----------
    if (body.type === 'lead') {
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return json(400, { error: 'bad_email' });
      }
      try {
        const leadKey = `lead/${day}/${sessionId}`;
        // The session id comes from the browser, so the limits that hold are the
        // ones per visitor and for the whole site.
        const ipKey = `leadip/${day}/${ipHash}`;
        const allKey = `leadtotal/${day}`;
        const [leads, ipCount, all] = await Promise.all([readCount(store, leadKey), readCount(store, ipKey), readCount(store, allKey)]);
        if (leads >= LIMITS.leadsPerSession || ipCount >= LIMITS.leadsPerIpDay || all >= LIMITS.leadsDailyTotal) return json(429, { error: 'rate' });
        await Promise.all([bump(store, leadKey, leads), bump(store, ipKey, ipCount), bump(store, allKey, all)]);
        const saved = await insert('ask_leads', { session_id: sessionId, ip_hash: ipHash, email, country: visitor.country, region: visitor.region, city: visitor.city });
        if (!saved) return closed('lead storage not configured');
        return json(200, { ok: true });
      } catch (err) {
        return closed(`lead: ${err?.message}`);
      }
    }

    // ---------- Question ----------
    const messages = validateMessages(body.messages);
    if (!messages) return json(400, { error: 'bad_request' });
    if (!hasKey()) return closed('ANTHROPIC_API_KEY not set');
    const twin = (await loadTwin(deps.fetchTwin)) ?? (deps.allowMissingTwin ? { systemPrompt: '', knowledge: '' } : null);
    if (!twin) return closed('twin prompt not available');

    const question = messages[messages.length - 1].content;
    const source = body.source === 'prompt' ? 'prompt' : 'typed';
    const started = Date.now();
    const { user_agent: _ua, ...place } = visitor;

    // A blocked question is logged once per visitor per day, so hitting the
    // limit over and over cannot fill the table.
    const logBlocked = async (reason) => {
      try {
        const key = `blocked/${day}/${ipHash}`;
        if (await readCount(store, key)) return;
        await bump(store, key, 0);
        await insert('ask_log', { session_id: sessionId, ip_hash: ipHash, turn: 0, question, stop_reason: reason, source, ...place });
      } catch (err) {
        console.error(`[ask] blocked log failed: ${err?.message}`);
      }
    };

    let used;
    try {
      const minute = Math.floor(Date.now() / 60000);
      const keys = {
        total: `total/${day}`,
        ip: `ip/${day}/${ipHash}`,
        minute: `min/${minute}/${ipHash}`,
        session: `session/${day}/${sessionId}`,
      };
      const [total, ipDay, ipMin, session] = await Promise.all([
        readCount(store, keys.total),
        readCount(store, keys.ip),
        readCount(store, keys.minute),
        readCount(store, keys.session),
      ]);
      if (total >= LIMITS.dailyTotal) {
        await logBlocked('daily_cap');
        return closed('daily cap reached');
      }
      if (ipDay >= LIMITS.ipPerDay || ipMin >= LIMITS.ipPerMinute) {
        await logBlocked('rate_limited');
        return json(429, { error: 'rate' });
      }
      await Promise.all([
        bump(store, keys.total, total),
        bump(store, keys.ip, ipDay),
        bump(store, keys.minute, ipMin),
        bump(store, keys.session, session),
      ]);
      used = session + 1;
    } catch (err) {
      return closed(`limit store error: ${err?.message}`);
    }

    const encoder = new TextEncoder();
    let stream;

    const responseBody = new ReadableStream({
      async start(controller) {
        const send = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
        let answer = '';
        let stopReason = null;
        let usage = null;
        try {
          stream = getClient().messages.stream({
            model: MODEL,
            max_tokens: LIMITS.maxOutputTokens,
            output_config: { effort: 'low' },
            system: [
              { type: 'text', text: twin.systemPrompt },
              { type: 'text', text: UI_CONTRACT },
              // Everything above the visitor's messages is identical on every
              // request, so one breakpoint here caches the whole prefix.
              {
                type: 'text',
                text: `<knowledge>\n${twin.knowledge}\n</knowledge>`,
                cache_control: { type: 'ephemeral' },
              },
            ],
            messages,
          });
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              answer += event.delta.text;
              send({ type: 'text', text: event.delta.text });
            }
          }
          const final = await stream.finalMessage();
          stopReason = final.stop_reason;
          usage = final.usage;
          if (stopReason === 'refusal') {
            answer = '';
            send({ type: 'refusal' });
          }
          send({ type: 'done' });
        } catch (err) {
          if (err instanceof Anthropic.RateLimitError) {
            console.error('[ask] Claude API rate limited');
          } else if (err instanceof Anthropic.APIError) {
            console.error(`[ask] Claude API error ${err.status}: ${err.message}`);
          } else {
            console.error(`[ask] stream error: ${err?.message}`);
          }
          stopReason = 'error';
          send({ type: 'error' });
        }

        try {
          await insert('ask_log', {
            session_id: sessionId,
            ip_hash: ipHash,
            turn: used,
            question,
            answer: answer || null,
            markers: [...answer.matchAll(MARKER_RE)].map((m) => m[1]),
            stop_reason: stopReason,
            input_tokens: usage?.input_tokens ?? null,
            cache_read_tokens: usage?.cache_read_input_tokens ?? null,
            output_tokens: usage?.output_tokens ?? null,
            source,
            latency_ms: Date.now() - started,
            ...place,
          });
        } catch (err) {
          console.error(`[ask] log failed: ${err?.message}`);
        }
        controller.close();
      },
      cancel() {
        stream?.abort();
      },
    });

    return new Response(responseBody, {
      status: 200,
      headers: {
        'content-type': 'application/x-ndjson; charset=utf-8',
        'cache-control': 'no-store',
        'x-accel-buffering': 'no',
        'x-ask-src': twin.baked ? '2' : '1',
      },
    });
  };
}

export default createHandler();
