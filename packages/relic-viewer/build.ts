/**
 * Bundles the viewer into `dist/`, which the app server serves as `/assets/`.
 *
 * Three entry points, deliberately separate bundles. `viewer.js` runs on the
 * service origin and holds the key. `sandbox.js` runs on the sandbox origin
 * and must never contain a line of key-handling code, which staying a
 * separate entry point makes true by construction rather than by review.
 * `sw.js` is the service worker and has to sit at the root scope.
 */

import { copyFile, mkdir, readdir } from 'node:fs/promises';

const out = new URL('./dist/', import.meta.url).pathname;
await mkdir(out, { recursive: true });

const built = await Bun.build({
  entrypoints: ['./src/main.ts', './src/sandbox.ts', './src/sw.ts'],
  outdir: out,
  target: 'browser',
  format: 'esm',
  minify: true,
  naming: '[name].js',
});

if (!built.success) {
  for (const log of built.logs) console.error(log);
  process.exit(1);
}

// `main.js` is served as `viewer.js`, because that is the name the shell and
// the service worker's cache list both reference.
await copyFile(`${out}main.js`, `${out}viewer.js`);
await copyFile('./src/styles.css', `${out}styles.css`);

for (const name of await readdir('./public')) {
  await copyFile(`./public/${name}`, `${out}${name}`);
}

const names = (await readdir(out)).sort();
console.log(`built ${names.length} assets: ${names.join(', ')}`);
