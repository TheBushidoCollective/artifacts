/**
 * The comment key, and the envelope a comment body travels in.
 *
 * A comment about content the operator cannot read, stored in the clear, hands
 * the operator exactly what the architecture exists to deny. So comment bodies
 * are ciphertext on the wire and at rest, and the key comes from the same
 * place the content key does: the fragment.
 *
 * It is not the content key. Both are HKDF expansions of the same 16 fragment
 * bytes under different `info` strings, which is the mechanism `rfc8188.ts`
 * already uses to get a content key and a nonce base out of one input. A
 * third distinct `info` yields an independent key without touching the
 * fragment, the container, or the format version, and `format.md` 2.1 is
 * explicit that a third field in the fragment would take a version bump.
 *
 * Nothing here reads `location`, writes storage, or logs. The key material
 * arrives as an argument and stays in memory, per `viewer.md` 1.8.
 */

import { decodeKey, encodeKey } from '@relic/format';

/** Expansion label. Distinct from the container's two by construction. */
const COMMENT_INFO = 'relic/comments/v1';

/** AES-128-GCM, matching the container's cipher rather than inventing one. */
const COMMENT_KEY_BITS = 128;

/** GCM's standard nonce length. Anything else costs an extra derivation. */
const NONCE_BYTES = 12;

/**
 * What a comment carries once it is open.
 *
 * The display name is decoration and the address is the record, so the name
 * lives inside the ciphertext where the operator cannot read it and the
 * address lives outside it where the server has to. That asymmetry is
 * deliberate: aliasing a public identity is presentation, and hiding it would
 * be a claim the participation graph makes false anyway.
 */
export interface CommentPlaintext {
  readonly body: string;
  readonly display_name: string | null;
}

/** The two operations the thread needs, so tests can supply their own. */
export interface CommentCipher {
  seal(plaintext: CommentPlaintext): Promise<string>;
  open(ciphertext: string): Promise<CommentPlaintext>;
}

/** Thrown when a ciphertext will not open under this relic's comment key. */
export class CommentSealedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommentSealedError';
  }
}

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

/**
 * `BufferSource` rather than the raw view, because a `Uint8Array` over a
 * `SharedArrayBuffer` is not assignable to it under TypeScript 5.7's lib.
 */
function bytesOf(view: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(view.byteLength);
  new Uint8Array(copy).set(view);
  return copy;
}

/**
 * Expand the fragment's 16 bytes into a comment key.
 *
 * Salt is zero-length. RFC 5869 section 2.2 makes that legal and defines the
 * result as HMAC with a zero-filled key of hash length, and the container's
 * own salt is the wrong input here: it lives in the ciphertext header, so
 * using it would make the comment key unavailable until the content had been
 * fetched and parsed. The comment thread has to work while the content is
 * still loading.
 */
export async function deriveCommentKey(
  fragmentKey: Uint8Array
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    bytesOf(fragmentKey),
    'HKDF',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new ArrayBuffer(0),
      info: bytesOf(encoder.encode(COMMENT_INFO)),
    },
    material,
    COMMENT_KEY_BITS
  );
  return crypto.subtle.importKey('raw', bits, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
}

/** `nonce || AES-128-GCM(key, nonce, plaintext)`, carried as base64url. */
export function commentCipher(key: CryptoKey): CommentCipher {
  return {
    async seal(plaintext) {
      const nonce = new Uint8Array(NONCE_BYTES);
      crypto.getRandomValues(nonce);
      const sealed = new Uint8Array(
        await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: bytesOf(nonce) },
          key,
          bytesOf(encoder.encode(JSON.stringify(plaintext)))
        )
      );
      const envelope = new Uint8Array(nonce.length + sealed.length);
      envelope.set(nonce, 0);
      envelope.set(sealed, nonce.length);
      return encodeKey(envelope);
    },

    async open(ciphertext) {
      const envelope = decodeKey(ciphertext);
      if (envelope.length <= NONCE_BYTES) {
        throw new CommentSealedError(
          `comment envelope is ${envelope.length} bytes, shorter than a nonce`
        );
      }
      let opened: ArrayBuffer;
      try {
        opened = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: bytesOf(envelope.subarray(0, NONCE_BYTES)) },
          key,
          bytesOf(envelope.subarray(NONCE_BYTES))
        );
      } catch {
        // A wrong key and an altered ciphertext are the same `OperationError`,
        // exactly as they are for content, so this does not claim to know
        // which. The thread says both are possible and shows the comment
        // rather than dropping it.
        throw new CommentSealedError('comment did not decrypt');
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(decoder.decode(opened));
      } catch {
        throw new CommentSealedError('comment plaintext is not valid JSON');
      }
      if (typeof parsed !== 'object' || parsed === null) {
        throw new CommentSealedError('comment plaintext is not an object');
      }
      const record = parsed as Record<string, unknown>;
      if (typeof record['body'] !== 'string') {
        throw new CommentSealedError('comment plaintext carries no body');
      }
      const name = record['display_name'];
      return {
        body: record['body'],
        display_name: typeof name === 'string' ? name : null,
      };
    },
  };
}
