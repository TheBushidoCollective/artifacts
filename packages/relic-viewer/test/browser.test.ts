import { describe, expect, test } from 'bun:test';
import { safeDownloadName, sniffImageType } from '../src/main.ts';
import {
  createSandboxHandler,
  isRenderJsxMessage,
  isRenderMessage,
} from '../src/sandbox.ts';
import { isCacheable } from '../src/sw.ts';

describe('safeDownloadName', () => {
  // The filename is untrusted display text used here as a lookup key, which
  // is the same defect class as archive entry names.
  const traversals: ReadonlyArray<readonly [string, string]> = [
    ['../../etc/passwd', 'passwd'],
    ['..\\..\\windows\\system32', 'system32'],
    ['/etc/shadow', 'shadow'],
    ['....//evil.sh', 'evil.sh'],
    ['.bashrc', 'bashrc'],
    ['', 'relic'],
    ['   ', 'relic'],
    ['/', 'relic'],
  ];

  for (const [input, expected] of traversals) {
    test(`${JSON.stringify(input)} becomes ${expected}`, () => {
      expect(safeDownloadName(input)).toBe(expected);
    });
  }

  test('keeps an ordinary name intact', () => {
    expect(safeDownloadName('Q3 report.md')).toBe('Q3 report.md');
  });

  test('bounds the length', () => {
    expect(safeDownloadName('a'.repeat(500))).toHaveLength(200);
  });
});

describe('sniffImageType', () => {
  // Derived from magic bytes, never from the declared type. A declared
  // image/svg+xml would otherwise be a route into script execution.
  test('recognizes real image formats', () => {
    expect(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(
      'image/png'
    );
    expect(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff]))).toBe(
      'image/jpeg'
    );
    expect(sniffImageType(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toBe(
      'image/gif'
    );
  });

  test('never returns an SVG or HTML type, whatever the bytes', () => {
    const svg = new TextEncoder().encode('<svg onload=alert(1)>');
    const type = sniffImageType(svg);
    expect(type).not.toContain('svg');
    expect(type).not.toContain('html');
    expect(type).toBe('application/octet-stream');
  });
});

describe('the sandbox handler', () => {
  const makeHandler = () => {
    const html: string[] = [];
    const jsx: string[] = [];
    return {
      html,
      jsx,
      handle: createSandboxHandler(
        (markup) => html.push(markup),
        (code) => jsx.push(code)
      ),
    };
  };

  test('renders a well-formed html message once', () => {
    const { html, jsx, handle } = makeHandler();

    expect(handle({ type: 'relic:render', html: '<p>hi</p>' })).toBe(true);
    expect(html).toEqual(['<p>hi</p>']);
    expect(jsx).toEqual([]);
  });

  test('renders a well-formed jsx message once', () => {
    const { html, jsx, handle } = makeHandler();

    expect(
      handle({ type: 'relic:render-jsx', code: 'export default App;' })
    ).toBe(true);
    expect(jsx).toEqual(['export default App;']);
    expect(html).toEqual([]);
  });

  test('refuses a second render, so content cannot be swapped after trust', () => {
    const { html, jsx, handle } = makeHandler();

    handle({ type: 'relic:render', html: 'first' });
    expect(handle({ type: 'relic:render', html: 'second' })).toBe(false);
    expect(html).toEqual(['first']);
  });

  test('the one render covers both types: jsx cannot follow html', () => {
    const { jsx, handle } = makeHandler();

    handle({ type: 'relic:render', html: 'first' });
    expect(handle({ type: 'relic:render-jsx', code: 'second' })).toBe(false);
    expect(jsx).toEqual([]);
  });

  test('the one render covers both types: html cannot follow jsx', () => {
    const { html, handle } = makeHandler();

    handle({ type: 'relic:render-jsx', code: 'first' });
    expect(handle({ type: 'relic:render', html: 'second' })).toBe(false);
    expect(handle({ type: 'relic:render-jsx', code: 'third' })).toBe(false);
    expect(html).toEqual([]);
  });

  const junk = [
    null,
    undefined,
    'a string',
    42,
    {},
    { type: 'relic:render' },
    { type: 'other', html: 'x' },
    { type: 'relic:render', html: 123 },
    { type: 'relic:render-jsx' },
    { type: 'relic:render-jsx', code: 123 },
    { type: 'relic:render-jsx', html: 'wrong field' },
  ];

  for (const data of junk) {
    test(`ignores ${JSON.stringify(data) ?? 'undefined'}`, () => {
      const { html, jsx, handle } = makeHandler();
      expect(handle(data)).toBe(false);
      expect(html).toEqual([]);
      expect(jsx).toEqual([]);
    });
  }

  test('junk does not consume the single render', () => {
    const { html, handle } = makeHandler();
    handle({ type: 'nope' });
    handle({ type: 'relic:render-jsx', code: 42 });
    expect(handle({ type: 'relic:render', html: 'real' })).toBe(true);
    expect(html).toEqual(['real']);
  });

  test('isRenderMessage is strict about both fields', () => {
    expect(isRenderMessage({ type: 'relic:render', html: '' })).toBe(true);
    expect(isRenderMessage({ type: 'relic:render' })).toBe(false);
    expect(isRenderMessage({ type: 'relic:render-jsx', code: 'x' })).toBe(
      false
    );
  });

  test('isRenderJsxMessage is strict about both fields', () => {
    expect(isRenderJsxMessage({ type: 'relic:render-jsx', code: '' })).toBe(
      true
    );
    expect(isRenderJsxMessage({ type: 'relic:render-jsx' })).toBe(false);
    expect(isRenderJsxMessage({ type: 'relic:render', html: 'x' })).toBe(false);
  });
});

describe('the service worker caches the shell and nothing else', () => {
  const origin = (path: string) => new URL(`https://relic.example${path}`);

  test('caches the app shell', () => {
    for (const path of [
      '/assets/viewer.js',
      '/assets/styles.css',
      '/manifest.webmanifest',
    ]) {
      expect(isCacheable(origin(path), true)).toBe(true);
    }
  });

  test('never caches relic ciphertext from storage', () => {
    // A cache entry would outlive the TTL and the per-object cap, on the
    // recipient's disk, past a takedown.
    expect(
      isCacheable(new URL('https://storage.googleapis.com/o/abc'), false)
    ).toBe(false);
  });

  test('never caches the mint or anything else under /api/', () => {
    expect(isCacheable(origin('/api/relics/abc/mint'), true)).toBe(false);
    expect(isCacheable(origin('/api/grant'), true)).toBe(false);
    expect(isCacheable(origin('/api/anything-added-later'), true)).toBe(false);
  });

  test('never caches a relic shell, so a takedown is not papered over', () => {
    expect(isCacheable(origin('/aaaaaaaaaaaaaaaaaaaaaaaaaa'), true)).toBe(
      false
    );
  });
});
