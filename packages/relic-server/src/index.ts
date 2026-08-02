/** Entry point. Cloud Run supplies PORT. */

import { createApp } from './app.ts';

const app = createApp({
  config: {
    serviceOrigin:
      process.env['RELIC_SERVICE_ORIGIN'] ?? 'http://localhost:8080',
    sandboxOrigin:
      process.env['RELIC_SANDBOX_ORIGIN'] ?? 'http://localhost:8081',
    killSwitchEngaged: process.env['RELIC_KILL_SWITCH'] === 'true',
  },
});

const port = Number(process.env['PORT'] ?? 8080);

Bun.serve({ port, fetch: app.fetch });

console.log(`relic server listening on :${port}`);

export { createApp };
