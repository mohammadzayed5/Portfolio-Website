// Build script: compiles each .jsx file to a regular .js file in /dist
// All files use shared globals (window.PROJECTS, etc.) so we transpile each
// independently, no bundling needed.

import { build } from 'esbuild';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

const ROOT = new URL('.', import.meta.url).pathname;
const OUT = join(ROOT, 'dist');

// Files to transpile, in dependency order (matches index.html script order)
const FILES = [
  'tweaks-panel.jsx',
  'utils.jsx',
  'tech-icons.jsx',
  'particles.jsx',
  'data.jsx',
  'live-demos.jsx',
  'case-study.jsx',
  'app.jsx',
];

await mkdir(OUT, { recursive: true });

for (const file of FILES) {
  const outfile = join(OUT, file.replace(/\.jsx$/, '.js'));
  await build({
    entryPoints: [join(ROOT, file)],
    outfile,
    loader: { '.jsx': 'jsx' },
    bundle: false,
    minify: true,
    sourcemap: false,
    target: ['es2020'],
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    logLevel: 'info',
  });
}

let VERSION;
try {
  VERSION = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
} catch {
  VERSION = Date.now().toString(36);
}

const HTML_FILES = ['index.html'];
for (const file of HTML_FILES) {
  const path = join(ROOT, file);
  const html = await readFile(path, 'utf-8');
  const updated = html
    .replace(
      /src="\/dist\/([a-z0-9-]+)\.js(?:\?v=[^"]*)?"/g,
      `src="/dist/$1.js?v=${VERSION}"`,
    )
    .replace(
      /href="\/styles\.css(?:\?v=[^"]*)?"/g,
      `href="/styles.css?v=${VERSION}"`,
    );
  if (updated !== html) await writeFile(path, updated);
}

console.log(`\n✓ Built ${FILES.length} files into /dist (v=${VERSION})`);
