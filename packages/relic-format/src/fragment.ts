/**
 * The URL fragment: `#<version-marker><key>` (`spec/format.md` 2.1).
 *
 * A fixed-width marker followed immediately by the encoded key, no
 * separator. The marker is a prefix and never a suffix, and there is no
 * trailing checksum, because either would put a different character class in
 * the terminal position and reopen the rule in 2.3.
 *
 * The fragment carries exactly two things. A third field takes a version
 * bump.
 */

import { MalformedFragmentError, UnknownVersionError } from './errors.ts';

/** The only format version this build speaks. */
export const FORMAT_VERSION = 1;

/** Fixed-width, two characters, and it is a prefix. */
export const VERSION_MARKER = 'r1';

/** RFC 8188 `aes128gcm` derives a 128-bit CEK regardless of IKM length. */
export const KEY_BYTES = 16;

/** 16 bytes is 22 unpadded base64url characters. */
export const KEY_CHARS = 22;

const B64URL =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * GFM's autolink extension drops these from the end of a bare URL. The
 * `fragment-terminal-charset` rule (`spec/format.md` 2.3) is that the
 * terminal characters our encoding can emit must not intersect this set.
 */
export const GFM_TRAILING_PUNCTUATION: readonly string[] = [
  '?',
  '!',
  '.',
  ',',
  ':',
  '*',
  '_',
  '~',
];

/** Unpadded base64url (RFC 4648 section 5). Padding adds no entropy. */
export function encodeKey(key: Uint8Array): string {
  let out = '';
  let accumulator = 0;
  let bitsHeld = 0;

  for (const byte of key) {
    accumulator = (accumulator << 8) | byte;
    bitsHeld += 8;
    while (bitsHeld >= 6) {
      bitsHeld -= 6;
      out += B64URL[(accumulator >>> bitsHeld) & 0x3f];
    }
  }

  if (bitsHeld > 0) {
    out += B64URL[(accumulator << (6 - bitsHeld)) & 0x3f];
  }

  return out;
}

export function decodeKey(encoded: string): Uint8Array {
  const bytes: number[] = [];
  let accumulator = 0;
  let bitsHeld = 0;

  for (const ch of encoded) {
    const index = B64URL.indexOf(ch);
    if (index < 0) {
      throw new MalformedFragmentError(
        `key contains ${JSON.stringify(ch)}, outside base64url`
      );
    }
    accumulator = (accumulator << 6) | index;
    bitsHeld += 6;
    if (bitsHeld >= 8) {
      bitsHeld -= 8;
      bytes.push((accumulator >>> bitsHeld) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}

/**
 * The set of characters the encoder can place in the final position, derived
 * from key length modulo three.
 *
 * This is the static half of the `fragment-terminal-charset` check. 16 is not
 * a multiple of three, so the final character carries 2 significant bits and
 * its index is a multiple of 16, which excludes index 62 (`-`) and 63 (`_`).
 * A 24-byte key would break it, which is what rules out AES-192 on encoding
 * grounds alone.
 */
export function terminalCharset(keyBytes: number = KEY_BYTES): string[] {
  const leftoverBits = (keyBytes * 8) % 6;
  if (leftoverBits === 0) return [...B64URL];
  const stride = 1 << (6 - leftoverBits);
  const chars: string[] = [];
  for (let index = 0; index < 64; index += stride) {
    chars.push(B64URL[index] as string);
  }
  return chars;
}

/** Draw a fresh content-encryption key from the platform CSPRNG. */
export function generateKey(): Uint8Array {
  const key = new Uint8Array(KEY_BYTES);
  crypto.getRandomValues(key);
  return key;
}

/** Build the fragment, without the leading `#`. */
export function encodeFragment(key: Uint8Array): string {
  if (key.length !== KEY_BYTES) {
    throw new MalformedFragmentError(`key must be ${KEY_BYTES} bytes`);
  }
  return VERSION_MARKER + encodeKey(key);
}

export interface ParsedFragment {
  readonly version: number;
  readonly key: Uint8Array;
}

/**
 * Parse a fragment, accepting a leading `#`.
 *
 * An unknown marker throws `UnknownVersionError`, and the viewer refuses
 * before fetching anything (`spec/format.md` 3.7): no mint, no consumed
 * download cap, no egress.
 */
export function parseFragment(fragment: string): ParsedFragment {
  const body = fragment.startsWith('#') ? fragment.slice(1) : fragment;

  if (body.length === 0) {
    throw new MalformedFragmentError('fragment is empty');
  }
  if (body.length !== VERSION_MARKER.length + KEY_CHARS) {
    throw new MalformedFragmentError(
      `fragment must be ${VERSION_MARKER.length + KEY_CHARS} characters, ` +
        `got ${body.length}`
    );
  }

  const marker = body.slice(0, VERSION_MARKER.length);
  if (marker !== VERSION_MARKER) {
    throw new UnknownVersionError(marker);
  }

  const key = decodeKey(body.slice(VERSION_MARKER.length));
  if (key.length !== KEY_BYTES) {
    throw new MalformedFragmentError(`key decoded to ${key.length} bytes`);
  }

  return { version: FORMAT_VERSION, key };
}

/** Assemble the full shareable URL. */
export function relicUrl(
  origin: string,
  relicId: string,
  key: Uint8Array
): string {
  const base = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  return `${base}/${relicId}#${encodeFragment(key)}`;
}
