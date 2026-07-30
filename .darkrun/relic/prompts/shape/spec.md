
> **Run** `relic` · **Station** `shape` · **Phase** `spec`

> Eliminates: _expensive-structural-reversal_


# Spec — `shape`

You are opening station **shape**. Its job is to eliminate a whole class of risk: **expensive-structural-reversal**. Nothing downstream is allowed to proceed until that risk is named and bounded here.


**Contract**

- Do exactly the work this action describes — no more, no less. Don't skip ahead to a later phase.
- Treat the locked artifact (`design.md`) as the source of truth. Read it before you act; never silently rewrite a locked decision.
- Every claim you make must be backed by something you actually ran, read, or wrote. No assumed results.
- Be specific and committed. **No placeholders** — a `TBD`, `similar to …`, `add error handling`, `etc.`, or `…` is a hole, not a decision; name the actual, checkable condition. **No hedging** — when you report work done, use a verb of completed action (`added`, `implemented`, `fixed`), never `should`, `seems`, `probably`, `might`, or `looks like`. Hedging is the tell of unfinished work.
- When the action is finished, record your output where the station expects it, then call `darkrun_tick` again for the next instruction. The manager — not you — decides what comes next.



**Explorers** (3): `surface`, `architecture`, `risk`


**Workers** (5): `designer` → `visual_designer` → `spiker` → `pressure_tester` → `resolver`


**Reviewers** (3): `fit`, `reversibility`, `simplicity`


Spec runs **elaboration and discovery in tandem** — they are NOT two sequential
steps. The moment the station opens, kick off both at once: dispatch the explorers
in parallel *while* you frame the problem. They sharpen each other. Only once both
have landed do you decompose.


## Keep or drop — decide at arrival, before any work

This station is **optional** for this run. Before you elaborate anything, judge whether its risk class — **expensive-structural-reversal** — actually applies here. If it plainly doesn't (the run is too small to carry the risk, or an upstream artifact already bounds it), drop the station now with `darkrun_station_drop` and the next `darkrun_tick` advances to the following station. The decision is only available **now**: once elaboration or units exist the station has started, and a started station can only be reset, never dropped. Keeping it is the default — drop only when you can say in one sentence why the risk doesn't apply.


## elaborate — frame the problem (concurrently with discovery)

State plainly what this station must achieve to kill **expensive-structural-reversal**: the intent, the inputs it inherits from upstream, and the boundary of what is explicitly *out of scope* so later phases don't drift into it. This is the frame the explorers work against — but do NOT wait on a finished frame to start them; the frame and the exploration are written in parallel and inform each other.

## discover — run the explorers in parallel (concurrently with elaboration)

Dispatch **all** explorers (`surface`, `architecture`, `risk`) **at once, in parallel** — one subagent each, fanned out concurrently, never one-after-another. Explorers don't build — they surface unknowns, constraints, prior art, and traps. They run alongside your framing; neither blocks the other.


**Project knowledge (priors from earlier runs)** — build on these, don't re-discover them:

- **abuse-liability-of-hosting-uninspectable-content** — Hosting a public, unauthenticated upload endpoint whose contents the operator is structurally unable to inspect is the failure mode that kills services in this category. This constraint outlives any single run.

## The precedents are specific, not hypothetical

Mozilla killed Firefox Send because it had **no Report Abuse mechanism at all**, all uploads were encrypted (so malware scanners could not inspect payloads), and **the domain was allowlisted in most corporate environments** (so links sailed through email filters). Named abusers: REvil/Sodinokibi ransomware, FIN7, the Zloader and Ursnif banking trojans, and government surveillance operators targeting human rights defenders. Mozilla suspended it July 2020 and killed it permanently in September 2020 after a cost/benefit analysis (https://www.securityweek.com/mozilla-discontinues-firefox-feature-abused-malware-phishing-attacks/, https://techcrunch.com/2020/09/17/mozilla-shutters-firefox-send-and-notes/amp). **Relic's design has all three properties.** Mozilla had a legal team and a brand to defend and still chose to shut down rather than build moderation. That is the baseline expectation, not a tail risk.

AnonFiles shut down citing "extreme volumes of people abusing the service." file.io carries a 33/100 Gridinsoft trust score and appears in live malware-distribution sandbox reports (https://www.skyhighsecurity.com/about/resources/intelligence-digest/abuse-of-file-sharing-services-aids-phishing-campaigns.html). transfer.sh is intermittently dead.

## Google Cloud imposes this as a contractual condition, not just good hygiene

GCP's AUP (https://cloud.google.com/terms/aup) prohibits distributing "viruses, worms, Trojan horses, corrupted files, hoaxes or other items of a destructive or deceptive nature," and Google monitors for malware and phishing. **For organizations hosting third-party content, Google requires** publishing policies defining prohibited content, maintaining "a reporting intake process (for example, a webform or email alias) to receive notices of illegal or abusive content," promptly reviewing alerts and removing problematic content, and monitoring logs for suspicious activity (https://docs.cloud.google.com/docs/security/respond-to-abuse-misuse).

On notification you "must promptly address or remedy any violations," and **"if you don't respond to the warning in a timely manner, your project might be suspended"** (https://support.google.com/cloud/answer/7002354). Note **project**-level, not bucket-level, blast radius. Appeals are typically answered within two business days. No documented SLA exists for how long you get before suspension.

## Safe Browsing, and why it is structurally worse for a zero-knowledge service

Safe Browsing flags at the URL level and sometimes the domain level. One flag propagates to Chrome, Google Search, Gmail, Android, and Google Ads (https://support.google.com/webmasters/answer/6347750). Chrome refreshes its local list roughly every 30 minutes. Delisting requires cleaning the site then requesting review in Search Console, and "a review can take from a few days to a few weeks."

**The structural problem: you cannot "clean the site" because you cannot see what is on it.** If the relic domain gets flagged, every relic ever shared breaks at once, Gmail strips the links, and remediation takes days to weeks with nothing concrete to point at as fixed.

## Legally you survive; reputationally you may not

18 USC 2258A obligates reporting only on "actual knowledge," which encryption means you never obtain, and providers are exempt from liability for good-faith reporting (https://uscode.house.gov/view.xhtml?req=granuleid%3AUSC-prelim-title18-section2258A). DMCA safe harbor holds if you act on notice. 0bin states this posture explicitly: "you cannot require somebody to moderate something they cannot read." **But it is an untested theory** — Mozilla had lawyers and chose not to rely on it, and GCP's AUP obligations are contractual and independent of it.

## No prior art solved moderation

PrivateBin: `robots.txt` disallows all spiders, auto-expiry, delete tokens; publicly states it has no other non-privacy-breaking mitigations and is "open to ideas" — its real strategy is decentralization. Cryptgeon: in-memory only, view-count and time limits, 512 MiB ceiling, no documented rate limiting. Wormhole: no documented abuse controls at all. 0bin: plausible deniability in place of moderation. Firefox Send: none, and it died. The pattern is that services either died, stayed tiny and self-hosted, or are commercially backed and quiet about it.

## Takedown by ID without decrypting works, and it is the key move

**The ID is not secret; only the key is.** An abuse reporter has the full URL, and the operator deletes by ID from the URL path without ever touching the fragment. The whole takedown pipeline is available to a zero-knowledge operator:
- Delete by relic ID.
- Blocklist a hash of the ciphertext so the same payload cannot be re-uploaded (defeated by re-encryption under a new key, so it is a speed bump).
- Record upload IP plus timestamp — which PrivateBin's threat model concedes is unavoidable anyway — and rate-limit or ban on it.
- Retain enough log to answer law enforcement without retaining content.

**Mandatory short TTL is the single highest-leverage control.** It bounds how long any abuse can circulate and composes cleanly with GCS lifecycle rules. Malware campaigns need links that live for days; a 24-hour to 7-day hard ceiling makes the service a poor distribution channel while staying fine for "publish this file to my colleague."

**Proof of work is a real deployed option.** Anubis uses hashcash-style PoW as a rate limiter precisely because PoW is "hard to solve and trivial to verify," making mass abuse expensive while individual use goes unnoticed (https://opensourcesecurity.io/2026/2026-01-anubis-xe/). Apply it to **publish**, never to view — Anubis drew real user hostility when applied to ordinary browsing.

## Non-negotiable design constraints

- Runs on a domain the company can afford to burn. **Never** a subdomain of a domain carrying company email, the marketing site, or client-facing infrastructure.
- Abuse reporting on day one: on every relic page, at a stable `/abuse` URL, and via a published email alias, with a named human answering it.
- Delete-by-ID tooling that works without the decryption secret.
- Mandatory (not configurable) TTL, hard size cap, per-IP publish quota, per-object download cap, per-IP download rate limit, and a global egress spend kill switch. All v1, not v2. GCS internet egress runs $0.12/GB for the first TB (https://leanopstech.com/blog/google-cloud-storage-pricing-2026/) and an unauthenticated endpoint has no identity to throttle against.
- Ciphertext-hash blocklist; IP + timestamp retention with a published retention window.
- `robots.txt` disallow plus `X-Robots-Tag: noindex`.
- Archives and executables are the highest-risk payload wrappers; supporting them is an abuse decision, not a rendering decision.

**The go/no-go test:** if the team will not commit to ongoing abuse operations (reports, takedowns, blocklist appeals, law enforcement requests), the correct answer is do not build. That work is unglamorous, unfunded, and never ends.

- **agent-mediated-key-delivery-leaks-to-the-transcript** — **Relic's zero-knowledge property holds against the Relic operator. It does not hold against the model provider or the session transcript store.** This is structural, not a defect, and it is not fixable inside the locked architecture.

## Why it is unavoidable

The `publish_relic` MCP tool must return the full URL **including the fragment**, because the whole point is that the agent hands the user a shareable link. The fragment is the decryption key. So on every publish, the key passes through the model's context window and is written to whatever transcript store that session uses.

There is no version of "the agent gives you a link" where the key does not transit the agent. Withholding the fragment from the tool result means the agent cannot produce a usable link, which is the product.

## What this does and does not compromise

- **Against the Relic operator: unchanged.** The server still never receives the key, still holds only ciphertext, and still cannot read a byte. Every claim in `docs/frame.md` about the operator remains true.
- **Against the model provider and transcript store: the claim does not apply at all.** Anyone with access to the session transcript has the key and the URL, which is complete access to the plaintext.
- **The publisher's own machine: unchanged.** The plaintext was there already.

## Why this is separate from the caveat the frame already carries

`docs/frame.md` concedes that the decrypting JavaScript is served by the same party the zero-knowledge claim is made against, so the claim is about operator intent rather than a property the recipient can verify. That is a real caveat and it is **a different one**. This one is not about intent or verifiability: the key is simply, definitely, in a third party's logs by design. A privacy statement carrying only the served-JavaScript caveat is materially incomplete.

## What follows

1. **It is a disclosure obligation.** It belongs in the same published statement as the telemetry trade recorded in [[relic-telemetry-trade-and-measurability]]. Publishers must be able to learn it before they publish something sensitive.
2. **It bounds the honest marketing claim.** "The service can't read your file" is true. "Nobody but the recipient can read your file" is false whenever an agent produced the link.
3. **It sharpens the input-schema decision.** A tool that accepts a file *path* keeps the plaintext out of the transcript, so only the key leaks. A tool that accepts inline *content* puts the plaintext in the transcript too, compounding the leak from "the key leaks upward" to "the key and the file leak upward." Prefer a path, and say so in the schema rather than accepting both and letting agents inline by default, because inlining is what a model already holds.
4. **It is worse for exactly the segment that most needs zero-knowledge.** [[prior-art-zero-knowledge-link-sharing]] notes cross-org handoff of secrets-adjacent content as the one place the property is genuinely felt. That is also the content whose key you least want in a third-party transcript.

## The general lesson

**Any privacy property mediated by an agent inherits the agent's trust boundary.** When a design routes a secret through a model to reach a human, the model provider joins the trust base whether or not the design acknowledges it. Check every cryptographic claim in an agent-native product against the question "what has to pass through the context window for this to work," because whatever does is not private from the provider.

- **archive-browsing-and-mimetype-detection** — Constraints for in-browser ZIP browsing and filetype routing. The headline: **range-decryptable ciphertext is a framing decision made at encryption time, and it determines whether ZIP browsing is possible at all.**

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

- **browser-crypto-and-large-file-constraints** — Hard platform constraints for client-side encryption and decryption in the browser. These are current browser realities, not preferences, and any run touching Relic's crypto or viewer inherits them.

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

- **citation-defects-and-the-three-checks-that-catch-them** — **Every unit this run has produced has shipped a citation defect, and they are three different failure modes with three different detectors. Only one of the three is covered by a quality gate.** Any station that cites sources should install all three checks.

## The three modes, in increasing order of how hard they are to catch

**1. Dead or missing source.** The URL 404s, or the document leans on something absent from the manifest. **Caught by:** the `every-cited-url-resolves` gate plus a two-way orphan check. This is the only mode with automated coverage, and it is the least dangerous.

**2. Unsupported citation.** The URL resolves, the source is real and topical, and it does not say what the document claims. Two instances:
- `docs/spec/format.md` cited MDN's `SubtleCrypto/encrypt` page for "192-bit AES-GCM is untested across browsers." That page has **zero** occurrences of "192" and no key-length statement at all. It was constraining a decision routed to `shape`.
- `docs/spec/viewer.md` cited MDN's CSP `sandbox` page for the header being "strictly stronger" than the iframe attribute because it "applies to the whole response" and "can't be stripped." That page has **zero** occurrences of "whole response," "strip," or "stronger," and makes no header-versus-attribute comparison. The claim is true and derivable; the citation simply does not support it.

**Caught by:** reading the cited page and asking whether it contains the claim. Not automatable with the current gate set. Both were found by an adversary beat that fetched pages and grepped.

**3. Fabricated quotation. The dangerous one.** The URL resolves, the section number is correct, the surrounding quotes in the same sentence are verbatim, and the quoted string does not exist in the source.

`docs/spec/service.md` attributed to RFC 9110 §15.5.11 that `410` means content is "no longer available at **any location**." The manager pulled the raw RFC and grepped: **"any location" appears zero times in all 10,785 lines.** The actual text is "no longer available at **the origin server**." The other quote in the same sentence ("the server owners desire that remote links to that resource be removed") is verbatim, which is exactly what makes this hard to spot: the sentence reads as carefully sourced.

It was also load-bearing in the wrong direction. The document's own preceding sentence concedes "the object still exists," which "no longer available at any location" directly contradicts. The sentence that actually justified the decision was the RFC's permanence test, sitting three lines below the quoted one, unused.

**Caught by:** grepping the source for the quoted string itself. Nothing else finds it. A resolving-URL gate passes, a does-the-source-support-the-claim read passes if the reader paraphrases rather than string-matches, and the surrounding verbatim quotes actively camouflage it.

## The check to install

For any document that quotes a source: **extract every quoted string attributed to a citation and grep the raw source for it.** Not the rendered page, not a summary, the raw text. For RFCs, pull the `.txt` from rfc-editor.org. For MDN, the compat data JSON from the `mdn/browser-compat-data` repo is authoritative where the prose is not.

**Do not use WebFetch on a specification.** A `spec_writer` beat on this run reported its summarizer returning text **flatly inverting** RFC 9110's fragment-inheritance meaning, claiming fragments are not forwarded across redirects when §10.2.2 mandates the opposite. Every adversary beat afterward worked from raw text and grep, which is why their findings held up under independent re-verification.

## Why this keeps happening

The mechanism is not carelessness about sources. In all four cases the writer had read the right document, understood it correctly, and reached the right conclusion. What failed was the last step: a confident paraphrase hardening into quotation marks. The conclusion survives; the evidence is counterfeit. That is why it passes every review that checks whether the argument is sound, and only fails a check that compares strings.

Related: [[gcs-false-impossibility-claims]] and [[browser-crypto-and-large-file-constraints]] record the same shape in a different register, where a correctly-understood constraint gets generalized one step too far. [[substance-floor-calibration-rule]] records the third variant, where the number is right and the stated reason is not.

- **claude-artifacts-capability-boundary** — Claude's first-party Artifacts publishing is the incumbent Relic is measured against. Knowing exactly where it stops defines the only defensible territory. Sources: https://code.claude.com/docs/en/artifacts and https://support.claude.com/en/articles/9547008-publish-and-share-artifacts.

**What Artifacts does well (do not try to beat these):** publishes an HTML or Markdown file to `claude.ai/code/artifact/{uuid}`, opens the browser, republishes to the same URL on update, versions every publish, needs no viewer sign-in for public links on Pro and Max, is free with the plan, applies a built-in design skill, and reads the project's design tokens.

**Where Artifacts stops — this is the entire opportunity:**
- Source file types are restricted to `.html`, `.htm`, and `.md`. No images, no video, no PDFs, no archives, no arbitrary binaries.
- 16 MiB rendered cap.
- Strict CSP blocks all external requests.
- Single page only; relative links do not resolve.
- Requires a claude.ai-authenticated session on Pro, Max, Team, or Enterprise.
- Unavailable on Bedrock, Vertex, and Foundry, and with ZDR / HIPAA / CMEK enabled or external sharing off.
- **Off by default in Agent SDK, GitHub Action, and MCP-server contexts**, and sessions using an API key, gateway token, or cloud-provider credential cannot publish at all.
- The artifact header names the publisher as author and links to their gallery, which matters for consultant-to-client deliverables.

**The strategic consequences:**
1. Headless and CI agent runs have no first-party publish path whatsoever. That is the cleanest unserved segment.
2. Non-Claude agents (Cursor, Codex, Copilot, Cline, Windsurf, Aider, Amp) have no publish button at all.
3. Arbitrary payload types are wide open, since Artifacts handles only HTML and Markdown.
4. Do NOT build for orgs that disabled Artifacts for compliance. An org that blocked Artifacts on policy grounds will not approve an unvetted third-party domain either.
5. **Standing risk:** Anthropic can erase this opportunity by enabling Artifacts in Agent SDK and GitHub Action contexts and widening accepted file types. Both are plausible roadmap items, so anything built here should assume the window is not permanent.

Note the audience trap for the bushido collective specifically: `han` is a Claude Code plugin platform, so its users are exactly the people who get Artifacts free and integrated. Work in this space serves the *adjacent* audience han does not have, and does not extend han's existing one.

- **cross-document-gaps-no-criterion-catches** — Two rules in the `specify` spec set are stated by one document and consumed by another that never implements them. Neither fails any unit's completion criteria, both reviewers correctly declined to file them, and both stations' gates pass. `shape` closes them or the implementer ships the defect.

## The class

When a station splits one system across four documents, each unit's criteria bound only its own document. A rule that document A states **about** document B's surface is checkable in A and invisible in B. The reviewers caught these by walking seams end to end rather than reading each document against its own criteria, which is the only method that surfaces this class.

Distinct from a contradiction, which is what `fb-10` and `fb-12` were. A contradiction has two answers and one is wrong. This has one answer sitting in the wrong document, so nothing is wrong and nobody implementing from the owning document ever sees it.

## Gap 1, load-bearing, with a stated user-facing consequence

`service.md` 3.2 mandates: "A fetch that fails not-found after a successful mint renders as 'this relic is no longer available', never as a decrypt failure. Get this backwards and a takedown reads to the recipient as a bad key, and they blame the sender."

`viewer.md` 6.1 enumerates "the five states, of which two collapse" and has **zero** occurrences of that copy or any branch for a post-mint object-fetch failure. Verified: `grep -ci 'no longer available' docs/spec/viewer.md` returns 0.

So the document that owns every recipient-facing screen has no state for this one, and the nearest screen an implementer reaches for is the decrypt-failure screen `service.md` explicitly forbids. The delete-mint race is a real sequence: mint succeeds, the object is deleted for abuse or under legal process before the fetch completes, and the recipient sees a bad-key error for a relic that was taken down.

**What `shape` does:** add the state to the viewer's screen set, wired to a not-found on the object fetch after a successful mint, carrying `service.md` 3.2's copy. It is a sixth state, not a variant of the five.

## Gap 2, smaller

`service.md` 2.1 justifies a mint-response field: "**`mints_remaining`** so the viewer can warn before the cap kills the link rather than after."

`viewer.md` never mentions `mints_remaining`. Verified: 1 occurrence in `service.md`, 0 in `viewer.md`. The field ships with a stated purpose and no specified consumer, so either the warning gets built from a justification buried in another document's field list, or the field is dead weight on every mint response.

**What `shape` does:** decide whether the viewer warns, and if it does, specify the threshold. If it does not, the field's justification in `service.md` 2.1 is false and the field is unjustified.

## The check that finds this class

For every rule one document states about another document's surface, grep the target document for the behavior. A rule that appears exactly once, in the document that does not implement it, is this defect. Neither `every-cited-url-resolves`, nor a substance floor, nor a per-unit criteria audit will catch it, because each document is internally complete and correct.

Related: [[citation-defects-and-the-three-checks-that-catch-them]] is the same shape one level down. There the evidence was counterfeit while the argument was sound; here the rule is sound while its home is wrong. Both survive every check that reads one artifact at a time.

- **domain-strategy-and-safe-browsing-blast-radius** — **Never host user-generated or user-uploaded content on a subdomain of a domain that carries company email or the marketing site.** This is evidence-backed, not caution.

**How Safe Browsing lookups mechanically work.** The client canonicalizes a URL and generates up to 30 host-suffix/path-prefix combinations: at most 5 host strings × 6 path variants. The host rule, quoted: "up to four hostnames formed by starting with the eTLD+1 domain and adding successive leading components," where **eTLD+1 is determined by the Public Suffix List** (https://developers.google.com/safe-browsing/reference/URLs.and.Hashing). So for `a.b.example.com` the generated hosts are `example.com`, `b.example.com`, `a.b.example.com`. Mechanically, a listing for a subdomain does *not* match the parent — but a listing for the parent matches **everything** beneath it, since every subdomain lookup generates the parent as one of its host keys.

**The mechanism permits sibling safety. Google's listing behavior does not.**

**The Immich precedent (October 2025) is the direct answer.** Google flagged **all subdomains under `*.immich.cloud`**, including internal-only services with no public exposure (Zitadel, Outline, Grafana, Victoria Metrics). The actual trigger was auto-generated per-PR **preview environments**, crawled after their URLs were posted to GitHub and classified as deceptive. Immich's own words: *"a single flagged subdomain would apparently invalidate the entire domain."* The URLs listed in Search Console were only the preview environments; the blast radius was not. Appeal via Search Console → Request Review was accepted in "a day or two" — **and then it recurred**, because new preview environments appeared, Google crawled GitHub again, and `immich.cloud` was flagged a second time. Their actual fix was moving preview environments to a **separate registrable domain, `immich.build`** — not a subdomain. Jellyfin, NextCloud, and n8n have reported the same pattern. (https://immich.app/blog/google-flags-immich-as-dangerous)

The detail that matters most: Immich's marketing site is `immich.app`, a **different registrable domain** from `immich.cloud`. That separation is the only reason their public site survived, and their remedy was to add a *third* registrable domain for the risky content.

**Corporate mail gateways make it worse, by default.** Microsoft's Tenant Allow/Block List: "a left tilde implies a domain and all subdomains. For example, `~contoso.com` includes `contoso.com` and `*.contoso.com`," and a TLD-level Safe Links entry blocks "all URLs that are related to `*.TLD/` (subdomains, domains, or sub paths) both during mail flow and at time of click across Microsoft Teams and Office apps" (https://learn.microsoft.com/en-us/defender-office-365/tenant-allow-block-list-urls-configure). An admin under time pressure blocks the registrable domain, not the specific host. Note Microsoft's *email*-domain docs are internally inconsistent on subdomain coverage; plan for the broader interpretation, since the URL rules are unambiguous.

**Honestly undetermined:** whether a Safe Browsing listing on a subdomain degrades the parent's **Gmail sender reputation**. Deliverability practitioners say severe subdomain abuse bleeds up to the root, but that is industry consensus, not Google policy, and Google publishes nothing on this specific interaction. Proofpoint's URI-blocklist treatment of host-to-parent relationships is also unpublished.

**The structure to ship:**
1. The company apex stays clean: marketing, email, nothing user-generated, ever.
2. **A separate registrable domain for the service.** A listing here costs the service, not the collective's email and marketing presence.
3. **A third registrable domain for the sandbox origin** rendering untrusted HTML — cross-site from the service domain, so a flag on rendered content does not take out the service's own API and PWA, and so untrusted HTML cannot reach the fragment secret.
4. If using per-relic random subdomains, register the sandbox parent on the **Public Suffix List**. Caveat stated honestly: PSL registration changes eTLD+1 computation so the parent stops being generated as a lookup key, but **no documentation confirms PSL registration prevents Safe Browsing from listing at the parent anyway**, and Google's Immich behavior was broader than the mechanism required. Treat PSL as origin isolation with a possible listing-scope benefit, never as a guaranteed firewall.
5. **Verify every domain in Search Console before launch, not after the flag.** The Security Issues report is the only place you can see which URLs triggered a listing. Unverified means flagged and blind.

**Design goal: assume you will be flagged. Make the flag cost one domain you can afford to lose.**

- **gcs-cloud-run-architecture-constraints** — Hosting-layer facts that dictate Relic's architecture. Verified against Google's docs.

**Cloud Run's 32 MiB wall forces the right design anyway.** Max HTTP/1 request size is **32 MiB**, with **no limit on HTTP/2** end to end; max HTTP/1 response is 32 MiB unless chunked or streaming; max request timeout 60 minutes; 1000 concurrent requests per instance (https://docs.cloud.google.com/run/quotas). The wall is escapable via HTTP/2, but the correct move is **signed URLs, direct to GCS, bypassing the app server entirely**. That is strictly better than raising the limit: ciphertext never transits the app server, so the server has no opportunity to observe anything, upgrading the zero-knowledge claim from "we promise" to "we structurally cannot."

**Direct-to-GCS upload.** Two signed-URL shapes: a simple signed PUT, or a server-initiated resumable session (server POSTs for a session URI, client PUTs to it).
- **CORS is required even with a signed URL** because the browser still preflights; every header in `Access-Control-Request-Headers` must appear in the bucket's `responseHeader` list or preflight fails (https://docs.cloud.google.com/storage/docs/cors-configurations). A working upload config covers `PUT, POST, OPTIONS` plus response headers `Content-Type`, `Content-Length`, `Content-Range`, `x-goog-resumable`.
- **Enforcing a max upload size is awkward:** `Content-Length` is ignored on a signed PUT. The two real options are **signed policy documents** (POST), which declare max file size, allowed content types, and key prefix as signed constraints, or **`X-Upload-Content-Length` on a resumable session**. Signing `content-length` also works, since a mismatch breaks the signature.
- **Relic's publish path runs on the user's machine, not in a browser, so the upload leg has no CORS requirement at all.** CORS only matters for the PWA's download leg.

**Lifecycle TTL.** Object Lifecycle Management's `age` condition is a real TTL: `{"rule":[{"action":{"type":"Delete"},"condition":{"age":7}}]}` (https://docs.cloud.google.com/storage/docs/lifecycle). Two gotchas: **config changes take up to 24 hours to take effect**, and Google may act on the old config during that window; and **granularity is days, rounded to the next UTC midnight**, so sub-day expiry is inexpressible. Anything shorter than a day must be enforced at the application layer (refuse to serve) with lifecycle reaping the bytes later.

**Range requests and progressive decryption.** GCS supports byte-range downloads and the XML API honors per-bucket CORS. For the browser to see them you must include **`Content-Range`** and `Content-Length` in the bucket's `responseHeader` list. Combined with `wormhole-crypto`'s `decryptStreamRange`, this is the working path to seekable decryption — the thing that makes in-page video playback and ZIP-entry browsing possible without downloading the whole object.

**Public read vs signed download.** A public object means anyone with the URL downloads it indefinitely, with no expiry and no audit trail. Signed URLs give time-bounded access to a private bucket but **cannot be individually revoked** (https://docs.cloud.google.com/storage/docs/access-control). For Relic, short-lived signed download URLs minted by the app server at view time beat public objects: they keep delete-by-ID effective as a control, preserve an audit trail, and let bucket-level Public Access Prevention stay on.

- **gcs-false-impossibility-claims** — **This run keeps generating false "GCS structurally cannot do X" claims, and every one of them has been wrong in the same direction: asserting an impossibility where the real answer is a cost or a design choice.** Three instances so far, each caught only because a second reader fetched the page and read the raw text.

1. **Soft delete "is set at bucket creation and cannot be changed."** False. The retention duration is editable at any time. The true, narrower fact is directional: a policy change only reaches objects deleted *after* it takes effect, so setting it late leaves a tail nobody can clear.
2. **"The app server cannot set metadata on an object it never touches."** False, and it produced three wrong downstream adjectives (custom metadata called client-declared, omissible, and forgeable). The docs say verbatim: "After you have created a custom metadata `key:value` pair, you can delete the key or change the value." The app server already holds bucket-mutating credentials, since delete-by-ID is a v1 control, so it can patch metadata post-upload on an object whose bytes it never handled. And metadata named in a V4 signed URL's `SignedHeaders` cannot be altered without invalidating the signature, so it is pinnable rather than forgeable.
3. The same shape appeared earlier as a renderer-class attestation argument: asserting a property was structurally guaranteed when it was merely conventional.

**The mechanism, and it is worth naming because it will recur.** Being outside the **data path** is not being outside the **control plane**. This architecture deliberately keeps the app server out of the bytes: ciphertext never transits it on either leg, and GCS serves objects directly under signed URLs. That is a real and load-bearing constraint, and it makes "the server cannot do X" feel true for every X. It is only true for operations on the byte stream and on the response GCS serves. The server retains full control-plane authority: it can create, patch, and delete objects and their metadata through the JSON and XML APIs, and it can constrain what a client uploads by signing headers into the grant.

**The concrete rule.** Before writing that GCS structurally prevents something, fetch the page and read the raw text. Distinguish three different claims that are easy to collapse into one: what the server can see (bytes: no), what response headers it controls on a GCS-served object (none), and what it can set or change through the API (nearly everything, with credentials it already holds). A wrong impossibility claim is worse than a wrong cost estimate, because it closes a question the next station would otherwise have to answer, and nobody reopens a question the spec says is settled.

**Why this keeps happening here specifically.** The frame's central promise is an operator who structurally cannot read content. That is true and it is the product. The failure mode is generalizing a genuine cryptographic impossibility into an infrastructural one. They are not the same guarantee and they do not have the same blast radius.

Related: [[substance-floor-calibration-rule]] records a different instance of the same underlying discipline, that a stated reason must match the rule actually used.

- **gcs-soft-delete-and-what-deletion-actually-means** — **GCS soft delete is enabled by default on all buckets, with a seven-day retention.** Deleting an object stops it being served immediately, and does not erase it. Any claim about takedown, retention windows, or lifecycle reaping has to be written against that, and it is the setting you get by not deciding.

Verified against Google's documentation twice during the `frame` station, the second time correcting an error in the first recording of this topic (see the correction note at the end).

## The facts, verified verbatim

- **Soft delete is enabled by default on all buckets and has a retention duration of seven days.**
- **Soft-deleted objects cannot be read or modified**, so serving genuinely stops at delete time.
- **Objects deleted by Object Lifecycle Management become soft-deleted.** Lifecycle expiry lands in the same state; it is not a separate, harder erase.
- **A soft delete policy can be set, deleted, or edited during a bucket creation OR UPDATE request.** It is editable at any time.

## What follows for anything abuse-facing

1. **Delete-by-ID answers an abuse notice correctly.** The half that matters to a reporter, a blocklist maintainer, or Google's abuse team is that the content stops being reachable, and delete does that instantly. Do not weaken the takedown story over this.
2. **Do not claim erasure.** "Deleted" and "gone" are different states for seven days by default. A published retention window claiming "we keep X for N days" is false if object bytes outlive it in soft-delete storage.
3. **It is still a precondition, but not because the policy is immutable.** The correct reason: **a policy change only reaches objects deleted after it takes effect.** Anything already soft-deleted keeps the duration that was in force when it was deleted, even if the policy is later removed. So setting it late leaves a tail nobody can retroactively clear, which is exactly why the decision belongs before the first deploy.
4. **Soft-deleted objects still cost storage.** Relevant to any egress or spend ceiling arithmetic.

## Two adjacent facts in the same class: expiries nobody is watching

- **Google Search Console verification is not permanent.** Verification "lasts as long as Search Console can confirm the presence and validity of your verification token," it is re-checked periodically, and "your permissions on that property will expire after a certain grace period" if confirmation fails. **"If all verified owners lose access to a property, all users will lose access to the Search Console property."** So verification is a standing observable, not a one-time gate, and it requires at least two verified owners. Losing it silently returns the operator to the flagged-and-blind state that verification exists to prevent (see [[domain-strategy-and-safe-browsing-blast-radius]]).
- **Domain registration has an expiry.** The standing observable is registrar expiry and auto-renew status, not a one-time "the domain exists" check. **A lapsed relic domain is worse than a flagged one**, because someone else can buy it and inherit every link ever shared.

## The general lesson, and a correction worth keeping visible

Every one of these was found by a pass that verified a **default or an expiry** rather than a decision. **The dangerous configuration is the one nobody chose, and the dangerous fact is the one that stops being true while nobody is looking.** When a document states what a platform does, check whether the claim describes the default, an intended setting, or a state with a clock on it, and say which.

**The correction:** the first version of this topic asserted soft delete is "a bucket-creation setting," and built the precondition argument on that immutability. That was wrong, caught by a distiller pass that fetched the page and grepped the raw text rather than trusting the summary it had been handed. The lesson generalizes past this fact: a claim that arrives already summarized, from a reader you trust, is still a claim. This entry now rests on the mechanism that actually carries it (post-effect-only application, per point 3) rather than on an immutability that does not exist. Related: [[unobservable-quantities-are-this-projects-failure-mode]], since "we deleted it" is a state the operator can assert but a reader cannot verify.

- **mcp-client-architecture-local-binary-not-returned-script** — **A remote MCP server must never return an executable script body for the calling agent to run.** Ship a local stdio MCP client instead. This is an architectural rule with a CVE behind it.

**CVE-2025-6514, confirmed.** `mcp-remote` (the npm shim letting stdio-only MCP clients talk to remote HTTP servers), **CVSS 9.6**, OS command injection to RCE. Affected 0.0.5–0.1.15, fixed in **0.1.16**. Found by JFrog Security Research (https://jfrog.com/blog/2025-6514-critical-mcp-remote-rce-vulnerability/, GHSA-6xpm-ggf7-wc3p).

The mechanism is the point: `mcp-remote` fetches OAuth metadata from the remote server; the server returns an attacker-chosen `authorization_endpoint`; that string reaches the npm `open` package's `open()`; on Windows it becomes PowerShell execution. JFrog's payload was `a:$(cmd.exe /c [malicious-command])?response_type=code` — a non-existent URI scheme with no backslashes, slipping past URL-encoding restrictions. Windows gets full arbitrary command execution with complete parameter control; macOS and Linux get arbitrary executable execution with limited parameter control.

**Why this is dispositive.** A remote MCP server returned *a string in a metadata field* and got RCE on the client. No script-execution feature was involved; that was the bug. A design that deliberately returns executable script bodies **makes that outcome the intended, documented, working behavior.** CVE-2025-6514 is what the accident looks like. Anyone writing a detection rule for this threat class will match the deliberate version too. And the universal prescribed mitigation is "only connect to trusted MCP servers" — which a publicly hosted, unauthenticated server for arbitrary users cannot satisfy. A service compromise, DNS hijack, expired-domain takeover, or subverted deploy pipeline becomes RCE on every publishing user, landing with the developer's own privileges on a machine holding source code and cloud credentials.

**Client-side controls do not save it.** The `2026-07-28` spec has **no content type meaning "this is executable"** — a script returned as `text` is protocol-indistinguishable from a weather report, so there is no flag a client could gate on. **No MCP client, in any documentation, treats server-returned code differently from server-returned data.** In Claude Code the chain is: tool returns text → model decides to run it → `Bash` call → permission system. That system does fail closed, but it degrades in three ordinary ways: static `allowedTools`/`settings.json` rules match first and the prompt never fires; `bypassPermissions` / `--dangerously-skip-permissions` skips it entirely and is common in agent-heavy workflows; and **the prompt becomes a rubber stamp on long payloads** — nobody meaningfully reviews a two-hundred-line encryption script. The human-in-the-loop control is strongest for short commands and weakest for exactly this payload.

**A local stdio server achieves the identical zero-knowledge property, with no caveats.** Zero-knowledge requires exactly three things: the key is generated on the user's machine, the plaintext is encrypted on the user's machine, and only ciphertext crosses the network. A local stdio MCP server runs as a subprocess with full user privileges and does all three in-process, in native code, with no shell involved. The remote service sees ciphertext either way. **The dynamic-script route has no property the local-binary route lacks.**

| | Remote returns script | Local stdio client |
|---|---|---|
| Code executed | Fetched fresh per call from a network endpoint | Installed once from a package registry |
| Version pinning | Impossible | Standard (lockfile, version in config) |
| Reviewable | No, changes per call | Yes, published artifact |
| Provenance | None | npm provenance, Sigstore, checksums |
| Server compromise → | Immediate RCE on every user | Cannot inject code; server returns none |
| Supply-chain risk | Every call | Registry compromise: one-time, detectable |
| Detectability | None | `npm audit`, Socket, SBOM, lockfile diff |

The local route's supply-chain surface is real (`npx -y @some/mcp-server` executes arbitrary code, and the MCP spec itself warns "users have no insight into what commands are being executed"), but it is one-time, pinnable, auditable, and already covered by the npm/PyPI security ecosystem. The dynamic-script risk is per-call, unpinnable, unauditable, and covered by nothing.

**The rule:**
1. The local stdio MCP server generates the key, encrypts, uploads direct to GCS via signed URL, and returns the URL — all in-process, no shell, no dynamic code.
2. The remote service is a plain HTTPS API: mint signed upload URLs, store metadata, serve the PWA, handle abuse reports. **No MCP surface required at all.**
3. If a remote MCP server must exist for a zero-install story, it returns **only data**, at most naming a **pinned, versioned command** (`npx -y @scope/relic@1.4.2 publish "file.ext"`). Never a script body. That bounds a server compromise from "arbitrary RCE" to "can name a different pinned version" — still bad, but detectable, revocable at the registry, and visible in a permission prompt a human can actually read.
4. Validate the `Origin` header, HTTPS only, per both the MCP transport MUST and JFrog's mitigation guidance.

The zero-install pitch is the only thing the dynamic-script route buys, at the price of a CVSS 9.6-shaped hole that is on by design.

- **mcp-protocol-2026-07-28-constraints** — **The current MCP protocol revision is `2026-07-28`** (https://modelcontextprotocol.io/specification/versioning), published one day before this run started. It made **breaking changes** to Streamable HTTP. Any SDK, example, or framework targeting `2025-06-18` or earlier implements a materially different transport — check every dependency against this revision specifically, not "MCP" generally.

**What changed in `2026-07-28`:** the GET stream endpoint is removed; protocol-level sessions are removed (no `Mcp-Session-Id`, no `Last-Event-ID` resumability, no DELETE); the `initialize` handshake is replaced by per-request `_meta` carrying `io.modelcontextprotocol/protocolVersion`, `clientInfo`, and `clientCapabilities`; server-to-client interactions (sampling, elicitation, roots) now travel as `InputRequiredResult` multi-round-trip requests embedded in results rather than server-initiated JSON-RPC; and a mandatory `server/discover` RPC handles up-front version negotiation. Claude Code still interoperates with older revisions via documented fallback.

**Transports.** Only **stdio** and **Streamable HTTP** exist in the current spec; HTTP+SSE (2024-11-05) is deprecated and eligible for removal. Streamable HTTP is now simpler: one endpoint accepting POST, no sessions, no GET stream, each request answered with either a JSON object or a request-scoped SSE stream.

Mandatory transport security, verbatim from the spec: servers **MUST** validate the `Origin` header on all incoming connections to prevent DNS rebinding, responding **403** if present and invalid; when running locally servers **SHOULD** bind only to 127.0.0.1; servers **SHOULD** implement authentication. Each request also carries `MCP-Protocol-Version`, `Mcp-Method`, and `Mcp-Name` headers, whose values the server **MUST** validate against the body, rejecting mismatches with `400` and JSON-RPC error `-32020` (`HeaderMismatch`). Send `X-Accel-Buffering: no` on SSE so nginx-class proxies do not buffer.

**Tool results.** Unstructured content blocks are `text`, `image` (base64 + mimeType), `audio`, `resource_link`, and embedded `resource`. Structured results go in `structuredContent` conforming to `outputSchema`, and a tool returning structured content SHOULD also return serialized JSON in a TextContent block for compatibility. `isError: true` marks an execution error the model should self-correct from. **Servers MUST "Validate all tool inputs / Implement proper access controls / Rate limit tool invocations / Sanitize tool outputs"** — rate limiting is a spec-level MUST.

**Running unauthenticated is spec-compliant.** "Authorization is OPTIONAL for MCP implementations." Never return 401/403 with `WWW-Authenticate` and never publish `/.well-known/oauth-protected-resource`, and clients never enter OAuth 2.1.
**Critical operational trap: Claude Code marks a server as needing auth only when it sees a `401` or `403`.** Returning either for a rate-limit rejection makes Claude Code prompt users to sign in against an authorization server that does not exist. **Use `429` for rate limiting.**
Consequence of no auth: **no per-user quota is possible.** Every abuse control keys on IP, on proof of work, or on nothing.

Because sessions are gone, the spec's **Stateful Tools** guidance governs any publish-then-confirm flow. For unauthenticated servers the spec says a handle "is necessarily a bearer token, it should be generated with sufficient entropy (e.g., a UUIDv4) and given a bounded lifetime." That is the design rule for a relic ID.

**Client-side facts (Claude Code, https://code.claude.com/docs/en/mcp).** Added via `claude mcp add --transport http <name> <url>`. In JSON config, `type` accepts `streamable-http` as an alias for `http`; **a `url` with no `type` is a configuration error** because a typeless entry is read as stdio. Three scopes — `local` (default, this project), `project` (`.mcp.json`, version-controlled, requires approval), `user` (all projects) — with precedence local > project > user. Project-scoped approvals are ignored in untrusted workspaces since v2.1.196, so a cloned repo cannot auto-approve its own servers. Failed HTTP connections retry 3 times at startup, then 5 attempts with exponential backoff mid-session. **Idle timeout is 5 minutes for HTTP servers with no response and no progress notification**, so any long operation must emit `notifications/progress`. Time-to-first-byte defaults to 60 seconds unless `timeout` or `MCP_TOOL_TIMEOUT` is raised.

**On returning executable script as a tool result:** no documented prior art and no spec provision exists. The `2026-07-28` spec has no content type meaning "this is executable"; a returned script is protocol-indistinguishable from any other text. Anthropic's "Code execution with MCP" (https://www.anthropic.com/engineering/code-execution-with-mcp) is frequently miscited as this pattern but is **the inverse** — the agent authors code calling MCP tools as APIs inside a restricted isolate. The security literature on the actual pattern is uniformly negative: tool results enter the LLM context where the model "may fail to distinguish between passive data and active instructions" (https://arxiv.org/pdf/2604.21477, https://arxiv.org/pdf/2512.08290).

- **prior-art-zero-knowledge-link-sharing** — The "encrypt client-side, put the key in the URL fragment, store only ciphertext" model is well-trodden prior art, not novel. Any future run touching Relic's crypto or positioning inherits this.

- **PrivateBin** (https://github.com/PrivateBin/PrivateBin) has shipped this exact construction since 2012. Its published threat model (https://github.com/PrivateBin/PrivateBin/wiki/Threat-Model) is candid that the operator gets "plausible deniability" and that "filing complaints about abusive content rarely helps." Text-only, no rich rendering, no agent integration.
- **file.kiwi** (https://file.kiwi/) is the closest competitor and ships three of Relic's four pillars for free: no signup, client-side 128-bit AES-GCM before upload, "the decryption key lives only inside the share link," URL shape `https://file.kiwi/abcdef12#secretKey`, no size limit, 96-hour auto-delete, resumable uploads with the download link issued as upload begins. It also ships an MCP server: `@file-kiwi/filekiwi-mcp-server` (https://github.com/file-kiwi/filekiwi-mcp-server), input a file path, output a download link.
- **Wormhole** (https://wormhole.app/security) uses 128-bit AES-GCM before the data leaves the browser, share URL literally `https://wormhole.app/{roomId}#{mainSecretKey}`, 24-hour deletion, 5 GB server-side then P2P.
- **Bitwarden Send** is encrypted and expiring but account-bound and aimed at secrets rather than documents.

Other MCP publishing servers already exist: **PreviewShip** (https://previewship.com/docs/mcp — `.html`/`.md`/`.pdf`/built folders, requires an API key, not zero-knowledge), **hypertext.live** (https://hypertext.live/guides/mcp — single `publish_html` tool, public by design), **EdgeOne Pages MCP** (https://pages.edgeone.ai/document/pages-mcp), and **temp-file-share-mcp / tfLink** (https://github.com/tflink-tmpfile/temp-file-share-mcp — 100 MB cap, no encryption, near-zero adoption).

**The durable conclusion:** neither the crypto nor agent-native publishing is defensible ground. The uncontested ground is opinionated, mimetype-aware rendering of agent output. Do not position Relic on zero-knowledge or on no-account publishing; both are matched by free incumbents.

- **redirects-inherit-the-fragment-and-leak-the-key** — **A redirect whose `Location` carries no fragment inherits the original request's fragment. For Relic, that means a single fragment-less redirect hands the decryption key to the redirect target.** This is mandated browser behavior, not a bug in anything, and it defeats the two-domain isolation the whole architecture rests on.

## The mechanism, verbatim from the spec

RFC 9110 §10.2.2: "If the Location value provided in a 3xx (Redirection) response does not have a fragment component, a user agent MUST process the redirection as if the value inherits the fragment component of the URI reference used to generate the target URI (i.e., the redirection inherits the original reference's fragment, if any)."

RFC 9110 §17.11 names the exact risk: "when a redirect occurs and the original request's fragment identifier is inherited by the new reference in Location, this might have the effect of disclosing one site's fragment to another site. If the first site uses personal information in fragments, it ought to ensure that redirects to other sites include a (possibly empty) fragment component in order to block that inheritance." (https://www.rfc-editor.org/rfc/rfc9110.html)

## Why it is severe here specifically

The sandbox origin is precisely "another site" in §17.11's sense. The entire point of the separate registrable domain is that untrusted content cannot reach the fragment (see [[rendering-untrusted-content-origin-isolation]]). **One fragment-less redirect from the service origin to the sandbox origin defeats that, by spec-compliant browser behavior, with no bug in any component.**

This is the same shape as the SVG taxonomy gap in [[renderer-class-is-a-security-boundary-not-a-label]]: correct components, unspecified boundary, key walks out.

## The rule

**Every redirect Relic issues MUST carry an explicit, possibly empty, fragment in `Location`.** No exceptions, and the list of places this bites is longer than it first looks:

- HTTP to HTTPS upgrade
- apex to `www`, or `www` to apex
- service origin to sandbox origin (the dangerous one)
- any legacy or renamed path
- trailing-slash normalization
- any CDN or load-balancer redirect the application does not author

That last one matters: a redirect configured in infrastructure rather than application code is the one nobody audits.

## The related exposure the fragment guarantee does not cover

The fragment guarantee is a statement about what a **browser** puts in an HTTP request. It says nothing about a human pasting the string somewhere.

- **Link shorteners.** A user pasting the full URL including `#secret` into a shortener's form transmits the key in a request body and stores it on that service. Nothing technical prevents this. (Note the shortened link often still works, because the click-time redirect inherits the fragment per §10.2.2, which is the same mechanism above working in the user's favor.)
- **Abuse report forms.** A reporter pasting the full URL puts the key in the operator's own intake, converting "we structurally cannot read it" into "we chose not to." Strip everything after `#` client-side before submit, strip again server-side, and ask for the relic ID only in the published policy. **The email alias cannot be defended this way and is a stated residual, not a solved problem.**
- **Enterprise link rewriters.** Microsoft Safe Links wraps URLs with the original as a query parameter (https://learn.microsoft.com/en-us/defender-office-365/safe-links-about); Proofpoint URL Defense encodes the original into the wrapper's path. **Neither documents what it does with a fragment.** If either percent-encodes the `#` into its wrapper, the key is transmitted to and logged by that vendor. Undocumented, testable in one message by mailing a real relic through a Defender tenant and reading the delivered URL, and worth testing before launch rather than assuming.

## What this forces on the marketing claim

"The key never reaches a server" is wrong as an unqualified absolute. The honest form is **"your browser never sends the key to Relic's servers."** Everything above is a case where the key reaches *some* server without Relic's browser code doing anything wrong. Belongs in the same published statement as [[agent-mediated-key-delivery-leaks-to-the-transcript]] and the telemetry trade.

- **relic-frame-decisions-dark-mode-assumptions** — Three frame-station decisions made autonomously under dark mode, each contradicting or sharpening the operator's original brief. **The operator can override any of these via feedback.** Recorded here so the reasoning is inspectable rather than buried.

## Decision 1: The MCP server does NOT return an executable script. A local stdio MCP server encrypts in-process.

**Overrides step 3 of the original brief.**

Rationale: zero-knowledge requires exactly three things — key generated locally, plaintext encrypted locally, only ciphertext on the wire. A local stdio MCP server runs as a subprocess with full user privileges and does all three in-process with no shell. **The returned-script route has no property the local-binary route lacks**, and it costs a CVSS 9.6-shaped hole that is on by design (see [[mcp-client-architecture-local-binary-not-returned-script]]).

The ergonomic argument also favors local: the original brief's flow fires a Bash approval prompt on **every** invocation, whereas a local stdio server does the work inside the MCP tool call itself, with **zero** Bash prompts after a one-time install. The brief's stated goals (MCP never sees the secret or the file; the agent makes one call; the user gets a URL) are all better served by the local route.

The only thing sacrificed is zero-install. That is a weak loss specifically for this operator: the bushido collective builds `han`, a Claude Code plugin platform, so plugin and MCP distribution is core competency, not friction.

**Fallback if a zero-install path is later required:** a remote MCP server that returns **only data**, at most naming a pinned versioned command (`npx -y @thebushidocollective/relic@1.4.2 publish "file.ext"`). Never a script body. That bounds a server compromise from arbitrary RCE to naming a different pinned version — detectable, revocable at the registry, and short enough that a permission prompt is genuinely readable.

**Consequence for architecture:** the remote service becomes a plain HTTPS API (mint signed upload URLs, store metadata, serve the PWA, handle abuse reports). It needs no MCP surface at all.

## Decision 2: Relic does not run under `thebushido.co`. It requires two registrable domains distinct from it.

**Overrides the `relics.thebushido.co` domain in the original brief.**

Rationale: Google lists Safe Browsing entries at the **registrable domain** in response to abuse found only on subdomains. Immich (October 2025) had all of `*.immich.cloud` flagged — including internal-only Zitadel, Outline, Grafana, and Victoria Metrics — triggered by per-PR preview environments. It recurred after a successful appeal. Their fix was a **separate registrable domain**, and their marketing site survived only because `immich.app` was already a different registrable domain. Microsoft's Tenant Allow/Block List blocks a URL domain and all subdomains by default. See [[domain-strategy-and-safe-browsing-blast-radius]].

**The required structure:**
1. `thebushido.co` stays clean: marketing and email, nothing user-generated, ever.
2. A separate registrable domain for the Relic service (API + PWA).
3. A third registrable domain for the sandbox origin rendering untrusted HTML, cross-site from the service domain, so a flag on rendered content does not take out the service's own API, and so untrusted HTML cannot reach the fragment secret.

**External dependency, operator action required:** selecting and purchasing those two registrable domains. No downstream station can deploy without them. Every domain must also be verified in Google Search Console **before** launch, because the Security Issues report is the only place a listing's triggering URLs are visible — unverified means flagged and blind.

## Decision 3: The frame centers on rendering. Zero-knowledge is the permission slip, not the pitch.

**Sharpens, rather than contradicts, the brief.**

Rationale: file.kiwi already ships client-side AES-GCM, key-in-fragment, no account, no size limit, 96-hour expiry, **and an MCP server**, free. PrivateBin has shipped the identical crypto since 2012. Neither the crypto nor agent-native publishing is defensible ground (see [[prior-art-zero-knowledge-link-sharing]]). The one thing no competitor holds is opinionated, mimetype-aware rendering of agent output.

Zero-knowledge still matters, but as the property that lets a developer answer "am I allowed to send our internal report through a third party" without a security review. Users will not *choose* Relic for it; they will be *allowed* to choose Relic because of it.

Honesty constraint on the claim: the JavaScript performing decryption is served by the same server the zero-knowledge claim is made against, so it is a statement about operator intent, not a property a recipient can verify. PrivateBin and 0bin say this out loud. Relic must too — overclaiming is a reputational liability (see [[abuse-liability-of-hosting-uninspectable-content]]).

Target segments follow from [[claude-artifacts-capability-boundary]]: headless/CI agent runs (Artifacts are off in Agent SDK, GitHub Action, and MCP-server contexts, and API-key sessions cannot publish at all) and non-Claude agents (Cursor, Codex, Copilot, Cline, Windsurf, Aider, Amp), which have no publish path whatsoever.

- **relic-telemetry-trade-and-measurability** — **A wedge nobody can measure is a wedge nobody can defend.** Relic's primary success metric is unmeasurable by default under its own architecture, and closing that gap costs a defined amount of metadata. Forced by adversarial review (`fb-01`, then sharpened by `fb-03`) at the frame station. Overridable by the operator.

## The problem

The primary metric is a conjunction: relics get opened by someone other than the publisher, **and** opened relics are predominantly types Relic *renders* rather than download-only binaries. The second clause is what distinguishes Relic from a worse file.kiwi.

Neither half has a path to a number by default:
- The server holds only ciphertext and never receives the key, and mimetype sniffing happens **after decryption, in the browser** (see [[archive-browsing-and-mimetype-detection]]).
- The viewing origin carries no analytics or error reporting, because any same-origin script can read `location.hash` (see [[rendering-untrusted-content-origin-isolation]]).
- The server cannot distinguish a recipient's open from the publisher's own confirmation open, so during dogfooding the metric reads green in exactly the world where Relic has zero recipients.

Left unfixed, "opens by rendered type" silently degrades to "opens," which is trivially observable from the signed-URL mint and is precisely the number that cannot detect the failure it exists to detect. The instrument becomes the thing that hides the problem.

## The telemetry

Minimum required to make the metric computable, all **server-side**, none from a script on the viewing origin:

1. **A coarse renderer class declared at publish time by the local client**, which already holds the plaintext: one of `markdown`, `code`, `html`, `image`, `media`, `archive`, `binary`. Stored against the relic ID.
2. **Open counts taken at signed-URL mint time.**
3. **Publishing client name**, so "does this serve the segments Artifacts cannot" is answerable at all.

**Why the class supports a claim about *opened* relics, not just published ones:** the class is stored against the relic ID, every open event names that ID, so joining them yields the class distribution of the opened population directly. The class is immutable for the relic's life, because republish-to-same-URL and versioning are non-goals, so one relic has exactly one plaintext and therefore exactly one true class. Nothing drifts between publish and open. The taxonomy also cuts exactly on the wedge boundary: renderable is `{markdown, code, html, image}`, download-only is `{media, archive, binary}`.

## The publisher-versus-recipient confound is PERMANENT. Do not treat it as solved.

**This is the correction from `fb-03`. An earlier version of this topic asserted "excluding opens originating from the publishing IP" as a clean mechanism attached to item 2. That was wrong, and the error is instructive.**

Publishing-IP exclusion fails **asymmetrically**, in the direction that hides a loss:
- **Same-NAT is the safe direction.** A genuine recipient behind the publisher's NAT gets excluded, undercounting recipient opens. This can only make you believe you lost when you won. Acceptable.
- **The publisher on any other IP is the dangerous direction.** Cellular, VPN, a second machine, a coffee shop: the publisher's own open counts as a recipient and inflates the exact clause the metric rests on. Not a corner case for this product, since Relic ships a PWA whose point is mobile viewing, and checking your own link before sending it is the most likely thing a publisher does. In the zero-recipient failure world, a publisher who habitually checks on a phone produces a first clause reading near 100 percent.

**No mechanism available under the locked non-goals fully separates publisher from recipient.** Accounts would, and accounts are a non-goal, so the residual confound is permanent and must be **documented rather than engineered away**. What is required instead:
1. State the asymmetry with both directions named. Never present the first clause as a clean number.
2. Name a concrete discriminator for the dominant false positive, computable server-side (a short post-publish exclusion window is the cheap one, since the self-check is overwhelmingly immediate; a time delta between publish and mint qualifies, anything needing a viewing-origin script does not).
3. **State what that discriminator fails to catch.** A short window misses a publisher who checks twice, or who checks from a phone after sending the link, and it eats a genuine first recipient open when the publisher never self-checks. An undocumented failure direction is worse than a known one.
4. State the trust condition: below what volume or during what period the number is not informative. Early low-volume operation with the collective as publisher is when self-checks dominate the sample.

**Two scope limits on the confound.** It touches only the first clause. The second clause (renderable versus download-only) is substantially robust to publisher self-opens, because a publisher self-checks relics drawn from the same publishing population, so the failure it exists to detect still shows through. The sharpest half of the metric is the half the confound damages least. Separately, the telemetry measures the *type* of what was opened, never whether rendering succeeded; render success would need a viewing-origin script, so it is out of reach by design.

## The cost, stated plainly

This leaks a coarse content category, a client name, and IP-correlated open activity to the operator. It is metadata, not content, and the operator still cannot read a single byte of any relic. But it is a real reduction from "the operator knows nothing" to "the operator knows what kind of thing you published and roughly how often it was fetched." It must appear in a published privacy statement. Per [[abuse-liability-of-hosting-uninspectable-content]], upload IP and timestamp are already retained for abuse response, so the IP-correlation cost is largely pre-existing.

**This does not conflict with the no-analytics rule on the viewing origin.** Every item is captured by the server at publish or at signed-URL mint. No script runs on the viewing origin to produce any of it. Do not read this decision as license to add one.

## The general principles for later stations

1. **A success metric that cannot be computed under the architecture that produced it is not a metric, it is a wish.** When a station locks a constraint that makes a metric unmeasurable, the station owning the metric must either state the telemetry that restores measurability and its cost, or change the metric. Silently keeping the unmeasurable metric is the failure mode.
2. **A mitigation with an undocumented failure direction is worse than no mitigation**, because it converts a known unknown into false confidence. Whenever you name a mechanism that partially solves a problem, name what it misses in the same breath. Apply this recursively: it is what turned "add a discriminator" from an unfalsifiable instruction into a checkable one.

- **renderer-class-is-a-security-boundary-not-a-label** — The frame's seven-value renderer taxonomy (`markdown`, `code`, `html`, `image`, `media`, `archive`, `binary`) was introduced as telemetry. **It is a publisher assertion, and it must never route the viewer.** Every gap or misuse here is a potential key-disclosure path.

## CORRECTION to an earlier version of this topic

An earlier version of this entry concluded "the class selects the renderer, the sniff can only downgrade," and argued that was safe if the class lived inside the ciphertext where it is publisher-attested and tamper-evident under the AEAD tag. **That reasoning was wrong and the conclusion was dangerous.**

Publisher-attested means the *operator* cannot forge it. It does not mean it is *true*. A malicious publisher signs an honest-looking lie. Declaring `image` on an HTML payload wins inline rendering on the viewing origin, which is the origin holding the fragment secret, and the content reads `location.hash`. **That is the fragment-stealing attack in a single step, and it is what "the class selects" permits.**

The tamper-evidence argument answers the wrong threat. The threat is not the operator lying about the class; it is the publisher lying about it.

## The rule

**The class is telemetry and nothing else. The viewer never routes on it.**

Routing comes from magic-byte sniffing after decryption, treated as a hint that can only reach a *less* privileged path, plus the following disagreement rule:

**When the declared type and the sniffed type disagree, route to the least privileged path either type would allow, and tell the recipient you did so.** A file declared `.png` that sniffs as HTML is not rendered as an image (it is not one) and not rendered as HTML (HTML gets a separate origin, and the publisher did not declare it). It is download-only with a visible note that the contents do not match the name. One sentence, and it closes the entire polyglot class for the first release.

Privilege ordering, least to most: download-only, then sandbox origin, then viewing origin.

## SVG is download-only in the first release

SVG has no magic number and sniffs as XML or text, so it cannot be sniff-routed at all. Its execution is context-dependent: inert under `Content-Disposition: attachment` and inside `<img src>`, but inline, as `<object>`, or via direct navigation it **fully executes** (https://digi.ninja/blog/svg_xss.php). Real advisories from exactly this shape: Traccar GHSA-mc2g-mjqh-8x78, 2FAuth GHSA-q5p4-6q4v-gqg3, FileRise GHSA-35pp-ggh6-c59c, Plane GHSA-rcg8-g69v-x23j.

**A spec that says "still images render inline" without carving out SVG ships the CVE.** Sandbox-origin rendering for SVG is available later.

## Blob URLs inherit the creating origin

`URL.createObjectURL(new Blob([plaintext], {type: sniffedType}))` on the viewing origin creates a same-origin resource with an attacker-controlled MIME type. **Navigating to it executes on the origin that holds the key.**

- Never navigate to, and never open in a new tab, a blob URL built from untrusted plaintext on the viewing origin.
- Download blobs are always typed `application/octet-stream` and triggered via an `a[download]` attribute.
- Images render only via `<img src=blob:>`, where parsing is inert.

## Markdown is a partial HTML class

Markdown permits raw inline HTML, so rendering `markdown` on the viewing origin puts sanitizer output next to the fragment secret. DOMPurify has been bypassed at **default configuration** as recently as CVE-2026-41238 (3.0.1 through 3.3.3, https://labs.trace37.com/blog/dompurify-pp-ceh-bypass/). In strength order:

1. **Strip raw HTML from Markdown entirely in the first release**, or render Markdown on the sandbox origin exactly like HTML. Sanitization is the second layer and must never be the only one.
2. Pin DOMPurify at or above 3.4.0 regardless.
3. **Read the fragment once into a variable, then `history.replaceState` it out of the address bar**, so a sanitizer bypass finds no `location.hash` to read. Cheapest insurance in the viewer.

Markdown link and image targets are attacker-controlled too (`javascript:`, `data:`, remote images). A remote image is both an exfiltration channel and a beacon revealing that a specific relic was opened.

## Code and plain text: the safe class, two traps

Syntax highlighters take a language hint usually derived from the attacker-controlled extension, and some build HTML by string concatenation. Build highlighted output as DOM text nodes or sanitize it like Markdown, and fall back to plain text on an unrecognized hint. Separately, a "code" file can be many megabytes on one line, which hangs the highlighter and freezes the tab; cap the highlighted region and render the remainder as plain text behind a stated cutoff.

## Where the security headers actually matter

The object fetch goes client-to-GCS on a signed URL, so **the app server cannot set headers on it at all** (a direct consequence of ciphertext never transiting the app server). What GCS serves is ciphertext, indistinguishable from random and unsniffable into anything executable, so `nosniff` and friends guard almost nothing there. **The headers that matter are the viewing origin's own responses and the blob URLs the viewer creates.** Stating this stops a later station spending effort on bucket headers that guard nothing while skipping the viewer-side ones that guard everything.

## Related consequences

- **Reserved path segments.** With `/{id}` at the root, `/abuse`, the policy URL, and `robots.txt` are reserved words that must be excluded from the id alphabet, or an issued id can shadow the abuse page, the one page the preconditions make a go/no-go obligation.
- **The taskbar and content are on different origins by construction**, so the content iframe is never full-viewport and a relic authored to fill the screen renders letterboxed. Product-visible; state it before someone finds it in review.
- **Unknown class values fail to download-only**, never best-effort, so a client newer than the viewer degrades safely.
- **`postMessage` to the sandbox uses an exact target origin, never `"*"`.** A `postMessage` with target `"*"` carrying a decrypted relic hands the whole plaintext to whatever occupies that frame, which is worse than leaking one relic's key.
- **The filename is content, not a category.** Server-side storage of it exceeds the frame's conceded leakage (`Q3-layoffs-final.xlsx` is not a coarse class) and routes back to `frame` as drift per [[shape-inherited-constraints-from-frame]]. It is also the most likely *quiet* frame violation, because putting the filename in the grant response is the obvious way to show a name in the taskbar before decryption finishes.

- **rendering-untrusted-content-origin-isolation** — Rendering attacker-controlled content is the part of Relic most likely to become a CVE. These constraints are non-negotiable for any run that touches the viewer.

**The precise threat.** If attacker HTML executes on the viewing origin, it can read `window.location.hash` (the decryption secret), read `localStorage`/`IndexedDB`, register or hijack a ServiceWorker for the whole origin, and render a pixel-perfect Relic-branded phishing page on a domain the recipient was told to trust. Each is worse than ordinary XSS.

**Origin isolation is the first layer; sanitization is the second.** Google's pattern is separate isolated origins (`*.googleusercontent.com`) — they treat XSS *inside* a sandbox domain as an invalid bug report, which shows how completely they rely on the origin boundary (https://security.googleblog.com/2012/08/content-hosting-for-modern-web.html, https://bughunters.google.com/learn/invalid-reports/web-platform/xss/6619189462433792/xss-in-sandbox-domains). The authoritative current guidance is https://web.dev/articles/securely-hosting-user-data.

- **Inactive content** (images, downloads, binaries): serve from the main domain with `X-Content-Type-Options: nosniff`, `Content-Disposition: attachment`, `Content-Security-Policy: sandbox`, `Content-Security-Policy: default-src 'none'`, `Cross-Origin-Resource-Policy: same-site`.
- **Active content** (HTML, SVG): use a **unique cross-site domain per piece of content** (`$RANDOM.exampleusercontent.com`), with the parent registered on the **Public Suffix List**, then `postMessage` the content to a static shim that renders it in a sandboxed iframe as a Blob. This isolates individual relics from each other, not just relics from the app. PSL registration is a real, slow external dependency — start it early.

Anthropic's Artifacts do exactly this: each artifact runs in a sandboxed iframe on a `*.claudeusercontent.com` origin, walled off from `claude.ai`, plus a restrictive CSP (https://code.claude.com/docs/en/artifacts).

**The `sandbox` attribute trap.** Never set both `allow-scripts` and `allow-same-origin` on untrusted content. With both, the framed script can reach `window.parent`, or simply **remove the `sandbox` attribute from its own iframe element and reload**, dropping all restrictions (https://danieldusek.com/escaping-improperly-sandboxed-iframes.html). The `Content-Security-Policy: sandbox` **header** applies to the whole response and cannot be stripped by the framed document, which makes the header strictly stronger than the attribute.

**Markdown sanitization.** `marked`'s `sanitize` option is deprecated and removed; the documented pattern is `DOMPurify.sanitize(marked.parse(input))` (https://marked.js.org/). `rehype-sanitize` is the choice inside a unified/rehype pipeline. But DOMPurify has been bypassed repeatedly and recently: **CVE-2025-26791** (mXSS via template-literal regex with `SAFE_FOR_TEMPLATES`, fixed 3.2.4) and **CVE-2026-41238** (config-parser fallback inheriting from `Object.prototype`, turning any prototype-pollution bug into full XSS bypass — affects **3.0.1 through 3.3.3 at default configuration**, https://labs.trace37.com/blog/dompurify-pp-ceh-bypass/). 3.4.0 fixes prototype pollution, mXSS, and a filter bypass. Config traps: over-permissive `ALLOWED_URI_REGEXP` re-enables `javascript:`; `ADD_URI_SAFE_ATTR` whitelists attributes out of sanitization. The recurring bypass shape is mXSS plus comments inside attribute values (https://portswigger.net/research/bypassing-dompurify-again-with-mutation-xss).
**Conclusion: pin DOMPurify ≥ 3.4.0, and never let sanitization be the only thing standing between an attacker and the secret.**

**SVG-as-image.** The rendering context decides execution. `Content-Disposition: attachment` → inert. Inside `<img src>` → parsed, no script or event-handler execution. Inline, as `<object>`, or via **direct navigation to the URL** → **fully executes** (https://digi.ninja/blog/svg_xss.php). Real advisories from exactly this: Traccar GHSA-mc2g-mjqh-8x78, 2FAuth GHSA-q5p4-6q4v-gqg3, FileRise GHSA-35pp-ggh6-c59c, Plane GHSA-rcg8-g69v-x23j.
**Rule: render SVG only inside `<img>` from a blob URL, or rasterize it, or treat it as active content on the sandbox origin. Never navigate to it.**

- **sandbox-csp-decision-and-what-the-wedge-actually-is** — **Decision: the sandbox origin serves a strict CSP that blocks outbound requests. Relic matches Artifacts here rather than loosening.** Made at the `specify` station, overridable by the operator.

## The fork

Origin isolation stops sandboxed content reaching `location.hash`, structurally. It does **not** stop attacker HTML making outbound requests. A sandboxed iframe with `allow-scripts` on a cross-site origin can still `fetch()` to an arbitrary host and exfiltrate the relic's own plaintext, which the recipient was allowed to see and a third party was not.

- **Strict (`default-src 'none'` / `connect-src 'none'`):** rendered HTML cannot phone home. Every HTML relic with an external image, stylesheet, or font breaks. This is what Anthropic picked: Artifacts run in a sandboxed iframe on a `*.claudeusercontent.com` origin with a restrictive CSP blocking external requests (https://code.claude.com/docs/en/artifacts).
- **Permissive:** HTML relics render richly, and every HTML relic can exfiltrate its own plaintext to any host.

The apparent problem: **Relic's wedge is rendering, so if it matches Artifacts' CSP the HTML half renders exactly as well as Artifacts and no better.**

## Why strict is nonetheless correct

**The wedge was never "richer HTML." It is breadth of type.** Per [[claude-artifacts-capability-boundary]], Artifacts accepts only `.html`, `.htm`, and `.md`, caps at 16 MiB, is off by default in Agent SDK, GitHub Action, and MCP-server contexts, and cannot publish at all from an API-key session. Relic's uncontested ground is rendering the things Artifacts **refuses to accept**: code with syntax highlighting, images, and later archives and seekable media, from clients that have no publish path at all.

On HTML specifically, Relic ties with Artifacts under a strict CSP. That tie costs nothing the wedge depended on, because a developer reaching for Relic to publish HTML from a GitHub Action was never choosing it over Artifacts on render quality. They were choosing it because Artifacts was not available to them.

Loosening, by contrast, ships an exfiltration channel Artifacts does not have, in a product whose entire permission-slip story is that content stays private. **A privacy product that renders slightly nicer HTML by adding a data-exfiltration path has traded its actual differentiator for a cosmetic one.**

## What follows

- Self-contained HTML renders fully. HTML depending on external assets renders degraded, and **the viewer must say so** rather than silently showing a broken page. That is a required behavior, not a nicety.
- Inline everything is the guidance for publishers, the same constraint Artifacts users already work under.
- If this is ever revisited, revisit it as a **wedge** decision with the operator, not as a CSP tuning task, because the cost is measured in privacy posture rather than in rendering fidelity.

## The related boundary rules this sits with

- **Never both `allow-scripts` and `allow-same-origin`** (see [[rendering-untrusted-content-origin-isolation]]). Mandate the `Content-Security-Policy: sandbox` **header** on the shim's own response, not merely the iframe attribute: the header applies to the whole response and cannot be stripped by the framed document, which makes it strictly stronger.
- **Message direction is forced, not chosen.** The main origin fetches, decrypts, and posts plaintext to the shim. The shim is truly static and never touches ciphertext or the network. The alternative (sandbox fetches, parent posts it the key) would require the key to cross the boundary, which is the one thing that must never happen.
- **The handshake:** the shim posts a data-free `ready` to `parent` with `targetOrigin: '*'`, the parent replies with the payload and an **exact** `targetOrigin`, and the shim pins `event.origin` from that reply. The `'*'` is safe only because the ready message carries nothing. The payload message must never use `'*'`. With per-relic subdomains the shim's expected parent origin is fixed and hardcodable, while the parent's `targetOrigin` is computed per render.
- **Transfer, do not copy.** Post plaintext as a transferable `ArrayBuffer`. Structured-cloning a large payload doubles memory, and large payloads are the wedge's whole premise.
- **The download Blob is materialized by the main origin**, not the sandbox, so the download affordance never lives inside the untrusted frame.

- **shape-inherited-constraints-from-frame** — Constraints and open values the `frame` station deliberately left for `shape`, plus two cross-document interactions that are invisible inside either document alone and will collide if `shape` picks values independently. Surfaced by the value audit reading both locked artifacts in one tree.

## Two interactions that will break silently if picked wrong

**1. The retention window must outlive the TTL.** The success metric's baseline confound filter compares a viewer's requesting IP against the relic's publishing IP, which requires that IP still be on record at open time. `docs/preconditions.md` mandates a published retention window for upload IP plus timestamp but deliberately sets no value; `docs/frame.md` mandates a TTL but sets no value either. **If the retention window is shorter than the TTL, the filter silently stops firing on older relics** and the metric's first clause degrades with no alarm. Neither document can catch this, because neither contains a number.

**2. Decide explicitly whether a refused mint counts as an open.** The per-object download cap, the per-IP download rate limit, and the frame's open counter all read the same mint log. Neither document says whether a rate-limited or cap-refused mint increments the metric. **Getting this wrong inflates the metric's first clause**, which is the clause already carrying a permanent confound (see [[relic-telemetry-trade-and-measurability]]).

## Values `frame` left open on purpose

Every one of these is deliberately unset so `shape` can decide, and every one is currently unconstrained by any number in either locked document: the TTL ceiling, the signed-URL validity window, the hard size cap, the global egress spend ceiling, and the per-object download cap. Note that **the real bound on how long a relic circulates is TTL plus signed-URL validity**, not TTL alone, because a URL minted a second inside the ceiling stays valid for its own lifetime.

## Hard constraints `shape` inherits and may not quietly settle

- **Range-decryptable wire format is required.** The value case includes in-page archive browsing and seekable media even though neither ships in the first release. The framing choice is irreversible once content is encrypted (see [[archive-browsing-and-mimetype-detection]]). This is a constraint on reversibility, not a request to build the feature.
- **Ciphertext never transits the app server.** `docs/frame.md` locks only the download leg (its telemetry counts opens at signed-URL mint). The publish leg is stated as a precondition in `docs/preconditions.md` section 4, because four of that document's sharpest limit clauses are structurally made of the server being outside the data path. **Deviation routes back to `frame` as drift**, not to a `shape` decision.
- **The size cap only holds with a grant carrying a signed size constraint.** A plain signed PUT does not bound body length (`Content-Length` is ignored), so choosing the convenient grant shape turns the cap into a client-side suggestion, present in the code and absent on the wire. Which grant shape is `shape`'s call; that the chosen one enforces size is not.
- **Rate limiting returns `429`, never `401` or `403`** (see [[mcp-protocol-2026-07-28-constraints]]).
- **Untrusted content renders on a separate origin**, and the viewing origin carries no third-party scripts, analytics, or error reporting. Note the trap the frame station found late: **a bundled first-party-served SDK satisfies `script-src 'self'` and presents no external host to scan for**, so neither a CSP fetch nor a third-party-host scan catches it. Sentry's browser SDK is exactly that shape.
- **GCS soft delete is a bucket-level decision that must be made before the first deploy** (see [[gcs-soft-delete-and-what-deletion-actually-means]]).

## The observability bill `shape` inherits

Keeping the server out of the data path costs three things the operator then cannot see: upload rejection counts, bytes actually served, and hash comparison at the door. The audit verified `docs/frame.md` makes no claim on any of the three (its egress condition reads the billing export, not bytes served), so the preconditions do not invoice the frame for anything it claimed. **Preserve that discipline: if `shape` adds a claim that depends on one of those three, it is reintroducing the defect class in [[unobservable-quantities-are-this-projects-failure-mode]].**

- **substance-floor-calibration-rule** — How this run sets `substance-floor` quality gates on doc units, frozen at `specify` round 3 after two reviewers spent two rounds disagreeing because neither rule was written down.

**The counting rule (testability's, adopted station-wide).** Count one mandated item for every distinct thing the unit obliges the document to contain, regardless of the markup expressing it. The union of: every top-level list item under "What this document must decide", whether `- ` or `1.`; every item named in that unit's "Route to `shape`" section, counting the semicolon-separated list, since the routing criterion makes routing a required resolution; and every enumeration a numbered completion criterion requires to be complete and that is not already counted. Do **not** count "Already decided" items, which are constraints to honor rather than content to produce.

**Why a bullet-counting rule fails.** completeness's original rule counted `- ` bullets only. It agreed with the markup-based count on the two units written entirely in bullets and diverged on the one using a numbered list, undercounting `spec-service-surface` by its five numbered disclosure items plus seven route items plus a twelve-case enumeration. A rule that reads formatting rather than obligation produces a wrong answer on whichever unit happens to use a numbered list, and the error is invisible because it looks like a merely finer-grained disagreement.

**The rate.** 60 to 85 words per mandated item, observed across this run's completed artifacts. Large embedded enumerations run leaner, roughly 25 words per case.

**The placement rule.** The floor goes at or just below the band bottom, never mid-band. It is a stub guard, not a completeness signal. Completeness is carried by the numbered completion criteria, which is where a document that clears the word count while genuinely incomplete gets caught. A mid-band floor creates padding pressure, which is the opposite of what the gate is for.

**The arithmetic on record, corrected.** The four floors as shipped, against testability's bands: format 1600 against 1620 to 2295; publish 2200 against 2280 to 3230; viewer 2600 against 2580 to 3655; service 2800 against 2810 to 3835. Three of the four sit just below their band bottom and viewer sits 20 above. **All four are placed by the at-or-just-below rule.** An earlier resolution note justified service's 2800 as "inside both reviewers' bands," which is wrong: 2800 is inside completeness's 2460 to 3485 but 10 below testability's 2810. The number is right and the stated reason was not. Placing by the rule is coherent; placing by "inside both" is not, and the two rules happen to agree on three of four units, which is exactly how a wrong reason survives.

**The failure this exists to prevent.** A floor set in a unit's frontmatter gate and a different floor argued in its body prose. Only the gate runs, so the prose is decoration that misleads the worker about how much the unit actually mandates. All four `specify` units now carry the same four elements in criterion 2: the gate value, the item count under this rule, the resulting band, and an explicit statement that the floor is a stub guard and never to pad to clear it. Keep that shape at later stations, and when a floor moves, move the prose in the same edit.

- **unobservable-quantities-are-this-projects-failure-mode** — **Relic's specific, recurring authoring defect is claiming a number the system cannot actually produce.** It was caught four times in a single document, by four different readers, three of them after an explicit sweep for exactly this. Treat it as the default suspicion on any measurable claim in this project, not as a thing that might happen.

## Why this project in particular

Relic's architecture forbids most of the obvious observation points. The server holds only ciphertext and never receives the key. Mimetype sniffing happens after decryption, in the browser. The viewing origin carries no analytics, because any same-origin script can read `location.hash`. There are no accounts. So the set of things the operator can actually observe is small and non-obvious, while the set of things it feels natural to write is large. Every gap between those two sets is a defect that reads as a fact.

## The four instances, as a pattern library

1. **A quantity requiring a capability that is an explicit non-goal.** A draft trust condition read "100 relics per week from more than one publishing **account**." Accounts are a non-goal. The document named a thing the product does not have.
2. **A quantity the architecture forbids observing.** The original success metric required the mimetype of *opened* relics, which is knowable only after in-browser decryption, on an origin where no script may run.
3. **A quantity where one half is observable and the other is not.** A condition claimed the headless/CI versus non-Claude client split was computable from the publishing client name. A Claude Code run inside a GitHub Action reports the same client name as an interactive one, so the non-Claude half computes and the headless/CI half does not.
4. **A quantity observable only from inside a third party.** A condition claimed the service domain staying unflagged by "Safe Browsing, VirusTotal consensus, and the major mail-gateway blocklists" was checkable on a schedule. The first two answer a scheduled query. **A block inside a single company's mail tenant is invisible from outside**, and surfaces as a recipient reporting a dead link rather than as a check going red. This was the worst instance, because that condition's consequence is "shut it down," so a false sense of detection is the most expensive possible blind spot.

Note the progression: each instance was subtler than the last, and instances 3 and 4 are *partially* observable, which is exactly why they survive review. A wholly fabricated metric gets caught. A half-true one does not.

## The rule

**Every claim of the form "we can measure X" must name the mechanism that produces X, and that mechanism must be one the locked architecture actually permits.** Where a quantity is partially observable, state which half is not, in the same breath as the claim. Never let a partially observable quantity read as fully observable.

The sweep is not optional and not incidental: enumerate every quantity in any measurement claim, and for each one name the exact server-side event or record it comes from. If you cannot name it, the claim is defective regardless of how reasonable it sounds.

## A design detail worth carrying forward

**The publishing-IP filter is a no-op for the headless and CI segment.** A CI runner's egress IP will never match a human viewer's, so the filter either fails in the safe direction or does not fire at all. Harmless, and the publisher-versus-recipient confound barely applies to that segment anyway, because there is no publisher sitting at a phone to self-check their own link. Worth knowing when a later station tunes the 120-second post-publish exclusion window (see [[relic-telemetry-trade-and-measurability]]), since the window is doing all the work for interactive publishers and none for CI ones.



When discovery surfaces a durable project fact worth carrying into **future** runs — a constraint, prior art, a convention, a trap — persist it with **`darkrun_knowledge_record`** (`topic` + `body`). That's the project's shared memory; re-recording a topic updates it. Keep it project-level (cross-run truths), not this run's transient details.

## decompose — once elaboration + discovery have both landed

Turn the framed, explored problem into the smallest set of independently completable **Units** that, together, kill the risk above. A Unit's **body is the spec the executing subagent works from — it gets no other context**. A one-line body is a slug, not a definition; the work that comes back from a thin Unit is thin.

Write every Unit with `darkrun_unit_create`, with the full anatomy:

- **`body`** — the real definition, in markdown:
  - the goal: what this Unit produces and why it exists in this station,
  - **completion criteria, EACH paired with the literal command that verifies it.** Inspect the project's manifest (`Cargo.toml` / `package.json` / `pyproject.toml` / `go.mod` …) *during decompose* and write commands against THIS project's actual stack — never a placeholder.
    - Good: "all endpoints return correct status codes (200/400/401/404)" → `cargo test -p api contracts` exits 0.
    - Bad: "API works correctly", "tests are written" — no check, no criterion.
  - for build-class Units: the **success path, the failure path, and the edge cases** the criteria must cover,
  - for knowledge/document Units: substantive criteria — what claims the artifact must ground, with sources,
  - the **files touched** (so review knows the blast radius),
  - what is explicitly **out of scope** (so the Unit doesn't sprawl).
- **`depends_on`** — every cross-Unit prerequisite, DECLARED, never left in prose. The wave scheduler sequences **only** on `depends_on`; a dependency mentioned in the body but not declared is invisible — the Unit gets co-scheduled with its own prerequisite and handed inputs that don't exist yet. A body that says "stub it until unit-X lands" is the symptom of a missing `depends_on` edge: declare the edge instead of writing the stub.
- **`inputs` / `outputs`** — the paths consumed and produced. A sibling-produced input path requires that sibling in `depends_on`.
- **`quality_gates`** — executable `{name, command}` checks proving the criteria. Required for any Unit that declares outputs. Each gate must pass **in the Unit's own isolated worktree at the time it runs** — a gate that needs a sibling's unmerged code, with no `depends_on` edge to order it, is not a gate, it's a Unit scheduled to fail. Circular gates (zero-match `! grep`, prose substrings against the Unit's own output) are rejected.
- **`model`** — match the tier to the risk: `opus` for architectural, cascading-failure, or deepest-reasoning work, `sonnet` (default) for known patterns plus judgment, `haiku` only for purely mechanical edits.


There are no Units yet. You are creating them.






## Done when

The spec names the risk, lists Units with testable completion criteria and dependencies, marks what's out of scope, and it's written to the station's spec artifact. Then call `darkrun_tick`.

---

# Provider contracts in effect

The project configures external-system providers whose behavior contracts apply to this phase. Follow them alongside the instructions above.

# Git Provider — Behavior Contract

darkrun is always git-backed when a `.git/` directory is present. This contract is **always active** in git environments — no settings activation needed.

## What you, the agent, must do

- Never run `git checkout`, `git merge`, `git branch -d`, or create branches manually during run operations. The engine owns branch topology, merge semantics, worktree creation, and station-branch enforcement.
- Commit substantive work (unit body edits, artifact writes, source changes) before calling `darkrun_tick` — the pre-tick clean-tree gate blocks the tick on loose agent work and hands the file list back. The engine commits its own `.darkrun/` state on every tick; it does NOT author your commits.
- **Never pair a VCS issue-closing keyword with a feedback id.** GitHub and GitLab parse `Closes`/`Fixes`/`Resolves`/`Implements` followed by an issue-shaped token as an external-issue closing reference — `Fixes fb-07` in a commit message or PR description renders a phantom closing link for a finding that is not a ticket. Use neutral phrasing — `addresses fb-07`, `per fb-07` — never a closing verb.
- Treat `git push` failures as non-fatal — the engine retries on the next tick. Don't block on a transient remote outage.
- If a station's gate is `external`, the engine watches for the PR merge signal. Don't flip frontmatter to fake the signal — the human's merge IS the decision.

## Branch architecture (read-only fact you operate against)

- **Run branch** `darkrun/<slug>/main` is the durable record. The engine commits state changes here and pushes on every tick (commit early, push often). The run's **delivery draft PR** opens against the project's default branch at run start and the engine flips it ready-for-review at seal.
- **Station branches** `darkrun/<slug>/<station>` accumulate station-scope work, synced downstream and landed by the engine.
- **Unit worktree branches** `darkrun/<slug>/units/<station>/<unit>` isolate each unit's diff — local-only, landed back onto the station branch when the unit locks.

## external_refs handling

The delivery PR's URL is stamped on `run.md` as `external_refs.pr_url` with its draft/ready status in `external_refs.other.pr_status`. You don't write these fields manually — the engine does — but you can read them to surface PR state to the operator. In DISCRETE mode the engine also opens a per-station draft PR at the station's external gate (recorded on `Station.pr_ref`); merging it is the approval.

## Proof asset uploads

Runtime-verification proof (screenshots, transcripts) is regenerated every run — attach it durably with `darkrun_proof_attach`, which records it on the run's proof ledger and posts it to the station's change request when one exists. Keep uploads idempotent — replace a re-run's proof rather than stacking duplicates.

## Non-git environments

When `.git/` is absent the engine falls back to filesystem persistence: no commits, no pushes, no worktrees, and `external` gates degrade to `ask` (there's no structural merge signal to enforce them). All run operations still work; this contract simply doesn't apply.