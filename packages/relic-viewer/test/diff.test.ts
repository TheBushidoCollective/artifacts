import { describe, expect, test } from 'bun:test';
import {
  comparisonAvailability,
  createImageDiff,
  createTextDiff,
  diffCeilingFor,
  diffModeForRoutes,
  MAX_DIFF_BYTES,
  MAX_RENDERED_DIFF_BYTES,
  versionHistoryCopy,
} from '../src/diff.ts';
import type { ReadyView } from '../src/viewer.ts';

const encoder = new TextEncoder();

function ready(
  route: ReadyView['route'],
  content: Uint8Array,
  currentVersion = 3
): ReadyView {
  return {
    filename: 'artifact.txt',
    declaredMimetype: 'text/plain',
    content,
    route,
    downgradeNotice: undefined,
    shareUrl: 'https://relik.example/aaaaaaaaaaaaaaaaaaaaaaaaaa#key',
    version: currentVersion,
    currentVersion,
  };
}

describe('the code line comparison', () => {
  test('reports changed lines and inline edits', () => {
    const result = createTextDiff(
      'const answer = 41;\nkeep();\n',
      'const answer = 42;\nkeep();\n'
    );

    expect(result.changed).toBe(true);
    expect(result.additions).toBe(1);
    expect(result.deletions).toBe(1);
    expect(result.parts.some((part) => part.kind === 'added')).toBe(true);
    expect(result.parts.some((part) => part.kind === 'removed')).toBe(true);
    expect(
      result.parts
        .flatMap((part) => part.segments ?? [])
        .some((segment) => segment.kind === 'added' && segment.text === '42')
    ).toBe(true);
    expect(
      result.parts
        .flatMap((part) => part.segments ?? [])
        .some((segment) => segment.kind === 'removed' && segment.text === '41')
    ).toBe(true);
  });

  test('names identical content instead of producing an empty diff', () => {
    const result = createTextDiff('same\ncontent\n', 'same\ncontent\n');

    expect(result.changed).toBe(false);
    expect(result.parts).toEqual([]);
    expect(result.summary).toBe(
      'No changes. These versions have identical content.'
    );
  });
});

describe('image version comparisons', () => {
  test('describes a changed image and its dimension delta', () => {
    const result = createImageDiff(
      encoder.encode('old pixels'),
      encoder.encode('new pixels'),
      { width: 640, height: 480 },
      { width: 800, height: 450 }
    );

    expect(result.changed).toBe(true);
    expect(result.summary).toBe(
      'Version dimensions: 640 x 480 px to 800 x 450 px. Width +160 px, height -30 px.'
    );
  });

  test('names byte-identical images instead of rendering an empty comparison', () => {
    const bytes = encoder.encode('same pixels');
    const result = createImageDiff(
      bytes,
      bytes.slice(),
      { width: 640, height: 480 },
      { width: 640, height: 480 }
    );

    expect(result.changed).toBe(false);
    expect(result.summary).toBe(
      'No changes. These versions have identical content.'
    );
  });
});

describe('version history labels', () => {
  test('names both versions and says which one is current history', () => {
    expect(versionHistoryCopy(5, 2)).toEqual({
      headline: 'Comparing version 2 with version 5',
      detail:
        'Version 5 is current. Version 2 is retained history and may contain ' +
        'content removed from the current artifact.',
    });
  });
});

describe('comparison availability', () => {
  test('maps all five renderable classes onto four comparison modes', () => {
    expect(diffModeForRoutes('markdown', 'markdown')).toBe('markdown');
    expect(diffModeForRoutes('code', 'code')).toBe('code');
    expect(diffModeForRoutes('sandboxed-html', 'sandboxed-html')).toBe(
      'rendered'
    );
    expect(diffModeForRoutes('sandboxed-jsx', 'sandboxed-jsx')).toBe(
      'rendered'
    );
    expect(diffModeForRoutes('image', 'image')).toBe('image');
  });

  test('refuses a pair whose two versions render in different modes', () => {
    // Feeding a rendered page to the prose comparison, or an image to
    // either, produces a confident result with no meaning.
    expect(diffModeForRoutes('markdown', 'sandboxed-html')).toBeUndefined();
    expect(diffModeForRoutes('code', 'markdown')).toBeUndefined();
    expect(diffModeForRoutes('image', 'code')).toBeUndefined();
    expect(diffModeForRoutes('markdown', 'download')).toBeUndefined();
  });

  test('does not offer history to a version 1 relic', () => {
    expect(
      comparisonAvailability(ready('code', encoder.encode('one'), 1))
    ).toEqual({
      kind: 'none',
    });
  });

  test('offers history to a diffable version 2 or higher relic', () => {
    expect(
      comparisonAvailability(ready('code', encoder.encode('two'), 2))
    ).toEqual({
      kind: 'available',
      mode: 'code',
    });
  });

  test('states why a download-only relic cannot be compared', () => {
    const result = comparisonAvailability(
      ready('download', encoder.encode('zip bytes'))
    );

    expect(result.kind).toBe('unavailable');
    if (result.kind !== 'unavailable') return;
    expect(result.code).toBe('comparison_not_renderable');
    expect(result.detail).toContain('download-only');
  });

  test('refuses content over the diff ceiling without changing the current view', () => {
    const current = ready('code', new Uint8Array(MAX_DIFF_BYTES + 1));
    const result = comparisonAvailability(current);

    expect(result.kind).toBe('unavailable');
    if (result.kind !== 'unavailable') return;
    expect(result.code).toBe('comparison_too_large');
    expect(result.detail).toContain('4 MiB');
    expect(current.route).toBe('code');
    expect(current.content).toHaveLength(MAX_DIFF_BYTES + 1);
  });

  test('holds a rendered class to the lower per-class ceiling', () => {
    // A rendered comparison also allocates two live DOM trees and two
    // captured trees, so the same byte budget buys a smaller file.
    expect(diffCeilingFor('code').bytes).toBe(MAX_DIFF_BYTES);
    for (const mode of ['markdown', 'rendered', 'image'] as const) {
      expect(diffCeilingFor(mode).bytes).toBe(MAX_RENDERED_DIFF_BYTES);
      expect(diffCeilingFor(mode).label).toBe('1 MiB');
    }
    expect(MAX_RENDERED_DIFF_BYTES).toBeLessThan(MAX_DIFF_BYTES);
  });

  test('refuses a rendered payload the code ceiling would have allowed', () => {
    const current = ready(
      'markdown',
      new Uint8Array(MAX_RENDERED_DIFF_BYTES + 1)
    );
    const result = comparisonAvailability(current);

    expect(result.kind).toBe('unavailable');
    if (result.kind !== 'unavailable') return;
    expect(result.code).toBe('comparison_too_large');
    expect(result.detail).toContain('1 MiB');
    // Still open, still markdown: a refused comparison never disturbs the
    // version the reader came for.
    expect(current.route).toBe('markdown');
    expect(current.content).toHaveLength(MAX_RENDERED_DIFF_BYTES + 1);
  });
});
