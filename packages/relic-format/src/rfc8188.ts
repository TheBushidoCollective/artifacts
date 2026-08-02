/**
 * RFC 8188 `aes128gcm` framing.
 *
 * Layer 1 of the container (`spec/format.md` 3.1). A plaintext header of
 * `salt (16) | rs (4) | idlen (1) | keyid (idlen)`, then records of `rs`
 * octets, each carrying its own 16-octet authentication tag and a padding
 * delimiter, the last record using delimiter 2 and all others 1.
 *
 * Chosen because it gives all four properties the format requires: range
 * decryption, per-record AEAD, plaintext size derivable from encrypted
 * length before decryption, and a header readable before allocation.
 */

import {
  DecryptFailedError,
  KeyIdPresentError,
  MalformedContainerError,
} from './errors.ts';

/** `salt (16) | rs (4) | idlen (1)`, with `keyid` always empty. */
export const HEADER_BYTES = 21;

/** AES-GCM authentication tag, appended to the ciphertext by WebCrypto. */
export const TAG_BYTES = 16;

/** Every record spends one byte on the padding delimiter. */
export const DELIMITER_BYTES = 1;

/** Overhead per record: the tag plus the delimiter. */
export const RECORD_OVERHEAD = TAG_BYTES + DELIMITER_BYTES;

/** RFC 8188 salt length. */
export const SALT_BYTES = 16;

/**
 * The record size, in octets of ciphertext including the tag.
 *
 * 64 KiB. It must exceed the maximum envelope header, which is 1301 bytes
 * here, and it doubles as the GCS byte-range unit for range decryption.
 * See `docs/decisions.md`.
 */
export const RECORD_SIZE = 65536;

/** RFC 8188 forbids a record size below 18. */
export const MIN_RECORD_SIZE = 18;

/** Content bytes a full record can carry. */
export function recordCapacity(rs: number): number {
  return rs - RECORD_OVERHEAD;
}

const CEK_INFO = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
const NONCE_INFO = new TextEncoder().encode('Content-Encoding: nonce\0');

export interface DerivedKeys {
  readonly cek: CryptoKey;
  readonly nonceBase: Uint8Array;
}

/**
 * Derive the content-encryption key and the base nonce (RFC 8188 section 2.2).
 *
 * HKDF-SHA256 with the container's salt, expanded twice under the two info
 * strings the RFC fixes.
 */
export async function deriveKeys(
  ikm: Uint8Array,
  salt: Uint8Array
): Promise<DerivedKeys> {
  const material = await crypto.subtle.importKey(
    'raw',
    toBufferSource(ikm),
    'HKDF',
    false,
    ['deriveBits']
  );

  const cekBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: toBufferSource(salt),
      info: CEK_INFO,
    },
    material,
    128
  );
  const nonceBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: toBufferSource(salt),
      info: NONCE_INFO,
    },
    material,
    96
  );

  const cek = await crypto.subtle.importKey(
    'raw',
    cekBits,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  return { cek, nonceBase: new Uint8Array(nonceBits) };
}

/**
 * The nonce for record `seq`: the base nonce XORed with the sequence number
 * as a 96-bit big-endian integer (RFC 8188 section 2.3).
 *
 * Counter-derived rather than random per record. One key covers every record
 * in a relic, and a fresh random nonce per record would walk into the
 * birthday bound the nonce-reuse trap sits behind.
 */
export function recordNonce(nonceBase: Uint8Array, seq: number): Uint8Array {
  if (!Number.isSafeInteger(seq) || seq < 0) {
    throw new MalformedContainerError(`record sequence ${seq} is not valid`);
  }

  const nonce = new Uint8Array(nonceBase);
  // seq never approaches 2^48 in practice, so XOR into the low 6 octets.
  let remaining = seq;
  for (let offset = nonce.length - 1; offset >= 0 && remaining > 0; offset--) {
    nonce[offset] = (nonce[offset] as number) ^ (remaining & 0xff);
    remaining = Math.floor(remaining / 256);
  }
  return nonce;
}

export interface ContainerHeader {
  readonly salt: Uint8Array;
  readonly rs: number;
}

/** Serialize the plaintext header. `keyid` is always empty. */
export function encodeHeader(salt: Uint8Array, rs: number): Uint8Array {
  if (salt.length !== SALT_BYTES) {
    throw new MalformedContainerError(`salt must be ${SALT_BYTES} bytes`);
  }
  const header = new Uint8Array(HEADER_BYTES);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(SALT_BYTES, rs, false);
  header[SALT_BYTES + 4] = 0;
  return header;
}

/**
 * Parse the plaintext header.
 *
 * Refuses `idlen != 0` (`spec/format.md` 3.4). `keyid` is a plaintext
 * free-text field sitting next to ciphertext, which is exactly the invitation
 * somebody accepts when they need somewhere to put a filename. Every
 * legitimate use is already placed elsewhere, so the field is barred outright
 * and using it later takes a version bump.
 *
 * The header is not covered by any AEAD tag (`spec/format.md` 3.5). A
 * successfully parsed header is evidence of nothing. An attacker who can
 * write the object can alter `rs` or `salt` and make every record fail its
 * tag, which is denial of service rather than forgery.
 */
export function decodeHeader(bytes: Uint8Array): ContainerHeader {
  if (bytes.length < HEADER_BYTES) {
    throw new MalformedContainerError(
      `container is ${bytes.length} bytes, shorter than the header`
    );
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const rs = view.getUint32(SALT_BYTES, false);
  const idlen = bytes[SALT_BYTES + 4] as number;

  if (idlen !== 0) throw new KeyIdPresentError(idlen);
  if (rs < MIN_RECORD_SIZE) {
    throw new MalformedContainerError(`record size ${rs} is below 18`);
  }

  return { salt: bytes.slice(0, SALT_BYTES), rs };
}

/** Encrypt one record, padding its plaintext out to `targetDataBytes`. */
export async function encryptRecord(
  keys: DerivedKeys,
  seq: number,
  data: Uint8Array,
  isLast: boolean,
  targetDataBytes: number = data.length
): Promise<Uint8Array> {
  if (targetDataBytes < data.length) {
    throw new MalformedContainerError('pad target is smaller than the data');
  }

  const plaintext = new Uint8Array(targetDataBytes + DELIMITER_BYTES);
  plaintext.set(data, 0);
  plaintext[data.length] = isLast ? 2 : 1;
  // Remaining bytes stay zero, which is the padding RFC 8188 specifies.

  const sealed = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toBufferSource(recordNonce(keys.nonceBase, seq)) },
    keys.cek,
    toBufferSource(plaintext)
  );
  return new Uint8Array(sealed);
}

export interface DecryptedRecord {
  readonly data: Uint8Array;
  readonly isLast: boolean;
}

/**
 * Decrypt one record and strip its padding.
 *
 * Throws `DecryptFailedError` on tag failure, carrying no cause. Per
 * `spec/format.md` 3.5 a wrong key, a truncated transfer, and a tampered
 * header are indistinguishable here, and callers must not claim otherwise.
 */
export async function decryptRecord(
  keys: DerivedKeys,
  seq: number,
  sealed: Uint8Array
): Promise<DecryptedRecord> {
  let opened: ArrayBuffer;
  try {
    opened = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toBufferSource(recordNonce(keys.nonceBase, seq)) },
      keys.cek,
      toBufferSource(sealed)
    );
  } catch {
    throw new DecryptFailedError(seq);
  }

  const plaintext = new Uint8Array(opened);

  // Padding is zeros and the delimiter is nonzero, so the last nonzero byte
  // scanning backwards is the delimiter.
  let cursor = plaintext.length - 1;
  while (cursor >= 0 && plaintext[cursor] === 0) cursor--;

  if (cursor < 0) {
    throw new MalformedContainerError(`record ${seq} has no padding delimiter`);
  }

  const delimiter = plaintext[cursor] as number;
  if (delimiter !== 1 && delimiter !== 2) {
    throw new MalformedContainerError(
      `record ${seq} has padding delimiter ${delimiter}, expected 1 or 2`
    );
  }

  return { data: plaintext.slice(0, cursor), isLast: delimiter === 2 };
}

/**
 * Bun and the DOM disagree on whether a `Uint8Array` over a `SharedArrayBuffer`
 * satisfies `BufferSource`. Narrowing here keeps every call site clean.
 */
function toBufferSource(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}
