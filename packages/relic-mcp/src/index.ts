#!/usr/bin/env node
/**
 * Entry point for the local MCP server.
 *
 * Plain Node, no Bun APIs, because this ships to npm and runs under whatever
 * runtime `npx` happens to have. Everything it needs (`fetch`, `crypto.subtle`,
 * `TextEncoder`, web streams) is standard from Node 18 on.
 *
 * stdio by default, which is what every agent runner expects. Set
 * `RELIC_MCP_HTTP=1` to serve the Streamable HTTP transport instead.
 *
 * Nothing is written to stdout except JSON-RPC. Diagnostics go to stderr,
 * because a stray stdout write corrupts the protocol stream.
 */

import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { nodeFiles } from './files.ts';
import { createHttpHandler } from './http.ts';
import type { PublishDeps } from './publish.ts';
import { serveStdio } from './server.ts';

const deps: PublishDeps = {
  serviceOrigin: process.env['RELIC_SERVICE_ORIGIN'] ?? 'https://relic.example',
  relicOrigin:
    process.env['RELIC_ORIGIN'] ??
    process.env['RELIC_SERVICE_ORIGIN'] ??
    'https://relic.example',
  files: nodeFiles,
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

  createServer((incoming, outgoing) => {
    const chunks: Buffer[] = [];
    incoming.on('data', (chunk: Buffer) => chunks.push(chunk));
    incoming.on('end', () => {
      void (async () => {
        const url = new URL(
          incoming.url ?? '/',
          `http://${incoming.headers.host ?? `${hostname}:${port}`}`
        );

        if (url.pathname !== '/mcp') {
          outgoing.writeHead(404).end('Not found');
          return;
        }

        const method = incoming.method ?? 'GET';
        const request = new Request(url, {
          method,
          headers: incoming.headers as Record<string, string>,
          ...(method === 'GET' || method === 'HEAD'
            ? {}
            : { body: Buffer.concat(chunks) }),
        });

        const response = await handler(request);
        outgoing.writeHead(
          response.status,
          Object.fromEntries(response.headers.entries())
        );
        const body = await response.arrayBuffer();
        outgoing.end(Buffer.from(body));
      })();
    });
  }).listen(port, hostname, () => {
    console.error(`relic-mcp listening on http://${hostname}:${port}/mcp`);
  });
} else {
  // Node's stdin is a classic Readable; the transport reads a web stream.
  await serveStdio(
    deps,
    Readable.toWeb(process.stdin) as unknown as ReadableStream<Uint8Array>,
    (line) => {
      process.stdout.write(`${line}\n`);
    }
  );
}
