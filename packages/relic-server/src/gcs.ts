/**
 * Google Cloud Storage, through V4 signed URLs only.
 *
 * The app server never handles relic bytes on either leg. The publishing
 * client PUTs ciphertext straight to GCS under a signed grant, and the
 * recipient GETs it straight from GCS under a signed URL. That is what makes
 * the zero-knowledge claim structural rather than a promise: the server has
 * no opportunity to observe anything, because the bytes never cross it.
 *
 * Everything here is signed URLs rather than the JSON API with an access
 * token, including `stat`. One credential path, one signing routine, and no
 * OAuth token cache to go stale mid-incident.
 *
 * The kill switch is worth stating plainly, because it shapes the validity
 * window. Disabling minting does nothing to URLs already minted: the residual
 * drain is live URLs times remaining validity times object size. Rotating the
 * signing key is the only second-stage stop and it is indiscriminate, killing
 * every outstanding URL including honest in-flight downloads. So the validity
 * window is a cost-control parameter, not a convenience one.
 */

import type { ObjectStat, ObjectStorage, SignedUpload } from './storage.ts';

export interface GcsCredentials {
  /** Service account email, the `client_email` of the JSON key. */
  readonly clientEmail: string;
  /** PKCS#8 PEM, the `private_key` of the JSON key. */
  readonly privateKey: string;
}

export interface GcsOptions extends GcsCredentials {
  readonly bucket: string;
  /** Prefix inside the bucket. Relic ids are appended to it. */
  readonly prefix?: string;
  readonly host?: string;
}

/** GCS caps signed URL lifetime here, and it is asserted rather than assumed. */
export const MAX_EXPIRES_SECONDS = 604_800;

const ALGORITHM = 'GOOG4-RSA-SHA256';
const DEFAULT_HOST = 'storage.googleapis.com';

/**
 * RFC 3986 encoding.
 *
 * `encodeURIComponent` leaves `!'()*` alone, and GCS canonicalization does
 * not. A mismatch here produces a signature that verifies against a different
 * request than the one being made, which fails as an opaque 403 at upload
 * time rather than as anything diagnosable.
 */
export function rfc3986(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/** Object paths keep their separators; every other reserved character escapes. */
export function encodeObjectPath(path: string): string {
  return path.split('/').map(rfc3986).join('/');
}

export function toTimestamp(epochMillis: number): string {
  return `${new Date(epochMillis).toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
}

export function toDatestamp(epochMillis: number): string {
  return toTimestamp(epochMillis).slice(0, 8);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return hex(new Uint8Array(digest));
}

function hex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Import a PKCS#8 PEM for RSASSA-PKCS1-v1_5 signing. */
export async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const der = Uint8Array.from(atob(body), (ch) => ch.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    der.buffer as ArrayBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

export interface SignRequestInput {
  readonly method: 'GET' | 'PUT' | 'HEAD' | 'DELETE';
  readonly host: string;
  /** Already-encoded, leading slash included. */
  readonly path: string;
  readonly clientEmail: string;
  readonly expiresSeconds: number;
  readonly now: number;
  /** Extra headers to sign. `host` is always included. */
  readonly headers?: Readonly<Record<string, string>>;
}

export interface SignedRequestParts {
  readonly canonicalRequest: string;
  readonly query: string;
  readonly signedHeaders: string;
}

/**
 * Build the canonical request and the string to sign.
 *
 * Split out from signing so the construction is testable without a key, which
 * matters because every field here is a place a silent mismatch turns into an
 * opaque 403 at the moment a publish is happening.
 */
export function buildSignedRequest(
  input: SignRequestInput
): SignedRequestParts {
  if (input.expiresSeconds > MAX_EXPIRES_SECONDS) {
    throw new Error(
      `expiry ${input.expiresSeconds}s exceeds the GCS ceiling of ` +
        `${MAX_EXPIRES_SECONDS}s`
    );
  }

  const timestamp = toTimestamp(input.now);
  const scope = `${toDatestamp(input.now)}/auto/storage/goog4_request`;

  const headers: Record<string, string> = { host: input.host };
  for (const [name, value] of Object.entries(input.headers ?? {})) {
    headers[name.toLowerCase()] = value.trim();
  }

  const headerNames = Object.keys(headers).sort();
  const signedHeaders = headerNames.join(';');
  const canonicalHeaders = headerNames
    .map((name) => `${name}:${headers[name]}\n`)
    .join('');

  // Query parameters are sorted by encoded key, then encoded value.
  const parameters: Array<[string, string]> = [
    ['X-Goog-Algorithm', ALGORITHM],
    ['X-Goog-Credential', `${input.clientEmail}/${scope}`],
    ['X-Goog-Date', timestamp],
    ['X-Goog-Expires', String(input.expiresSeconds)],
    ['X-Goog-SignedHeaders', signedHeaders],
  ];

  const query = parameters
    .map(([key, value]) => [rfc3986(key), rfc3986(value)] as const)
    .sort((a, b) => (a[0] === b[0] ? compare(a[1], b[1]) : compare(a[0], b[0])))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const canonicalRequest = [
    input.method,
    input.path,
    query,
    canonicalHeaders,
    signedHeaders,
    // Signed URLs do not commit to a body hash.
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  return { canonicalRequest, query, signedHeaders };
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * The exact bytes a signature is computed over.
 *
 * One definition, used by the signer and asserted directly by the tests, so
 * the two cannot drift into signing different things.
 */
export async function stringToSignFor(
  input: SignRequestInput
): Promise<string> {
  const parts = buildSignedRequest(input);
  return [
    ALGORITHM,
    toTimestamp(input.now),
    `${toDatestamp(input.now)}/auto/storage/goog4_request`,
    await sha256Hex(parts.canonicalRequest),
  ].join('\n');
}

/** Sign a request and return the full URL. */
export async function signUrl(
  input: SignRequestInput,
  key: CryptoKey
): Promise<string> {
  const parts = buildSignedRequest(input);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(await stringToSignFor(input))
  );

  return (
    `https://${input.host}${input.path}?${parts.query}` +
    `&X-Goog-Signature=${hex(new Uint8Array(signature))}`
  );
}

export function gcsStorage(options: GcsOptions): ObjectStorage {
  const host = options.host ?? DEFAULT_HOST;
  const prefix = (options.prefix ?? '').replace(/^\/+|\/+$/g, '');
  const keyPromise = importPrivateKey(options.privateKey);

  const pathFor = (relicId: string): string => {
    const object = prefix.length > 0 ? `${prefix}/${relicId}` : relicId;
    return `/${encodeObjectPath(options.bucket)}/${encodeObjectPath(object)}`;
  };

  const sign = async (
    method: SignRequestInput['method'],
    relicId: string,
    expiresSeconds: number,
    now: number,
    headers?: Record<string, string>
  ): Promise<string> =>
    signUrl(
      {
        method,
        host,
        path: pathFor(relicId),
        clientEmail: options.clientEmail,
        expiresSeconds,
        now,
        ...(headers === undefined ? {} : { headers }),
      },
      await keyPromise
    );

  return {
    async signUpload(
      relicId: string,
      maxBytes: number,
      validitySeconds: number,
      now: number
    ): Promise<SignedUpload> {
      // `Content-Length` is signed, so a client cannot alter it without
      // invalidating the signature. That is the enforcement point: a signed
      // PUT otherwise ignores the declared length entirely.
      //
      // No `x-goog-meta-*` is signed, because nothing needs custom object
      // metadata and anything content-descriptive is barred from living there.
      const headers = { 'content-length': String(maxBytes) };
      const url = await sign('PUT', relicId, validitySeconds, now, headers);

      return {
        url,
        method: 'PUT',
        headers,
        expiresAt: now + validitySeconds * 1000,
        maxBytes,
      };
    },

    async signDownload(
      relicId: string,
      validitySeconds: number,
      now: number
    ): Promise<{ url: string; expiresAt: number }> {
      return {
        url: await sign('GET', relicId, validitySeconds, now),
        expiresAt: now + validitySeconds * 1000,
      };
    },

    async stat(relicId: string): Promise<ObjectStat | undefined> {
      const now = Date.now();
      const url = await sign('HEAD', relicId, 60, now);
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) return undefined;

      const length = Number(response.headers.get('content-length') ?? '0');
      // `x-goog-hash` looks like `crc32c=xxxx==,md5=yyyy==`. CRC32C is the
      // one GCS recommends for integrity checks, and it is non-editable.
      const hashes = response.headers.get('x-goog-hash') ?? '';
      const crc32c =
        /crc32c=([^,]+)/.exec(hashes)?.[1] ??
        response.headers.get('x-goog-stored-content-crc32c') ??
        '';

      return { length, crc32c };
    },

    async read(relicId: string): Promise<Uint8Array | undefined> {
      // The delete path's hash, and nothing else. This is the operator
      // handling inert ciphertext through the control plane, never the
      // serving data path.
      const url = await sign('GET', relicId, 60, Date.now());
      const response = await fetch(url);
      if (!response.ok) return undefined;
      return new Uint8Array(await response.arrayBuffer());
    },

    async delete(relicId: string): Promise<void> {
      const url = await sign('DELETE', relicId, 60, Date.now());
      const response = await fetch(url, { method: 'DELETE' });
      // 404 is success here: delete is idempotent and a missing object means
      // the outcome already holds.
      if (!response.ok && response.status !== 404) {
        throw new Error(`delete failed with ${response.status}`);
      }
    },
  };
}
