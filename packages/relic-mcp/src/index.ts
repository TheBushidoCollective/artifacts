#!/usr/bin/env bun
/**
 * Entry point for the local stdio MCP server.
 *
 * Nothing is written to stdout except JSON-RPC. Diagnostics go to stderr,
 * because a stray stdout write corrupts the protocol stream.
 */

import { bunFiles } from './files.ts';
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

await serveStdio(deps, Bun.stdin.stream(), (line) => {
  Bun.write(Bun.stdout, `${line}\n`);
});
