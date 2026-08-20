import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  CommentDecryptFailedError,
  deriveCommentKey,
  encodeKey,
  parseFragment,
} from '@relic/format';
import {
  authRequestBody,
  type CommentRecord,
  commentCipher,
  commentRefusal,
  keySurvivesNavigation,
  loadThread,
  MAX_BODY_BYTES,
  plainLabel,
  postComment,
  requestMagicLink,
  threadCountLabel,
} from '../src/comments.ts';
import {
  buildBar,
  commentRow,
  localStorageKeyVault,
  THREAD_EMPTY_NOTE,
  threadRefusal,
} from '../src/main.ts';
import type { ReadyView, ViewerDeps } from '../src/viewer.ts';

/**
 * Bun tests run without a DOM, exactly as `version-diff-ui.test.ts` found, so
 * the stubs carry only what the thread touches while it builds. Structure is
 * assertable here; what the thread looks like is proven in a browser, which is
 * the only place it can be.
 */
class ElementStub {
  readonly tagName: string;
  className = '';
  textContent = '';
  id = '';
  hidden = false;
  tabIndex = 0;
  type = '';
  title = '';
  value = '';
  rows = 0;
  required = false;
  disabled = false;
  maxLength = 0;
  placeholder = '';
  autocomplete = '';
  href = '';
  rel = '';
  readonly children: ElementStub[] = [];
  readonly attributes = new Map<string, string>();
  readonly dataset: Record<string, string> = {};
  readonly style = { setProperty: (): void => {} };
  readonly classList = {
    add: (name: string): void => {
      this.className = `${this.className} ${name}`.trim();
    },
    toggle: (): void => {},
  };

  constructor(tag: string) {
    this.tagName = tag.toUpperCase();
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  appendChild(child: ElementStub): ElementStub {
    this.children.push(child);
    return child;
  }

  append(...children: ElementStub[]): void {
    this.children.push(...children);
  }

  replaceChildren(...children: ElementStub[]): void {
    this.children.splice(0, this.children.length, ...children);
  }

  focus(): void {}
  addEventListener(): void {}
  scrollIntoView(): void {}
  replaceWith(): void {}
}

function installDom(): void {
  (globalThis as { document?: unknown }).document = {
    createElement: (tag: string) => new ElementStub(tag),
    createElementNS: (_namespace: string, tag: string) => new ElementStub(tag),
    createTextNode: (text: string) => {
      const node = new ElementStub('#text');
      node.textContent = text;
      return node;
    },
    addEventListener: () => {},
    visibilityState: 'visible',
  };
  (globalThis as { window?: unknown }).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

function clearDom(): void {
  delete (globalThis as { document?: unknown }).document;
  delete (globalThis as { window?: unknown }).window;
}

function descendants(element: ElementStub): ElementStub[] {
  return [element, ...element.children.flatMap(descendants)];
}

function textOf(element: ElementStub): string {
  return [element.textContent, ...element.children.map(textOf)].join(' ');
}

function withClass(element: ElementStub, name: string): ElementStub[] {
  return descendants(element).filter((candidate) =>
    candidate.className.split(' ').includes(name)
  );
}

const RELIC_ID = 'aaaaaaaaaaaaaaaaaaaaaaaaaa';

/** A real 16-byte key, so the derivation and the envelope are the real ones. */
const KEY_BYTES = new Uint8Array([
  9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 15, 14, 13, 12, 11, 10,
]);
const FRAGMENT = `#r1${encodeKey(KEY_BYTES)}`;

function view(overrides: Partial<ReadyView> = {}): ReadyView {
  return {
    filename: 'notes.md',
    declaredMimetype: 'text/markdown',
    content: new TextEncoder().encode('# notes\n'),
    route: 'markdown',
    downgradeNotice: undefined,
    shareUrl: `https://relik.example/${RELIC_ID}${FRAGMENT}`,
    version: 1,
    currentVersion: 1,
    ...overrides,
  };
}

/** An in-memory `Storage`, so the vault under test is the shipped one. */
function memoryStorage(): Storage {
  const entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    key: (index: number) => [...entries.keys()][index] ?? null,
    getItem: (name: string) => entries.get(name) ?? null,
    setItem: (name: string, value: string) => {
      entries.set(name, value);
    },
    removeItem: (name: string) => {
      entries.delete(name);
    },
    clear: () => {
      entries.clear();
    },
  } as Storage;
}

interface Call {
  readonly url: string;
  readonly method: string;
  readonly body: string | undefined;
}

function stubDeps(
  handler: (call: Call) => Response,
  calls: Call[] = [],
  storage: Storage = memoryStorage()
): ViewerDeps {
  return {
    serviceOrigin: 'https://relik.example',
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      const call: Call = {
        url: String(input),
        method: init?.method ?? 'GET',
        body: typeof init?.body === 'string' ? init.body : undefined,
      };
      calls.push(call);
      return handler(call);
    }) as typeof globalThis.fetch,
    takeFragment: () => FRAGMENT,
    stripFragment: () => {},
    locationHref: `https://relik.example/${RELIC_ID}`,
    keyVault: localStorageKeyVault(storage, () => 1_000),
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function problem(code: string, status: number): Response {
  return new Response(JSON.stringify({ code, title: code }), {
    status,
    headers: { 'content-type': 'application/problem+json' },
  });
}

async function sealed(
  body: string,
  displayName: string | null = null,
  key: Uint8Array = KEY_BYTES
): Promise<string> {
  const cipher = commentCipher(await deriveCommentKey(key));
  return cipher.seal({ body, display_name: displayName });
}

async function record(
  overrides: Partial<CommentRecord> & { readonly ciphertext: string }
): Promise<CommentRecord> {
  return {
    comment_id: 'c1',
    author: 'ada@example.com',
    created_at: '2026-08-20T09:15:00.000Z',
    ...overrides,
  };
}

describe('the comment key', () => {
  test('cannot be read back out by a script on this origin', async () => {
    // Independence from the container key is proven where it is derived, in
    // `relic-format`'s own tests. What matters on this side of the boundary is
    // that the viewer holds a key object and not key bytes: a sanitizer
    // bypass or a stray same-origin script finds nothing to export.
    const commentKey = await deriveCommentKey(KEY_BYTES);
    expect(commentKey.extractable).toBe(false);
    await expect(crypto.subtle.exportKey('raw', commentKey)).rejects.toThrow();
  });

  test('is deterministic for one fragment and differs across fragments', async () => {
    const one = commentCipher(await deriveCommentKey(KEY_BYTES));
    const again = commentCipher(await deriveCommentKey(KEY_BYTES));
    const other = commentCipher(
      await deriveCommentKey(new Uint8Array(16).fill(7))
    );

    const ciphertext = await one.seal({ body: 'hi', display_name: null });
    expect((await again.open(ciphertext)).body).toBe('hi');
    await expect(other.open(ciphertext)).rejects.toThrow(
      CommentDecryptFailedError
    );
  });

  test('comes out of the fragment the viewer already parsed', async () => {
    // The thread derives from `parseFragment(view.shareUrl hash)`, so this is
    // the path the DOM layer actually takes.
    const parsed = parseFragment(new URL(view().shareUrl).hash);
    const cipher = commentCipher(await deriveCommentKey(parsed.key));
    const ciphertext = await sealed('from the share url');
    expect((await cipher.open(ciphertext)).body).toBe('from the share url');
  });
});

describe('the thread', () => {
  beforeEach(installDom);
  afterEach(clearDom);

  test('renders two comments oldest first, with author and time', async () => {
    const rows = [
      await record({
        comment_id: 'c1',
        author: 'ada@example.com',
        created_at: '2026-08-20T09:15:00.000Z',
        ciphertext: await sealed('First, and it decrypts.'),
      }),
      await record({
        comment_id: 'c2',
        author: 'grace@example.com',
        created_at: '2026-08-20T10:30:00.000Z',
        ciphertext: await sealed('Second, with a name.', 'Grace H'),
      }),
    ];
    const deps = stubDeps(() => json(rows));
    const cipher = commentCipher(await deriveCommentKey(KEY_BYTES));

    const state = await loadThread(RELIC_ID, deps, cipher);
    if (state.kind !== 'ready') throw new Error(`refused: ${state.kind}`);
    expect(state.entries).toHaveLength(2);

    const list = state.entries.map(
      (entry) => commentRow(entry) as unknown as ElementStub
    );
    const first = list[0];
    const second = list[1];
    if (first === undefined || second === undefined) {
      throw new Error('the thread built no rows');
    }

    expect(textOf(first)).toContain('First, and it decrypts.');
    expect(textOf(first)).toContain('ada@example.com');
    // Absolute rather than relative: a relic outlives "3 hours ago".
    expect(textOf(first)).not.toContain('ago');

    // A display name aliases the address, it never replaces it.
    expect(withClass(second, 'comment-name')[0]?.textContent).toBe('Grace H');
    expect(withClass(second, 'comment-author')[0]?.textContent).toBe(
      'grace@example.com'
    );
  });

  test('a comment that will not decrypt is shown, not dropped', async () => {
    const wrongKey = await sealed(
      'written under another key',
      null,
      new Uint8Array(16).fill(3)
    );
    const rows = [
      await record({ comment_id: 'good', ciphertext: await sealed('fine') }),
      await record({ comment_id: 'bad', ciphertext: wrongKey }),
    ];
    const deps = stubDeps(() => json(rows));
    const cipher = commentCipher(await deriveCommentKey(KEY_BYTES));

    const state = await loadThread(RELIC_ID, deps, cipher);
    if (state.kind !== 'ready') throw new Error('the thread was refused');

    // Two entries, not one. A thread that silently drops a row it cannot read
    // is one whose length nobody can trust.
    expect(state.entries).toHaveLength(2);
    expect(state.entries[1]?.kind).toBe('sealed');

    const row = commentRow(state.entries[1] as never) as unknown as ElementStub;
    expect(row.className).toContain('comment-undecryptable');
    expect(textOf(row)).toContain('did not decrypt');
    // Still attributed and still timed: what is missing is the body.
    expect(textOf(row)).toContain('ada@example.com');
    // And it does not claim to know which cause it was.
    expect(textOf(row)).toContain('no way to tell which');
  });

  test('an empty thread says so, and it is not an error', async () => {
    const deps = stubDeps(() => json([]));
    const cipher = commentCipher(await deriveCommentKey(KEY_BYTES));
    const state = await loadThread(RELIC_ID, deps, cipher);

    expect(state).toEqual({ kind: 'ready', entries: [] });
    expect(threadCountLabel(0)).toBe('No comments');
    expect(THREAD_EMPTY_NOTE).toContain('No comments yet');
    // The empty state explains what a comment is for rather than sitting
    // blank, and it does not overclaim about who can read one.
    expect(THREAD_EMPTY_NOTE).toContain('without being able to read it');
  });
  test('a row missing its ciphertext is reported, not dropped and not sealed', async () => {
    const deps = stubDeps(() =>
      json([
        {
          comment_id: 'x',
          author: 'a@b.c',
          created_at: '2026-08-20T09:00:00Z',
        },
        { nothing: true },
      ])
    );
    const cipher = commentCipher(await deriveCommentKey(KEY_BYTES));
    const state = await loadThread(RELIC_ID, deps, cipher);
    if (state.kind !== 'ready') throw new Error('the thread was refused');

    // Two entries, because a thread shorter than it is cannot be noticed.
    expect(state.entries).toHaveLength(2);
    expect(state.entries.map((entry) => entry.kind)).toEqual([
      'unreadable',
      'unreadable',
    ]);
    // Sealed would be a guess: there may never have been a body.
    const first = state.entries[0];
    if (first?.kind !== 'unreadable') throw new Error('wrong state');
    expect(first.author).toBe('a@b.c');
    const second = state.entries[1];
    if (second?.kind !== 'unreadable') throw new Error('wrong state');
    expect(second.author).toBeNull();

    // A row that named no sender gets no sender invented for it.
    const row = commentRow(second) as unknown as ElementStub;
    expect(withClass(row, 'comment-author')).toHaveLength(0);
    expect(textOf(row)).toContain(
      'did not arrive in a form this page can read'
    );
    expect(threadCountLabel(state.entries.length)).toBe('2 comments');
  });

  test('reading the thread needs no session and sends no credential', async () => {
    const calls: Call[] = [];
    const deps = stubDeps(() => json([]), calls);
    await loadThread(
      RELIC_ID,
      deps,
      commentCipher(await deriveCommentKey(KEY_BYTES))
    );

    expect(calls).toHaveLength(1);
    expect(calls[0]?.method).toBe('GET');
    expect(calls[0]?.url).toBe(
      `https://relik.example/api/relics/${RELIC_ID}/comments`
    );
  });

  test('strips bidirectional controls out of a chosen display name', () => {
    // A display name is chosen by any link holder and rendered on the origin
    // holding the fragment, so it gets the filename's treatment.
    expect(plainLabel('ada\u202egnitirw')).toBe('adagnitirw');
    const row = commentRow({
      kind: 'open',
      id: 'c1',
      author: 'ada@example.com',
      createdAt: '2026-08-20T09:15:00.000Z',
      body: 'hello',
      displayName: 'A\u202Eda',
    }) as unknown as ElementStub;
    expect(withClass(row, 'comment-name')[0]?.textContent).toBe('Ada');
  });

  test('a publish-token comment is marked as the publisher', () => {
    const row = commentRow({
      kind: 'open',
      id: 'c1',
      author: 'publisher',
      createdAt: '2026-08-20T09:15:00.000Z',
      body: 'republished with the fix',
      displayName: null,
    }) as unknown as ElementStub;
    expect(textOf(row)).toContain('Published this relic');
  });
});

describe('refusal states', () => {
  beforeEach(installDom);
  afterEach(clearDom);

  test('a rate limit names itself and offers a retry', async () => {
    const deps = stubDeps(() => problem('comment_rate_limited', 429));
    const state = await loadThread(
      RELIC_ID,
      deps,
      commentCipher(await deriveCommentKey(KEY_BYTES))
    );
    if (state.kind !== 'refused') throw new Error('expected a refusal');

    expect(state.refusal.code).toBe('comment_rate_limited');
    expect(state.refusal.retryable).toBe(true);
    const card = threadRefusal(
      state.refusal,
      () => {}
    ) as unknown as ElementStub;
    expect(textOf(card)).toContain('Too many comments');
    // The reader is told nothing was lost, which is the actionable part.
    expect(textOf(card)).toContain('Nothing was lost');
    expect(textOf(card)).toContain('comment_rate_limited');
    const buttons = descendants(card).filter(
      (element) => element.tagName === 'BUTTON'
    );
    expect(buttons.map(textOf).join(' ')).toContain('Try again');
  });

  test('a refusal that a retry cannot fix does not offer one', () => {
    const card = threadRefusal(
      commentRefusal('body_too_large'),
      () => {}
    ) as unknown as ElementStub;
    const buttons = descendants(card).filter(
      (element) => element.tagName === 'BUTTON'
    );
    expect(buttons).toHaveLength(0);
    expect(textOf(card)).toContain('nothing was sent');
  });

  test('an unknown code is stated rather than flattened', () => {
    const refusal = commentRefusal('comment_storage_unavailable');
    expect(refusal.detail).toContain('comment_storage_unavailable');
    expect(refusal.detail).not.toContain('something went wrong');
  });

  test('a network failure is not reported as a problem with the relic', async () => {
    const deps: ViewerDeps = {
      ...stubDeps(() => json([])),
      // A rejecting fetch is not shaped like `fetch`, and it does not need to
      // be: the thread only ever calls it.
      fetch: (() =>
        Promise.reject(new Error('offline'))) as unknown as typeof fetch,
    };
    const state = await loadThread(
      RELIC_ID,
      deps,
      commentCipher(await deriveCommentKey(KEY_BYTES))
    );
    if (state.kind !== 'refused') throw new Error('expected a refusal');
    expect(state.refusal.code).toBe('network');
    expect(state.refusal.detail).toContain('network problem');
  });

  test('a lapsed session is distinguished from never having had one', () => {
    expect(commentRefusal('invalid_session').headline).toContain(
      'not verified any more'
    );
    expect(commentRefusal('invalid_session').retryable).toBe(false);
  });

  test('an oversize body is refused before it is encrypted or sent', async () => {
    const calls: Call[] = [];
    const deps = stubDeps(() => json({ author: 'a@b.c' }), calls);
    const result = await postComment(
      RELIC_ID,
      { body: 'x'.repeat(MAX_BODY_BYTES + 1), display_name: null },
      deps,
      commentCipher(await deriveCommentKey(KEY_BYTES))
    );
    expect(result.kind).toBe('refused');
    expect(calls).toHaveLength(0);
  });
});

describe('posting a comment', () => {
  test('sends ciphertext and nothing that reads as a body', async () => {
    const calls: Call[] = [];
    const deps = stubDeps(
      () => json({ comment_id: 'c9', author: 'ada@example.com' }),
      calls
    );
    const result = await postComment(
      RELIC_ID,
      { body: 'the operator must not read this', display_name: 'Ada' },
      deps,
      commentCipher(await deriveCommentKey(KEY_BYTES))
    );

    expect(result).toEqual({ kind: 'posted', author: 'ada@example.com' });
    const sentBody = calls[0]?.body ?? '';
    expect(sentBody).not.toContain('the operator must not read this');
    // The display name lives inside the envelope too, so it is not on the wire
    // in the clear either.
    expect(sentBody).not.toContain('Ada');
    // Named rather than cast inline: this is the request this test built, so
    // its shape is known here in a way a wire response never is.
    const parsed: unknown = JSON.parse(sentBody);
    expect(
      typeof parsed === 'object' && parsed !== null ? Object.keys(parsed) : []
    ).toEqual(['ciphertext']);
  });

  test('what the server stores decrypts back to what was typed', async () => {
    const calls: Call[] = [];
    const deps = stubDeps(
      () => json({ comment_id: 'c9', author: 'ada@example.com' }),
      calls
    );
    const cipher = commentCipher(await deriveCommentKey(KEY_BYTES));
    await postComment(
      RELIC_ID,
      { body: 'round trips', display_name: 'Ada' },
      deps,
      cipher
    );
    const parsed: unknown = JSON.parse(calls[0]?.body ?? '{}');
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('ciphertext' in parsed) ||
      typeof parsed.ciphertext !== 'string'
    ) {
      throw new Error('the post sent no ciphertext');
    }
    const stored = { ciphertext: parsed.ciphertext };
    expect(await cipher.open(stored.ciphertext)).toEqual({
      body: 'round trips',
      display_name: 'Ada',
    });
  });
});

describe('the magic-link round trip', () => {
  test('the request carries an address and a relic id, and no key', () => {
    const body = authRequestBody('ada@example.com', RELIC_ID);
    expect(body).toEqual({
      email: 'ada@example.com',
      relic_id: RELIC_ID,
    });
    // The one rule in the flow whose failure costs the reader the whole
    // relic: the fragment never goes to a server.
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain('#');
    expect(serialized).not.toContain(encodeKey(KEY_BYTES));
    expect(Object.keys(body).sort()).toEqual(['email', 'relic_id']);
  });

  test('nothing on the wire to the auth endpoint holds the fragment', async () => {
    const calls: Call[] = [];
    const deps = stubDeps(() => new Response(null, { status: 202 }), calls);
    const result = await requestMagicLink(RELIC_ID, 'ada@example.com', deps);

    expect(result).toEqual({ kind: 'sent' });
    for (const call of calls) {
      expect(call.url).not.toContain('#');
      expect(call.url).not.toContain(encodeKey(KEY_BYTES));
      expect(call.body ?? '').not.toContain(encodeKey(KEY_BYTES));
    }
  });

  test('the fragment survives the navigation, and comments still open', async () => {
    // The whole round trip: the reader is on the relic with a fragment, asks
    // for a link, the tab navigates away to the callback and comes back to
    // `/{id}` with no fragment at all. What has to still be true afterwards
    // is that the comment key derives to the same thing.
    const storage = memoryStorage();
    const before = stubDeps(() => json([]), [], storage);

    // What `load` does after a successful mint, which is what the reader's
    // first visit already did.
    before.keyVault.remember(RELIC_ID, FRAGMENT, Number.POSITIVE_INFINITY);

    const ciphertext = await sealed('written before the round trip');

    // The return leg. The address bar carries no fragment, because reading it
    // stripped it and the callback's redirect could not put it back: the
    // server never had it.
    const recalled = before.keyVault.recall(RELIC_ID);
    expect(recalled).toBe(FRAGMENT);

    const key = parseFragment(recalled ?? '').key;
    const cipher = commentCipher(await deriveCommentKey(key));
    expect((await cipher.open(ciphertext)).body).toBe(
      'written before the round trip'
    );
  });

  test('warns before leaving when this browser is not keeping the key', () => {
    const kept = stubDeps(() => json([]));
    kept.keyVault.remember(RELIC_ID, FRAGMENT, Number.POSITIVE_INFINITY);
    expect(keySurvivesNavigation(RELIC_ID, FRAGMENT, kept)).toBe(true);

    // Private browsing, a quota, a webview: the vault degrades to doing
    // nothing, and following the link in this tab would lose the key for good.
    const refusing: Storage = {
      ...memoryStorage(),
      setItem: () => {
        throw new Error('storage disabled');
      },
    } as Storage;
    const lost = stubDeps(() => json([]), [], refusing);
    lost.keyVault.remember(RELIC_ID, FRAGMENT, Number.POSITIVE_INFINITY);
    expect(keySurvivesNavigation(RELIC_ID, FRAGMENT, lost)).toBe(false);
  });
});

describe('the disclosure, at the point of commenting', () => {
  beforeEach(installDom);
  afterEach(clearDom);

  test('the taskbar carries the thread, with its count', () => {
    const bar = buildBar(view(), RELIC_ID, {
      onComments: () => {},
      commentCount: 2,
    }) as unknown as ElementStub;

    const comments = withClass(bar, 'action-comments')[0];
    if (comments === undefined) throw new Error('no comment control');
    expect(textOf(comments)).toContain('Comments');
    expect(withClass(comments, 'action-count')[0]?.textContent).toBe('2');
    // A button, never a link to a document fragment: a `#thread` href would
    // write a fragment into the address bar of the one page whose security
    // model is about what lives there.
    expect(comments.tagName).toBe('BUTTON');
  });

  test('a count of zero is not shown before the fetch lands', () => {
    const bar = buildBar(view(), RELIC_ID, {
      onComments: () => {},
    }) as unknown as ElementStub;
    expect(withClass(bar, 'action-count')).toHaveLength(0);
    expect(withClass(bar, 'action-comments')).toHaveLength(1);
  });

  test('a relic with no thread has no control for one', () => {
    const bar = buildBar(view(), RELIC_ID, {}) as unknown as ElementStub;
    expect(withClass(bar, 'action-comments')).toHaveLength(0);
  });

  test('the version control keeps its slot beside the new one', () => {
    // The accounting is the control, so the addition must not have displaced
    // anything on the floor's must-survive list.
    const bar = buildBar(view({ version: 4, currentVersion: 4 }), RELIC_ID, {
      onComments: () => {},
      commentCount: 1,
      onCompare: () => {},
    }) as unknown as ElementStub;
    const row = textOf(bar);
    expect(row).toContain('Version 4 of 4');
    expect(row).toContain('Copy link');
    expect(row).toContain('Download');
    expect(row).toContain('Report');
    expect(row).toContain('notes.md');
  });
});
