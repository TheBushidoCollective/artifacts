import { describe, expect, test } from 'bun:test';
import {
  deriveRendererClass,
  isRenderable,
  isRendererClass,
  leastPrivileged,
  RENDERABLE_CLASSES,
  RENDERER_CLASSES,
  type RendererClass,
} from '../src/renderer-class.ts';

const utf8 = (text: string): Uint8Array => new TextEncoder().encode(text);

describe('the taxonomy', () => {
  test('has exactly seven values', () => {
    expect(RENDERER_CLASSES).toHaveLength(7);
  });

  test('cuts on the wedge boundary, so the second clause is unambiguous', () => {
    expect([...RENDERABLE_CLASSES].sort()).toEqual([
      'code',
      'html',
      'image',
      'markdown',
    ]);
    const downloadOnly = RENDERER_CLASSES.filter((c) => !isRenderable(c));
    expect([...downloadOnly].sort()).toEqual(['archive', 'binary', 'media']);
  });

  test('rejects a value outside the seven', () => {
    expect(isRendererClass('spreadsheet')).toBe(false);
    expect(isRendererClass('markdown')).toBe(true);
  });
});

describe('the zero-byte rule', () => {
  // `spec/format.md` 3.9, unconditional.
  const names = ['script.py', 'notes.md', 'page.html', 'photo.png', ''];

  for (const filename of names) {
    test(`a zero-byte ${filename || 'unnamed'} file is binary`, () => {
      expect(deriveRendererClass(new Uint8Array(0), filename)).toBe('binary');
    });
  }

  test('a one-byte file is not caught by the rule', () => {
    expect(deriveRendererClass(utf8('x'), 'notes.md')).toBe('markdown');
  });
});

describe('magic bytes beat the extension', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  test('a PNG named .txt is still an image', () => {
    expect(deriveRendererClass(png, 'secret.txt')).toBe('image');
  });

  test('a ZIP named .md is still an archive', () => {
    const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]);
    expect(deriveRendererClass(zip, 'readme.md')).toBe('archive');
  });

  test('gzip is an archive', () => {
    expect(deriveRendererClass(new Uint8Array([0x1f, 0x8b, 0x08]), 'x')).toBe(
      'archive'
    );
  });

  test('a PDF is binary, since the first release does not render it', () => {
    const pdf = utf8('%PDF-1.7\n');
    expect(deriveRendererClass(pdf, 'report.pdf')).toBe('binary');
  });
});

describe('the extension fallback', () => {
  const cases: ReadonlyArray<readonly [string, RendererClass]> = [
    ['notes.md', 'markdown'],
    ['README.markdown', 'markdown'],
    ['index.html', 'html'],
    ['page.HTM', 'html'],
    ['main.ts', 'code'],
    ['server.go', 'code'],
    ['config.yaml', 'code'],
    ['query.sql', 'code'],
    ['Dockerfile', 'code'],
    ['data.csv', 'code'],
    ['clip.mp4', 'media'],
    ['song.flac', 'media'],
    ['bundle.zip', 'archive'],
    ['diagram.svg', 'image'],
  ];

  for (const [filename, expected] of cases) {
    test(`${filename} is ${expected}`, () => {
      expect(
        deriveRendererClass(utf8('some plausible content'), filename)
      ).toBe(expected);
    });
  }
});

describe('the content fallback', () => {
  test('unnamed HTML sniffs as html', () => {
    expect(deriveRendererClass(utf8('<!DOCTYPE html><p>hi'), 'thing')).toBe(
      'html'
    );
  });

  test('unnamed plain text is code', () => {
    expect(deriveRendererClass(utf8('just some prose here'), 'thing')).toBe(
      'code'
    );
  });

  test('unnamed binary with NUL bytes is binary', () => {
    const blob = new Uint8Array([0x00, 0x01, 0x02, 0x00, 0xff, 0xfe]);
    expect(deriveRendererClass(blob, 'thing')).toBe('binary');
  });

  test('an unknown extension falls through to the content check', () => {
    expect(deriveRendererClass(utf8('plain words'), 'thing.wat')).toBe('code');
  });
});

describe('declared versus sniffed disagreement', () => {
  // `spec/format.md` 3.6: route to the least privileged path either type
  // would allow. The publisher is the threat here, not the operator.
  test('html against image resolves to image, never html', () => {
    expect(leastPrivileged('html', 'image')).toBe('image');
    expect(leastPrivileged('image', 'html')).toBe('image');
  });

  test('html against binary resolves to binary', () => {
    expect(leastPrivileged('html', 'binary')).toBe('binary');
  });

  test('agreement is a no-op', () => {
    for (const cls of RENDERER_CLASSES) {
      expect(leastPrivileged(cls, cls)).toBe(cls);
    }
  });

  test('html never wins against anything', () => {
    for (const cls of RENDERER_CLASSES) {
      if (cls === 'html') continue;
      expect(leastPrivileged('html', cls)).not.toBe('html');
    }
  });
});
