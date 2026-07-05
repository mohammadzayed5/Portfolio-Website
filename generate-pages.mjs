// Generates static case-study pages at /projects/<id>.html from data.jsx.
// data.jsx is pure JS data assigned to window globals, so we eval it with a stub.

import { readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const ROOT = new URL('.', import.meta.url).pathname;
const OUT = join(ROOT, 'projects');
const SITE = 'https://mohammadzayed.com';

const source = await readFile(join(ROOT, 'data.jsx'), 'utf-8');
const window = {};
new Function('window', source)(window);
const PROJECTS = window.PROJECTS;

if (!Array.isArray(PROJECTS) || PROJECTS.length === 0) {
  throw new Error('Could not load PROJECTS from data.jsx');
}

const esc = (s) =>
  String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const attr = esc;

function metaDescription(p) {
  const d = p.short || p.overview || '';
  return d.length > 160 ? d.slice(0, 157) + '...' : d;
}

function externalLinks(p) {
  const links = [];
  if (p.liveUrl) links.push({ label: 'Live site', value: p.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''), href: p.liveUrl });
  if (p.appUrl) links.push({ label: 'App Store', value: 'iOS app', href: p.appUrl });
  if (p.githubUrl) links.push({ label: 'GitHub', value: p.githubUrl.replace(/^https?:\/\/github\.com\//, ''), href: p.githubUrl });
  return links;
}

function render(p) {
  const url = `${SITE}/projects/${p.id}`;
  const title = `${p.name} | Mohammad Zayed`;
  const desc = metaDescription(p);
  const ogImage = p.images?.[0] ? `${SITE}/${p.images[0]}` : `${SITE}/assets/headshot.jpg`;
  const links = externalLinks(p);

  const breadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE}/#projects` },
      { '@type': 'ListItem', position: 3, name: p.name, item: url },
    ],
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0a0a0a" />

<title>${esc(title)}</title>
<meta name="description" content="${attr(desc)}" />
<meta name="author" content="Mohammad Zayed" />
<link rel="canonical" href="${url}" />

<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

<meta property="og:type" content="article" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${attr(title)}" />
<meta property="og:description" content="${attr(desc)}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:site_name" content="Mohammad Zayed" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${url}" />
<meta name="twitter:title" content="${attr(title)}" />
<meta name="twitter:description" content="${attr(desc)}" />
<meta name="twitter:image" content="${ogImage}" />

<script type="application/ld+json">
${breadcrumb}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Instrument+Serif&display=swap" rel="stylesheet" />

<style>
:root {
  --bg: #0a0a0a; --bg-2: #0d0d10; --bg-3: #111114;
  --fg: #f5f6f8; --fg-mute: #a1a1aa; --fg-faint: #52525b;
  --line: rgba(255,255,255,0.08); --line-2: rgba(255,255,255,0.14);
  --accent: #3b82f6; --accent-soft: rgba(59,130,246,0.15); --accent-glow: rgba(59,130,246,0.25);
  --font-display: "Geist", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: "Instrument Serif", Georgia, serif;
  --container: 880px; --pad: clamp(20px, 4vw, 48px);
}
* { box-sizing: border-box; }
html, body { background: var(--bg); color: var(--fg); margin: 0; }
body { font-family: var(--font-body); -webkit-font-smoothing: antialiased; line-height: 1.6; }
a { color: inherit; text-decoration: none; }
::selection { background: var(--accent-soft); color: var(--fg); }
.page-bg {
  position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(ellipse at 50% -10%, rgba(59,130,246,0.10), transparent 60%),
    radial-gradient(ellipse at 80% 100%, rgba(59,130,246,0.06), transparent 50%),
    var(--bg);
}
.site-header {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px var(--pad);
  background: linear-gradient(to bottom, rgba(10,10,10,.92), rgba(10,10,10,.55));
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
}
.brand { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 17px; }
.brand-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 14px var(--accent-glow); }
.header-links { display: flex; gap: 28px; font-family: var(--font-display); font-size: 14px; font-weight: 500; color: var(--fg-mute); }
.header-links a { transition: color .2s; }
.header-links a:hover { color: var(--fg); }
main { max-width: var(--container); margin: 0 auto; padding: 64px var(--pad) 96px; }
.eyebrow {
  display: inline-flex; align-items: center; gap: 12px;
  font-family: var(--font-display); font-size: 12px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-mute); margin-bottom: 18px;
}
.eyebrow-line { height: 1px; width: 32px; background: var(--line-2); }
.status-pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-display); font-size: 12px; font-weight: 600;
  padding: 5px 12px; border: 1px solid var(--line-2); border-radius: 999px; background: var(--bg-2);
}
.status-pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }
h1.project-title {
  font-family: var(--font-display);
  font-size: clamp(36px, 5.5vw, 58px);
  line-height: 1.05; letter-spacing: -0.02em; font-weight: 700; margin: 14px 0 10px;
}
.project-tag { font-family: var(--font-serif); font-size: clamp(18px, 2vw, 23px); color: var(--fg-mute); margin: 0 0 28px; }
.meta-row {
  display: flex; flex-wrap: wrap; gap: 10px 28px;
  font-family: var(--font-display); font-size: 14px; color: var(--fg-mute);
  padding: 16px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
  margin-bottom: 44px;
}
.meta-row b { color: var(--fg); font-weight: 600; }
section.cs { margin-bottom: 52px; }
section.cs h2 {
  font-family: var(--font-display); font-size: clamp(22px, 3vw, 30px);
  letter-spacing: -0.01em; font-weight: 600; margin: 0 0 16px;
}
section.cs p { font-size: 16.5px; margin: 0 0 14px; max-width: 66ch; }
.approach-list { margin: 0; padding: 0; list-style: none; display: grid; gap: 12px; }
.approach-list li {
  position: relative; padding: 16px 20px 16px 44px;
  background: var(--bg-2); border: 1px solid var(--line); border-radius: 12px; font-size: 15.5px;
}
.approach-list li::before {
  content: ""; position: absolute; left: 20px; top: 24px;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 8px var(--accent-glow);
}
.metrics {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--line); border: 1px solid var(--line); border-radius: 16px; overflow: hidden;
}
.metric { background: var(--bg-2); padding: 24px; text-align: center; }
.metric-v { font-family: var(--font-display); font-size: clamp(24px, 3.4vw, 36px); font-weight: 700; color: var(--accent); }
.metric-l { font-family: var(--font-display); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-mute); margin-top: 6px; }
@media (max-width: 560px) { .metrics { grid-template-columns: 1fr; } }
.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
.gallery img {
  width: 100%; height: auto; display: block;
  border: 1px solid var(--line-2); border-radius: 12px; background: var(--bg-2);
}
.tech-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.tech-pills span {
  font-family: var(--font-display); font-size: 13px; font-weight: 500;
  padding: 6px 12px; border: 1px solid var(--line-2); border-radius: 999px; background: var(--bg-2);
}
.links-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.link-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; border: 1px solid var(--line-2); border-radius: 14px; background: var(--bg-2);
  transition: border-color .2s, transform .2s; font-family: var(--font-display);
}
.link-card:hover { border-color: var(--accent); transform: translateY(-1px); }
.link-card .label { font-weight: 600; font-size: 15px; }
.link-card .value { font-size: 13px; color: var(--fg-mute); }
.link-card .arrow { color: var(--accent); }
.cta-back {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 22px; border: 1px solid var(--line-2); border-radius: 999px;
  font-family: var(--font-display); font-size: 14px; font-weight: 500;
  background: rgba(255,255,255,.02); transition: all .25s; margin-top: 8px;
}
.cta-back:hover { border-color: var(--accent); background: var(--accent-soft); }
footer.site-footer {
  border-top: 1px solid var(--line); padding: 24px var(--pad);
  display: flex; justify-content: space-between; align-items: center;
  color: var(--fg-mute); font-size: 13px; font-family: var(--font-display);
}
footer.site-footer a:hover { color: var(--fg); }
.footer-links { display: flex; gap: 20px; }
</style>

<script data-goatcounter="https://mohammadzayed.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</head>
<body>
<div class="page-bg" aria-hidden="true"></div>

<header class="site-header">
  <a href="/" class="brand"><span class="brand-dot"></span>Mohammad Zayed</a>
  <nav class="header-links" aria-label="Primary">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/#projects">Projects</a>
    <a href="/#contact">Contact</a>
  </nav>
</header>

<main>
  <div class="eyebrow"><span>Case study</span><span class="eyebrow-line" aria-hidden="true"></span><span>${esc(p.year)}</span></div>
  ${p.status ? `<span class="status-pill"><span class="status-pill-dot"></span>${esc(p.status)}</span>` : ''}
  <h1 class="project-title">${esc(p.name)}</h1>
  <p class="project-tag">${esc(p.tag)}</p>

  <div class="meta-row">
    <span><b>Role</b> · ${esc(p.role)}</span>
    <span><b>Year</b> · ${esc(p.year)}</span>
  </div>

  <section class="cs">
    <h2>Overview</h2>
    <p>${esc(p.overview)}</p>
  </section>

  <section class="cs">
    <h2>The problem</h2>
    <p>${esc(p.problem)}</p>
  </section>

  <section class="cs">
    <h2>Approach</h2>
    <ul class="approach-list">
      ${(p.approach || []).map((a) => `<li>${esc(a)}</li>`).join('\n      ')}
    </ul>
  </section>

  ${(p.metrics || []).length ? `<section class="cs">
    <h2>By the numbers</h2>
    <div class="metrics">
      ${p.metrics.map((m) => `<div class="metric"><div class="metric-v">${esc(m.v)}</div><div class="metric-l">${esc(m.l)}</div></div>`).join('\n      ')}
    </div>
  </section>` : ''}

  ${(p.images || []).length ? `<section class="cs">
    <h2>Screenshots</h2>
    <div class="gallery">
      ${p.images.map((img) => `<img src="/${attr(img)}" alt="${attr(p.name)} screenshot" loading="lazy" decoding="async" />`).join('\n      ')}
    </div>
  </section>` : ''}

  <section class="cs">
    <h2>Built with</h2>
    <div class="tech-pills">
      ${(p.stack || []).map((s) => `<span>${esc(s)}</span>`).join('\n      ')}
    </div>
  </section>

  ${links.length ? `<section class="cs">
    <h2>Links</h2>
    <div class="links-grid">
      ${links.map((l) => `<a class="link-card" href="${attr(l.href)}" target="_blank" rel="noopener">
        <div><div class="label">${esc(l.label)}</div><div class="value">${esc(l.value)}</div></div>
        <span class="arrow" aria-hidden="true">&#8599;</span>
      </a>`).join('\n      ')}
    </div>
  </section>` : ''}

  <a class="cta-back" href="/#projects">&larr; All projects</a>
</main>

<footer class="site-footer">
  <div>&copy; 2026 Mohammad Zayed</div>
  <nav class="footer-links" aria-label="Footer">
    <a href="https://github.com/mohammadzayed5" rel="me noopener" target="_blank">GitHub</a>
    <a href="https://www.linkedin.com/in/mohammadzayedd/" rel="me noopener" target="_blank">LinkedIn</a>
    <a href="/resume">Resume</a>
  </nav>
</footer>
</body>
</html>
`;
}

await mkdir(OUT, { recursive: true });
for (const p of PROJECTS) {
  const file = join(OUT, `${p.id}.html`);
  await writeFile(file, render(p));
  console.log(`  projects/${p.id}.html`);
}
console.log(`\n✓ Generated ${PROJECTS.length} project pages`);
