---
topic: archive-browsing-and-mimetype-detection
created_at: 2026-07-30T00:22:51.174744+00:00
updated_at: 2026-07-30T00:22:51.174744+00:00
---
Constraints for in-browser ZIP browsing and filetype routing. The headline: **range-decryptable ciphertext is a framing decision made at encryption time, and it determines whether ZIP browsing is possible at all.**

**Library comparison for in-browser ZIP reading:**
| Library | Random access | Streaming | Notes |
|---|---|---|---|
| `unzipit` | **Yes** | Partial | **6x–25x faster than JSZip, far less memory; only accessed entries consume memory; can avoid downloading the whole zip when the server supports HTTP range requests** (https://github.com/greggman/unzipit) |
| `zip.js` | Yes | Yes | "For zip reading, random access to data is required to fetch entries reliably and efficiently" |
| `fflate` | Via central directory | Yes | Fastest/smallest pure-JS compression lib; its sync-with-callbacks design outperforms stream-based libs in Chrome |
| `JSZip` | Weak | No | Loads everything into memory. Wrong tool |
| `client-zip` | N/A (write only) | Yes | Generation only |

**`unzipit` is the standout**, because its range-request behavior composes exactly with GCS byte-range downloads and `wormhole-crypto`'s `decryptStreamRange`: fetch the central directory at the archive's end, decrypt just that range, list entries, then fetch and decrypt only the ranges for entries the user clicks. That is "browse a ZIP in-page without downloading it," and it works **only if the crypto framing supports range decryption**. This is the single strongest argument for RFC 8188 framing over ad-hoc chunked AES-GCM, and the decision is irreversible after encryption.

**Mimetype detection.** Never trust the client-declared content type or the filename extension; both are attacker-controlled. `file-type` (npm) does magic-number sniffing and is explicitly "a best-effort hint," not a guarantee. Browsers MIME-sniff **regardless of the declared `Content-Type`**, especially when it is missing or generic (`application/octet-stream`, `text/plain`). `X-Content-Type-Options: nosniff` forces the browser to honor the declared type and is what blocks **polyglot** attacks — a file that is simultaneously a valid GIF and valid HTML, or a valid JPEG and valid JS (https://aszx87410.github.io/beyond-xss/en/ch5/mime-sniffing/).
**Rule:** sniff magic bytes after decryption, in the browser, and treat the result as a **routing hint only**. A file that sniffs as PNG goes through the image path with all image-path protections; it is never promoted to a more trusted path because sniffing said so.

**ZIP traps.**
- **Zip Slip:** entries store fully qualified names permitting `/` and `..`, so `../../etc/passwd` escapes the extraction root. The fix is canonical-path validation of every entry **during extraction, not beforehand**, because different parsers disagree about the archive (https://security.snyk.io/research/zip-slip-vulnerability). Still landing in 2026 — Zed shipped one in extension archive extraction (GHSA-v385-xh3h-rrfr). **In-browser it does not write to disk, but the entry name still reaches the DOM as a tree label and gets used as a lookup key, making it an XSS and path-confusion vector rather than a file-write one.** Sanitize names before display; never use a raw entry name as a key or URL segment.
- **Zip bombs:** high compression ratios, deep nesting, or huge declared sizes crash the recipient's tab. Enforce a **decompressed-size cap and a per-entry compression-ratio cap**, read from the central directory and checked **before inflating a single byte**.
- **Nested archives** compound both. Cap recursion depth at zero — do not auto-descend into inner ZIPs.
