import { type Change, diffLines, diffWordsWithSpace } from 'diff';
import type { ReadyView, RenderRoute } from './viewer.ts';

/**
 * The code ceiling. A line comparison keeps two plaintext byte arrays, two
 * decoded strings, and the diff library's change graph alive together. At
 * 4 MiB per version that is 8 MiB of plaintext, up to 16 MiB of UTF-16 text,
 * an 8 MiB ciphertext window, and 32 MiB reserved for change bookkeeping and
 * DOM text. The 64 MiB working set stays well below the separate 100 MiB
 * one-version render ceiling.
 */
export const MAX_DIFF_BYTES = 4 * 1024 * 1024;
export const DIFF_LIMIT_LABEL = '4 MiB';

/**
 * The rendered ceiling, and it has to be lower than the code one rather than
 * equal to it, because a rendered comparison allocates two things the line
 * comparison never does: two live DOM trees, and two captured trees to diff.
 *
 * At 1 MiB per version: 2 MiB of plaintext, up to 4 MiB of UTF-16 text, a
 * 2 MiB ciphertext window, two live DOM trees at a conservative eight times
 * source for 16 MiB, two captured trees at four times source for 8 MiB, and
 * 8 MiB for the change graph, the mark set, and the change list. That is
 * roughly 40 MiB, inside the same 64 MiB budget the code ceiling was sized
 * against.
 *
 * Images sit here too, and for a sharper reason: a decoded bitmap is many
 * times the size of its encoded bytes, so a 4 MiB photograph decodes into
 * tens of megabytes and a comparison holds two of them. The same byte budget
 * therefore buys a smaller file, which is the honest trade rather than a
 * conservative one.
 */
export const MAX_RENDERED_DIFF_BYTES = 1 * 1024 * 1024;
export const RENDERED_DIFF_LIMIT_LABEL = '1 MiB';

/**
 * How a pair of versions is compared. `code` is the one text mode left: a
 * line diff is the visual form of code, because code is text. Everything
 * else is compared as it renders.
 */
export type DiffMode = 'markdown' | 'code' | 'rendered' | 'image';

export interface DiffCeiling {
  readonly bytes: number;
  /** The same ceiling as the recipient is told it. */
  readonly label: string;
}

/**
 * The ceiling for a mode, carried as one value so the number and the copy
 * that names it cannot drift apart. Three call sites read it: the taskbar's
 * availability check, the historical load's refusal before fetching, and the
 * comparison's own copy.
 */
export function diffCeilingFor(mode: DiffMode): DiffCeiling {
  return mode === 'code'
    ? { bytes: MAX_DIFF_BYTES, label: DIFF_LIMIT_LABEL }
    : { bytes: MAX_RENDERED_DIFF_BYTES, label: RENDERED_DIFF_LIMIT_LABEL };
}

export interface DiffSegment {
  readonly kind: 'unchanged' | 'added' | 'removed';
  readonly text: string;
}

export interface TextDiffPart {
  readonly kind: 'unchanged' | 'added' | 'removed';
  readonly value: string;
  readonly beforeStart: number | undefined;
  readonly currentStart: number | undefined;
  readonly beforeLines: number;
  readonly currentLines: number;
  readonly segments: readonly DiffSegment[] | undefined;
}

export interface TextDiff {
  readonly changed: boolean;
  readonly additions: number;
  readonly deletions: number;
  readonly parts: readonly TextDiffPart[];
  readonly summary: string;
}

export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

export interface ImageDiff {
  readonly mode: 'image';
  readonly changed: boolean;
  readonly summary: string;
}

export type ComparisonAvailability =
  | { readonly kind: 'none' }
  | { readonly kind: 'available'; readonly mode: DiffMode }
  | {
      readonly kind: 'unavailable';
      readonly code: 'comparison_not_renderable' | 'comparison_too_large';
      readonly detail: string;
    };

export interface VersionHistoryCopy {
  readonly headline: string;
  readonly detail: string;
}

export function versionHistoryCopy(
  currentVersion: number,
  historicalVersion: number
): VersionHistoryCopy {
  return {
    headline: `Comparing version ${historicalVersion} with version ${currentVersion}`,
    detail:
      `Version ${currentVersion} is current. Version ${historicalVersion} is ` +
      'retained history and may contain content removed from the current artifact.',
  };
}

function kindOf(change: Change): DiffSegment['kind'] {
  if (change.added === true) return 'added';
  if (change.removed === true) return 'removed';
  return 'unchanged';
}

function wordSegments(
  before: string,
  current: string,
  side: 'removed' | 'added'
): readonly DiffSegment[] {
  return diffWordsWithSpace(before, current)
    .filter((change) =>
      side === 'removed' ? change.added !== true : change.removed !== true
    )
    .map((change) => ({ kind: kindOf(change), text: change.value }));
}

/**
 * Compare code line by line. Code is the one class where a line diff is the
 * visual form, because code is text: what a reader sees is the source. Every
 * other class is compared as it renders.
 */
export function createTextDiff(before: string, current: string): TextDiff {
  if (before === current) {
    return {
      changed: false,
      additions: 0,
      deletions: 0,
      parts: [],
      summary: 'No changes. These versions have identical content.',
    };
  }

  const changes = diffLines(before, current);
  const parts: TextDiffPart[] = [];
  let beforeLine = 1;
  let currentLine = 1;
  let additions = 0;
  let deletions = 0;

  for (let index = 0; index < changes.length; index++) {
    const change = changes[index];
    if (change === undefined) continue;

    const kind = kindOf(change);
    const beforeLines = kind === 'added' ? 0 : change.count;
    const currentLines = kind === 'removed' ? 0 : change.count;
    let segments: readonly DiffSegment[] | undefined;

    const next = changes[index + 1];
    if (
      kind === 'removed' &&
      change.count === 1 &&
      next?.added === true &&
      next.count === 1
    ) {
      segments = wordSegments(change.value, next.value, 'removed');
    } else if (
      kind === 'added' &&
      change.count === 1 &&
      changes[index - 1]?.removed === true &&
      changes[index - 1]?.count === 1
    ) {
      const previous = changes[index - 1];
      if (previous !== undefined) {
        segments = wordSegments(previous.value, change.value, 'added');
      }
    }

    parts.push({
      kind,
      value: change.value,
      beforeStart: beforeLines === 0 ? undefined : beforeLine,
      currentStart: currentLines === 0 ? undefined : currentLine,
      beforeLines,
      currentLines,
      segments,
    });

    beforeLine += beforeLines;
    currentLine += currentLines;
    if (kind === 'added') additions += currentLines;
    if (kind === 'removed') deletions += beforeLines;
  }

  return {
    changed: true,
    additions,
    deletions,
    parts,
    summary: `${additions} added ${additions === 1 ? 'line' : 'lines'}, ${deletions} removed ${deletions === 1 ? 'line' : 'lines'}.`,
  };
}

export function bytesEqual(before: Uint8Array, current: Uint8Array): boolean {
  if (before.length !== current.length) return false;
  return before.every((byte, index) => current[index] === byte);
}

function signedPixels(value: number): string {
  if (value > 0) return `+${value} px`;
  return `${value} px`;
}

export function createImageDiff(
  before: Uint8Array,
  current: Uint8Array,
  beforeDimensions: ImageDimensions,
  currentDimensions: ImageDimensions
): ImageDiff {
  if (bytesEqual(before, current)) {
    return {
      mode: 'image',
      changed: false,
      summary: 'No changes. These versions have identical content.',
    };
  }

  const widthDelta = currentDimensions.width - beforeDimensions.width;
  const heightDelta = currentDimensions.height - beforeDimensions.height;
  return {
    mode: 'image',
    changed: true,
    summary:
      `Version dimensions: ${beforeDimensions.width} x ${beforeDimensions.height} px ` +
      `to ${currentDimensions.width} x ${currentDimensions.height} px. ` +
      `Width ${signedPixels(widthDelta)}, height ${signedPixels(heightDelta)}.`,
  };
}

/**
 * How one version would be compared. Exported because the historical load
 * refuses against a ceiling before it fetches anything, and that ceiling is
 * per mode.
 */
export function diffModeForRoute(route: RenderRoute): DiffMode | undefined {
  switch (route) {
    case 'markdown':
      return 'markdown';
    case 'code':
      return 'code';
    case 'sandboxed-html':
    case 'sandboxed-jsx':
      return 'rendered';
    case 'image':
      return 'image';
    default:
      return undefined;
  }
}

/**
 * Both versions have to reach the same mode, and the rule is equality rather
 * than a fallback to the current version's mode. Each mode compares a
 * different kind of thing: rendered prose the viewer builds, a page the
 * usercontent frame builds, an image the browser decodes, or lines of text.
 * Feeding one mode the other's bytes would produce a confident result with no
 * meaning, so a pair that disagrees is refused and the recipient is told why.
 */
export function diffModeForRoutes(
  currentRoute: RenderRoute,
  historicalRoute: RenderRoute
): DiffMode | undefined {
  const currentMode = diffModeForRoute(currentRoute);
  if (currentMode === undefined) return undefined;
  return currentMode === diffModeForRoute(historicalRoute)
    ? currentMode
    : undefined;
}

export function comparisonAvailability(
  view: ReadyView
): ComparisonAvailability {
  if (!Number.isInteger(view.currentVersion) || view.currentVersion <= 1) {
    return { kind: 'none' };
  }

  const mode = diffModeForRoute(view.route);
  if (mode === undefined) {
    return {
      kind: 'unavailable',
      code: 'comparison_not_renderable',
      detail:
        'Earlier versions exist, but this file is download-only. Relik cannot ' +
        'compare media, archives, or binary files in the browser.',
    };
  }

  const ceiling = diffCeilingFor(mode);
  if (view.content.length > ceiling.bytes) {
    return {
      kind: 'unavailable',
      code: 'comparison_too_large',
      detail:
        `Earlier versions exist, but this version is larger than the ${ceiling.label} ` +
        'comparison limit. The current version is still open normally.',
    };
  }

  return { kind: 'available', mode };
}
