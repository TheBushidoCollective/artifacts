---
topic: browser-crypto-and-large-file-constraints
created_at: 2026-07-30T00:19:54.440982+00:00
updated_at: 2026-07-30T06:42:59.565031+00:00
---
Hard platform constraints for client-side encryption and decryption in the browser. These are current browser realities, not preferences, and any run touching Relic's crypto or viewer inherits them.

**Corrected 2026-07-30 against MDN browser-compat-data.** Three claims below were wrong or overstated. They are marked in place with what the sources actually say, and the wrong version is left visible so nobody re-derives it. The original was written from a single explorer pass and nobody re-read the compat data until a `spec_writer` beat checked it while writing `docs/spec/viewer.md`. Em-dashes and en-dashes were also stripped throughout, since they violate a hard project style rule and this file is durable state.

**AES-GCM via WebCrypto**
- Key lengths are 128, 192, or 256 bits per `AesKeyGenParams`. Treat 192 as untested and use 128 or 256. **Do not cite MDN's `SubtleCrypto/encrypt` page for this.** That page was checked directly: zero occurrences of "192", no key-length support statement at all. A sibling spec cited it for exactly this claim and the citation failed review. A separate and sound reason to exclude a 24-byte key is in `docs/spec/format.md` 2.3: 24 is a multiple of three, so the final unpadded base64url character carries a full 6 bits and can be `-` or `_`, which GFM autolink truncation then eats.
- IV is 12 bytes or 96 bits, from `crypto.getRandomValues` (https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt). 96 bits is the only length GCM uses directly without an extra derivation step.
- WebCrypto **appends the auth tag to the ciphertext** rather than returning it separately; `tagLength` defaults to 128. Decryption throws `OperationError` on tag mismatch. There is no separate-verify path.
- Plaintext ceiling per operation is 2^39 minus 256 bytes, about 68.7 GB. Irrelevant once chunked.
- `crypto.subtle` is `undefined` outside a secure context: HTTPS, `localhost`, `127.0.0.1`, `*.localhost`, `file://`. **Dev over a LAN IP silently has no crypto** (https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle).

**The nonce-reuse trap (catastrophic, not degraded)**
Reusing a (key, nonce) pair under GCM leaks the GHASH subkey H via polynomial arithmetic, letting an attacker forge valid tags for arbitrary messages and potentially recover plaintext (https://pentesterlab.com/glossary/gcm-nonce-reuse, https://github.com/miscreant/meta/wiki/Nonce-Reuse-Misuse-Resistance). Random 96-bit nonces hit the birthday bound at about 2^48 messages.
**Rule:** every relic gets a fresh random key, so the nonce budget is per-file. In chunked encryption, where one key covers thousands of records, use a **counter-derived nonce** per chunk (RFC 8188's base-nonce XOR record-sequence-number), never a fresh random nonce per chunk.

**Large files**
- A single `subtle.decrypt` on a large buffer blocks the main thread and freezes the tab. **CORRECTED.** The original read "practical failure reported at 500 to 800 MB, with the `ArrayBuffer` ceiling near 512 MB on 64-bit." That overstates one source into a measured range. The cited thread (https://forum.dfinity.org/t/using-aes-gcm-with-large-files-800mb/21929) is a single developer reporting `OperationError` at 800 MB, plus a separate `ArrayBuffer` constraint. It is not a 500-to-800 band and not a 512 MB ceiling. Apple publishes no per-tab ceiling. Every number here is a practitioner report and must be labeled as one wherever it is used.
- The working pattern is chunked AES-GCM framing piped through streams, decrypting straight to disk (https://transcend.io/blog/open-sourcing-penumbra).
- `TransformStream` is cross-browser (Firefox 102+). `DecompressionStream` has been Baseline since May 2023.
- **`ReadableStream` async iteration, narrowed.** The original said "Safari still lacks `for await` async iteration on `ReadableStream`." True today, but the useful form is more precise: per MDN compat data `ReadableStream[@@asyncIterator]` is Chrome 124 and **Safari 27**, which has not shipped (26.6 is current as of 2026-07-27). So no shipping Safari has it, `getReader()` loops are the portable path, and **this constraint has a known expiry** rather than being permanent.
- Making a decrypted stream land as a normal file save **requires a ServiceWorker** intercepting a synthetic request via `respondWith()` (the StreamSaver.js technique).
- **CORRECTED, and this one was flatly false.** The original said "this is why hat.sh caps Safari and mobile browsers at 1 GB single files: no service-worker fetch support." **iOS Safari has had service-worker fetch support since Safari 11.1.** Verified in MDN browser-compat-data: `FetchEvent` and `FetchEvent.respondWith` are both `safari: 11.1`, with `safari_ios` mirroring. hat.sh does cap Safari and mobile at 1 GB and does state that rationale, but its rationale no longer matches the platform.
  **The rule that follows:** tier by **runtime feature detection**, never by a hardcoded browser list. A hardcoded list encodes exactly the kind of claim that just failed verification, and it fails closed against browsers that have since gained the capability. Same discipline as [[gcs-false-impossibility-claims]]: an asserted platform impossibility is the claim most likely to be stale and least likely to be rechecked.

**Randomness:** `crypto.getRandomValues` only, never `Math.random()`. It throws `QuotaExceededError` above 65,536 bytes per call.

**Fragment mechanics, confirmed and qualified**
The fragment is genuinely never sent to the server (https://en.wikipedia.org/wiki/URI_fragment). It leaks anyway through: browser history and vendor cloud sync; any extension with host permissions reading `window.location.href`; **any same-origin script** reading `location.hash`, including analytics, tag managers, and error reporters (Sentry needed explicit fragment scrubbing); and **anything embedded same-origin**, since an `<iframe srcdoc>` or same-origin iframe inherits the origin and reads `parent.location.hash`.
**Mitigations that work:** `Referrer-Policy: no-referrer`; zero third-party scripts, analytics, or error reporting on the viewing origin; read the hash once into a local variable then `history.replaceState` it out of the address bar; and render all untrusted content on a **different origin** so it cannot reach `location.hash` at all.

**Key encoding:** base64url (RFC 4648 §5) is the default, and a 32-byte key is 43 characters with no percent-encoding needed. Base58 is discouraged above 256 bytes (O(n^2) worst case). Hex doubles length for nothing. No browser enforces a fragment-specific length limit, but about 2000 characters total URI is the safe practical ceiling across servers, middleboxes, and chat clients.

**Directly reusable prior art:** `SocketDev/wormhole-crypto` (https://github.com/SocketDev/wormhole-crypto), built on RFC 8188, implements `decryptStreamRange(offset, length, totalEncryptedLength)`, computing which encrypted byte ranges to fetch to satisfy a plaintext range request, then decrypting just that slice, with `plaintextSize()`/`encryptedSize()` converters. Almost nothing else solves progressive range decryption. Firefox Send used the same RFC 8188 framing, streaming uploads over WebSockets and downloads through a ServiceWorker.

**Tooling caveat found while verifying this topic.** A `spec_writer` beat reported that WebFetch's summarizer returned text **flatly inverting** RFC 9110's meaning, claiming fragments are not forwarded across redirects when §10.2.2 mandates the opposite. Pull raw RFC text and read it directly. Do not trust a fetched summary of a specification on this run.
