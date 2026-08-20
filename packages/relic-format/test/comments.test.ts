import { describe, expect, test } from 'bun:test';
import {
  COMMENT_BODY_LIMIT_BYTES,
  COMMENT_DISPLAY_NAME_LIMIT_BYTES,
  COMMENT_NONCE_BYTES,
  decryptComment,
  deriveCommentKey,
  encryptComment,
} from '../src/comments.ts';
import {
  CommentDecryptFailedError,
  CommentTooLargeError,
  MalformedCommentError,
} from '../src/errors.ts';
import { generateKey, KEY_BYTES } from '../src/fragment.ts';
import { deriveKeys } from '../src/rfc8188.ts';

/**
 * HKDF-SHA256 over the fragment key, run here rather than through the module,
 * so two derivations can be compared as bytes. Both real keys are imported
 * non-extractable, which is correct and makes them uncomparable directly.
 */
async function derivedBits(
  keyBytes: Uint8Array,
  info: string,
  salt: Uint8Array = new Uint8Array(0),
  length = 128
): Promise<string> {
  const material = await crypto.subtle.importKey(
    'raw',
    keyBytes.slice().buffer as ArrayBuffer,
    'HKDF',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt.slice().buffer as ArrayBuffer,
      info: new TextEncoder().encode(info),
    },
    material,
    length
  );
  return Buffer.from(bits).toString('hex');
}

const COMMENT_INFO = 'relic/comments/v1';
const CEK_INFO = 'Content-Encoding: aes128gcm\0';
const NONCE_INFO = 'Content-Encoding: nonce\0';

function corrupt(ciphertext: string): string {
  const bytes = new Uint8Array(Buffer.from(ciphertext, 'base64url'));
  // A byte inside the sealed region, past the nonce, so the tag is what fails
  // rather than the framing.
  const target = COMMENT_NONCE_BYTES + 2;
  const current = bytes[target];
  if (current === undefined) throw new Error('ciphertext too short to corrupt');
  bytes[target] = current ^ 0x01;
  return Buffer.from(bytes).toString('base64url');
}

describe('the comment key', () => {
  test('is not the container key derived from the same fragment', async () => {
    const fragmentKey = generateKey();
    const salt = new Uint8Array(16).fill(3);

    const comment = await derivedBits(fragmentKey, COMMENT_INFO);

    // Against the container's real derivation, salt and all.
    expect(comment).not.toBe(await derivedBits(fragmentKey, CEK_INFO, salt));
    expect(comment).not.toBe(
      await derivedBits(fragmentKey, NONCE_INFO, salt, 96)
    );

    // And with the salt held identical, so the separation is the label's work
    // rather than an accident of the container carrying a salt. That is what
    // makes independence structural.
    expect(comment).not.toBe(await derivedBits(fragmentKey, CEK_INFO));

    // Behaviourally too: the container's CEK cannot open a comment.
    const container = await deriveKeys(fragmentKey, salt);
    const sealed = await encryptComment(await deriveCommentKey(fragmentKey), {
      body: 'not for the container key',
      display_name: null,
    });
    await expect(decryptComment(container.cek, sealed)).rejects.toBeInstanceOf(
      CommentDecryptFailedError
    );
  });

  test('is stable for one fragment key', async () => {
    const fragmentKey = generateKey();
    expect(await derivedBits(fragmentKey, COMMENT_INFO)).toBe(
      await derivedBits(fragmentKey, COMMENT_INFO)
    );

    // Stability is what makes a comment written today readable tomorrow, so
    // prove it end to end rather than only over the bits.
    const first = await deriveCommentKey(fragmentKey);
    const second = await deriveCommentKey(fragmentKey);
    const sealed = await encryptComment(first, {
      body: 'still readable',
      display_name: null,
    });
    expect(await decryptComment(second, sealed)).toEqual({
      body: 'still readable',
      display_name: null,
    });
  });

  test('differs for a different fragment key', async () => {
    const one = generateKey();
    const other = generateKey();
    expect(one).toHaveLength(KEY_BYTES);
    expect(await derivedBits(one, COMMENT_INFO)).not.toBe(
      await derivedBits(other, COMMENT_INFO)
    );

    // Which is what stops a link holder for one relic reading another's
    // comments.
    const sealed = await encryptComment(await deriveCommentKey(one), {
      body: 'for this relic only',
      display_name: null,
    });
    await expect(
      decryptComment(await deriveCommentKey(other), sealed)
    ).rejects.toBeInstanceOf(CommentDecryptFailedError);
  });
});

describe('the envelope', () => {
  test('round trips a body and a display name, multibyte included', async () => {
    const key = await deriveCommentKey(generateKey());
    const plaintext = {
      body: 'The second chart is wrong. \u00e9\u00e8\u0161 \u4f60\u597d \ud83d\ude80\ud83d\udd25',
      display_name: 'Jos\u00e9 \ud83d\udc4b',
    };

    const sealed = await encryptComment(key, plaintext);
    expect(await decryptComment(key, sealed)).toEqual(plaintext);
  });

  test('round trips a null display name distinctly from an empty one', async () => {
    const key = await deriveCommentKey(generateKey());
    const nulled = await decryptComment(
      key,
      await encryptComment(key, { body: 'a', display_name: null })
    );
    const empty = await decryptComment(
      key,
      await encryptComment(key, { body: 'a', display_name: '' })
    );
    expect(nulled.display_name).toBeNull();
    expect(empty.display_name).toBe('');
  });

  test('a flipped ciphertext bit fails authentication', async () => {
    const key = await deriveCommentKey(generateKey());
    const sealed = await encryptComment(key, {
      body: 'do not tamper with this',
      display_name: null,
    });

    await expect(decryptComment(key, corrupt(sealed))).rejects.toBeInstanceOf(
      CommentDecryptFailedError
    );
  });

  test('two seals of identical plaintext differ, so the nonce is fresh', async () => {
    const key = await deriveCommentKey(generateKey());
    const plaintext = { body: 'same words twice', display_name: null };

    const first = await encryptComment(key, plaintext);
    const second = await encryptComment(key, plaintext);

    // Nonce reuse under one AES-GCM key loses the plaintext outright, so this
    // is a correctness assertion and not a style one.
    expect(first).not.toBe(second);
    const firstNonce = new Uint8Array(Buffer.from(first, 'base64url')).subarray(
      0,
      COMMENT_NONCE_BYTES
    );
    const secondNonce = new Uint8Array(
      Buffer.from(second, 'base64url')
    ).subarray(0, COMMENT_NONCE_BYTES);
    expect(Buffer.from(firstNonce).toString('hex')).not.toBe(
      Buffer.from(secondNonce).toString('hex')
    );
    // Both still open, which is the point of a fresh nonce rather than a
    // random ciphertext.
    expect((await decryptComment(key, first)).body).toBe('same words twice');
    expect((await decryptComment(key, second)).body).toBe('same words twice');
  });

  test('refuses a comment too short to carry a nonce', async () => {
    const key = await deriveCommentKey(generateKey());
    await expect(decryptComment(key, 'AAAA')).rejects.toBeInstanceOf(
      MalformedCommentError
    );
  });

  test('refuses a value that is not base64url', async () => {
    const key = await deriveCommentKey(generateKey());
    await expect(decryptComment(key, 'not base64!!')).rejects.toBeInstanceOf(
      MalformedCommentError
    );
  });
});

describe('the caps', () => {
  test('a body at the cap is accepted and one byte over is refused', async () => {
    const key = await deriveCommentKey(generateKey());
    const atCap = 'x'.repeat(COMMENT_BODY_LIMIT_BYTES);

    expect(
      (
        await decryptComment(
          key,
          await encryptComment(key, {
            body: atCap,
            display_name: null,
          })
        )
      ).body
    ).toHaveLength(COMMENT_BODY_LIMIT_BYTES);

    await expect(
      encryptComment(key, { body: `${atCap}x`, display_name: null })
    ).rejects.toBeInstanceOf(CommentTooLargeError);
  });

  test('counts UTF-8 bytes, not characters', async () => {
    const key = await deriveCommentKey(generateKey());
    // Four-byte characters: a body inside the character limit and outside the
    // byte limit, which is the case a length check on `.length` gets wrong.
    const body = '\ud83d\ude80'.repeat(COMMENT_BODY_LIMIT_BYTES / 4 + 1);
    expect(body.length).toBeLessThan(COMMENT_BODY_LIMIT_BYTES);

    const refusal = encryptComment(key, { body, display_name: null });
    await expect(refusal).rejects.toBeInstanceOf(CommentTooLargeError);
    await expect(refusal).rejects.toMatchObject({ field: 'body' });
  });

  test('refuses a display name over its cap and names the field', async () => {
    const key = await deriveCommentKey(generateKey());
    const refusal = encryptComment(key, {
      body: 'fine',
      display_name: 'n'.repeat(COMMENT_DISPLAY_NAME_LIMIT_BYTES + 1),
    });

    await expect(refusal).rejects.toBeInstanceOf(CommentTooLargeError);
    await expect(refusal).rejects.toMatchObject({
      field: 'display_name',
      limitBytes: COMMENT_DISPLAY_NAME_LIMIT_BYTES,
    });
  });
});

describe('strict parsing', () => {
  /** Seal arbitrary JSON under a comment key, bypassing `encryptComment`. */
  async function sealRaw(key: CryptoKey, json: string): Promise<string> {
    const nonce = crypto.getRandomValues(new Uint8Array(COMMENT_NONCE_BYTES));
    const sealed = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: nonce.slice().buffer as ArrayBuffer },
        key,
        new TextEncoder().encode(json).slice().buffer as ArrayBuffer
      )
    );
    const framed = new Uint8Array(nonce.length + sealed.length);
    framed.set(nonce, 0);
    framed.set(sealed, nonce.length);
    return Buffer.from(framed).toString('base64url');
  }

  test('refuses an unknown field rather than ignoring it', async () => {
    const key = await deriveCommentKey(generateKey());
    const sealed = await sealRaw(
      key,
      JSON.stringify({ body: 'hi', display_name: null, anchor: 'para-3' })
    );

    // An anchored comment is a real future feature. It must arrive as a
    // deliberate change, not as a field an old parser dropped on the floor.
    await expect(decryptComment(key, sealed)).rejects.toBeInstanceOf(
      MalformedCommentError
    );
  });

  test('refuses a display name that is neither a string nor null', async () => {
    const key = await deriveCommentKey(generateKey());
    const sealed = await sealRaw(
      key,
      JSON.stringify({ body: 'hi', display_name: 42 })
    );

    await expect(decryptComment(key, sealed)).rejects.toBeInstanceOf(
      MalformedCommentError
    );
  });

  test('refuses a missing body and a non-object plaintext', async () => {
    const key = await deriveCommentKey(generateKey());

    await expect(
      decryptComment(key, await sealRaw(key, JSON.stringify({})))
    ).rejects.toBeInstanceOf(MalformedCommentError);
    await expect(
      decryptComment(key, await sealRaw(key, JSON.stringify(['body'])))
    ).rejects.toBeInstanceOf(MalformedCommentError);
    await expect(
      decryptComment(key, await sealRaw(key, 'not json'))
    ).rejects.toBeInstanceOf(MalformedCommentError);
  });
});
