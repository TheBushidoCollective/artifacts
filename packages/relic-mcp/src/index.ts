#!/usr/bin/env bun
/**
 * Entry point for the local MCP server.
 *
 * stdio by default, which is what every agent runner expects. Set
 * `RELIC_MCP_HTTP=1` to serve the Streamable HTTP transport instead.
 *
 * Nothing is written to stdout except JSON-RPC. Diagnostics go to stderr,
 * because a stray stdout write corrupts the protocol stream.
 */

import { bunFiles } from './files.ts';
import { createHttpHandler } from './http.ts';
import type { PublishDeps } from './publish.ts';
import { serveStdio } from './server.ts';

const deps: PublishDeps = {
  serviceOrigin: process.env['RELIC_SERVICE_ORIGIN'] ?? 'https://relic.example',
  relicOrigin:
    process.env['RELIC_ORIGIN'] ??
    process.env['RELIC_SERVICE_ORIGIN'] ??
    'https://relic.example',
  files: bunFiles,
  fetch: globalThis.fetch,
  clientName: process.env['RELIC_CLIENT_NAME'] ?? 'relic-mcp/0.1.0',
};

if (process.env['RELIC_MCP_HTTP'] === '1') {
  const port = Number(process.env['RELIC_MCP_PORT'] ?? 7333);
  // Loopback, not 0.0.0.0. This process can read any file its user can, so
  // binding it to a network interface hands that reach to the network.
  const hostname = process.env['RELIC_MCP_HOST'] ?? '127.0.0.1';

  const allowedOrigins = (process.env['RELIC_MCP_ALLOWED_ORIGINS'] ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const handler = createHttpHandler(deps, { allowedOrigins });

  Bun.serve({
    port,
    hostname,
    fetch: (request) => {
      const url = new URL(request.url);
      if (url.pathname !== '/mcp') {
        return new Response('Not found', { status: 404 });
      }
      return handler(request);
    },
  });

  console.error(`relic-mcp listening on http://${hostname}:${port}/mcp`);
} else {
  await serveStdio(deps, Bun.stdin.stream(), (line) => {
    Bun.write(Bun.stdout, `${line}\n`);
  });
}
