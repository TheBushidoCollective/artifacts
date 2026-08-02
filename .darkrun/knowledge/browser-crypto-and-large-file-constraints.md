---
topic: browser-crypto-and-large-file-constraints
created_at: 2026-07-30T00:19:54.440982+00:00
updated_at: 2026-07-30T00:19:54.440982+00:00
---
Hard platform constraints for client-side encryption and decryption in the browser. These are current browser realities, not preferences, and any run touching Relic's crypto or viewer inherits them.

**AES-GCM via WebCrypto**
- Key lengths are 128, 192, or 256 bits per `AesKeyGenParams`. No authoritative report of Chrome or Safari rejecting 192-bit was found, so treat 192 as untested and use 128 or 256.
- IV is 12 bytes / 96 bits, from `crypto.getRandomValues` (https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt). 96 bits is the only length GCM uses directly without an extra derivation step.
- WebCrypto **appends the auth tag to the ciphertext** rather than returning it separately; `tagLength` defaults to 128. Decryption throws `OperationError` on tag mismatch. There is no separate-verify path.
- Plaintext ceiling per operation is 2^39 − 256 bytes (~68.7 GB). Irrelevant once chunked.
- `crypto.subtle` is `undefined` outside a secure context: HTTPS, `localhost`, `127.0.0.1`, `*.localhost`, `file://`. **Dev over a LAN IP silently has no crypto** (https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle).

**The nonce-reuse trap (catastrophic, not degraded)**
Reusing a (key, nonce) pair under GCM leaks the GHASH subkey H via polynomial arithmetic, letting an attacker forge valid tags for arbitrary messages and potentially recover plaintext (https://pentesterlab.com/glossary/gcm-nonce-reuse, https://github.com/miscreant/meta/wiki/Nonce-Reuse-Misuse-Resistance). Random 96-bit nonces hit the birthday bound at ~2^48 messages.
**Rule:** every relic gets a fresh random key, so the nonce budget is per-file. In chunked encryption, where one key covers thousands of records, use a **counter-derived nonce** per chunk (RFC 8188's base-nonce XOR record-sequence-number), never a fresh random nonce per chunk.

**Large files**
- A single `subtle.decrypt` on a large buffer blocks the main thread and freezes the tab. Practical failure reported at 500–800 MB, with the `ArrayBuffer` ceiling near 512 MB on 64-bit (https://forum.dfinity.org/t/using-aes-gcm-with-large-files-800mb/21929).
- The working pattern is chunked AES-GCM framing piped through streams, decrypting straight to disk (https://transcend.io/blog/open-sourcing-penumbra).
- `TransformStream` is cross-browser (Firefox 102+). `DecompressionStream` has been Baseline since May 2023. **Safari still lacks `for await` async iteration on `ReadableStream`** — use `getReader()` loops.
- Making a decrypted stream land as a normal file save **requires a ServiceWorker** intercepting a synthetic request via `respondWith()` (the StreamSaver.js technique). This is why hat.sh caps Safari and mobile browsers at 1 GB single files: no service-worker fetch support.

**Randomness:** `crypto.getRandomValues` only, never `Math.random()`. It throws `QuotaExceededError` above 65,536 bytes per call.

**Fragment mechanics — confirmed and qualified**
The fragment is genuinely never sent to the server (https://en.wikipedia.org/wiki/URI_fragment). It leaks anyway through: browser history and vendor cloud sync; any extension with host permissions reading `window.location.href`; **any same-origin script** reading `location.hash`, including analytics, tag managers, and error reporters (Sentry needed explicit fragment scrubbing); and **anything embedded same-origin** — an `<iframe srcdoc>` or same-origin iframe inherits the origin and reads `parent.location.hash`.
**Mitigations that work:** `Referrer-Policy: no-referrer`; zero third-party scripts, analytics, or error reporting on the viewing origin; read the hash once into a local variable then `history.replaceState` it out of the address bar; and render all untrusted content on a **different origin** so it cannot reach `location.hash` at all.

**Key encoding:** base64url (RFC 4648 §5) is the default — a 32-byte key is 43 characters, no percent-encoding needed. Base58 is discouraged above 256 bytes (O(n²) worst case). Hex doubles length for nothing. No browser enforces a fragment-specific length limit, but ~2000 characters total URI is the safe practical ceiling across servers, middleboxes, and chat clients.

**Directly reusable prior art:** `SocketDev/wormhole-crypto` (https://github.com/SocketDev/wormhole-crypto), built on RFC 8188, implements `decryptStreamRange(offset, length, totalEncryptedLength)` — computing which encrypted byte ranges to fetch to satisfy a plaintext range request, then decrypting just that slice, with `plaintextSize()`/`encryptedSize()` converters. Almost nothing else solves progressive range decryption. Firefox Send used the same RFC 8188 framing, streaming uploads over WebSockets and downloads through a ServiceWorker.
