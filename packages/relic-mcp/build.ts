/**
 * Bundle the client into one readable Node ESM file.
 *
 * Deliberately NOT minified. The whole point of shipping source rather than a
 * compiled binary is that an agent, or a person, can read what the encryption
 * path actually does before trusting it. A minified bundle would be a black
 * box wearing a `.js` extension.
 *
 * One file rather than a tree, because the alternative is publishing
 * `@relic/format` separately and asking a reader to follow imports across
 * packages to answer "what happens to my file".
 */

import { chmod, mkdir } from 'node:fs/promises';

const out = new URL('./dist/', import.meta.url).pathname;
await mkdir(out, { recursive: true });

const built = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: out,
  target: 'node',
  format: 'esm',
  minify: false,
  splitting: false,
  naming: 'relic-mcp.js',
  // No banner: Bun preserves the entrypoint's own shebang, and adding a
  // second one puts `#!` on line 2, which is a syntax error rather than a
  // comment.
});

if (!built.success) {
  for (const log of built.logs) console.error(log);
  process.exit(1);
}

const bundle = `${out}relic-mcp.js`;
const text = await Bun.file(bundle).text();

if (!text.startsWith('#!/usr/bin/env node')) {
  console.error('bundle lost its shebang; `npx relic-mcp` would not run');
  process.exit(1);
}

// `bin` entries have to be executable in the published tarball.
await chmod(bundle, 0o755);

console.log(
  `built dist/relic-mcp.js: ${text.split('\n').length} readable lines`
);
