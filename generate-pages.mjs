// Generates the static pages from data.jsx: /projects, /about and one case study
// per project at /projects/<id>.html. They share one layout (nav, footer, CSS).
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

const EMAIL = 'mohammadzayed521@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/mohammadzayedd/';
const GITHUB = 'https://github.com/mohammadzayed5';
const STATUS = 'Open to full-time · May 2027';

// Reuse the cache-busting version build.mjs stamped into index.html.
const indexSource = await readFile(join(ROOT, 'index.html'), 'utf-8');
const VERSION = indexSource.match(/styles\.css\?v=([^"]+)"/)?.[1] ?? '';
const v = VERSION ? `?v=${VERSION}` : '';

const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Mohammad Zayed',
  givenName: 'Mohammad',
  familyName: 'Zayed',
  url: SITE,
  image: `${SITE}/assets/headshot.jpg`,
  jobTitle: 'Software Engineer',
  description:
    'Full-stack software engineer who built LineReady, the app his Chick-fil-A runs on. Graduating from Cal State Long Beach in May 2027 and open to full-time roles.',
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'California State University, Long Beach', sameAs: 'https://www.csulb.edu/' },
  address: { '@type': 'PostalAddress', addressRegion: 'CA', addressCountry: 'US' },
  sameAs: [GITHUB, LINKEDIN],
};

const crumbs = (...items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', `${SITE}/`], ...items].map(([name, item], i) => ({
    '@type': 'ListItem', position: i + 1, name, item,
  })),
});

/** Shared shell: head, top nav (same as the home page), footer. */
function layout({ path, title, desc, ogType = 'website', ogImage, jsonLd = [], active, body, wide = false }) {
  const url = `${SITE}${path}`;
  const image = ogImage || `${SITE}/assets/og.jpg`;
  const link = (href, label, key) =>
    `<a href="${href}" class="topnav-link${active === key ? ' is-active' : ''}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`;
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

<meta property="og:type" content="${ogType}" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${attr(title)}" />
<meta property="og:description" content="${attr(desc)}" />
<meta property="og:image" content="${image}" />
<meta property="og:site_name" content="Mohammad Zayed" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${url}" />
<meta name="twitter:title" content="${attr(title)}" />
<meta name="twitter:description" content="${attr(desc)}" />
<meta name="twitter:image" content="${image}" />

${jsonLd.map((j) => `<script type="application/ld+json">\n${JSON.stringify(j, null, 2)}\n</script>`).join('\n')}

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

<link rel="stylesheet" href="/styles.css${v}" />
<link rel="stylesheet" href="/pages.css${v}" />

<script data-goatcounter="https://mohammadzayed.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</head>
<body>
<div class="page-bg" aria-hidden="true"></div>

<nav class="topnav" aria-label="Main">
  <div class="topnav-links">
    ${link('/', 'HOME', 'home')}
    ${link('/projects', 'PROJECTS', 'projects')}
    ${link('/about', 'ABOUT', 'about')}
    <a href="/resume" class="topnav-link" target="_blank" rel="noopener noreferrer">RESUME</a>
  </div>
  <span class="topnav-status"><span class="topnav-status-dot" aria-hidden="true"></span>${STATUS}</span>
</nav>

<main class="page${wide ? ' page-wide' : ''}">
${body}
</main>

<footer class="footer">
  <div class="footer-l">
    <div>&copy; 2026 Mohammad Zayed</div>
    <a class="footer-email" href="mailto:${EMAIL}">${EMAIL}</a>
  </div>
  <div class="footer-r">
    <a class="footer-link" href="${LINKEDIN}" rel="me noopener" target="_blank">LinkedIn</a>
    <a class="footer-link" href="${GITHUB}" rel="me noopener" target="_blank">GitHub</a>
    <a class="footer-link" href="/resume">Resume</a>
  </div>
</footer>
<script src="/track.js${v}" defer></script>
<script src="/ph.js${v}" defer></script>
</body>
</html>
`;
}

let secN = 0;
const sec = (label, inner) => `  <section class="sec">
    <h2 class="sec-label"><span>${String(++secN).padStart(2, '0')}</span>${esc(label)}</h2>
    <div class="sec-body">
${inner}
    </div>
  </section>`;

const stats = (cls, metrics) => `<dl class="${cls}">
        ${metrics.map((m) => `<div><dt>${esc(m.l)}</dt><dd>${esc(m.v)}</dd></div>`).join('\n        ')}
      </dl>`;

function renderCaseStudy(p) {
  secN = 0;
  const links = externalLinks(p);
  const body = `  <header class="page-head">
    <p class="page-eyebrow"><a href="/projects">Projects</a> / How I built it</p>
    <h1 class="page-title">${esc(p.name)}</h1>
    <p class="project-tag">${esc(p.tag)}</p>
    <div class="meta-row">
      <span><b>Role</b> ${esc(p.role)}</span>${p.year ? `\n      <span><b>Year</b> ${esc(p.year)}</span>` : ''}
    </div>
  </header>
${p.cover ? `
  <figure class="cover"><img src="/${attr(p.cover)}" alt="${attr(p.name)}" width="1600" height="1000" decoding="async" /></figure>
` : ''}
${[
    sec('Overview', `      <p>${esc(p.overview)}</p>`),
    sec('The problem', `      <p>${esc(p.problem)}</p>`),
    sec('Approach', `      <ul class="approach">
        ${(p.approach || []).map((a) => `<li>${esc(a)}</li>`).join('\n        ')}
      </ul>`),
    (p.metrics || []).length ? sec('By the numbers', `      ${stats('metrics', p.metrics)}`) : '',
    (p.images || []).length ? sec('Screenshots', `      <div class="gallery">
        ${p.images.map((img) => `<a href="/${attr(img)}" target="_blank" rel="noopener"><img src="/${attr(img)}" alt="${attr(p.name)} screenshot" loading="lazy" decoding="async" /></a>`).join('\n        ')}
      </div>`) : '',
    sec('Built with', `      <p class="stack">${(p.stack || []).map(esc).join(' · ')}</p>`),
    links.length ? sec('Links', `      <div class="link-row" style="margin-top:-10px">
        ${links.map((l) => `<a href="${attr(l.href)}" target="_blank" rel="noopener">${esc(l.label)} &#8599;</a>`).join('\n        ')}
      </div>`) : '',
  ].filter(Boolean).join('\n\n')}

  <a class="back-link" href="/projects">&larr; All projects</a>`;

  return layout({
    path: `/projects/${p.id}`,
    title: `${p.name} | Mohammad Zayed`,
    desc: metaDescription(p),
    ogType: 'article',
    ogImage: (p.cover || p.images?.[0]) ? `${SITE}/${p.cover || p.images[0]}` : undefined,
    jsonLd: [crumbs(['Projects', `${SITE}/projects`], [p.name, `${SITE}/projects/${p.id}`])],
    active: 'projects',
    body,
  });
}

function renderProjects() {
  const rows = PROJECTS.map((p, i) => {
    const links = externalLinks(p);
    return `    <li class="prow">
      <div class="prow-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</div>
      <div>
        <div class="prow-head">
          ${p.avatar ? `<img src="/${attr(p.avatar)}" alt="" width="40" height="40" loading="lazy" decoding="async" />` : ''}
          <h2 class="prow-name"><a href="/projects/${p.id}">${esc(p.name)}</a></h2>
        </div>
        <p class="prow-tag">${esc(p.tag)}</p>
        <p class="prow-short">${esc(p.short)}</p>
        ${(p.metrics || []).length ? stats('prow-stats', p.metrics) : ''}
        <div class="prow-links">
          <a href="/projects/${p.id}">How I built it &rarr;</a>
          ${links.map((l) => `<a href="${attr(l.href)}" target="_blank" rel="noopener">${esc(l.label)} &#8599;</a>`).join('\n          ')}
        </div>
      </div>
      ${p.cover ? `<a class="prow-cover" href="/projects/${p.id}" tabindex="-1" aria-hidden="true"><img src="/${attr(p.cover)}" alt="" width="1600" height="1000" loading="${i ? 'lazy' : 'eager'}" decoding="async" /></a>` : ''}
    </li>`;
  }).join('\n');

  const body = `  <header class="page-head">
    <p class="page-eyebrow">Projects</p>
    <h1 class="page-title">Things I built and <em>shipped</em>.</h1>
    <p class="page-lede">Four projects, all built solo. The first one runs my store.</p>
  </header>

  <ol class="plist">
${rows}
  </ol>`;

  return layout({
    path: '/projects',
    title: 'Projects | Mohammad Zayed',
    desc: 'Software projects by Mohammad Zayed: LineReady, the app his Chick-fil-A runs on, LockedIn, Mini Golf Score Tracker and the Chick-fil-A Foothill Ranch website.',
    jsonLd: [
      crumbs(['Projects', `${SITE}/projects`]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: PROJECTS.map((p, i) => ({
          '@type': 'ListItem', position: i + 1, name: p.name, url: `${SITE}/projects/${p.id}`,
        })),
      },
    ],
    active: 'projects',
    wide: true,
    body,
  });
}

const FAQ = [
  ['What does Mohammad Zayed do?', "I'm a Director at the Chick-fil-A in Foothill Ranch, California, and I write the software my store runs on. I'm also finishing a B.S. in Computer Science at Cal State Long Beach."],
  ['What has Mohammad Zayed built?', "Four projects, all solo: LineReady, the restaurant operations platform my store runs on; LockedIn, a nutrition and GLP-1 tracker; Mini Golf Score Tracker; and my store's website and team portal."],
  ['When does Mohammad Zayed graduate?', 'May 2027, with a B.S. in Computer Science from California State University, Long Beach.'],
  ['What roles is Mohammad Zayed looking for?', "Full-time software engineering roles starting after I graduate in May 2027. I don't need visa sponsorship and I'll relocate."],
  ['How do I contact Mohammad Zayed?', 'LinkedIn is the fastest way. My email and GitHub are at the bottom of this page.'],
];
const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

function renderAbout() {
  secN = 0;
  const EXPERIENCE = window.EXPERIENCE || [];
  const SKILL_GROUPS = window.SKILL_GROUPS || [];

  const body = `  <header class="page-head has-photo">
    <img class="page-photo" src="/assets/headshot.webp" alt="Mohammad Zayed" width="800" height="1067" decoding="async" />
    <p class="page-eyebrow">About</p>
    <h1 class="page-title">I'm Mohammad <em>Zayed</em>.</h1>
    <p class="page-lede">I'm a Director at the Chick-fil-A in Foothill Ranch, California, and I write the software my store runs on. I'm finishing a B.S. in Computer Science at Cal State Long Beach and I graduate in May 2027.</p>
  </header>

  <dl class="facts">
    <div><dt>Based in</dt><dd>Orange County, California</dd></div>
    <div><dt>Education</dt><dd>B.S. Computer Science, CSULB, May 2027</dd></div>
    <div><dt>Looking for</dt><dd>Full-time software engineering roles</dd></div>
    <div><dt>Logistics</dt><dd>No visa sponsorship needed. I'll relocate.</dd></div>
  </dl>

${[
    sec('Background', `      <p>I started at the store in March 2022 as a Team Member, became a Shift Lead in June 2023, and have been a Director since June 2024. I've been programming for about 5 years.</p>
      <p>I run daily operations on software I built myself, so I'm my own first user. <a href="/projects/lineready">LineReady</a> started because I was running shifts and watching information get lost in group chats. I built it for the people I work next to, and I hear what's broken from the people using it.</p>
      <p>In July 2026 I founded Zayed Software LLC to hold the apps I build. The rest of my work is on the <a href="/projects">projects page</a>.</p>`),
    sec('Experience', `      <ol class="xp">
        ${EXPERIENCE.map((e) => `<li>
          <div class="xp-top">
            <h3 class="xp-role">${esc(e.role)} <span>· ${esc(e.org.replace(' · ', ', '))}</span></h3>
            <span class="xp-period">${esc(e.period)}</span>
          </div>${e.bullets.length ? `
          <ul>
            ${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('\n            ')}
          </ul>` : ''}
        </li>`).join('\n        ')}
      </ol>`),
    sec('Skills', `      <dl class="skills">
        ${SKILL_GROUPS.map((g) => `<div><dt>${esc(g.label)}</dt><dd>${g.items.map(esc).join(', ')}</dd></div>`).join('\n        ')}
      </dl>`),
    sec('Education', `      <p>B.S. in Computer Science, California State University, Long Beach. I graduate in May 2027.</p>`),
    sec('Quick answers', `      <dl class="faq">
        ${FAQ.map(([q, a]) => `<div><dt>${esc(q)}</dt><dd>${esc(a)}</dd></div>`).join('\n        ')}
      </dl>`),
    sec('Contact', `      <p>LinkedIn is the fastest way to reach me.</p>
      <div class="link-row" style="margin-top:0">
        <a href="${LINKEDIN}" rel="me noopener" target="_blank">LinkedIn &#8599;</a>
        <a href="mailto:${EMAIL}">Email &#8599;</a>
        <a href="${GITHUB}" rel="me noopener" target="_blank">GitHub &#8599;</a>
        <a href="/resume">Resume &#8599;</a>
      </div>`),
  ].join('\n\n')}`;

  return layout({
    path: '/about',
    title: 'About Mohammad Zayed | Software Engineer',
    desc: 'About Mohammad Zayed: a Director at a Chick-fil-A who writes the software his store runs on. B.S. Computer Science, Cal State Long Beach, graduating May 2027. Open to full-time software engineering roles.',
    ogType: 'profile',
    jsonLd: [PERSON, crumbs(['About', `${SITE}/about`]), FAQ_LD],
    active: 'about',
    body,
  });
}

await mkdir(OUT, { recursive: true });
for (const p of PROJECTS) {
  await writeFile(join(OUT, `${p.id}.html`), renderCaseStudy(p));
  console.log(`  projects/${p.id}.html`);
}
await writeFile(join(ROOT, 'projects.html'), renderProjects());
await writeFile(join(ROOT, 'about.html'), renderAbout());
console.log(`  projects.html\n  about.html`);
console.log(`\n✓ Generated ${PROJECTS.length} project pages, the projects index and the about page`);

// Crawlable internal links in index.html.
//
// The homepage is client-rendered, so its raw HTML linked to none of the pages
// above. Search Console showed all four case studies plus /blog as "Discovered
// - currently not indexed" with Last crawled: N/A, while /about — the one
// internal page that was linked from the <noscript> fallback — was indexed.
// Googlebot reads that fallback, so the links belong there. Generated from
// PROJECTS so they can't drift the way the hand-written "Selected work" line
// did: it never listed LineReady at all.
const START = '<!-- crawl-links:start -->';
const END = '<!-- crawl-links:end -->';

const caseStudies = PROJECTS.map(
  (p) => `<a href="/projects/${p.id}">${esc(p.name)}</a>`,
).join(' · ');

const crawlLinks = `    <p>Case studies: ${caseStudies}</p>
    <p>More: <a href="/projects">Projects</a> · <a href="/about">About</a> · <a href="/resume">Resume</a></p>`;

const indexPath = join(ROOT, 'index.html');
const indexHtml = indexSource;
const between = new RegExp(`${START}[\\s\\S]*?${END}`);

if (!between.test(indexHtml)) {
  throw new Error(`index.html is missing the ${START} / ${END} markers`);
}

const nextHtml = indexHtml.replace(between, `${START}\n${crawlLinks}\n    ${END}`);
if (nextHtml !== indexHtml) {
  await writeFile(indexPath, nextHtml);
}
console.log(`✓ Wrote ${PROJECTS.length} crawlable case-study links into index.html`);
