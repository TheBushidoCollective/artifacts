import { beforeEach, describe, expect, test } from 'bun:test';
import { openRelic, parseFragment, parseRelicId } from '@relic/format';
import { createApp } from '@relic/server/src/app.ts';
import { MemoryStorage } from '@relic/server/src/storage.ts';
import { MemoryStore } from '@relic/server/src/store.ts';
import {
  type FileReader,
  guessMimetype,
  type PublishDeps,
  PublishError,
  publish,
  ServerRefusal,
} from '../src/publish.ts';
import { handleMessage, TOOL_DEFINITION, TOOL_NAME } from '../src/server.ts';

const SERVICE = 'https://relic.example';

let now = Date.parse('2026-08-02T12:00:00.000Z');
let storage: MemoryStorage;
let app: ReturnType<typeof createApp>;
let disk: Map<string, Uint8Array>;
let deps: PublishDeps;

/** A filesystem that lives in a Map, so the flow runs without a disk. */
function fakeFiles(): FileReader {
  return {
    resolve: (path) => (path.startsWith('/') ? path : `/work/${path}`),
    basename: (path) => path.slice(path.lastIndexOf('/') + 1),
    async stat(path) {
      if (path.endsWith('/')) return { kind: 'directory' };
      if (path === '/work/a-directory') return { kind: 'directory' };
      if (path === '/work/a-fifo') return { kind: 'other' };
      const bytes = disk.get(path);
      if (bytes === undefined) return { kind: 'other' };
      return { kind: 'file', size: bytes.length };
    },
    async read(path) {
      const bytes = disk.get(path);
      if (bytes === undefined) throw new Error('ENOENT');
      return bytes;
    },
  };
}

/** Routes service URLs at the app and storage URLs at MemoryStorage. */
function shimFetch(): typeof globalThis.fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : String(input));

    if (url.origin === SERVICE) {
      const headers = new Headers(init?.headers);
      headers.set('x-forwarded-for', '198.51.100.10');
      return app.fetch(new Request(url.toString(), { ...init, headers }));
    }

    if (url.hostname === 'storage.invalid') {
      const segments = url.pathname.split('/').filter((s) => s.length > 0);
      const relicId = segments[1] as string;

      if (init?.method === 'PUT') {
        const body = init.body as Uint8Array;
        storage.put(relicId, new Uint8Array(body));
        return new Response(null, { status: 200 });
      }

      const bytes = await storage.read(relicId);
      if (bytes === undefined) return new Response(null, { status: 404 });
      return new Response(bytes as unknown as BodyInit, { status: 200 });
    }

    return new Response(null, { status: 404 });
  }) as typeof globalThis.fetch;
}

/** Records every /api/grant request body, so tests see the wire, not intent. */
function captureGrants(
  sink: Record<string, unknown>[]
): typeof globalThis.fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : String(input));
    if (url.pathname === '/api/grant') {
      sink.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    }
    return deps.fetch(input, init);
  }) as typeof globalThis.fetch;
}

beforeEach(() => {
  now = Date.parse('2026-08-02T12:00:00.000Z');
  storage = new MemoryStorage();
  disk = new Map();
  app = createApp({
    store: new MemoryStore(),
    storage,
    now: () => now,
    operatorTokens: new Map([['jason', 'operator-secret']]),
  });
  deps = {
    serviceOrigin: SERVICE,
    relicOrigin: SERVICE,
    files: fakeFiles(),
    fetch: shimFetch(),
    clientName: 'relic-mcp/0.1.0 (test)',
  };
});

function writeFile(path: string, content: string | Uint8Array): void {
  disk.set(
    path,
    typeof content === 'string' ? new TextEncoder().encode(content) : content
  );
}

/** Stand in for the viewer: mint, fetch, decrypt. */
async function open(url: string, ip = '203.0.113.5') {
  const parsed = new URL(url);
  const relicId = parsed.pathname.slice(1);
  const { key, version } = parseFragment(parsed.hash);

  const mintResponse = await app.fetch(
    new Request(`${SERVICE}/api/relics/${relicId}/mint`, {
      method: 'POST',
      headers: { 'x-forwarded-for': ip },
    })
  );
  if (!mintResponse.ok) {
    return {
      mintStatus: mintResponse.status,
      problem: await mintResponse.json(),
    };
  }

  const mint = (await mintResponse.json()) as {
    url: string;
    object_length: number;
  };
  const bytes = new Uint8Array(
    await (await deps.fetch(mint.url)).arrayBuffer()
  );
  expect(bytes.length).toBe(mint.object_length);

  const opened = await openRelic(bytes, key, version);
  return { mintStatus: 200, opened, mint };
}

describe('the whole loop', () => {
  test('publishes a markdown file and a recipient reads it back byte for byte', async () => {
    const body = '# Q3 report\n\nRevenue was up.\n';
    writeFile('/work/report.md', body);

    const result = await publish({ path: 'report.md' }, deps);

    expect(result.relic_id).toBe(parseRelicId(result.relic_id));
    expect(result.renderer_class).toBe('markdown');
    expect(result.filename).toBe('report.md');
    expect(result.resolved_path).toBe('/work/report.md');

    now += 10 * 60 * 1000;
    const viewed = await open(result.url);

    expect(viewed.mintStatus).toBe(200);
    expect(new TextDecoder().decode(viewed.opened?.content)).toBe(body);
    expect(viewed.opened?.envelope.entries[0]?.filename).toBe('report.md');
    expect(viewed.opened?.envelope.entries[0]?.mimetype).toBe('text/markdown');
  });

  test('round trips a binary payload', async () => {
    const png = new Uint8Array(5000);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    for (let index = 8; index < png.length; index++) png[index] = index % 251;
    writeFile('/work/chart.png', png);

    const result = await publish({ path: 'chart.png' }, deps);
    expect(result.renderer_class).toBe('image');

    now += 10 * 60 * 1000;
    const viewed = await open(result.url);
    expect([...(viewed.opened?.content ?? [])]).toEqual([...png]);
  });

  test('round trips a zero-byte file, which classes as binary', async () => {
    writeFile('/work/empty.md', new Uint8Array(0));

    const result = await publish({ path: 'empty.md' }, deps);
    expect(result.renderer_class).toBe('binary');

    now += 10 * 60 * 1000;
    const viewed = await open(result.url);
    expect(viewed.opened?.content).toHaveLength(0);
  });

  test('round trips content spanning many records', async () => {
    const big = new Uint8Array(400_000);
    for (let index = 0; index < big.length; index++) big[index] = index % 256;
    writeFile('/work/big.bin', big);

    const result = await publish({ path: 'big.bin' }, deps);
    now += 10 * 60 * 1000;
    const viewed = await open(result.url);
    expect([...(viewed.opened?.content ?? [])]).toEqual([...big]);
  });

  test('the filename override reaches the envelope, not the server', async () => {
    writeFile('/work/tmp-xyz.md', 'hello');
    const result = await publish(
      { path: 'tmp-xyz.md', filename: 'Q3-layoffs-final.md' },
      deps
    );

    now += 10 * 60 * 1000;
    const viewed = await open(result.url);
    expect(viewed.opened?.envelope.entries[0]?.filename).toBe(
      'Q3-layoffs-final.md'
    );

    // The server must hold nothing finer than the class and the client name.
    const row = await app.store.getRelic(result.relic_id);
    expect(JSON.stringify(row)).not.toContain('Q3-layoffs-final');
    expect(JSON.stringify(row)).not.toContain('tmp-xyz');
  });
});

describe('what the server never learns', () => {
  test('the key never appears in anything the server holds', async () => {
    writeFile('/work/secret.md', 'the numbers');
    const result = await publish({ path: 'secret.md' }, deps);
    const fragment = new URL(result.url).hash.slice(1);

    const everything = JSON.stringify({
      relic: await app.store.getRelic(result.relic_id),
      mintLog: await app.store.readMintLog(),
      reports: await app.store.readAbuseReports(),
    });
    expect(everything).not.toContain(fragment);
    expect(everything).not.toContain(fragment.slice(2));
  });

  test('the plaintext never appears in the stored object', async () => {
    const secret = 'CONFIDENTIAL-MARKER-9f3a';
    writeFile('/work/secret.md', `# Notes\n\n${secret}\n`);
    const result = await publish({ path: 'secret.md' }, deps);

    const stored = await storage.read(result.relic_id);
    expect(new TextDecoder().decode(stored)).not.toContain(secret);
  });

  test('the server stores the class and the client name, and nothing finer', async () => {
    writeFile('/work/notes.md', 'hello');
    const result = await publish({ path: 'notes.md' }, deps);

    const row = await app.store.getRelic(result.relic_id);
    expect(row?.rendererClass).toBe('markdown');
    expect(row?.publishingClient).toBe('relic-mcp/0.1.0 (test)');
    expect(JSON.stringify(row)).not.toContain('text/markdown');
    expect(JSON.stringify(row)).not.toContain('notes.md');
  });
});

describe('local refusals, before any HTTP', () => {
  test('refuses a directory and names the fix', async () => {
    await expect(publish({ path: 'a-directory' }, deps)).rejects.toMatchObject({
      code: 'source_is_directory',
    });
  });

  test('refuses a non-regular file', async () => {
    await expect(publish({ path: 'a-fifo' }, deps)).rejects.toMatchObject({
      code: 'source_not_regular_file',
    });
  });

  test('refuses a missing file', async () => {
    await expect(publish({ path: 'nope.md' }, deps)).rejects.toBeInstanceOf(
      PublishError
    );
  });

  test('the size precheck uses the server number, not a compiled-in constant', async () => {
    writeFile('/work/huge.bin', new Uint8Array(1024));
    const strict = createApp({
      store: new MemoryStore(),
      storage,
      now: () => now,
      config: { plaintextCapBytes: 512 },
    });
    app = strict;

    try {
      await publish({ path: 'huge.bin' }, deps);
      throw new Error('expected a refusal');
    } catch (error) {
      expect(error).toBeInstanceOf(PublishError);
      const failure = error as PublishError;
      expect(failure.code).toBe('local_size_precheck_failed');
      expect(failure.details['size_limit_bytes']).toBe(512);
      expect(failure.details['size_basis']).toBe('plaintext');
    }
  });

  test('a local refusal costs no grant', async () => {
    await publish({ path: 'a-directory' }, deps).catch(() => undefined);
    expect(await app.store.readMintLog()).toHaveLength(0);
  });
});

describe('server refusals reach the caller with their code', () => {
  test('a paused service surfaces service_paused', async () => {
    app = createApp({
      store: new MemoryStore(),
      storage,
      now: () => now,
      config: { killSwitchEngaged: true },
    });
    writeFile('/work/notes.md', 'hello');

    try {
      await publish({ path: 'notes.md' }, deps);
      throw new Error('expected a refusal');
    } catch (error) {
      expect(error).toBeInstanceOf(ServerRefusal);
      expect((error as ServerRefusal).code).toBe('service_paused');
      expect((error as ServerRefusal).status).toBe(503);
    }
  });
});

describe('the recipient experience on a dead relic', () => {
  test('a removed relic reads as removed, never as a decrypt failure', async () => {
    writeFile('/work/notes.md', 'hello');
    const result = await publish({ path: 'notes.md' }, deps);

    await app.fetch(
      new Request(`${SERVICE}/api/relics/${result.relic_id}`, {
        method: 'DELETE',
        headers: { authorization: 'Bearer operator-secret' },
      })
    );

    const viewed = await open(result.url);
    expect(viewed.mintStatus).toBe(410);
    expect(viewed.problem.code).toBe('relic_removed');
    expect(viewed.problem.report_url).toBe(`${SERVICE}/abuse`);
  });

  test('an expired relic reads as expired', async () => {
    // Expiry is opt-in now, so this relic only dies because its publisher
    // said it should.
    writeFile('/work/notes.md', 'hello');
    const result = await publish({ path: 'notes.md', ttl_days: 7 }, deps);
    now += 8 * 86_400 * 1000;

    const viewed = await open(result.url);
    expect(viewed.mintStatus).toBe(410);
    expect(viewed.problem.code).toBe('relic_expired');
  });
});

describe('publisher-chosen lifetimes', () => {
  test('forwards ttl_days on the grant and reports the expiry date', async () => {
    writeFile('/work/notes.md', 'hello');
    const grants: Record<string, unknown>[] = [];

    const result = await publish(
      { path: 'notes.md', ttl_days: 3 },
      { ...deps, fetch: captureGrants(grants) }
    );

    expect(grants).toHaveLength(1);
    expect(grants[0]?.['ttl_days']).toBe(3);
    expect(Date.parse(result.relic_expires_at ?? '')).not.toBeNaN();

    // The lifetime took effect server-side, not just on the wire.
    const row = await app.store.getRelic(result.relic_id);
    expect(row?.expiresAt).toBe(now + 3 * 86_400 * 1000);
  });

  test('omits ttl_days when none was supplied, and the relic never expires', async () => {
    writeFile('/work/notes.md', 'hello');
    const grants: Record<string, unknown>[] = [];

    const result = await publish(
      { path: 'notes.md' },
      { ...deps, fetch: captureGrants(grants) }
    );

    expect(grants).toHaveLength(1);
    // The field is absent, not zero and not null: an unset lifetime is the
    // server's default to make, never this client's guess.
    expect('ttl_days' in (grants[0] ?? {})).toBe(false);
    expect(result.relic_expires_at).toBeNull();

    const row = await app.store.getRelic(result.relic_id);
    expect(row?.expiresAt).toBeUndefined();
  });

  test('a relic without a lifetime is still readable after any wait', async () => {
    writeFile('/work/notes.md', 'hello');
    const result = await publish({ path: 'notes.md' }, deps);
    now += 3650 * 86_400 * 1000;

    const viewed = await open(result.url);
    expect(viewed.mintStatus).toBe(200);
  });
});

describe('the MCP surface', () => {
  test('advertises publish and describe, both prefixed with the product name', async () => {
    const response = await handleMessage(
      { jsonrpc: '2.0', id: 1, method: 'tools/list' },
      deps
    );
    const tools = (response?.result as { tools: { name: string }[] }).tools;
    expect(tools.map((t) => t.name)).toEqual([
      'relic_publish',
      'relic_describe_client',
    ]);
    // The spec's own remedy for cross-server collisions is a name prefix.
    for (const tool of tools) {
      expect(tool.name.startsWith('relic')).toBe(true);
    }
    expect(TOOL_NAME.startsWith('relic')).toBe(true);
  });

  test('describe_client reads nothing and sends nothing', async () => {
    // The inspection tool exists so a local client is not opaque to the agent
    // driving it. It must not be a second way to touch the disk or network.
    const before = disk.size;
    const response = await handleMessage(
      {
        jsonrpc: '2.0',
        id: 9,
        method: 'tools/call',
        params: { name: 'relic_describe_client', arguments: {} },
      },
      deps
    );

    const result = response?.result as {
      isError: boolean;
      content: { text: string }[];
      structuredContent: Record<string, unknown>;
    };

    expect(result.isError).toBe(false);
    expect(disk.size).toBe(before);
    expect(result.structuredContent['key_transmitted_to_service']).toBe(false);
    expect(result.structuredContent['plaintext_transmitted_to_service']).toBe(
      false
    );
  });

  test('describe_client states the transcript leak, not just the good news', async () => {
    const response = await handleMessage(
      {
        jsonrpc: '2.0',
        id: 10,
        method: 'tools/call',
        params: { name: 'relic_describe_client', arguments: {} },
      },
      deps
    );
    const text = (response?.result as { content: { text: string }[] })
      .content[0]?.text as string;

    expect(text).toContain('AES-128-GCM');
    expect(text).toContain('RFC 8188');
    expect(text).toContain('transcript');
    expect(text).toContain('never sent anywhere in');
  });

  test('accepts a path and refuses inline content by schema', () => {
    const schema = TOOL_DEFINITION.inputSchema;
    expect(Object.keys(schema.properties)).toEqual([
      'path',
      'filename',
      'ttl_days',
    ]);
    expect(schema.additionalProperties).toBe(false);
    // Inline content would put the plaintext in the transcript too,
    // compounding the leak from "the key leaks" to "the key and the file leak".
    expect(Object.keys(schema.properties)).not.toContain('content');
  });

  test('the schema declares the lifetime bounds the contract fixes', () => {
    const ttl = TOOL_DEFINITION.inputSchema.properties['ttl_days'];
    expect(ttl.type).toBe('integer');
    expect(ttl.minimum).toBe(1);
    expect(ttl.maximum).toBe(3650);
  });

  test('refuses a malformed ttl_days before any HTTP, like a missing path', async () => {
    const grants: Record<string, unknown>[] = [];

    for (const ttl_days of [0, -1, 3651, 1.5, '7']) {
      const response = await handleMessage(
        {
          jsonrpc: '2.0',
          id: 11,
          method: 'tools/call',
          params: {
            name: TOOL_NAME,
            arguments: { path: 'notes.md', ttl_days },
          },
        },
        { ...deps, fetch: captureGrants(grants) }
      );
      // A lifetime the contract cannot honor means the call cannot be made;
      // answering it by publishing forever is the opposite of what was asked.
      expect(response?.error?.code).toBe(-32602);
    }
    expect(grants).toHaveLength(0);
  });

  test('a null relic_expires_at is reported as no expiry, not a bogus date', async () => {
    writeFile('/work/notes.md', '# hello');
    const response = await handleMessage(
      {
        jsonrpc: '2.0',
        id: 12,
        method: 'tools/call',
        params: { name: TOOL_NAME, arguments: { path: 'notes.md' } },
      },
      deps
    );

    const result = response?.result as {
      isError: boolean;
      structuredContent: { relic_expires_at: string | null };
      content: { text: string }[];
    };
    expect(result.isError).toBe(false);
    expect(result.structuredContent.relic_expires_at).toBeNull();
    expect(result.content[0]?.text).toContain('does not expire');
    expect(result.content[0]?.text).not.toContain('Expires null');
  });

  test('a ttl_days publish reports the expiry date in the same breath', async () => {
    writeFile('/work/notes.md', '# hello');
    const response = await handleMessage(
      {
        jsonrpc: '2.0',
        id: 13,
        method: 'tools/call',
        params: {
          name: TOOL_NAME,
          arguments: { path: 'notes.md', ttl_days: 30 },
        },
      },
      deps
    );

    const result = response?.result as {
      isError: boolean;
      structuredContent: { relic_expires_at: string | null };
      content: { text: string }[];
    };
    expect(result.isError).toBe(false);
    expect(typeof result.structuredContent.relic_expires_at).toBe('string');
    expect(result.content[0]?.text).toContain('Expires ');
  });

  test('does not expose the renderer class as an input', () => {
    expect(Object.keys(TOOL_DEFINITION.inputSchema.properties)).not.toContain(
      'renderer_class'
    );
  });

  test('answers initialize and server/discover', async () => {
    const legacy = await handleMessage(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-06-18' },
      },
      deps
    );
    expect(
      (legacy?.result as { serverInfo: { name: string } }).serverInfo.name
    ).toBe('relic');

    const discover = await handleMessage(
      { jsonrpc: '2.0', id: 2, method: 'server/discover' },
      deps
    );
    expect(
      (discover?.result as { protocolVersions: string[] }).protocolVersions
    ).toContain('2026-07-28');
  });

  test('a call returns the full URL including the fragment', async () => {
    writeFile('/work/notes.md', '# hello');
    const response = await handleMessage(
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: TOOL_NAME, arguments: { path: 'notes.md' } },
      },
      deps
    );

    const result = response?.result as {
      structuredContent: { url: string };
      isError: boolean;
      content: { text: string }[];
    };
    expect(result.isError).toBe(false);
    expect(result.structuredContent.url).toContain('#r1');
    // The transcript consequence is disclosed in the same breath.
    expect(result.content[0]?.text).toContain('transcript');
  });

  test('returns all eight result members', async () => {
    writeFile('/work/notes.md', '# hello');
    const response = await handleMessage(
      {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: TOOL_NAME, arguments: { path: 'notes.md' } },
      },
      deps
    );
    const structured = (
      response?.result as { structuredContent: Record<string, unknown> }
    ).structuredContent;

    expect(Object.keys(structured).sort()).toEqual([
      'disclosure_url',
      'filename',
      'relic_expires_at',
      'relic_id',
      'renderer_class',
      'report_url',
      'resolved_path',
      'url',
    ]);
  });

  test('a failed publish is a tool error, not a protocol error', async () => {
    const response = await handleMessage(
      {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: { name: TOOL_NAME, arguments: { path: 'a-directory' } },
      },
      deps
    );

    expect(response?.error).toBeUndefined();
    const result = response?.result as {
      isError: boolean;
      structuredContent: { code: string };
    };
    expect(result.isError).toBe(true);
    expect(result.structuredContent.code).toBe('source_is_directory');
  });

  test('a missing path is a protocol error, because the call cannot be made', async () => {
    const response = await handleMessage(
      {
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: { name: TOOL_NAME, arguments: {} },
      },
      deps
    );
    expect(response?.error?.code).toBe(-32602);
  });

  test('an unknown tool name is refused', async () => {
    const response = await handleMessage(
      {
        jsonrpc: '2.0',
        id: 7,
        method: 'tools/call',
        params: { name: 'publish', arguments: { path: 'notes.md' } },
      },
      deps
    );
    expect(response?.error?.code).toBe(-32602);
  });

  test('a notification gets no response', async () => {
    const response = await handleMessage(
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      deps
    );
    expect(response).toBeUndefined();
  });
});

describe('guessMimetype', () => {
  test('maps known extensions', () => {
    expect(guessMimetype('a.md', 'markdown')).toBe('text/markdown');
    expect(guessMimetype('a.png', 'image')).toBe('image/png');
    expect(guessMimetype('a.html', 'html')).toBe('text/html');
  });

  test('falls back by class when the extension is unknown', () => {
    expect(guessMimetype('a.wat', 'code')).toBe('text/plain');
    expect(guessMimetype('noextension', 'binary')).toBe(
      'application/octet-stream'
    );
  });
});
