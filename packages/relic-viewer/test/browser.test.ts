import { describe, expect, test } from 'bun:test';
import { safeDownloadName, sniffImageType } from '../src/main.ts';
import { createSandboxHandler, isRenderMessage } from '../src/sandbox.ts';
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
  test('renders a well-formed message once', () => {
    const written: string[] = [];
    const handle = createSandboxHandler((html) => written.push(html));

    expect(handle({ type: 'relic:render', html: '<p>hi</p>' })).toBe(true);
    expect(written).toEqual(['<p>hi</p>']);
  });

  test('refuses a second render, so content cannot be swapped after trust', () => {
    const written: string[] = [];
    const handle = createSandboxHandler((html) => written.push(html));

    handle({ type: 'relic:render', html: 'first' });
    expect(handle({ type: 'relic:render', html: 'second' })).toBe(false);
    expect(written).toEqual(['first']);
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
  ];

  for (const data of junk) {
    test(`ignores ${JSON.stringify(data) ?? 'undefined'}`, () => {
      const written: string[] = [];
      const handle = createSandboxHandler((html) => written.push(html));
      expect(handle(data)).toBe(false);
      expect(written).toEqual([]);
    });
  }

  test('junk does not consume the single render', () => {
    const written: string[] = [];
    const handle = createSandboxHandler((html) => written.push(html));
    handle({ type: 'nope' });
    expect(handle({ type: 'relic:render', html: 'real' })).toBe(true);
    expect(written).toEqual(['real']);
  });

  test('isRenderMessage is strict about both fields', () => {
    expect(isRenderMessage({ type: 'relic:render', html: '' })).toBe(true);
    expect(isRenderMessage({ type: 'relic:render' })).toBe(false);
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
