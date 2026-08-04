/** Entry point. Cloud Run supplies PORT. */

import { createApp } from './app.ts';
import { diskAssets } from './assets.ts';
import { gcsStorage } from './gcs.ts';
import { MemoryStorage, type ObjectStorage } from './storage.ts';

/**
 * Real storage when credentials are present, memory otherwise.
 *
 * The fallback is loud, and in production it is refused outright. A service
 * that silently serves from memory looks healthy, accepts publishes, and
 * loses every relic on restart, which is a failure the recipient discovers
 * rather than the operator.
 */
function resolveStorage(): ObjectStorage {
  const bucket = process.env['RELIC_GCS_BUCKET'];
  const clientEmail = process.env['RELIC_GCS_CLIENT_EMAIL'];
  // Secret managers commonly hand back the PEM with escaped newlines.
  const privateKey = process.env['RELIC_GCS_PRIVATE_KEY']?.replace(
    /\\n/g,
    '\n'
  );
  const prefix = process.env['RELIC_GCS_PREFIX'];

  if (bucket && clientEmail && privateKey) {
    return gcsStorage({
      bucket,
      clientEmail,
      privateKey,
      ...(prefix ? { prefix } : {}),
    });
  }

  if (process.env['NODE_ENV'] === 'production') {
    throw new Error(
      'RELIC_GCS_BUCKET, RELIC_GCS_CLIENT_EMAIL, and RELIC_GCS_PRIVATE_KEY ' +
        'are required in production. Refusing to start on memory storage.'
    );
  }

  console.warn(
    'relic: no GCS credentials, using in-memory storage. Every relic is lost ' +
      'on restart.'
  );
  return new MemoryStorage();
}

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

const app = createApp({
  config: {
    serviceOrigin:
      process.env['RELIC_SERVICE_ORIGIN'] ?? 'http://localhost:8080',
    sandboxOrigin:
      process.env['RELIC_SANDBOX_ORIGIN'] ?? 'http://localhost:8081',
    killSwitchEngaged: process.env['RELIC_KILL_SWITCH'] === 'true',
  },
  storage: resolveStorage(),
  assets: diskAssets(
    process.env['RELIC_ASSET_ROOT'] ??
      new URL('../../relic-viewer/dist/', import.meta.url).pathname
  ),
  operatorTokens: parseOperatorTokens(process.env['RELIC_OPERATOR_TOKENS']),
});

const port = Number(process.env['PORT'] ?? 8080);

Bun.serve({ port, fetch: app.fetch });

console.log(`relic server listening on :${port}`);

export { createApp };
