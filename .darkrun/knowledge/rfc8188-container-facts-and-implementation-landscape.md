---
topic: rfc8188-container-facts-and-implementation-landscape
created_at: 2026-07-30T09:56:49.769420+00:00
updated_at: 2026-07-30T09:56:49.769420+00:00
---
Verified against the raw RFC text (https://www.rfc-editor.org/rfc/rfc8188.txt) and library source, not summaries. Any run touching Relic's wire format inherits this.

## What the coding fixes, and the AES-256 trap

**`aes128gcm` is AES-128 and only AES-128.** Verbatim: "The 'aes128gcm' content coding uses a single fixed set of encryption primitives. Cipher agility is achieved by defining a new content-coding scheme." And in 2.2: "AEAD_AES_128_GCM requires a 16-octet (128-bit) content-encryption key (CEK), so the length (L) parameter to HKDF is 16."

The fragment key is **not** the CEK. It is the input-keying material (IKM) that HKDF-SHA256 turns into a 16-octet CEK using the header salt. So the IKM has no length constraint in the RFC, and a 32-byte fragment value is legal, but **the cipher is AES-128 either way**. `docs/spec/format.md` 4.2 routes "key length, 128 or 256 bits" as if it selects cipher strength. Under RFC 8188 it selects IKM entropy only. Choosing AES-256 as a cipher means leaving the coding entirely, which forfeits every off-the-shelf implementation and re-opens the irreversible framing decision.

## Framing arithmetic

- Header: `salt (16) | rs (4) | idlen (1) | keyid (idlen)`, so 21 bytes with `idlen = 0`.
- Per record: plaintext "any length up to rs-17 octets", padded to rs-16, ciphertext exactly rs. Overhead is 17 bytes per record (1 delimiter + 16 tag). Delimiter is 1 on every record and 2 on the last.
- "Values smaller than 18 are invalid" for `rs`.
- Range decryption is a stated property: "range requests [RFC7233] and random access to encrypted payload bodies are possible at the granularity of the record size. Partial records at the ends of a range cannot be decrypted."
- Nonce is `HMAC-SHA-256(PRK, nonce_info || 0x01) XOR SEQ` with SEQ a 96-bit counter from zero. "This nonce construction prevents removal or reordering of records."
- Encryption limit: with rs a multiple of 16, "398 terabytes can be encrypted safely". Not binding at any plausible cap.

## `rs` is per-object and cheap to change, unlike the framing

`rs` lives in each object's own plaintext header, so a decryptor that reads it drives its own slicing and old relics keep working when the default moves. **This makes the `rs` default a low-reversal-cost decision, unlike the framing choice it is routed alongside.** The condition is that the reader parse `rs` from the header rather than assume a constant. `wormhole-crypto` parses it and then throws if a caller-supplied value disagrees ("Record size declared in constructor does not match record size in encrypted stream"), so a viewer that passes a hardcoded default breaks old relics the day the default changes. Read the first 21 bytes, take `rs` from them, then slice.

## Padding and the bucket-padding branch

RFC 4.8 argues against the obvious implementation of size-bucket padding: "Even a good strategy can still cause size information to leak if processing activity of a recipient can be observed. This is especially true if the trailing records of a message contain only padding. Distributing non-padding data across records is recommended to avoid leaking size information." Trailing pad-only records are exactly what a naive bucket pad produces. `wormhole-crypto` emits minimal padding only and has no bucket mode, so that branch is a fork or a custom encryptor, not a config flag.

## Implementation landscape, checked 2026-07-30

- **JS/TS.** `webtorrent/wormhole-crypto` (699 stars, active) is the only implementation anywhere with progressive range decryption: `decryptStreamRange(offset, length, totalEncryptedLength, rs)`, plus `plaintextSize`/`encryptedSize`. Note `SocketDev/wormhole-crypto` serves the same content; `webtorrent` is the canonical repo. Its `Keychain` **hard-rejects any key that is not 16 bytes** ("Invalid byteLength: must be 16 bytes"), so a 32-byte IKM needs the lower-level `lib/ece.js` directly. Its `readHeader` already throws on `idlen !== 0`, which is `format.md` 3.4 for free. Its nonce XOR writes only the low 32 bits and throws above `0xffffffff` records, a conformance ceiling far above any relic. Also available: `web-push-libs/encrypted-content-encoding` (33 stars, npm `http_ece`), `negrel/http-ece` (TS, Deno and browsers).
- **Rust.** `mozilla/rust-ece` (29 stars) is the only maintained crate and it is **not usable as-is**: its README says "This crate has not been security reviewed yet, use at your own risk", its public API is web-push shaped (`encrypt(&pubkey, &auth_secret, data) -> Vec<u8>`), the `aes128gcm` module is private, there is no streaming, and there is no way to supply your own IKM, salt, or `rs`. Rust means hand-rolling.
- **Go.** `crow-misia/http-ece` (4 stars, active) is the only one. Effectively also hand-rolling, with a 4-star dependency.

**The structural consequence.** The viewer must be JS, so the reader is a JS implementation no matter what. Unless the publishing binary is also JS, the format has **two independent implementations**, and a writer bug ships permanently into every relic written under it. Gate both against the RFC's own vectors: 3.1 (IKM `yqdlZ-tYemfogSmv7Ws5PQ`, rs 4096, single record, empty keyid, with published salt/PRK/CEK/NONCE intermediates) and 3.2 (IKM `BO3ZVPxUlnLORbVGMpbT1Q`, rs 25, two records, keyid `a1`). 3.2 carries a non-zero keyid that Relic forbids in production, so the test harness must parse what the product refuses.

Related: [[browser-crypto-and-large-file-constraints]], [[archive-browsing-and-mimetype-detection]].
