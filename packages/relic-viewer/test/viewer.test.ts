import { beforeEach, describe, expect, test } from 'bun:test';
import { encryptRelic, generateKey, generateRelicId } from '@relic/format';
import { createApp } from '@relic/server/src/app.ts';
import { MemoryStorage } from '@relic/server/src/storage.ts';
import { MemoryStore } from '@relic/server/src/store.ts';
import {
  deadFromProblem,
  load,
  routeFor,
  type ViewerDeps,
} from '../src/viewer.ts';

const SERVICE = 'https://relic.example';
const utf8 = (text: string) => new TextEncoder().encode(text);

let now = Date.parse('2026-08-02T12:00:00.000Z');
let storage: MemoryStorage;
let app: ReturnType<typeof createApp>;
let stripped: boolean;
let fragmentReads: number;

function shimFetch(): typeof globalThis.fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : String(input));
    if (url.origin === SERVICE) {
      const headers = new Headers(init?.headers);
      headers.set('x-forwarded-for', '203.0.113.5');
      return app.fetch(new Request(url.toString(), { ...init, headers }));
    }
    const relicId = url.pathname.split('/').filter(Boolean)[1] as string;
    const bytes = await storage.read(relicId);
    if (bytes === undefined) return new Response(null, { status: 404 });
    return new Response(bytes as unknown as BodyInit, { status: 200 });
  }) as typeof globalThis.fetch;
}

function deps(fragment: string, href = `${SERVICE}/x#${fragment}`): ViewerDeps {
  return {
    serviceOrigin: SERVICE,
    fetch: shimFetch(),
    takeFragment: () => {
      fragmentReads += 1;
      return fragment;
    },
    stripFragment: () => {
      stripped = true;
    },
    locationHref: href,
  };
}

/** Put a real relic in place and return its id, key, and fragment. */
async function seed(
  content: Uint8Array,
  filename: string,
  mimetype: string
): Promise<{ id: string; fragment: string }> {
  const id = generateRelicId();
  const key = generateKey();

  await app.fetch(
    new Request(`${SERVICE}/api/challenge`, {
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.10' },
    })
  );
  const challenge = (await app
    .fetch(
      new Request(`${SERVICE}/api/challenge`, {
        method: 'POST',
        headers: { 'x-forwarded-for': '198.51.100.10' },
      })
    )
    .then((r) => r.json())) as { challenge_nonce: string };

  await app.fetch(
    new Request(`${SERVICE}/api/grant`, {
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.10' },
      body: JSON.stringify({
        challenge_nonce: challenge.challenge_nonce,
        relic_id: id,
        renderer_class: 'markdown',
        publishing_client: 'test',
        declared_size_bytes: content.length,
      }),
    })
  );

  storage.put(id, await encryptRelic({ content, filename, mimetype, key }));
  now += 10 * 60 * 1000;

  const { encodeFragment } = await import('@relic/format');
  return { id, fragment: encodeFragment(key) };
}

beforeEach(() => {
  now = Date.parse('2026-08-02T12:00:00.000Z');
  storage = new MemoryStorage();
  stripped = false;
  fragmentReads = 0;
  app = createApp({
    store: new MemoryStore(),
    storage,
    now: () => now,
    operatorTokens: new Map([['jason', 'operator-secret']]),
  });
});

describe('the fragment', () => {
  test('is read once and stripped from the address bar', async () => {
    const { id, fragment } = await seed(
      utf8('# hi'),
      'notes.md',
      'text/markdown'
    );
    await load(id, deps(fragment));

    expect(fragmentReads).toBe(1);
    expect(stripped).toBe(true);
  });

  test('is stripped even when the relic turns out to be dead', async () => {
    await load(generateRelicId(), deps('r1AAAAAAAAAAAAAAAAAAAA'));
    expect(stripped).toBe(true);
  });

  test('an absent fragment is a dead page pointing at the original link', async () => {
    const state = await load(generateRelicId(), deps(''));
    expect(state.kind).toBe('dead');
    if (state.kind !== 'dead') return;
    expect(state.dead.code).toBe('fragment_missing');
    expect(state.dead.action).toBe('reopen-original-link');
    // A reload is the common cause, and it must not read as a decrypt error.
    expect(state.dead.detail).toContain('reloaded');
  });

  test('an unknown version refuses before any fetch, so no mint is spent', async () => {
    const { id } = await seed(utf8('# hi'), 'notes.md', 'text/markdown');
    const before = (await app.store.readMintLog()).length;

    const state = await load(id, deps('r9AAAAAAAAAAAAAAAAAAAA'));

    expect(state.kind).toBe('dead');
    if (state.kind === 'dead') expect(state.dead.code).toBe('unknown_version');
    expect(await app.store.readMintLog()).toHaveLength(before);
    expect((await app.store.getRelic(id))?.mintsUsed).toBe(0);
  });

  test('a truncated fragment says the link looks truncated', async () => {
    const { id, fragment } = await seed(
      utf8('# hi'),
      'notes.md',
      'text/markdown'
    );
    const state = await load(id, deps(fragment.slice(0, -1)));

    expect(state.kind).toBe('dead');
    if (state.kind === 'dead') {
      expect(state.dead.code).toBe('fragment_malformed');
    }
  });

  test('the share url keeps the fragment, backing the copy-link affordance', async () => {
    const { id, fragment } = await seed(
      utf8('# hi'),
      'notes.md',
      'text/markdown'
    );
    const href = `${SERVICE}/${id}#${fragment}`;
    const state = await load(id, deps(fragment, href));

    expect(state.kind).toBe('ready');
    if (state.kind === 'ready') expect(state.view.shareUrl).toBe(href);
  });
});

describe('rendering', () => {
  test('opens markdown and hands back the exact bytes', async () => {
    const body = '# Q3\n\nRevenue was up.\n';
    const { id, fragment } = await seed(
      utf8(body),
      'report.md',
      'text/markdown'
    );
    const state = await load(id, deps(fragment));

    expect(state.kind).toBe('ready');
    if (state.kind !== 'ready') return;
    expect(state.view.route).toBe('markdown');
    expect(state.view.filename).toBe('report.md');
    expect(new TextDecoder().decode(state.view.content)).toBe(body);
  });

  test('routes code to the code view', async () => {
    const { id, fragment } = await seed(
      utf8('const x = 1;\n'),
      'main.ts',
      'text/plain'
    );
    const state = await load(id, deps(fragment));
    if (state.kind === 'ready') expect(state.view.route).toBe('code');
  });

  test('routes an image to the image view', async () => {
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const { id, fragment } = await seed(png, 'chart.png', 'image/png');
    const state = await load(id, deps(fragment));
    if (state.kind === 'ready') expect(state.view.route).toBe('image');
  });

  test('routes html to the sandbox origin, never inline', async () => {
    const { id, fragment } = await seed(
      utf8('<!doctype html><p>hi'),
      'page.html',
      'text/html'
    );
    const state = await load(id, deps(fragment));
    if (state.kind === 'ready') {
      expect(state.view.route).toBe('sandboxed-html');
    }
  });

  test('an archive is download-only in the first release', async () => {
    const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]);
    const { id, fragment } = await seed(zip, 'bundle.zip', 'application/zip');
    const state = await load(id, deps(fragment));
    if (state.kind === 'ready') expect(state.view.route).toBe('download');
  });
});

describe('the declared versus sniffed rule', () => {
  test('HTML wearing an image name renders as an image, not as HTML', async () => {
    // The publisher is the threat. Declaring `.png` on an HTML payload would
    // otherwise win inline rendering on the origin holding the fragment
    // secret, which is fragment theft in one step.
    const { id, fragment } = await seed(
      utf8('<!doctype html><script>steal(location.hash)</script>'),
      'innocent.png',
      'image/png'
    );
    const state = await load(id, deps(fragment));

    expect(state.kind).toBe('ready');
    if (state.kind !== 'ready') return;
    expect(state.view.route).not.toBe('sandboxed-html');
    expect(state.view.downgradeNotice).toBeDefined();
  });

  test('tells the recipient when it downgraded', async () => {
    const { id, fragment } = await seed(
      new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]),
      'notes.md',
      'text/markdown'
    );
    const state = await load(id, deps(fragment));

    if (state.kind === 'ready') {
      expect(state.view.downgradeNotice).toContain('safer way');
      expect(state.view.route).toBe('download');
    }
  });

  test('agreement produces no notice', async () => {
    const { id, fragment } = await seed(
      utf8('# hi'),
      'notes.md',
      'text/markdown'
    );
    const state = await load(id, deps(fragment));
    if (state.kind === 'ready') {
      expect(state.view.downgradeNotice).toBeUndefined();
    }
  });

  test('routeFor never promotes to a more privileged path', () => {
    const html = utf8('<!doctype html><p>x');
    expect(routeFor('x.png', 'image/png', html).route).not.toBe(
      'sandboxed-html'
    );
    expect(routeFor('x.txt', 'text/plain', html).route).not.toBe(
      'sandboxed-html'
    );
  });

  test('an SVG is treated as a web page, because it carries script', () => {
    const svg = utf8('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    expect(routeFor('x.svg', 'image/svg+xml', svg).route).toBe(
      'sandboxed-html'
    );
  });
});

describe('failure states', () => {
  test('a wrong key does not claim the key is wrong', async () => {
    const { id } = await seed(utf8('# hi'), 'notes.md', 'text/markdown');
    const { encodeFragment } = await import('@relic/format');
    const state = await load(id, deps(encodeFragment(generateKey())));

    expect(state.kind).toBe('dead');
    if (state.kind !== 'dead') return;
    expect(state.dead.code).toBe('decrypt_failed');
    expect(state.dead.detail.toLowerCase()).not.toContain('wrong key');
    // It says outright that it cannot tell which cause applies.
    expect(state.dead.detail).toContain('no way to tell');
  });

  test('a removed relic reads as removed, never as a decrypt failure', async () => {
    const { id, fragment } = await seed(
      utf8('# hi'),
      'notes.md',
      'text/markdown'
    );
    await app.fetch(
      new Request(`${SERVICE}/api/relics/${id}`, {
        method: 'DELETE',
        headers: { authorization: 'Bearer operator-secret' },
      })
    );

    const state = await load(id, deps(fragment));
    expect(state.kind).toBe('dead');
    if (state.kind !== 'dead') return;
    expect(state.dead.code).toBe('relic_removed');
    expect(state.dead.action).toBe('report');
  });

  test('an expired relic reads as expired', async () => {
    const { id, fragment } = await seed(
      utf8('# hi'),
      'notes.md',
      'text/markdown'
    );
    now += 8 * 86_400 * 1000;

    const state = await load(id, deps(fragment));
    if (state.kind === 'dead') expect(state.dead.code).toBe('relic_expired');
  });
});

describe('deadFromProblem', () => {
  test('still-uploading offers a retry and never reads as a dead link', () => {
    const view = deadFromProblem('relic_not_yet_published');
    expect(view.action).toBe('retry');
    expect(view.headline.toLowerCase()).toContain('uploading');
  });

  test('cap exhaustion says waiting will not help', () => {
    expect(deadFromProblem('download_cap_exhausted').detail).toContain(
      'Waiting will not help'
    );
    expect(deadFromProblem('download_cap_exhausted').action).toBe('none');
  });

  test('removal offers the appeal path', () => {
    expect(deadFromProblem('relic_removed').action).toBe('report');
  });

  test('expiry offers no retry, because retrying cannot work', () => {
    expect(deadFromProblem('relic_expired').action).toBe('none');
  });

  test('an unknown code degrades to a retry rather than a lie', () => {
    expect(deadFromProblem('something_new').action).toBe('retry');
  });
});
