/** Entry point. Cloud Run supplies PORT. */

import { createApp } from './app.ts';
import { diskAssets } from './assets.ts';

const app = createApp({
  config: {
    serviceOrigin:
      process.env['RELIC_SERVICE_ORIGIN'] ?? 'http://localhost:8080',
    sandboxOrigin:
      process.env['RELIC_SANDBOX_ORIGIN'] ?? 'http://localhost:8081',
    killSwitchEngaged: process.env['RELIC_KILL_SWITCH'] === 'true',
  },
  assets: diskAssets(
    process.env['RELIC_ASSET_ROOT'] ??
      new URL('../../relic-viewer/dist/', import.meta.url).pathname
  ),
  operatorTokens: parseOperatorTokens(process.env['RELIC_OPERATOR_TOKENS']),
});

/**
 * `name:secret` pairs, comma separated.
 *
 * Per-operator rather than one shared token, because every delete writes an
 * audit record naming the operator and a shared token makes that record a
 * fiction.
 */
function parseOperatorTokens(raw: string | undefined): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const pair of (raw ?? '').split(',')) {
    const [name, secret] = pair.split(':');
    if (name && secret) tokens.set(name.trim(), secret.trim());
  }
  return tokens;
}

const port = Number(process.env['PORT'] ?? 8080);

Bun.serve({ port, fetch: app.fetch });

console.log(`relic server listening on :${port}`);

export { createApp };
