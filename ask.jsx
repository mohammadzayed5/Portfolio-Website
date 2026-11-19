/* Chat-first home: "Ask Mohammad". Talks to the Netlify Function at /api/ask. */

// Only the most recent exchanges are sent back as context, so a long
// conversation costs about the same per question as a short one.
const ASK_HISTORY_TURNS = 3;
const ASK_MAX_CHARS = 500;

// Suggested questions, three at a time. The refresh button deals the next three.
// Each one has a written answer, shown if the live chat can't answer (no API
// credit, an outage), so the suggested questions always work. Every fact here
// comes from twin/knowledge.md; keep the two in step.
const ASK_FALLBACK = {
  "What's your favorite project?":
    "LineReady. It's the app my own Chick-fil-A runs on, so I'm my own first user. I built it for the people I work next to, which is why it's in English and Spanish and why a new hire joins with just an invite code.\n\nUnder the hood, each store's data is kept separate in Postgres with row-level security, and it ships on the iOS App Store and the web from one codebase. [[case:lineready]]",
  "What roles are you looking for?":
    "Full-time software engineering roles starting after I graduate in May 2027.\n\nI'll relocate anywhere, I'm happy to work in person, and I don't need visa sponsorship. [[resume]]",
  "What's your background?":
    "I'm a Director at the Chick-fil-A in Foothill Ranch, California. I started there in March 2022 as a Team Member and have been a Director since June 2024. I write the software my store runs on.\n\nI'm finishing a B.S. in Computer Science at Cal State Long Beach and graduate in May 2027. I've been programming for about 5 years. [[resume]]",
  "What did you build for Chick-fil-A?":
    "Two things. LineReady is the app my store runs on: food-safety checks, training with videos, checklists, scheduling, team messaging and our team points system. 40 team members use it, and leaders use it every shift.\n\nI also built our store's website at cfafoothill.com. Guests get careers, catering and community pages, and the team side handles requests like time-punch fixes and sick pay. [[case:lineready]]",
  "Show me LockedIn":
    "LockedIn is a nutrition and GLP-1 tracker: meal and macro logging, barcode scanning, food search, dose logging, titration schedules and dose-vs-weight charts. It's in English, Spanish and Arabic, including right-to-left layout.\n\nIt's still in development and not publicly released yet. [[case:lockedin]]",
  "Where can I try your apps?":
    "LineReady is at linereadyapp.com and on the iOS App Store. Mini Golf Score Tracker is at minigolfscoretracker.com and on the App Store too. My store's website is cfafoothill.com.\n\nLockedIn isn't publicly released yet. [[case:minigolf]]",
  "What's your stack?":
    "Mostly React and Vite on the front end, with Capacitor to ship the same code to iOS. On the back end, Flask, PostgreSQL and Supabase with row-level security.\n\nLanguages: Python, JavaScript, Java, C++, C and SQL. [[resume]]",
  "How do I reach you?":
    "LinkedIn is the fastest way: linkedin.com/in/mohammadzayedd, with two d's at the end.\n\nMy email is in the contact section at the bottom of this page. [[contact]]",
};
const ASK_PROMPTS = Object.keys(ASK_FALLBACK);
const ASK_PROMPTS_SHOWN = 3;

const ASK_CASES = {
  "case:lineready": { id: "lineready", name: "LineReady", sub: "Restaurant operations app, iOS and web", stat: "40 team members use it", img: "assets/shots/lineready-cover.jpg" },
  "case:lockedin": { id: "lockedin", name: "LockedIn", sub: "Nutrition and GLP-1 tracker", stat: "English, Spanish and Arabic", img: "assets/shots/lockedin-site.jpg" },
  "case:minigolf": { id: "minigolf", name: "Mini Golf", sub: "Multiplayer scorekeeping, iOS and web", stat: "Live on the App Store and the web", img: "assets/shots/golf-cover.jpg" },
  "case:cfa-site": { id: "cfa", name: "Chick-fil-A site", sub: "Store website and team portal", stat: "Public site and team portal in one deploy", img: "assets/shots/cfa-cover.jpg" },
};

const ASK_GREETING = "Hi, I'm an AI version of Mohammad. Ask me about what I've built or the roles I'm looking for.";
const ASK_GREETING_HIRING = "Hiring? Ask what I'd bring to your team.";

// After an answer, the suggested questions that follow on from it are offered first.
const ASK_RELATED = {
  "case:lineready": ["What's your stack?", "Where can I try your apps?", "What's your background?"],
  "case:lockedin": ["What's your stack?", "Where can I try your apps?", "What's your favorite project?"],
  "case:minigolf": ["Where can I try your apps?", "What's your stack?", "What's your favorite project?"],
  "case:cfa-site": ["What did you build for Chick-fil-A?", "What's your background?", "What's your stack?"],
  resume: ["What's your background?", "What's your favorite project?", "How do I reach you?"],
  contact: ["What roles are you looking for?", "What's your background?", "What's your favorite project?"],
};

const ASK_MARKER_RE = /\[\[(case:[a-z-]+|resume|contact|lead)\]\]/g;

const ASK_NOTES = {
  closed: "I can't answer that one right now. The suggested questions still work, or ask the real me.",
  rate: "That's a lot of questions at once. Give it a minute and try again.",
  refusal: "That one's outside my lane. I'm better at talking about what I've built.",
};

/** Splits a raw answer into visible paragraphs and the buttons it asked for. */
function parseAnswer(raw, streaming) {
  const markers = [];
  let text = raw.replace(ASK_MARKER_RE, (_, m) => {
    if (!markers.includes(m)) markers.push(m);
    return "";
  });
  // While streaming, hide a marker that has only partly arrived.
  if (streaming) text = text.replace(/\[+[a-z:-]*\]?$/, "");
  const paragraphs = text.trim().split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return { paragraphs, markers };
}

function askSessionId() {
  try {
    let id = sessionStorage.getItem("ask.sid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("ask.sid", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function jumpToContact() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Shared with the portrait so it reacts to the conversation: it shimmers while
   an answer is on its way, talks while the answer is being written out, lights
   up a little on each key typed, and sends a ring outward when a question is sent. */
const ASK_LIVE = { speaking: false, thinking: false, keyAt: -1e9, pulseAt: -1e9, pulseX: 0.5, pulseY: 0.4 };
function askPulse(x = 0.5, y = 0.4) {
  ASK_LIVE.pulseAt = performance.now();
  ASK_LIVE.pulseX = x;
  ASK_LIVE.pulseY = y;
}

// Density ramp (dark to bright), then four stroke glyphs used along edges.
const GLYPHS = " .·:;-=+*xX#%&@" + "|/-\\";
const GLYPH_RAMP = 15;
const GLYPH_LEVELS = 12;

/* A short video of me, cut out of its backdrop and redrawn in characters, so
   the chat reads as a conversation with an AI version of me. An idle loop
   plays normally and a talking loop plays while an answer is being written out.
   Each cell gets a tone (how bright) and a glyph: flat areas use the density
   ramp, edges (jaw, brows, eyes, collar, outline) use a stroke that follows
   the edge direction. That is what makes a face read at this size.
   It also reacts to the visitor: it turns slightly toward the pointer, the
   cells under the pointer light up, and a click sends a ring across it.
   A still frame stands in until a video is playing, and for reduced motion. */
function GlyphPortrait() {
  const ref = React.useRef(null);
  const idleRef = React.useRef(null);
  const talkRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image();
    img.decoding = "async";
    img.src = "/assets/portrait.jpg";
    const idle = idleRef.current;
    const talk = talkRef.current;

    let grid = null;
    let raf = 0;
    let last = 0;
    let born = 0;
    let fontReady = false;
    let frame = 0;
    const pointer = { x: 0, y: 0, seen: false };
    const onMove = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.seen = true; };
    const onTap = (e) => {
      const r = canvas.getBoundingClientRect();
      if (r.width) askPulse((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      canvas.addEventListener("pointerdown", onTap);
    }

    const playing = (v) => v && v.readyState >= 2 && !v.paused;
    const play = (v) => { if (v && v.paused) v.play().catch(() => {}); };

    // Cell layout, work buffers and the glyph sprite sheet. Redone on resize.
    const layout = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Whole device pixels per cell, so the glyph sprites tile without seams.
      const cwD = Math.max(3, Math.round((w / 118) * dpr));
      const chD = Math.round(cwD * 1.55);
      const cols = Math.floor((w * dpr) / cwD);
      const rows = Math.floor((h * dpr) / chD);
      const n = cols * rows;

      const sample = document.createElement("canvas");
      sample.width = cols;
      sample.height = rows;
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      sctx.imageSmoothingQuality = "high";

      const phase = new Float32Array(n);
      for (let i = 0; i < n; i++) phase[i] = Math.random() * Math.PI * 2;

      // Sprite sheet: every glyph at every brightness, drawn once.
      const atlas = document.createElement("canvas");
      atlas.width = GLYPHS.length * cwD;
      atlas.height = GLYPH_LEVELS * chD;
      const actx = atlas.getContext("2d");
      actx.font = `600 ${(chD * 1.02).toFixed(1)}px "JetBrains Mono", ui-monospace, monospace`;
      actx.textBaseline = "middle";
      actx.textAlign = "center";
      for (let lv = 0; lv < GLYPH_LEVELS; lv++) {
        const v = lv / (GLYPH_LEVELS - 1);
        const alpha = 0.4 + 0.6 * Math.pow(v, 0.8);
        actx.fillStyle = `rgba(${Math.round(120 + 135 * v)},${Math.round(178 + 77 * v)},255,${alpha.toFixed(2)})`;
        for (let g = 1; g < GLYPHS.length; g++) {
          actx.fillText(GLYPHS[g], g * cwD + cwD / 2, lv * chD + chD / 2);
        }
      }

      canvas.width = cols * cwD;
      canvas.height = rows * chD;
      // A wash of colour laid over the characters: sky blue up top, violet at the shoulders.
      const tint = canvas.getContext("2d").createLinearGradient(0, 0, 0, canvas.height);
      tint.addColorStop(0, "rgba(125,211,252,0.22)");
      tint.addColorStop(0.5, "rgba(147,197,253,0)");
      tint.addColorStop(1, "rgba(167,139,250,0.5)");
      grid = {
        tint,
        cols, rows, n, cwD, chD, sctx, phase, atlas, ready: false,
        wall: new Uint8Array(n), mask: new Float32Array(n), lum: new Float32Array(n),
        sharp: new Float32Array(n), tone: new Float32Array(n), glyph: new Int8Array(n),
        stack: new Int32Array(n), hist: new Uint32Array(64), lo: -1, hi: -1,
      };
    };

    // Turn one frame (video or still) into tones and glyphs.
    const analyze = (source, sw, sh) => {
      const { cols, rows, n, sctx, wall, mask, lum, sharp, tone, glyph, stack, hist } = grid;
      // Fill the grid, cropping the source to the grid's shape from the top centre.
      const want = (cols * grid.cwD) / (rows * grid.chD);
      let cw = sw, ch = sh;
      if (sw / sh > want) cw = sh * want; else ch = sw / want;
      // Move in on the head and shoulders so the face is the biggest thing drawn.
      cw /= 1.12; ch /= 1.12;
      sctx.drawImage(source, (sw - cw) / 2, sh * 0.02, cw, ch, 0, 0, cols, rows);
      let data;
      try {
        data = sctx.getImageData(0, 0, cols, rows).data;
      } catch {
        return false;
      }

      // 1. Brightness, and which cells are backdrop. The clips are cut out onto pure
      // white ahead of time, and nothing on me is that bright.
      for (let i = 0; i < n; i++) {
        const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        lum[i] = (0.45 * r + 0.45 * g + 0.1 * b) / 255;
        wall[i] = mn > 243 ? 1 : 0;
      }
      // Only wall that connects to the top or side edges is backdrop, so
      // eye whites and teeth stay part of the face.
      let top = 0;
      const seed = (i) => { if (wall[i] === 1) { wall[i] = 2; stack[top++] = i; } };
      for (let x = 0; x < cols; x++) seed(x);
      for (let y = 0; y < rows; y++) { seed(y * cols); seed(y * cols + cols - 1); }
      while (top) {
        const i = stack[--top];
        const x = i % cols;
        if (x > 0) seed(i - 1);
        if (x < cols - 1) seed(i + 1);
        if (i >= cols) seed(i - cols);
        if (i < n - cols) seed(i + cols);
      }
      const at = (arr, x, y) => arr[Math.min(rows - 1, Math.max(0, y)) * cols + Math.min(cols - 1, Math.max(0, x))];
      // Soften the cut-out by averaging over the neighbouring cells.
      hist.fill(0);
      let count = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let bg = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) bg += at(wall, x + dx, y + dy) === 2 ? 1 : 0;
          const i = y * cols + x;
          mask[i] = 1 - bg / 9;
          if (mask[i] > 0.6) { hist[Math.min(63, (lum[i] * 64) | 0)]++; count++; }
        }
      }

      // 2. Stretch the subject's own brightness range to full contrast. The
      //    range is eased between frames so the picture does not pump.
      let lo = 0, hi = 1, acc = 0;
      for (let k = 0; k < 64; k++) {
        acc += hist[k];
        if (acc <= count * 0.04) lo = (k + 1) / 64;
        if (acc <= count * 0.97) hi = (k + 2) / 64;
      }
      grid.lo = grid.lo < 0 ? lo : grid.lo + (lo - grid.lo) * 0.15;
      grid.hi = grid.hi < 0 ? hi : grid.hi + (hi - grid.hi) * 0.15;
      const span = Math.max(0.05, grid.hi - grid.lo);
      // The footage is evenly lit and the shirt is white, so the range is
      // left close to linear: skin sits in the middle and the features read against it.
      for (let i = 0; i < n; i++) lum[i] = Math.pow(Math.min(1, Math.max(0, (lum[i] - grid.lo) / span)), 0.95);

      // 3. Local contrast: push each cell away from its neighbourhood average,
      //    which brings out eyes, brows and the mouth.
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let sum = 0;
          for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) sum += at(lum, x + dx, y + dy);
          const v = lum[y * cols + x];
          sharp[y * cols + x] = Math.min(1, Math.max(0, v + 1.9 * (v - sum / 25)));
        }
      }

      // 4. Edges, from brightness inside the subject and from the cut-out outline.
      const sobel = (arr, x, y) => {
        const gx = at(arr, x + 1, y - 1) + 2 * at(arr, x + 1, y) + at(arr, x + 1, y + 1)
          - at(arr, x - 1, y - 1) - 2 * at(arr, x - 1, y) - at(arr, x - 1, y + 1);
        const gy = at(arr, x - 1, y + 1) + 2 * at(arr, x, y + 1) + at(arr, x + 1, y + 1)
          - at(arr, x - 1, y - 1) - 2 * at(arr, x, y - 1) - at(arr, x + 1, y - 1);
        return [gx, gy];
      };
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const m = mask[i];
          tone[i] = 0;
          glyph[i] = -1; // -1: pick from the density ramp
          const [ox, oy] = sobel(mask, x, y);
          const outline = Math.hypot(ox, oy);
          if (m < 0.35 && outline < 0.9) continue;
          let t = m * (0.3 + 0.7 * Math.pow(sharp[i], 1.15));
          const [gx, gy] = sobel(lum, x, y);
          const inner = Math.hypot(gx, gy) * m;
          let ex = gx, ey = gy, strength = inner;
          if (outline > 1.1) { ex = ox; ey = oy; strength = Math.max(inner, 1.3); }
          if (strength > 1.05) {
            // The stroke runs along the edge, at right angles to the gradient.
            // Cells are taller than wide, so weight the vertical part to match.
            const deg = (Math.atan2(ey * 1.55, ex) * 180 / Math.PI + 180) % 180;
            glyph[i] = GLYPH_RAMP + (deg < 22.5 || deg >= 157.5 ? 0 : deg < 67.5 ? 3 : deg < 112.5 ? 2 : 1);
            t = Math.max(t, Math.min(1, 0.5 + 0.22 * strength));
          }
          tone[i] = t;
        }
      }
      grid.ready = true;
      return true;
    };

    const paint = (now) => {
      if (!grid || !fontReady) return;
      const speaking = ASK_LIVE.speaking;
      const thinking = ASK_LIVE.thinking;
      frame++;

      // Pick the frame: the talking loop while answering, otherwise the idle
      // loop, otherwise the still.
      if (!still) {
        if (speaking) play(talk);
        else if (talk && !talk.paused) talk.pause();
        play(idle);
      }
      const video = still ? null : speaking && playing(talk) ? talk : playing(idle) ? idle : null;
      if (video) analyze(video, video.videoWidth, video.videoHeight);
      else if (!grid.ready && img.complete && img.naturalWidth) analyze(img, img.naturalWidth, img.naturalHeight);
      if (!grid.ready) return;
      if (!born) born = now;

      const { cols, rows, cwD, chD, tone, glyph, phase, atlas } = grid;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = now / 1000;
      const amp = still ? 0 : thinking ? 0.45 : speaking ? 0.2 : 0.07;
      const rate = thinking ? 11 : speaking ? 7 : 1.5;
      // A slow band of light moving down, and a top-to-bottom reveal on load.
      const band = still ? -1 : ((t * (thinking ? 1.1 : speaking ? 0.5 : 0.14)) % 1.5) - 0.25;
      const shown = still ? 2 : (now - born) / 1100;

      // Where the pointer is, in cells, and a slight turn toward it.
      let px = -1e6, py = -1e6;
      const reach = cols * 0.22;
      if (!still && pointer.seen) {
        const r = canvas.getBoundingClientRect();
        if (r.width && r.height) {
          px = ((pointer.x - r.left) / r.width) * cols;
          py = ((pointer.y - r.top) / r.height) * rows;
          const dx = Math.max(-1, Math.min(1, (pointer.x - (r.left + r.width / 2)) / (window.innerWidth / 2)));
          const dy = Math.max(-1, Math.min(1, (pointer.y - (r.top + r.height / 2)) / (window.innerHeight / 2)));
          canvas.style.transform = `perspective(900px) rotateY(${(dx * 10).toFixed(2)}deg) rotateX(${(-dy * 7).toFixed(2)}deg)`;
        }
      }
      // A ring moving outward from a click, or from the middle when a question is sent.
      const pulseAge = still ? 2 : (now - ASK_LIVE.pulseAt) / 900;
      const ring = pulseAge >= 0 && pulseAge < 1 ? pulseAge * cols * 0.95 : -1;
      const ox = ASK_LIVE.pulseX * cols, oy = ASK_LIVE.pulseY * rows;
      // A short lift in brightness on each key the visitor types.
      const heard = still ? 0 : Math.max(0, 1 - (now - ASK_LIVE.keyAt) / 380) * 0.2;

      for (let y = 0; y < rows; y++) {
        const fy = y / rows;
        if (fy > shown) break;
        const glow = Math.max(0, 1 - Math.abs(fy - band) * 8) * 0.3;
        const fade = fy > 0.88 ? (1 - fy) / 0.12 : 1;
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const base = tone[i];
          if (base < 0.05) continue;
          let v = base * (1 - amp + amp * Math.sin(t * rate + phase[i])) + glow * base;
          v *= 1 + heard;
          let scramble = thinking && (i * 7 + frame * 3) % 13 === 0;
          const ddx = x - px, ddy = (y - py) * 1.55;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < reach * reach) v += (0.15 + base) * 0.6 * (1 - d2 / (reach * reach));
          if (ring >= 0) {
            const k = 1 - Math.abs(Math.hypot(x - ox, (y - oy) * 1.55) - ring) / 4;
            if (k > 0) {
              v += (0.3 + base) * 0.7 * k * (1 - pulseAge);
              if (k > 0.45) scramble = true;
            }
          }
          v *= fade;
          if (v > 1) v = 1;
          const g = scramble ? 1 + ((i + frame * 5) % (GLYPH_RAMP - 1))
            // Dark areas (hair) keep fairly dense characters, just dimmer, so they read as a mass.
            : glyph[i] >= 0 ? glyph[i] : Math.max(1, Math.round((0.38 + 0.62 * v) * (GLYPH_RAMP - 1)));
          const lv = Math.round(v * (GLYPH_LEVELS - 1));
          ctx.drawImage(atlas, g * cwD, lv * chD, cwD, chD, x * cwD, y * chD, cwD, chD);
        }
      }
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = grid.tint;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      // About 22 frames a second follows the video and keeps it light.
      if (now - last < 45) return;
      last = now;
      paint(now);
    };

    const start = () => {
      layout();
      cancelAnimationFrame(raf);
      if (still) paint(performance.now());
      else raf = requestAnimationFrame(loop);
    };

    // The sprite sheet needs the mono font; draw once it is ready.
    const go = () => { fontReady = true; start(); };
    (document.fonts?.load ? document.fonts.load('600 12px "JetBrains Mono"') : Promise.resolve()).then(go, go);
    img.onload = () => { if (still && fontReady) start(); };

    const ro = new ResizeObserver(() => { if (fontReady) start(); });
    ro.observe(canvas);
    // Stop the work while the tab is hidden.
    const onVis = () => {
      if (still) return;
      cancelAnimationFrame(raf);
      if (document.hidden) { idle?.pause(); talk?.pause(); }
      else raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onTap);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="ask-portrait">
      <canvas ref={ref} role="img" aria-label="Portrait of Mohammad Zayed, drawn in characters" />
      <video ref={idleRef} className="ask-portrait-src" src="/assets/portrait-idle.mp4" muted loop playsInline autoPlay preload="auto" aria-hidden="true" tabIndex={-1} />
      <video ref={talkRef} className="ask-portrait-src" src="/assets/portrait-talk.mp4" muted loop playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
    </div>
  );
}


function AskLeadForm({ sessionId }) {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState("idle"); // idle | sending | saved | failed
  const inputId = React.useId();

  const submit = async (e) => {
    e.preventDefault();
    if (state === "sending" || !email.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "lead", sessionId, email: email.trim() }),
      });
      setState(res.ok ? "saved" : "failed");
    } catch {
      setState("failed");
    }
  };

  if (state === "saved") return <span className="ask-lead-note">Got it. I'll follow up by email.</span>;
  return (
    <form className="ask-lead" onSubmit={submit}>
      <label htmlFor={inputId} className="sr-only">Your email</label>
      <input
        id={inputId}
        className="ask-input ph-no-capture"
        type="email"
        required
        maxLength={254}
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" className="ask-send" disabled={state === "sending"}>
        {state === "sending" ? "Sending" : "Leave my email"}
      </button>
      {state === "failed" &&
        <span className="ask-lead-note" role="alert">
          That didn't save. <a href="#contact" onClick={(e) => { e.preventDefault(); jumpToContact(); }} style={{ color: "#93c5fd" }}>Email me from the contact section</a> instead.
        </span>
      }
    </form>
  );
}

function AskButtons({ markers, sessionId }) {
  if (!markers.length) return null;
  return (
    <div className="ask-buttons">
      {markers.map((m) => {
        const c = ASK_CASES[m];
        if (c) {
          return (
            <a key={m} className="ask-case" href={`/projects/${c.id}`}>
              <img src={"/" + c.img} alt={c.name + " screenshot"} width="320" height="200" loading="lazy" />
              <span className="ask-case-text">
                <b>{c.name}</b>
                <span>{c.sub}</span>
                <strong>{c.stat}</strong>
                <em>See how I built it</em>
              </span>
            </a>
          );
        }
        if (m === "resume") {
          return <a key={m} className="ask-action" href="/resume" target="_blank" rel="noopener noreferrer">Resume</a>;
        }
        if (m === "contact") {
          return <button key={m} type="button" className="ask-action" data-track="talk-to-real-me" onClick={jumpToContact}>Talk to the real me</button>;
        }
        if (m === "lead") return <AskLeadForm key={m} sessionId={sessionId} />;
        return null;
      })}
    </div>
  );
}

/* One question and its answer. The answer is written out at a steady pace
   instead of in the bursts it arrives in, and the portrait talks for as long
   as that takes. */
function AskCopy({ text }) {
  const [done, setDone] = React.useState(false);
  if (!navigator.clipboard) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {}
  };
  return (
    <button type="button" className="ask-tool" data-track="copy-answer" onClick={copy} aria-live="polite">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        {done
          ? <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M5.5 5.5v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M3.5 5.5h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />}
      </svg>
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function AskTurn({ turn, sessionId, offerLead, onGrow, onSettled }) {
  const full = turn.note ? ASK_NOTES[turn.note] : turn.raw;
  const instant = React.useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const [shown, setShown] = React.useState(0);
  const fullRef = React.useRef(full);
  fullRef.current = full;
  const waiting = turn.status === "streaming";
  const count = instant ? full.length : Math.min(shown, full.length);
  const revealing = waiting || count < full.length;

  React.useEffect(() => {
    if (instant || !revealing) return;
    const timer = setInterval(() => {
      setShown((n) => {
        const left = fullRef.current.length - n;
        return left <= 0 ? n : n + Math.max(2, Math.ceil(left / 40));
      });
    }, 30);
    return () => clearInterval(timer);
  }, [instant, revealing]);

  React.useEffect(() => {
    ASK_LIVE.thinking = waiting && count === 0;
    ASK_LIVE.speaking = revealing && count > 0;
  }, [waiting, revealing, count > 0]);
  React.useEffect(() => { onGrow?.(); }, [count, revealing]);
  React.useEffect(() => { if (!revealing) onSettled?.(turn.id); }, [revealing]);
  React.useEffect(() => () => { ASK_LIVE.thinking = false; ASK_LIVE.speaking = false; }, []);

  const parsed = parseAnswer(full.slice(0, count), revealing);
  const paragraphs = parsed.paragraphs;
  const markers = turn.note ? (turn.note === "rate" || turn.note === "refusal" ? [] : ["contact", "resume"]) : parsed.markers;
  return (
    <div className="ask-turn is-new">
      <p className="ask-q"><span className="sr-only">You asked: </span>{turn.q}</p>
      <div className="ask-a">
        {revealing && paragraphs.length === 0 &&
          <span className="ask-dots" aria-label="Thinking"><span /><span /><span /></span>
        }
        {paragraphs.map((p, i) =>
          <p key={i}>
            {p}
            {revealing && i === paragraphs.length - 1 && <span className="ask-caret" aria-hidden="true" />}
          </p>
        )}
        {!revealing && <AskButtons markers={markers} sessionId={sessionId} />}
        {!revealing && offerLead && !markers.includes("lead") &&
          <div className="ask-offer">
            <p>Want me to follow up myself? Leave your email and I'll reply.</p>
            <AskLeadForm sessionId={sessionId} />
          </div>
        }
        {!revealing && !turn.note && paragraphs.length > 0 &&
          <div className="ask-tools"><AskCopy text={paragraphs.join("\n\n")} /></div>
        }
      </div>
    </div>
  );
}

const ASK_OFFER_AFTER = 3;

function AskChat({ onActive }) {
  const sessionId = React.useMemo(askSessionId, []);
  const [turns, setTurns] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [deal, setDeal] = React.useState(0);
  const formRef = React.useRef(null);
  const turnsRef = React.useRef(turns);
  turnsRef.current = turns;

  // The conversation scrolls inside its own panel so the portrait stays in view.
  const logRef = React.useRef(null);
  React.useEffect(() => {
    const log = logRef.current;
    if (log && turns.length) log.scrollTop = log.scrollHeight;
  }, [turns.length]);
  // Follow the answer as it is written, unless the visitor has scrolled back up.
  const follow = React.useCallback(() => {
    const log = logRef.current;
    if (log && log.scrollHeight - log.scrollTop - log.clientHeight < 140) log.scrollTop = log.scrollHeight;
  }, []);
  // A turn is settled once its answer has arrived and been written out.
  const settle = React.useCallback((id) => {
    if (turnsRef.current.length && turnsRef.current[turnsRef.current.length - 1].id === id) setBusy(false);
  }, []);

  const patch = (id, fields) =>
    setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, ...(typeof fields === "function" ? fields(t) : fields) } : t)));

  const ask = async (text, source = "typed") => {
    const q = text.trim().slice(0, ASK_MAX_CHARS);
    if (!q || busy) return;

    const history = [];
    for (const t of turnsRef.current) {
      if (t.status === "done" && !t.note && t.raw.trim()) {
        history.push({ role: "user", content: t.q }, { role: "assistant", content: t.raw.trim() });
      }
    }
    history.splice(0, Math.max(0, history.length - ASK_HISTORY_TURNS * 2));
    const id = Date.now();
    setTurns((ts) => [...ts, { id, q, raw: "", status: "streaming", note: null }]);
    setInput("");
    setBusy(true);
    setDeal(0);
    askPulse();

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, source, messages: [...history, { role: "user", content: q }] }),
      });
      if (!res.ok || !res.body) {
        let code = "closed";
        try { code = (await res.json()).error || "closed"; } catch {}
        if (code !== "rate" && ASK_FALLBACK[q]) patch(id, { status: "done", raw: ASK_FALLBACK[q] });
        else patch(id, { status: "done", note: code === "rate" ? "rate" : "closed" });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let failed = false;
      const handle = (line) => {
        if (!line.trim()) return;
        let ev;
        try { ev = JSON.parse(line); } catch { return; }
        if (ev.type === "text") patch(id, (t) => ({ raw: t.raw + ev.text }));
        else if (ev.type === "refusal") patch(id, { note: "refusal" });
        else if (ev.type === "error") failed = true;
      };
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        lines.forEach(handle);
      }
      handle(buffer);
      if (failed && ASK_FALLBACK[q]) patch(id, { status: "done", raw: ASK_FALLBACK[q], note: null });
      else patch(id, (t) => ({ status: "done", note: failed ? "closed" : t.note }));
    } catch {
      if (ASK_FALLBACK[q]) patch(id, { status: "done", raw: ASK_FALLBACK[q], note: null });
      else patch(id, { status: "done", note: "closed" });
    }
  };

  const asked = new Set(turns.filter((t) => !t.note).map((t) => t.q));
  const lastDone = [...turns].reverse().find((t) => t.status === "done" && !t.note);
  const related = lastDone ? [...lastDone.raw.matchAll(ASK_MARKER_RE)].flatMap((m) => ASK_RELATED[m[1]] || []) : [];
  const open = ASK_PROMPTS.filter((c) => !asked.has(c));
  const pool = [...related.filter((c, i) => open.includes(c) && related.indexOf(c) === i), ...open.filter((c) => !related.includes(c))];
  const chips = pool.length <= ASK_PROMPTS_SHOWN
    ? pool
    : Array.from({ length: ASK_PROMPTS_SHOWN }, (_, i) => pool[(deal * ASK_PROMPTS_SHOWN + i) % pool.length]);
  const hasLog = turns.length > 0;
  // After the third answered question, offer the email box once, unless an answer already did.
  const answered = turns.filter((t) => t.status === "done" && !t.note);
  const offerId = answered.length >= ASK_OFFER_AFTER && !answered.slice(0, ASK_OFFER_AFTER).some((t) => t.raw.includes("[[lead]]"))
    ? answered[ASK_OFFER_AFTER - 1].id : null;
  const reset = () => { setTurns([]); setBusy(false); setDeal(0); setInput(""); };
  React.useEffect(() => { onActive?.(hasLog); }, [hasLog]);

  return (
    <div className="ask-chat">
      <div ref={logRef} className="ask-log" tabIndex={0} role="log" aria-live="polite" aria-busy={busy} aria-label="Conversation with the AI version of Mohammad">
        <div className="ask-turn">
          <div className="ask-a"><p>{ASK_GREETING}</p><p className="ask-hiring">{ASK_GREETING_HIRING}</p></div>
        </div>
        {turns.map((t) => <AskTurn key={t.id} turn={t} sessionId={sessionId} offerLead={t.id === offerId} onGrow={follow} onSettled={settle} />)}
      </div>

      {chips.length > 0 &&
        <div className="ask-chips">
          {pool.length > ASK_PROMPTS_SHOWN &&
            <button type="button" className="ask-refresh" aria-label="Show other suggested questions" title="Other questions"
              disabled={busy} data-track="refresh-prompts" onClick={() => setDeal((d) => d + 1)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          }
          {chips.map((c) =>
            <button key={c} type="button" className="ask-chip" disabled={busy} onClick={() => ask(c, "prompt")}>{c}</button>
          )}
          {hasLog &&
            <button type="button" className="ask-tool ask-reset" disabled={busy} data-track="start-over" onClick={reset}>Start over</button>
          }
        </div>
      }

      <form ref={formRef} className="ask-form" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <label htmlFor="ask-input" className="sr-only">Your question</label>
        <input
          id="ask-input"
          className="ask-input ph-no-capture"
          type="text"
          autoComplete="off"
          maxLength={ASK_MAX_CHARS}
          placeholder="Ask me anything about my work"
          value={input}
          onChange={(e) => { ASK_LIVE.keyAt = performance.now(); setInput(e.target.value); }} />
        <button type="submit" className="ask-send" disabled={busy || !input.trim()}>Ask</button>
      </form>

    </div>
  );
}

function ChatHome() {
  const [active, setActive] = React.useState(false);
  // The conversation view fills the screen below the nav, whatever height the nav is.
  React.useEffect(() => {
    const nav = document.querySelector(".topnav");
    if (!nav) return;
    const set = () => document.documentElement.style.setProperty("--nav-h", `${nav.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);
  React.useEffect(() => { if (active) window.scrollTo({ top: 0 }); }, [active]);
  return (
    <section id="top" className={`ask-home ${active ? "is-active" : ""}`}>
      <div className="ask-stage">
        <div className="ask-hero">
          <h1 className="ask-name">Mohammad Zayed</h1>
          <p className="ask-tagline">Software engineer</p>
          <GlyphPortrait />
        </div>
        <AskChat onActive={setActive} />
      </div>
      <div className="ask-side-actions">
        <a className="ask-action" href="/resume" target="_blank" rel="noopener noreferrer">Resume</a>
        <button type="button" className="ask-action" data-track="talk-to-real-me" onClick={jumpToContact}>Talk to the real me</button>
      </div>
      <p className="ask-intro">
        I'm Mohammad Zayed, a software engineer in Orange County, California. I built LineReady, the app my
        Chick-fil-A runs on, and I graduate from Cal State Long Beach in May 2027. I'm open to full-time
        software engineering roles. See my <a href="/projects">projects</a> or read more <a href="/about">about me</a>.
      </p>
    </section>
  );
}
