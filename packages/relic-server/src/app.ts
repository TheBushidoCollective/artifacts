/**
 * The app server.
 *
 * Two rules shape the whole router and neither is negotiable:
 *
 * 1. **The mint is never a side effect of serving `/{id}`**
 *    (`spec/service.md` section 2). That path returns a static shell with no
 *    mint, no counter increment, and no cap consumption, which keeps
 *    non-executing link fetchers off both the open counter and the download
 *    cap. Slack states plainly that it does not honor robots.txt, so the
 *    control has to be structural rather than advisory.
 * 2. **Reserved path segments beat IDs at the router**
 *    (`spec/format.md` 1.5). An issued ID shadowing `/abuse` would be
 *    launch-blocking, since the abuse intake is a go/no-go obligation.
 */

import {
  InvalidRelicIdError,
  isRendererClass,
  parseRelicId,
  RESERVED_SEGMENTS,
  type RendererClass,
} from '@relic/format';
import { assertConfig, DEFAULT_CONFIG, type RelicConfig } from './config.ts';
import { newOccurrenceId, ProblemError, problemResponse } from './problems.ts';
import { RateLimiter } from './ratelimit.ts';
import {
  ciphertextHash,
  MemoryStorage,
  type ObjectStorage,
} from './storage.ts';
import {
  MemoryStore,
  type MintLogEntry,
  type ReasonClass,
  type RelicStore,
} from './store.ts';

const RESERVED = new Set(RESERVED_SEGMENTS);

export interface AppOptions {
  readonly config?: Partial<RelicConfig>;
  readonly store?: RelicStore;
  readonly storage?: ObjectStorage;
  /** Injected so tests control time and the server never trusts a client. */
  readonly now?: () => number;
  /** Per-operator credentials for the authenticated surface under `/api`. */
  readonly operatorTokens?: ReadonlyMap<string, string>;
}

export interface RelicApp {
  readonly config: RelicConfig;
  readonly store: RelicStore;
  readonly storage: ObjectStorage;
  fetch(request: Request): Promise<Response>;
}

export function createApp(options: AppOptions = {}): RelicApp {
  const config: RelicConfig = { ...DEFAULT_CONFIG, ...options.config };
  assertConfig(config);

  const store = options.store ?? new MemoryStore();
  const storage = options.storage ?? new MemoryStorage();
  const clock = options.now ?? (() => Date.now());
  const operators = options.operatorTokens ?? new Map<string, string>();
  const limiter = new RateLimiter();

  async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter((s) => s.length > 0);
    const head = segments[0];
    const ip = clientIp(request);
    const now = clock();

    if (segments.length === 0) return shell(config, 'Relic');

    // Reserved segments win at the router, before anything is read as an ID.
    if (head !== undefined && RESERVED.has(head)) {
      return reservedRoute(segments, request, url, ip, now);
    }

    if (segments.length === 1 && head !== undefined) {
      // The shell only. No mint, no counter, no cap.
      return shell(config, head);
    }

    return new Response('Not found', { status: 404 });
  }

  async function reservedRoute(
    segments: readonly string[],
    request: Request,
    url: URL,
    ip: string,
    now: number
  ): Promise<Response> {
    const head = segments[0];

    if (head === 'health') {
      return Response.json({ status: 'ok' });
    }

    if (head === 'robots.txt') {
      // Stops indexing by compliant crawlers. It does not stop fetching, and
      // no control in this system rests on it.
      return new Response('User-agent: *\nDisallow: /\n', {
        headers: { 'content-type': 'text/plain', 'x-robots-tag': 'noindex' },
      });
    }

    if (head === 'policy') {
      return new Response(disclosureStatement(config), {
        headers: { 'content-type': 'text/markdown; charset=utf-8' },
      });
    }

    if (head === 'abuse') {
      if (request.method === 'GET') return abuseForm(config);
      if (request.method === 'POST') return abuseSubmit(request, now);
      return new Response('Method not allowed', { status: 405 });
    }

    if (head === 'api')
      return apiRoute(segments.slice(1), request, url, ip, now);

    return new Response('Not found', { status: 404 });
  }

  async function apiRoute(
    rest: readonly string[],
    request: Request,
    url: URL,
    ip: string,
    now: number
  ): Promise<Response> {
    const [first, second, third] = rest;

    if (first === 'challenge' && request.method === 'POST') {
      return challenge(ip, now);
    }
    if (first === 'grant' && request.method === 'POST') {
      return grant(request, ip, now);
    }
    if (
      first === 'relics' &&
      second !== undefined &&
      third === 'mint' &&
      request.method === 'POST'
    ) {
      return mint(second, ip, now);
    }
    if (
      first === 'relics' &&
      second !== undefined &&
      third === 'complete' &&
      request.method === 'POST'
    ) {
      return complete(second, now);
    }
    if (
      first === 'relics' &&
      second !== undefined &&
      third === undefined &&
      request.method === 'DELETE'
    ) {
      return operatorDelete(second, request, url, now);
    }

    return new Response('Not found', { status: 404 });
  }

  // --- publish path -------------------------------------------------------

  /**
   * The challenge returns the cap before a grant is requested, so a client can
   * refuse locally with the server's own number rather than a compiled-in
   * constant that goes stale.
   */
  async function challenge(ip: string, now: number): Promise<Response> {
    if (config.killSwitchEngaged) {
      return refuse('service_paused', { retry_after_seconds: 300 });
    }
    const verdict = limiter.check(
      `publish ${ip}`,
      config.publishRateLimit,
      now
    );
    if (!verdict.allowed) {
      return refuse('publish_rate_limited', {
        retry_after_seconds: verdict.retryAfterSeconds,
      });
    }

    const nonce = await store.issueChallenge(ip, now);
    return Response.json({
      challenge_nonce: nonce,
      size_limit_bytes: config.plaintextCapBytes,
      size_basis: 'plaintext',
      disclosure_url: `${config.serviceOrigin}/policy`,
      report_url: `${config.serviceOrigin}/abuse`,
      challenge_expires_at: iso(now + config.challengeTtlSeconds * 1000),
    });
  }

  async function grant(
    request: Request,
    ip: string,
    now: number
  ): Promise<Response> {
    if (config.killSwitchEngaged) {
      return refuse('service_paused', { retry_after_seconds: 300 });
    }

    const verdict = limiter.check(
      `publish ${ip}`,
      config.publishRateLimit,
      now
    );
    if (!verdict.allowed) {
      return refuse('publish_rate_limited', {
        retry_after_seconds: verdict.retryAfterSeconds,
      });
    }

    const body = (await readJson(request)) as Record<string, unknown>;

    const nonce = body['challenge_nonce'];
    if (typeof nonce !== 'string') {
      return refuse('invalid_challenge_nonce');
    }
    const live = await store.consumeChallenge(
      nonce,
      now,
      config.challengeTtlSeconds
    );
    if (!live) return refuse('invalid_challenge_nonce');

    // The client generates the ID before requesting a grant, so the server
    // validates rather than issues.
    let relicId: string;
    try {
      relicId = parseRelicId(String(body['relic_id'] ?? ''));
    } catch (error) {
      const failure =
        error instanceof InvalidRelicIdError ? error.failure : 'alphabet';
      return refuse('invalid_relic_id', { id_validation_failure: failure });
    }

    const rendererClass = body['renderer_class'];
    const publishingClient = body['publishing_client'];
    if (
      typeof rendererClass !== 'string' ||
      !isRendererClass(rendererClass) ||
      typeof publishingClient !== 'string' ||
      publishingClient.length === 0 ||
      publishingClient.length > 128
    ) {
      return refuse('invalid_publish_metadata', { relic_id: relicId });
    }

    const declared = Number(body['declared_size_bytes']);
    if (!Number.isSafeInteger(declared) || declared < 0) {
      return refuse('invalid_publish_metadata', { relic_id: relicId });
    }
    if (declared > config.plaintextCapBytes) {
      return refuse('size_over_cap', {
        relic_id: relicId,
        size_limit_bytes: config.plaintextCapBytes,
        declared_size_bytes: declared,
        size_basis: 'plaintext',
      });
    }

    // Never overwrite. A collision is astronomical bad luck or a broken RNG,
    // and both should fail loudly.
    if (
      (await store.getRelic(relicId)) !== undefined ||
      (await store.getTombstone(relicId)) !== undefined
    ) {
      return refuse('relic_id_collision', { relic_id: relicId });
    }

    const expiresAt = now + config.ttlSeconds * 1000;
    await store.putRelic({
      id: relicId,
      publishIp: ip,
      grantedAt: now,
      expiresAt,
      rendererClass: rendererClass as RendererClass,
      publishingClient,
      declaredSizeBytes: declared,
      mintsUsed: 0,
    });

    const upload = await storage.signUpload(
      relicId,
      config.ciphertextCapBytes,
      config.urlValiditySeconds,
      now
    );

    return Response.json({
      relic_id: relicId,
      upload_url: upload.url,
      upload_method: upload.method,
      upload_headers: upload.headers,
      upload_expires_at: iso(upload.expiresAt),
      relic_expires_at: iso(expiresAt),
      report_url: `${config.serviceOrigin}/abuse`,
      disclosure_url: `${config.serviceOrigin}/policy`,
    });
  }

  /**
   * The publishing client reports a finished upload, giving the server a true
   * publish timestamp.
   *
   * It is an optimization, never a requirement. `format.md` 1.3 is explicit
   * that the confirmation is the message that gets lost, which is why the
   * client owns the ID and the key before anything leaves the machine, and why
   * `relic_never_published` exists for the case where nothing ever lands.
   *
   * The timestamp matters because the frame's 120-second window is anchored to
   * publish time. Anchoring it to the first mint instead would drop every
   * first genuine open, which is precisely the event the metric's first clause
   * exists to count.
   */
  async function complete(rawId: string, now: number): Promise<Response> {
    let relicId: string;
    try {
      relicId = parseRelicId(rawId);
    } catch {
      return refuse('invalid_relic_id');
    }

    const row = await store.getRelic(relicId);
    if (row === undefined)
      return refuse('relic_not_found', { relic_id: relicId });

    const object = await storage.stat(relicId);
    if (object === undefined) {
      return refuse('relic_not_yet_published', {
        relic_id: relicId,
        retry_after_seconds: 5,
      });
    }

    if (row.publishedAt === undefined) {
      await store.markPublished(relicId, now, object.length, object.crc32c);
    }

    return Response.json({
      relic_id: relicId,
      object_length: object.length,
      object_crc32c: object.crc32c,
      relic_expires_at: iso(row.expiresAt),
    });
  }

  // --- view path ----------------------------------------------------------

  async function mint(
    rawId: string,
    ip: string,
    now: number
  ): Promise<Response> {
    const occurrenceId = newOccurrenceId();

    if (config.killSwitchEngaged) {
      return logAndRefuse(rawId, ip, now, occurrenceId, 'service_paused', {
        retry_after_seconds: 300,
      });
    }

    const verdict = limiter.check(`mint ${ip}`, config.mintRateLimit, now);
    if (!verdict.allowed) {
      return logAndRefuse(rawId, ip, now, occurrenceId, 'mint_rate_limited', {
        retry_after_seconds: verdict.retryAfterSeconds,
      });
    }

    // Normalize before keying, or the cap fragments across ID spellings and
    // stops being a cap.
    let relicId: string;
    try {
      relicId = parseRelicId(rawId);
    } catch (error) {
      const failure =
        error instanceof InvalidRelicIdError ? error.failure : 'alphabet';
      return logAndRefuse(rawId, ip, now, occurrenceId, 'invalid_relic_id', {
        id_validation_failure: failure,
      });
    }

    const tombstone = await store.getTombstone(relicId);
    if (tombstone !== undefined) {
      // The fact of removal is disclosed. The reason is not: a system that
      // normally names the reason cannot go quiet on one takedown without the
      // silence itself being the disclosure.
      return logAndRefuse(relicId, ip, now, occurrenceId, 'relic_removed', {
        relic_id: relicId,
        report_url: `${config.serviceOrigin}/abuse`,
      });
    }

    const row = await store.getRelic(relicId);
    if (row === undefined) {
      return logAndRefuse(relicId, ip, now, occurrenceId, 'relic_not_found', {
        relic_id: relicId,
      });
    }

    const object = await storage.stat(relicId);

    if (now >= row.expiresAt) {
      // Expired and never-published are distinguished, because the ID is
      // unguessable and only somebody handed the link can ask.
      const code =
        object === undefined ? 'relic_never_published' : 'relic_expired';
      return logAndRefuse(relicId, ip, now, occurrenceId, code, {
        relic_id: relicId,
      });
    }

    if (object === undefined) {
      // Temporary: the grant is live and the bytes have not landed. The
      // viewer says "still uploading", never anything that reads as a dead
      // link.
      return logAndRefuse(
        relicId,
        ip,
        now,
        occurrenceId,
        'relic_not_yet_published',
        { relic_id: relicId, retry_after_seconds: 5 }
      );
    }

    if (row.publishedAt === undefined) {
      // The completion call never arrived, so the true publish time is
      // unknown. Anchor at the grant instead, because the upload begins
      // immediately after it.
      //
      // Anchoring at `now` would be wrong in a way that breaks the metric
      // rather than merely biasing it: the window would then always cover the
      // first mint, so the first genuine recipient open would be dropped every
      // single time. The residual cost of the grant anchor is that a slow
      // upload shifts the window earlier, letting a publisher self-check land
      // outside it. That is the known inflation bias the frame already
      // documents as permanent, not a new one.
      await store.markPublished(
        relicId,
        row.grantedAt,
        object.length,
        object.crc32c
      );
    }

    if (row.mintsUsed >= config.downloadCap) {
      // Not a rate limit: waiting never helps and the object still exists.
      return logAndRefuse(
        relicId,
        ip,
        now,
        occurrenceId,
        'download_cap_exhausted',
        { relic_id: relicId, download_cap: config.downloadCap }
      );
    }

    // Clamp to min(url_validity, relic_expiry). Accepting the overhang would
    // extend how long abuse circulates past the TTL.
    const remainingSeconds = Math.floor((row.expiresAt - now) / 1000);
    const validity = Math.min(config.urlValiditySeconds, remainingSeconds);
    if (validity < config.minViableValiditySeconds) {
      return logAndRefuse(relicId, ip, now, occurrenceId, 'relic_expired', {
        relic_id: relicId,
      });
    }

    const previous = await store.recentMint(
      relicId,
      ip,
      now,
      config.mintDedupSeconds
    );

    let url: string;
    let urlExpiresAt: number;
    const stillViable =
      previous !== undefined &&
      previous.urlExpiresAt - now >= config.minViableValiditySeconds * 1000;

    if (stillViable && previous !== undefined) {
      // A deduped mint returns the URL already issued, never a fresh one.
      // Several concurrently valid URLs against one unit of cap would add a
      // term to the worst-case egress arithmetic at zero cap cost.
      url = previous.url;
      urlExpiresAt = previous.urlExpiresAt;
    } else {
      const signed = await storage.signDownload(relicId, validity, now);
      url = signed.url;
      urlExpiresAt = signed.expiresAt;
    }

    // A repeat inside the window is not a distinct open, and it still
    // consumes the cap. The two counters answer different questions: the open
    // counter is the metric, the cap is the cost control.
    const isDedup = previous !== undefined;
    const capRemaining =
      config.downloadCap - (await store.consumeMint(relicId));
    await store.rememberMint(relicId, ip, { url, urlExpiresAt, at: now });

    const publishedAt = row.publishedAt ?? row.grantedAt;
    const dropReason = isDedup
      ? 'dedup'
      : ip === row.publishIp
        ? 'publishing_ip_match'
        : now - publishedAt < config.postPublishWindowSeconds * 1000
          ? 'post_publish_window'
          : undefined;

    await store.appendMintLog({
      relicId,
      ip,
      at: now,
      endpoint: 'mint',
      outcome: 'granted',
      code: undefined,
      countedAsOpen: dropReason === undefined,
      dropReason,
      consumedCap: true,
      capRemaining,
      occurrenceId,
    });

    return Response.json(
      {
        url,
        url_expires_at: iso(urlExpiresAt),
        relic_expires_at: iso(row.expiresAt),
        object_length: object.length,
        object_crc32c: object.crc32c,
        mints_remaining: capRemaining,
      },
      { headers: { 'referrer-policy': 'no-referrer' } }
    );
  }

  // --- operator surface ---------------------------------------------------

  /**
   * The only authenticated surface in a product whose first locked non-goal is
   * no identity anywhere. The non-goal bounds the product, not the operator's
   * tooling. It sits under the reserved `api` prefix, so it can never collide
   * with an issued ID, and it returns 401 and 403 normally.
   */
  async function operatorDelete(
    rawId: string,
    request: Request,
    url: URL,
    now: number
  ): Promise<Response> {
    const operator = authenticateOperator(request);
    if (operator === undefined) {
      return new Response('Unauthorized', { status: 401 });
    }

    let relicId: string;
    try {
      relicId = parseRelicId(rawId);
    } catch {
      return refuse('invalid_relic_id');
    }

    const existing = await store.getTombstone(relicId);
    if (existing !== undefined) {
      // Idempotent. Under a suspension clock, "already handled" and "wrong ID"
      // have to be distinguishable at a glance.
      return Response.json({ tombstone: existing, already_deleted: true });
    }

    const row = await store.getRelic(relicId);
    if (row === undefined) {
      // On this endpoint 404 means one thing only: never issued.
      return new Response('No such relic id was ever issued', { status: 404 });
    }

    const reasonClass = (url.searchParams.get('reason') ??
      'abuse') as ReasonClass;
    const reference = url.searchParams.get('reference') ?? undefined;

    // Hash before delete. A delete that captures no hash permanently loses the
    // ability to blocklist that payload.
    const bytes = await storage.read(relicId);
    if (bytes === undefined) {
      return new Response('Refused: no bytes to hash', { status: 409 });
    }
    const hash = await ciphertextHash(bytes);

    await storage.delete(relicId);
    await store.putTombstone({
      id: relicId,
      publishIp: row.publishIp,
      publishedAt: row.publishedAt,
      publishingClient: row.publishingClient,
      rendererClass: row.rendererClass,
      ciphertextHash: hash,
      deletedAt: now,
      operator,
      reasonClass,
      reportReference: reference,
    });

    // Blocklist in the same call, because a second call gets forgotten at 3am.
    const override = url.searchParams.get('blocklist');
    const automatic =
      reasonClass === 'abuse' || reasonClass === 'blocklist_match';
    const shouldBlocklist =
      override === 'true' ? true : override === 'false' ? false : automatic;
    if (shouldBlocklist) await store.blocklist(hash);

    return Response.json({
      relic_id: relicId,
      deleted: true,
      blocklisted: shouldBlocklist,
      ciphertext_hash: hash,
    });
  }

  function authenticateOperator(request: Request): string | undefined {
    const header = request.headers.get('authorization');
    if (header === null || !header.startsWith('Bearer ')) return undefined;
    const token = header.slice('Bearer '.length);
    for (const [name, secret] of operators) {
      if (secret === token) return name;
    }
    return undefined;
  }

  // --- abuse intake -------------------------------------------------------

  async function abuseSubmit(request: Request, now: number): Promise<Response> {
    const form = await request.formData();
    const submitted = String(form.get('relic_id') ?? '');

    // The server-side strip is the one that counts, because it is the only
    // one a no-JavaScript submission reaches. A stored fragment would put the
    // key in the operator's hands and convert "we structurally cannot read it"
    // into "we chose not to".
    const relicId = stripToRelicId(submitted);

    const category = String(form.get('category') ?? 'other');
    const valid = [
      'malware',
      'phishing',
      'csam',
      'copyright',
      'legal_process',
      'other',
    ];
    if (!valid.includes(category)) {
      return new Response('Unknown category', { status: 400 });
    }
    if (
      (category === 'copyright' || category === 'legal_process') &&
      (form.get('authority') === null || form.get('reference') === null)
    ) {
      return new Response('Authority and reference are required', {
        status: 400,
      });
    }

    await store.putAbuseReport({
      relicId,
      category: category as never,
      description: String(form.get('description') ?? ''),
      contact: optional(form.get('contact')),
      authority: optional(form.get('authority')),
      reference: optional(form.get('reference')),
      receivedAt: now,
    });

    return new Response(
      `Report received. We respond within ${config.abuseSlaHours} hours.`,
      { status: 202, headers: { 'content-type': 'text/plain' } }
    );
  }

  // --- helpers ------------------------------------------------------------

  function refuse(
    code: ProblemError['code'],
    options: ConstructorParameters<typeof ProblemError>[1] = {}
  ): Response {
    return problemResponse(
      new ProblemError(code, options),
      config.serviceOrigin
    );
  }

  async function logAndRefuse(
    relicId: string,
    ip: string,
    now: number,
    occurrenceId: string,
    code: ProblemError['code'],
    options: ConstructorParameters<typeof ProblemError>[1] = {}
  ): Promise<Response> {
    const entry: MintLogEntry = {
      relicId,
      ip,
      at: now,
      endpoint: 'mint',
      outcome: 'refused',
      code,
      // A refused mint is never an open and never consumes the cap.
      countedAsOpen: false,
      dropReason: 'refused',
      consumedCap: false,
      capRemaining: config.downloadCap,
      occurrenceId,
    };
    await store.appendMintLog(entry);
    return problemResponse(
      new ProblemError(code, options),
      config.serviceOrigin,
      occurrenceId
    );
  }

  return {
    config,
    store,
    storage,
    fetch: handle,
  };
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded !== null) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function optional(value: FormDataEntryValue | null): string | undefined {
  if (value === null) return undefined;
  const text = String(value);
  return text.length === 0 ? undefined : text;
}

/** Accept a full URL and strip the origin and everything from `#`. */
export function stripToRelicId(submitted: string): string {
  const withoutFragment = submitted.split('#')[0] ?? '';
  const trimmed = withoutFragment.trim();
  try {
    const url = new URL(trimmed);
    return url.pathname.split('/').filter((s) => s.length > 0)[0] ?? '';
  } catch {
    return (
      trimmed
        .split('/')
        .filter((s) => s.length > 0)
        .pop() ?? trimmed
    );
  }
}

function iso(epochMillis: number): string {
  return new Date(epochMillis).toISOString();
}

function shell(config: RelicConfig, title: string): Response {
  // A static shell. No mint happens here, which is what keeps non-executing
  // link fetchers off the open counter and the download cap.
  const body = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Relic</title>
<link rel="manifest" href="/manifest.webmanifest">
<div id="relic-root" data-relic-id="${escapeHtml(title)}"></div>
<script type="module" src="/assets/viewer.js"></script>
`;
  return new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'referrer-policy': 'no-referrer',
      'x-robots-tag': 'noindex',
      'cache-control': 'no-store',
      'content-security-policy': [
        "default-src 'none'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data:",
        `connect-src 'self' ${new URL(config.serviceOrigin).origin} https:`,
        `frame-src ${new URL(config.sandboxOrigin).origin}`,
        "base-uri 'none'",
        "form-action 'none'",
      ].join('; '),
    },
  });
}

function abuseForm(config: RelicConfig): Response {
  // Works without JavaScript, as a plain form POST.
  const body = `<!doctype html>
<meta charset="utf-8">
<title>Report a relic</title>
<h1>Report a relic</h1>
<p>Paste the relic ID. Do not include the part after <code>#</code>: that is
the decryption key, and we do not want it. We strip it either way.</p>
<form method="post" action="/abuse">
  <label>Relic ID <input name="relic_id" required></label>
  <label>Category
    <select name="category" required>
      <option value="malware">Malware</option>
      <option value="phishing">Phishing</option>
      <option value="csam">CSAM</option>
      <option value="copyright">Copyright</option>
      <option value="legal_process">Legal process</option>
      <option value="other">Other</option>
    </select>
  </label>
  <label>What is wrong <textarea name="description" required></textarea></label>
  <label>Your contact <input name="contact" type="email"></label>
  <label>Issuing authority <input name="authority"></label>
  <label>Reference <input name="reference"></label>
  <button type="submit">Send report</button>
</form>
<p>We respond within ${config.abuseSlaHours} hours of arrival.</p>
`;
  return new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'referrer-policy': 'no-referrer',
    },
  });
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (ch) =>
      (
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }) as Record<string, string>
      )[ch] as string
  );
}

function disclosureStatement(config: RelicConfig): string {
  const days = Math.round(config.ttlSeconds / 86_400);
  const retention = Math.round(config.retentionSeconds / 86_400);
  return `# What Relic knows about your relic

Read this before you publish. The frame conditions the whole telemetry trade
on it being readable first.

## What we can never read

Your file is encrypted on your machine with a key your machine generates. The
key lives in the URL fragment, after the \`#\`. **Your browser never sends the
key to Relic's servers.** That is the correct form of the claim. Saying "the
key never reaches a server" unqualified would be wrong.

## What we do know

- **A coarse renderer class**, one of: markdown, code, html, image, media,
  archive, binary. Nothing finer.
- **The name of the tool that published it**, so we can tell whether Relic
  serves the contexts it was built for.
- **Open activity, correlated with the publishing IP address.** Upload IP and
  timestamp are retained for abuse response regardless.

This moves us from knowing nothing to knowing what kind of thing you published
and roughly how often it was fetched. It is metadata. It is never content.

## The length leak

Ciphertext length reveals plaintext length to within one record. Combined with
the class, we learn something like "an image of roughly 2.4 MB". We do not pad
to size buckets, because that cost is paid in egress by every recipient on
every fetch, forever.

## The key enters your AI session transcript

The publish tool returns the full URL including the fragment, because handing
you a usable link is the product. **The key therefore enters the model's
context and your session transcript on every publish.** Zero-knowledge holds
against us. It does not hold against your model provider or whoever stores
your transcripts. This is structural, not a defect we plan to fix.

## The JavaScript caveat

The code that decrypts your relic in the browser is served by us, the same
party this promise is made against, and we could serve different code
tomorrow. This is a statement about our intent, not a property you can verify.
Anyone claiming otherwise about a service of this shape is overclaiming.

## The key can leave without us doing anything wrong

Pasting the URL into a link shortener transmits the key to that service.
Enterprise mail security products that rewrite links may transmit it to their
vendor. We have not yet completed the empirical test that would tell us which
of those happens, so we do not assert either way.

## Retention, per sink

- Application records and tombstones: ${retention} days
- Mint log: ${retention} days
- Edge and load balancer logs: ${retention} days
- Abuse intake mailbox and ticket queue: ${retention} days
- Soft-deleted object bytes: 7 days after deletion

**Deleted does not mean erased.** Deletion stops serving immediately, which is
the half that answers an abuse notice. The bytes persist in soft-delete for a
further retention period, and we never promise erasure.

## Lifetime

Every relic expires after ${days} days. There is no configuration for this and
no way to extend it. Each relic can be opened ${config.downloadCap} times
before the link stops working.

## Reporting abuse

${config.serviceOrigin}/abuse. We respond within ${config.abuseSlaHours} hours
of arrival. That measures our responsiveness on reports we receive. It is not
coverage: we cannot inspect content, so unreported abuse is invisible to us.
`;
}
