/**
 * Comment encryption (`spec/format.md` 3.13).
 *
 * A comment about content the operator cannot read, stored in the clear,
 * hands the operator exactly what the architecture exists to deny. So comment
 * bodies are encrypted by whoever writes them, under a key only a holder of
 * the relic's link can derive.
 *
 * **The fragment does not change, and that is the constraint everything here
 * bends around.** `spec/format.md` 2.1 fixes the fragment at the marker and
 * the key, and says a third field takes a version bump. There is therefore no
 * room for a separate comment secret. What there is room for is another HKDF
 * label: RFC 8188 already expands the same input keying material twice, under
 * `Content-Encoding: aes128gcm\0` for the content key and
 * `Content-Encoding: nonce\0` for the base nonce, and a third distinct label
 * yields a third key independent of both. Independence is by construction
 * rather than by assertion, which is why this needs no version bump: the
 * container's bytes, the envelope's fields, and the fragment's shape are all
 * untouched. Nothing that was written before this existed decodes differently
 * after it.
 *
 * The salt is zero-length, unlike the container's, because there is no salt to
 * carry: a comment is not a container and has no header to put one in. RFC
 * 5869 permits it, and the label plus a per-comment nonce is what separates
 * comments from each other.
 *
 * The framing is deliberately not RFC 8188. A comment is small, read whole,
 * and never range-decrypted, so records, padding, and a 21-byte header would
 * all be overhead spent on properties comments do not need. It is
 * `nonce(12) || AES-128-GCM(key, nonce, plaintext)`, transported base64url.
 *
 * This package owns it because the viewer and the publishing client both
 * encrypt and decrypt comments, and a second definition of the derivation is
 * the drift this package exists to prevent.
 */

import {
  CommentDecryptFailedError,
  CommentTooLargeError,
  MalformedCommentError,
} from './errors.ts';

/**
 * The third label. Distinct from RFC 8188's two by construction, and namespaced
 * with a version segment so a later envelope change has a label to move to
 * without colliding with comments already written.
 */
const COMMENT_INFO = new TextEncoder().encode('relic/comments/v1');

/** AES-GCM's standard nonce length, prepended to every comment. */
export const COMMENT_NONCE_BYTES = 12;

/**
 * A body cap, enforced here rather than left to a caller.
 *
 * Enforced before encryption so the refusal names the limit, and enforced in
 * this package so it is one number rather than one per caller. Truncating
 * instead of refusing would change what a comment says, which is worse than
 * refusing to store it.
 */
export const COMMENT_BODY_LIMIT_BYTES = 4096;

/** A display name is decoration, so it gets a decoration-sized cap. */
export const COMMENT_DISPLAY_NAME_LIMIT_BYTES = 64;

/**
 * What a comment carries.
 *
 * `display_name` aliases the commenter's identity for presentation and never
 * replaces it: the identity is the verified address the service holds, and
 * this is untrusted display text living inside the ciphertext where the
 * service cannot read it.
 */
export interface CommentPlaintext {
  readonly body: string;
  readonly display_name: string | null;
}

/**
 * Derive a relic's comment key from the same 16 bytes the fragment carries.
 *
 * HKDF-SHA256, zero-length salt, `relic/comments/v1`, expanded to 128 bits.
 */
export async function deriveCommentKey(
  keyBytes: Uint8Array
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    toBufferSource(keyBytes),
    'HKDF',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: COMMENT_INFO,
    },
    material,
    128
  );
  return crypto.subtle.importKey('raw', bits, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

/**
 * Seal one comment. The nonce is drawn fresh per call, never derived from a
 * counter, because comments have no ordering this package can see and a reused
 * nonce under a reused key loses the plaintext outright.
 */
export async function encryptComment(
  commentKey: CryptoKey,
  plaintext: CommentPlaintext
): Promise<string> {
  const bodyBytes = new TextEncoder().encode(plaintext.body);
  if (bodyBytes.length > COMMENT_BODY_LIMIT_BYTES) {
    throw new CommentTooLargeError(
      'body',
      bodyBytes.length,
      COMMENT_BODY_LIMIT_BYTES
    );
  }
  if (plaintext.display_name !== null) {
    const nameBytes = new TextEncoder().encode(plaintext.display_name).length;
    if (nameBytes > COMMENT_DISPLAY_NAME_LIMIT_BYTES) {
      throw new CommentTooLargeError(
        'display_name',
        nameBytes,
        COMMENT_DISPLAY_NAME_LIMIT_BYTES
      );
    }
  }

  const encoded = new TextEncoder().encode(
    JSON.stringify({
      body: plaintext.body,
      display_name: plaintext.display_name,
    })
  );
  const nonce = crypto.getRandomValues(new Uint8Array(COMMENT_NONCE_BYTES));
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: toBufferSource(nonce) },
      commentKey,
      toBufferSource(encoded)
    )
  );

  const framed = new Uint8Array(nonce.length + sealed.length);
  framed.set(nonce, 0);
  framed.set(sealed, nonce.length);
  return base64url(framed);
}

/**
 * Open one comment, parsing strictly.
 *
 * An unknown field is refused rather than ignored, so an extension to this
 * envelope has to be a deliberate change instead of something a shrugging
 * parser absorbed. A `display_name` that is present and neither a string nor
 * null is refused for the same reason: coercing it to null would silently
 * discard whatever the writer meant.
 */
export async function decryptComment(
  commentKey: CryptoKey,
  ciphertext: string
): Promise<CommentPlaintext> {
  const framed = decodeBase64url(ciphertext);
  if (framed.length <= COMMENT_NONCE_BYTES) {
    throw new MalformedCommentError(
      `comment is ${framed.length} bytes, too short to carry a ` +
        `${COMMENT_NONCE_BYTES}-byte nonce and a tag`
    );
  }

  let opened: Uint8Array;
  try {
    opened = new Uint8Array(
      await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: toBufferSource(framed.subarray(0, COMMENT_NONCE_BYTES)),
        },
        commentKey,
        toBufferSource(framed.subarray(COMMENT_NONCE_BYTES))
      )
    );
  } catch {
    // No cause, per `spec/format.md` 3.5. A wrong key, a truncated value, and
    // a tampered nonce are the same symptom from here.
    throw new CommentDecryptFailedError();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(opened)
    );
  } catch {
    throw new MalformedCommentError('comment plaintext is not valid JSON');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new MalformedCommentError('comment plaintext is not a JSON object');
  }

  const fields = parsed as Record<string, unknown>;
  const unknown = Object.keys(fields).filter(
    (key) => key !== 'body' && key !== 'display_name'
  );
  if (unknown.length > 0) {
    throw new MalformedCommentError(
      `comment carries unknown field(s): ${unknown.join(', ')}`
    );
  }

  const body = fields['body'];
  if (typeof body !== 'string') {
    throw new MalformedCommentError('comment body is missing or not a string');
  }

  const displayName = fields['display_name'];
  if (displayName !== null && typeof displayName !== 'string') {
    throw new MalformedCommentError(
      'comment display_name is present and is neither a string nor null'
    );
  }

  return { body, display_name: displayName };
}

/** Unpadded base64url (RFC 4648 section 5), the same encoding the key uses. */
function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeBase64url(encoded: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(encoded)) {
    throw new MalformedCommentError('comment is not unpadded base64url');
  }
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  let binary: string;
  try {
    binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
  } catch {
    throw new MalformedCommentError('comment is not decodable base64url');
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/**
 * Bun and the DOM disagree on whether a `Uint8Array` over a `SharedArrayBuffer`
 * satisfies `BufferSource`. Narrowing here keeps every call site clean, the
 * same way `rfc8188.ts` does.
 */
function toBufferSource(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}
