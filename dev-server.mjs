// Local preview: serves the site and runs the "ask" function in-process.
//   npm run dev                         -> http://localhost:8000
// With ANTHROPIC_API_KEY set in your shell, answers come from Claude.
// Without it, a canned local reply is streamed so the UI can still be tested.
// Limits use an in-memory store here (Netlify Blobs in production), and
// questions/leads print to this terminal unless Supabase env vars are set.

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { createHandler } from './netlify/functions/ask/ask.mjs';

const ROOT = new URL('.', import.meta.url).pathname;
const PORT = Number(process.env.PORT) || 8000;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain',
};

const memory = new Map();
const limitStore = {
  get: async (key) => memory.get(key) ?? null,
  setJSON: async (key, value) => void memory.set(key, value),
};

function fakeClient() {
  const reply = (q) => {
    if (/lockedin/i.test(q)) return 'Local test reply, no API key set. LockedIn is my nutrition and GLP-1 tracker.\n\nIt's in English, Spanish and Arabic. [[case:lockedin]]';
    if (/hiring|recruit|role for/i.test(q)) return 'Local test reply, no API key set. Leave your email and I will follow up. [[lead]]';
    if (/reach|contact|email/i.test(q)) return 'Local test reply, no API key set. LinkedIn is the fastest way to reach me. [[contact]] [[resume]]';
    return 'Local test reply, no API key set. Ask me about LineReady, the app my Chick-fil-A runs on.\n\nThis second paragraph shows the muted style. [[case:lineready]]';
  };
  return {
    messages: {
      stream({ messages }) {
        const text = reply(messages[messages.length - 1].content);
        const chunks = text.match(/.{1,6}/gs);
        return {
          async *[Symbol.asyncIterator]() {
            await new Promise((r) => setTimeout(r, 500));
            for (const c of chunks) {
              await new Promise((r) => setTimeout(r, 25));
              yield { type: 'content_block_delta', delta: { type: 'text_delta', text: c } };
            }
          },
          finalMessage: async () => ({ stop_reason: 'end_turn', usage: { input_tokens: 0, output_tokens: 0 } }),
          abort() {},
        };
      },
    },
  };
}

const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);
const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const ask = createHandler({
  getLimitStore: () => limitStore,
  hashSecret: () => process.env.ANTHROPIC_API_KEY || 'local-dev-only',
  ...(hasKey ? {} : { getClient: fakeClient, hasKey: () => true, allowMissingTwin: true }),
  ...(hasSupabase ? {} : {
    insert: async (table, row) => {
      console.log(`[dev] ${table}:`, JSON.stringify(row));
      return true;
    },
  }),
});

const REWRITES = [
  [/^\/resume$/, '/resume.pdf'],
  [/^\/about$/, '/about.html'],
  [/^\/projects\/?$/, '/projects.html'],
  [/^\/projects\/([a-z0-9-]+)$/, '/projects/$1.html'],
];
const BLOCKED = /^\/(twin|netlify|design-mocks-nov10)\//;

async function serveStatic(pathname, res, range) {
  let status = 200;
  let path = decodeURIComponent(pathname);
  if (BLOCKED.test(path)) { status = 404; path = '/index.html'; }
  for (const [re, to] of REWRITES) if (re.test(path)) { path = path.replace(re, to); break; }
  if (path === '/') path = '/index.html';
  let file = join(ROOT, normalize(path));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try {
    if (!(await stat(file)).isFile()) throw new Error('not a file');
  } catch {
    file = join(ROOT, 'index.html');
  }
  const data = await readFile(file);
  // Byte ranges, so the browser can seek inside the portrait videos (Netlify does this too).
  const m = status === 200 && /^bytes=(\d*)-(\d*)$/.exec(range || '');
  if (m && (m[1] || m[2])) {
    const start = m[1] ? Number(m[1]) : Math.max(0, data.length - Number(m[2]));
    const end = m[1] && m[2] ? Math.min(Number(m[2]), data.length - 1) : data.length - 1;
    if (start <= end) {
      res.writeHead(206, {
        'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store',
        'accept-ranges': 'bytes', 'content-range': `bytes ${start}-${end}/${data.length}`, 'content-length': end - start + 1,
      });
      res.end(data.subarray(start, end + 1));
      return;
    }
  }
  res.writeHead(status, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store', 'accept-ranges': 'bytes' });
  res.end(data);
}

http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname === '/api/ask') {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const request = new Request(url, {
          method: req.method,
          headers: req.headers,
          body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
        });
        const response = await ask(request, { ip: req.socket.remoteAddress });
        res.writeHead(response.status, Object.fromEntries(response.headers));
        if (response.body) for await (const chunk of response.body) res.write(chunk);
        res.end();
        return;
      }
      await serveStatic(url.pathname, res, req.headers.range);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.writeHead(500);
      res.end();
    }
  })
  .listen(PORT, () => {
    console.log(`\nSite:  http://localhost:${PORT}`);
    console.log(`Chat:  ${hasKey ? 'Claude API (ANTHROPIC_API_KEY found)' : 'canned local replies (no ANTHROPIC_API_KEY in this shell)'}`);
    console.log(`Logs:  ${hasSupabase ? 'Supabase' : 'printed here'}\n`);
  });
