/**
 * The Relic envelope, layer 2 of the container (`spec/format.md` 3.1).
 *
 * Entirely inside the encrypted stream. Record 0 is the envelope header and
 * never spans records: one record fetched, one decrypted, and the viewer
 * holds the whole header. That is what makes the refuse-before-allocating
 * check possible and range decryption useful.
 *
 * Wire layout, all integers big-endian:
 *
 *     version       u8
 *     entry_count   u8
 *     per entry:
 *       filename_len  u16
 *       filename      utf-8 bytes
 *       mimetype_len  u16
 *       mimetype      utf-8 bytes
 *       offset        u64   into the content stream
 *       length        u64
 *
 * The parser is strict: any byte left over after the declared structure is a
 * refusal, which is how "unknown fields are refused rather than ignored"
 * lands in a binary encoding. Extensions arrive with a version bump, which is
 * what the fragment marker exists to make possible.
 */

import { StrictParseError, VersionMismatchError } from './errors.ts';

/** Bounded so the header always fits in record 0 alone. */
export const MAX_FILENAME_BYTES = 1024;

/** Bounded for the same reason. */
export const MAX_MIMETYPE_BYTES = 255;

/**
 * Exactly 1 in version 1 (`spec/format.md` 3.1).
 *
 * The structure carries offsets so a future manifest can add entries without
 * needing a new container. That is the frame's reversibility argument applied
 * to structure, and it costs a handful of bytes.
 */
export const ENTRY_COUNT_V1 = 1;

/** Largest header this build can emit, which is what bounds `rs`. */
export const MAX_HEADER_BYTES =
  2 + (2 + MAX_FILENAME_BYTES + 2 + MAX_MIMETYPE_BYTES + 8 + 8);

export interface EnvelopeEntry {
  /**
   * Untrusted display text. The container carries it as a bounded UTF-8 byte
   * string and asserts nothing about it. An empty filename is legal and means
   * the viewer names the download from the relic ID.
   */
  readonly filename: string;
  /** Declared mimetype. Untrusted in exactly the same way. */
  readonly mimetype: string;
  readonly offset: number;
  readonly length: number;
}

export interface Envelope {
  readonly version: number;
  readonly entries: readonly EnvelopeEntry[];
}

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: false });

export function encodeEnvelope(envelope: Envelope): Uint8Array {
  if (envelope.entries.length !== ENTRY_COUNT_V1) {
    throw new StrictParseError(
      `version 1 carries exactly ${ENTRY_COUNT_V1} entry, got ` +
        `${envelope.entries.length}`
    );
  }

  const parts: Uint8Array[] = [];
  const prelude = new Uint8Array(2);
  prelude[0] = envelope.version;
  prelude[1] = envelope.entries.length;
  parts.push(prelude);

  for (const entry of envelope.entries) {
    const filename = encoder.encode(entry.filename);
    const mimetype = encoder.encode(entry.mimetype);

    if (filename.length > MAX_FILENAME_BYTES) {
      throw new StrictParseError(
        `filename is ${filename.length} bytes, over ${MAX_FILENAME_BYTES}`
      );
    }
    if (mimetype.length > MAX_MIMETYPE_BYTES) {
      throw new StrictParseError(
        `mimetype is ${mimetype.length} bytes, over ${MAX_MIMETYPE_BYTES}`
      );
    }

    const fixed = new Uint8Array(
      2 + filename.length + 2 + mimetype.length + 16
    );
    const view = new DataView(fixed.buffer);
    let cursor = 0;

    view.setUint16(cursor, filename.length, false);
    cursor += 2;
    fixed.set(filename, cursor);
    cursor += filename.length;

    view.setUint16(cursor, mimetype.length, false);
    cursor += 2;
    fixed.set(mimetype, cursor);
    cursor += mimetype.length;

    view.setBigUint64(cursor, BigInt(entry.offset), false);
    cursor += 8;
    view.setBigUint64(cursor, BigInt(entry.length), false);

    parts.push(fixed);
  }

  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/**
 * Parse the envelope header out of record 0's plaintext.
 *
 * `fragmentVersion` is the version the fragment marker declared. A
 * disagreement is refused (`spec/format.md` 3.7): the outer copy enabled
 * early refusal, the inner copy sits inside the AEAD and is tamper-evident,
 * and a mismatch means a mangled fragment prefix or a substituted object.
 */
export function decodeEnvelope(
  bytes: Uint8Array,
  fragmentVersion: number
): Envelope {
  if (bytes.length < 2) {
    throw new StrictParseError('envelope header is shorter than its prelude');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = bytes[0] as number;
  const entryCount = bytes[1] as number;

  if (version !== fragmentVersion) {
    throw new VersionMismatchError(fragmentVersion, version);
  }
  if (entryCount !== ENTRY_COUNT_V1) {
    throw new StrictParseError(
      `version 1 carries exactly ${ENTRY_COUNT_V1} entry, header declares ` +
        `${entryCount}`
    );
  }

  let cursor = 2;
  const entries: EnvelopeEntry[] = [];

  for (let index = 0; index < entryCount; index++) {
    cursor = requireBytes(cursor, 2, bytes.length, 'filename length');
    const filenameLen = view.getUint16(cursor - 2, false);
    if (filenameLen > MAX_FILENAME_BYTES) {
      throw new StrictParseError(
        `filename declares ${filenameLen} bytes, over ${MAX_FILENAME_BYTES}`
      );
    }

    cursor = requireBytes(cursor, filenameLen, bytes.length, 'filename');
    const filename = decoder.decode(bytes.slice(cursor - filenameLen, cursor));

    cursor = requireBytes(cursor, 2, bytes.length, 'mimetype length');
    const mimetypeLen = view.getUint16(cursor - 2, false);
    if (mimetypeLen > MAX_MIMETYPE_BYTES) {
      throw new StrictParseError(
        `mimetype declares ${mimetypeLen} bytes, over ${MAX_MIMETYPE_BYTES}`
      );
    }

    cursor = requireBytes(cursor, mimetypeLen, bytes.length, 'mimetype');
    const mimetype = decoder.decode(bytes.slice(cursor - mimetypeLen, cursor));

    cursor = requireBytes(cursor, 16, bytes.length, 'offset and length');
    const offset = toSafeInteger(
      view.getBigUint64(cursor - 16, false),
      'offset'
    );
    const length = toSafeInteger(
      view.getBigUint64(cursor - 8, false),
      'length'
    );

    entries.push({ filename, mimetype, offset, length });
  }

  // Strict: nothing may follow the declared structure.
  if (cursor !== bytes.length) {
    throw new StrictParseError(
      `envelope header has ${bytes.length - cursor} trailing bytes`
    );
  }

  return { version, entries };
}

function requireBytes(
  cursor: number,
  needed: number,
  available: number,
  field: string
): number {
  const next = cursor + needed;
  if (next > available) {
    throw new StrictParseError(`envelope header truncated reading ${field}`);
  }
  return next;
}

function toSafeInteger(value: bigint, field: string): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new StrictParseError(`envelope ${field} exceeds the safe range`);
  }
  return Number(value);
}
