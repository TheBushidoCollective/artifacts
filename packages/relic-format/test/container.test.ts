import { describe, expect, test } from 'bun:test';
import {
  ciphertextCapBytes,
  contentRangeToObjectRange,
  decryptContentRange,
  encryptedSize,
  encryptRelic,
  envelopePrefixLength,
  openEnvelope,
  openRelic,
  PLAINTEXT_CAP_BYTES,
  plaintextSizeUpperBound,
} from '../src/container.ts';
import {
  decodeEnvelope,
  encodeEnvelope,
  MAX_HEADER_BYTES,
} from '../src/envelope.ts';
import {
  DecryptFailedError,
  KeyIdPresentError,
  StrictParseError,
  VersionMismatchError,
} from '../src/errors.ts';
import { FORMAT_VERSION, generateKey } from '../src/fragment.ts';
import {
  decodeHeader,
  HEADER_BYTES,
  RECORD_SIZE,
  recordCapacity,
} from '../src/rfc8188.ts';

const RS = 64; // capacity 47, so a few bytes of content span records
const CAPACITY = recordCapacity(RS);

function bytes(length: number, seed = 7): Uint8Array {
  const out = new Uint8Array(length);
  let state = seed;
  for (let index = 0; index < length; index++) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    out[index] = state & 0xff;
  }
  return out;
}

async function roundTrip(content: Uint8Array, rs = RS) {
  const key = generateKey();
  const container = await encryptRelic({
    content,
    filename: 'a.txt',
    mimetype: 'text/plain',
    key,
    rs,
  });
  const opened = await openRelic(container, key);
  return { container, key, opened };
}

describe('round trip', () => {
  const sizes = [
    0,
    1,
    2,
    CAPACITY - 1,
    CAPACITY,
    CAPACITY + 1,
    CAPACITY * 2,
    CAPACITY * 2 + 1,
    CAPACITY * 5 + 13,
    1000,
  ];

  for (const size of sizes) {
    test(`preserves ${size} bytes exactly`, async () => {
      const content = bytes(size);
      const { opened } = await roundTrip(content);
      expect([...opened.content]).toEqual([...content]);
    });
  }

  test('preserves the envelope header fields', async () => {
    const key = generateKey();
    const container = await encryptRelic({
      content: bytes(500),
      filename: 'Q3 report.md',
      mimetype: 'text/markdown',
      key,
      rs: RS,
    });
    const { envelope } = await openRelic(container, key);
    expect(envelope.version).toBe(FORMAT_VERSION);
    expect(envelope.entries).toHaveLength(1);
    expect(envelope.entries[0]?.filename).toBe('Q3 report.md');
    expect(envelope.entries[0]?.mimetype).toBe('text/markdown');
    expect(envelope.entries[0]?.length).toBe(500);
    expect(envelope.entries[0]?.offset).toBe(0);
  });

  test('preserves a non-ASCII filename', async () => {
    const key = generateKey();
    // A multibyte filename pushes the envelope past the 47-byte capacity of
    // the deliberately tiny RS used elsewhere, so this one runs at 256.
    const container = await encryptRelic({
      content: bytes(10),
      filename: 'ผลลัพธ์ 日本語 café.txt',
      mimetype: 'text/plain',
      key,
      rs: 256,
    });
    const { envelope } = await openRelic(container, key);
    expect(envelope.entries[0]?.filename).toBe('ผลลัพธ์ 日本語 café.txt');
  });

  test('an empty filename is legal', async () => {
    const key = generateKey();
    const container = await encryptRelic({
      content: bytes(10),
      filename: '',
      mimetype: 'application/octet-stream',
      key,
      rs: RS,
    });
    const { envelope } = await openRelic(container, key);
    expect(envelope.entries[0]?.filename).toBe('');
  });

  test('works at the production record size', async () => {
    const content = bytes(200_000);
    const { opened } = await roundTrip(content, RECORD_SIZE);
    expect([...opened.content]).toEqual([...content]);
  });

  test('content that ends in zero bytes survives padding removal', async () => {
    const content = new Uint8Array(100); // every byte is zero
    const { opened } = await roundTrip(content);
    expect(opened.content).toHaveLength(100);
    expect([...opened.content].every((b) => b === 0)).toBe(true);
  });
});

describe('zero-byte content', () => {
  test('produces a non-empty object, so "exists and is non-empty" holds', async () => {
    const { container } = await roundTrip(new Uint8Array(0));
    expect(container.length).toBeGreaterThan(HEADER_BYTES);
  });

  test('leaves record 0 short, since it is also the final record', async () => {
    const { container } = await roundTrip(new Uint8Array(0));
    expect(container.length - HEADER_BYTES).toBeLessThan(RS);
  });
});

describe('record 0 padding', () => {
  test('is padded to full rs when content follows, fixing later offsets', async () => {
    const { container } = await roundTrip(bytes(CAPACITY * 3));
    const body = container.length - HEADER_BYTES;
    // Every record but the last is exactly rs, so the body is a whole number
    // of records plus a possibly short final one.
    expect(body).toBeGreaterThan(RS * 3);
    expect(Math.floor(body / RS)).toBeGreaterThanOrEqual(3);
  });
});

describe('reading the envelope before the content', () => {
  test('opens from the object prefix alone', async () => {
    const key = generateKey();
    const container = await encryptRelic({
      content: bytes(50_000),
      filename: 'big.bin',
      mimetype: 'application/octet-stream',
      key,
      rs: RECORD_SIZE,
    });

    const prefix = container.slice(0, envelopePrefixLength(RECORD_SIZE));
    const envelope = await openEnvelope(prefix, key);
    expect(envelope.entries[0]?.filename).toBe('big.bin');
    expect(envelope.entries[0]?.length).toBe(50_000);
  });

  test('the prefix is one record request', () => {
    expect(envelopePrefixLength(RECORD_SIZE)).toBe(HEADER_BYTES + RECORD_SIZE);
  });
});

describe('range decryption', () => {
  test('maps a content range onto the right records', () => {
    const range = contentRangeToObjectRange(0, 1, RS);
    expect(range.firstRecord).toBe(1);
    expect(range.start).toBe(HEADER_BYTES + RS);
    expect(range.trimStart).toBe(0);
  });

  test('content byte n lives in record floor(n / capacity) + 1', () => {
    const range = contentRangeToObjectRange(CAPACITY, CAPACITY + 1, RS);
    expect(range.firstRecord).toBe(2);
    expect(range.trimStart).toBe(0);
  });

  const spans: ReadonlyArray<readonly [number, number]> = [
    [0, 10],
    [0, CAPACITY],
    [5, CAPACITY + 5],
    [CAPACITY, CAPACITY * 2],
    [CAPACITY - 1, CAPACITY + 1],
    [CAPACITY * 2 + 3, CAPACITY * 4 + 9],
  ];

  for (const [start, end] of spans) {
    test(`decrypts content bytes ${start}..${end} without the whole object`, async () => {
      const content = bytes(CAPACITY * 6);
      const key = generateKey();
      const container = await encryptRelic({
        content,
        filename: 'a.txt',
        mimetype: 'text/plain',
        key,
        rs: RS,
      });
      const { salt } = decodeHeader(container);

      const range = contentRangeToObjectRange(start, end, RS);
      const span = container.slice(
        range.start,
        Math.min(range.end + 1, container.length)
      );

      const decrypted = await decryptContentRange(
        span,
        range,
        salt,
        key,
        RS,
        end - start
      );
      expect([...decrypted]).toEqual([...content.slice(start, end)]);
    });
  }

  test('a range request is strictly smaller than the object', async () => {
    const content = bytes(CAPACITY * 20);
    const key = generateKey();
    const container = await encryptRelic({
      content,
      filename: 'a.txt',
      mimetype: 'text/plain',
      key,
      rs: RS,
    });
    const range = contentRangeToObjectRange(0, 10, RS);
    expect(range.end - range.start + 1).toBeLessThan(container.length);
  });
});

describe('size arithmetic', () => {
  const sizes = [0, 1, CAPACITY, CAPACITY + 1, CAPACITY * 3, 5000];

  for (const size of sizes) {
    test(`encryptedSize predicts the object length for ${size} bytes`, async () => {
      const key = generateKey();
      const container = await encryptRelic({
        content: bytes(size),
        filename: 'a.txt',
        mimetype: 'text/plain',
        key,
        rs: RS,
      });
      const envelopeBytes = encodeEnvelope({
        version: FORMAT_VERSION,
        entries: [
          {
            filename: 'a.txt',
            mimetype: 'text/plain',
            offset: 0,
            length: size,
          },
        ],
      }).length;
      expect(encryptedSize(size, RS, envelopeBytes)).toBe(container.length);
    });
  }

  for (const size of sizes) {
    test(`plaintextSizeUpperBound bounds ${size} bytes from above`, async () => {
      const key = generateKey();
      const container = await encryptRelic({
        content: bytes(size),
        filename: 'a.txt',
        mimetype: 'text/plain',
        key,
        rs: RS,
      });
      expect(
        plaintextSizeUpperBound(container.length, RS)
      ).toBeGreaterThanOrEqual(size);
    });
  }

  test('the bound is tight to within one record', async () => {
    const size = CAPACITY * 4;
    const key = generateKey();
    const container = await encryptRelic({
      content: bytes(size),
      filename: 'a.txt',
      mimetype: 'text/plain',
      key,
      rs: RS,
    });
    const bound = plaintextSizeUpperBound(container.length, RS);
    expect(bound - size).toBeLessThanOrEqual(CAPACITY);
  });

  test('a file exactly at the published cap fits the signed ciphertext limit', () => {
    // The failure `spec/format.md` 3.11 exists to prevent: a plaintext file
    // exactly at a plaintext-stated cap yielding a ciphertext over a
    // ciphertext-enforced cap.
    expect(ciphertextCapBytes()).toBeGreaterThan(PLAINTEXT_CAP_BYTES);
    expect(encryptedSize(PLAINTEXT_CAP_BYTES)).toBeLessThanOrEqual(
      ciphertextCapBytes()
    );
  });

  test('the cap is a round plaintext number a user can check with ls', () => {
    expect(PLAINTEXT_CAP_BYTES).toBe(100 * 1024 * 1024);
  });
});

describe('refusals', () => {
  test('a wrong key fails authentication', async () => {
    const { container } = await roundTrip(bytes(200));
    await expect(openRelic(container, generateKey())).rejects.toBeInstanceOf(
      DecryptFailedError
    );
  });

  test('a decrypt failure carries no cause, because it cannot know one', async () => {
    const { container } = await roundTrip(bytes(200));
    try {
      await openRelic(container, generateKey());
      throw new Error('expected a refusal');
    } catch (error) {
      expect(error).toBeInstanceOf(DecryptFailedError);
      // `spec/format.md` 3.5: tampering, truncation, and a wrong key are
      // indistinguishable here, so the message must not claim "wrong key".
      expect((error as Error).message.toLowerCase()).not.toContain('wrong key');
    }
  });

  test('a flipped content byte fails authentication', async () => {
    const { container, key } = await roundTrip(bytes(200));
    const tampered = new Uint8Array(container);
    const target = container.length - 20;
    tampered[target] = ((tampered[target] as number) ^ 0xff) & 0xff;
    await expect(openRelic(tampered, key)).rejects.toBeInstanceOf(
      DecryptFailedError
    );
  });

  test('a tampered salt fails every record, which is denial of service not forgery', async () => {
    const { container, key } = await roundTrip(bytes(200));
    const tampered = new Uint8Array(container);
    tampered[0] = ((tampered[0] as number) ^ 0xff) & 0xff;
    await expect(openRelic(tampered, key)).rejects.toBeInstanceOf(
      DecryptFailedError
    );
  });

  test('a tampered rs fails every record', async () => {
    const { container, key } = await roundTrip(bytes(200));
    const tampered = new Uint8Array(container);
    new DataView(tampered.buffer).setUint32(16, RS + 1, false);
    await expect(openRelic(tampered, key)).rejects.toBeInstanceOf(Error);
  });

  test('truncation fails authentication', async () => {
    const { container, key } = await roundTrip(bytes(CAPACITY * 3));
    await expect(
      openRelic(container.slice(0, container.length - 5), key)
    ).rejects.toBeInstanceOf(DecryptFailedError);
  });

  test('a set keyid is refused', async () => {
    const { container } = await roundTrip(bytes(100));
    const tampered = new Uint8Array(container);
    tampered[20] = 4; // idlen
    expect(() => decodeHeader(tampered)).toThrow(KeyIdPresentError);
  });

  test('an envelope version disagreeing with the fragment is refused', () => {
    const encoded = encodeEnvelope({
      version: 1,
      entries: [
        { filename: 'a', mimetype: 'text/plain', offset: 0, length: 1 },
      ],
    });
    expect(() => decodeEnvelope(encoded, 2)).toThrow(VersionMismatchError);
  });

  test('the envelope parser refuses trailing bytes rather than ignoring them', () => {
    const encoded = encodeEnvelope({
      version: 1,
      entries: [
        { filename: 'a', mimetype: 'text/plain', offset: 0, length: 1 },
      ],
    });
    const extended = new Uint8Array(encoded.length + 3);
    extended.set(encoded, 0);
    expect(() => decodeEnvelope(extended, 1)).toThrow(StrictParseError);
  });

  test('the envelope parser refuses a truncated header', () => {
    const encoded = encodeEnvelope({
      version: 1,
      entries: [
        { filename: 'abc', mimetype: 'text/plain', offset: 0, length: 1 },
      ],
    });
    expect(() =>
      decodeEnvelope(encoded.slice(0, encoded.length - 4), 1)
    ).toThrow(StrictParseError);
  });

  test('an entry count other than 1 is refused in version 1', () => {
    const encoded = encodeEnvelope({
      version: 1,
      entries: [
        { filename: 'a', mimetype: 'text/plain', offset: 0, length: 1 },
      ],
    });
    const twoEntries = new Uint8Array(encoded);
    twoEntries[1] = 2;
    expect(() => decodeEnvelope(twoEntries, 1)).toThrow(StrictParseError);
  });

  test('content over the published cap is refused before any work', async () => {
    await expect(
      encryptRelic({
        content: new Uint8Array(PLAINTEXT_CAP_BYTES + 1),
        filename: 'too-big.bin',
        mimetype: 'application/octet-stream',
        key: generateKey(),
      })
    ).rejects.toThrow();
  });
});

describe('the envelope fits record 0 alone', () => {
  test('the maximum header is well inside the production record size', () => {
    expect(MAX_HEADER_BYTES).toBe(1301);
    expect(MAX_HEADER_BYTES).toBeLessThan(recordCapacity(RECORD_SIZE));
  });
});
