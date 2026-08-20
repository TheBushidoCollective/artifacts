import { type Change, diffLines, diffWordsWithSpace } from 'diff';
import type { ReadyView, RenderRoute } from './viewer.ts';

/**
 * A comparison keeps two plaintext byte arrays, two decoded strings, and the
 * diff library's change graph alive together. At 4 MiB per version that is
 * 8 MiB of plaintext, up to 16 MiB of UTF-16 text, an 8 MiB ciphertext window,
 * and 32 MiB reserved for change bookkeeping and DOM text. The 64 MiB working
 * set stays well below the separate 100 MiB one-version render ceiling.
 */
export const MAX_DIFF_BYTES = 4 * 1024 * 1024;
export const DIFF_LIMIT_LABEL = '4 MiB';

export type DiffMode = 'markdown' | 'code' | 'source' | 'image';

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
  readonly mode: Exclude<DiffMode, 'image'>;
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
 * Compare source lines. Markdown is compared as Markdown source, code as code
 * source, and HTML or JSX as source rather than as a rendered DOM.
 */
export function createTextDiff(
  mode: Exclude<DiffMode, 'image'>,
  before: string,
  current: string
): TextDiff {
  if (before === current) {
    return {
      mode,
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
    mode,
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

function modeForRoute(route: RenderRoute): DiffMode | undefined {
  switch (route) {
    case 'markdown':
      return 'markdown';
    case 'code':
      return 'code';
    case 'sandboxed-html':
    case 'sandboxed-jsx':
      return 'source';
    case 'image':
      return 'image';
    default:
      return undefined;
  }
}

/**
 * All text render routes can be compared as source. Images need another image
 * because parsing an image as text would invent a result with no visual use.
 */
export function diffModeForRoutes(
  currentRoute: RenderRoute,
  historicalRoute: RenderRoute
): DiffMode | undefined {
  const currentMode = modeForRoute(currentRoute);
  const historicalMode = modeForRoute(historicalRoute);
  if (currentMode === undefined || historicalMode === undefined)
    return undefined;
  if (currentMode === 'image' || historicalMode === 'image') {
    return currentMode === 'image' && historicalMode === 'image'
      ? 'image'
      : undefined;
  }
  return currentMode;
}

export function comparisonAvailability(
  view: ReadyView
): ComparisonAvailability {
  if (!Number.isInteger(view.currentVersion) || view.currentVersion <= 1) {
    return { kind: 'none' };
  }

  const mode = modeForRoute(view.route);
  if (mode === undefined) {
    return {
      kind: 'unavailable',
      code: 'comparison_not_renderable',
      detail:
        'Earlier versions exist, but this file is download-only. Relik cannot ' +
        'compare media, archives, or binary files in the browser.',
    };
  }

  if (view.content.length > MAX_DIFF_BYTES) {
    return {
      kind: 'unavailable',
      code: 'comparison_too_large',
      detail:
        `Earlier versions exist, but this version is larger than the ${DIFF_LIMIT_LABEL} ` +
        'comparison limit. The current version is still open normally.',
    };
  }

  return { kind: 'available', mode };
}
