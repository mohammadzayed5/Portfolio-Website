// Build script: compiles each .jsx file to a regular .js file in /dist
// All files use shared globals (window.PROJECTS, etc.) so we transpile each
// independently, no bundling needed.

import { build } from 'esbuild';
import { mkdir, readdir } from 'fs/promises';
import { join } from 'path';

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

console.log(`\n✓ Built ${FILES.length} files into /dist`);
