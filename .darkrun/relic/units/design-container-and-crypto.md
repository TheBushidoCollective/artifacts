---
name: Decide the container framing, the key material, and the reference implementation
unit_type: ''
status: in_progress
depends_on: []
worker: ''
model: opus
station: shape
inputs:
- frame.md
- spec.md
outputs:
- docs/design/container.md
- docs/design/container.sources.txt
branch: darkrun/relic/units/shape/design-container-and-crypto
started_at: 2026-07-30T11:15:50.599322+00:00
iterations:
- worker: designer
  started_at: 2026-07-30T11:15:50.599322+00:00
  completed_at: 2026-07-30T11:15:50.599322+00:00
  result: advance
  note: |-
    `docs/design/container.md` (5,605 words) and `container.sources.txt` (13 URLs) committed at `651920d`. Worktree clean.

    **Gates re-run independently by the manager:** artifact-exists PASS; substance-floor 5605 against 2400; sources 13 against 6; all 13 URLs resolve; zero dashes; `AES-128` present twice. **Also verified: `format.md` 4.4 and 4.6 are genuinely not decided** (every hit is either the explicit disclaimer or a stated need naming storage as owner), and sibling-obligation phrasing returns zero.

    ## Decisions the siblings consume

    IKM **16 octets**, cipher **AES-128 either way**, restating 4.2 out of its category error. ID entropy **125 bits, 25 Crockford characters**. Bucket padding **refused**, minimal only. `rs` **4096**, with the envelope header a fixed block of exactly `rs - 17` octets. Writer is **JavaScript**, one implementation shared by binary and viewer.

    ## It generated evidence rather than asserting it

    **It reproduced RFC 8188 §3.1 end to end from IKM and salt on Node.** Derived CEK, nonce, and the full encrypted body match the RFC's published base64url byte for byte. It also enumerated all 256 final-octet values to confirm the terminal character set is exactly `{A, Q, g, w}`, and round-tripped the size derivation at ten content lengths.

    Two things fell out that a later harness would have tripped on: **the RFC's own stated `Content-Length: 54` is wrong and the body is 53 octets** (errata held for document update since 2018, manager-confirmed at line 385 of the raw RFC), and two 2025 errata claiming both vectors omit the final padding delimiter were rejected in 2026, which its reproduction independently confirms.

    ## It withdrew an argument in its own favour, in writing

    **The 16-byte implementation-cost argument in the brief and in the knowledge topic does not survive, and it says so rather than using it.** Both claimed a 32-byte IKM forces you to drive `lib/ece.js` directly. Reading the source: section 5 drives `lib/ece.js` directly regardless, because the `Keychain` facade passes no `rs` and is pinned to 65536 in all three directions, and `lib/ece.js` imposes no key-length constraint at all. So the 16-octet decision now rests only on the cryptographic argument, that HKDF's output is fixed at 16 octets so the CEK caps at 128 bits and a wider IKM raises the cost of an attack nobody has reason to mount. **The convenient argument was removed so the challenge pass attacks the real one.** Treat the knowledge topic's version of that claim as corrected here.

    ## What the challenge pass should attack, in the beat's own ranking

    1. **`rs = 4096` is the weakest decision.** `format.md` 3.1's "record 0 alone" makes the envelope a full record, so `rs` is a fixed per-relic tax: 4,079 octets at 4096 against 65,519 at the library default. It weighted the small-relic case (a 2 KB relic is 97 percent padding at 65536) over per-record overhead (0.415% against 0.026%) and AEAD call count (25,708 against 1,602 per 100 MB). **The counterargument it could not dismiss:** 64 KB per relic is roughly $4 per 100K relics at five opens each, and 16x the WebCrypto calls is a real cost on exactly the large payloads the wedge exists to carry. **16384 as a middle is a defensible attack.** Its mitigation is that `rs` is per-object and readers are header-driven, so the default moves later at zero cost to existing relics.
    2. **The deep import.** `wormhole-crypto` 0.3.1 has no `exports` map, so `lib/ece.js` resolves today and breaks if upstream adds one. Version pinned, vendoring named as the remedy. **A reviewer arguing that vendoring 13 KB of MIT code now is correct for a format that can never change has a strong case, and the beat says it would not fight hard.**
    3. **The fixed `rs - 17` envelope block**, which costs 3,548 octets of zero fill in the worst case at 4096. If someone shows a short record 0 the stock encryptor can emit while satisfying 3.1, the whole `rs` argument gets cheaper.
    4. **125 bits over 122** was picked on encoding alignment, not security: Crockford zero-extends 122 to 125 anyway, which would make every ID's first character range over only 4 of 32 symbols. The beat calls this aesthetics dressed as arithmetic and would rather it be named than defended.
    5. Filename and mimetype caps at 255 octets each; the mimetype figure is judgment against a longest real IANA type near 65 characters.

    ## Quotation audit, and a third false-negative mode the checker must handle

    **35 quoted strings, 35 verbatim, 1 corrected.** The correction is instructive: `format.md` 4.2 was quoted as "key length, 128 or 256 bits" where the actual text is **"Key length. 128 or 256 bits."** Caught by a sweep over every double-quoted run rather than by the claim list, which is the argument for the sweep. It also restructured two RFC quotations where it had substituted single for double quotes around `"aes128gcm"` and `"salt"`, before they could read as defects.

    **A false-negative mode not in `citation-defects-and-the-three-checks-that-catch-them`, and the manager confirmed it.** The quotation "random access to specific parts of encrypted data could be confounded by the presence of padding" returns **zero hits under the full documented normalization** and is verbatim. It spans an **RFC page break**, so the raw text interposes a form feed, a `[Page N]` footer, and a running header between two words. Manager reproduction: 0 hits after rejoin-then-collapse, 1 hit after additionally stripping form feeds and running headers.

    **This means the recorded procedure is insufficient as written against the source type this run cites most.** RFC 8188 alone is 899 lines with many page boundaries. A checker must strip form feeds and RFC running headers and footers before matching, or it manufactures a fabrication accusation against any quote crossing a page. Being recorded into the knowledge topic separately.

    ## One cross-document need, stated in sibling form

    Refusing bucket padding discharges `format.md` 3.3's minimal-padding qualifier, which is the stated reason `viewer.md` 5 withholds a pre-decryption byte count. That reason no longer applies at version 1. The document states the fact and the behaviour either way and names `design-product-surface` as owner without telling it what to do. This is a third instance of the class in `cross-document-gaps-no-criterion-catches`.
- worker: pressure_tester
  started_at: 2026-07-30T12:03:22.040226+00:00
  completed_at: 2026-07-30T12:03:22.040226+00:00
  result: advance
  note: |-
    Eleven findings against `651920d`, plus verdicts on all five weaknesses the make pass nominated. Scripts in the scratchpad (`repro31.mjs`, `repro32.mjs`, `arith.mjs`, `bench.mjs`, `quotecheck.py`).

    **The make pass's central evidence survives independent reproduction.** RFC 8188 §3.1 re-derived from IKM and salt: PRK, CEK `_wniytB-ofscZDh4tbSjHw`, NONCE `Bcs8gkIRKLI8GeI8`, and the full 53-octet body all match byte for byte. Errata status confirmed live.

    **Manager-verified the three most consequential findings before recording.**

    ## Must fix

    1. **The mandated §3.2 writer gate is unpassable by a conforming Relic writer.** §3.2 uses **discretionary** padding: the RFC states "there are 7 octets of message in the first record and 8 in the second." A minimal-padding encryptor slices at `rs - 17 = 8`, so it puts 8 in record 0. The beat built both: the 7/8 split reproduces the published body exactly, the 8/7 split does not. **Manager-confirmed against the raw RFC.** So §3.2 is decrypt-only, and section 4's minimal-padding mandate makes the §3.2 encrypt assertion fail by construction. The three implementer notes cover the `keyid`, `Content-Length`, and delimiter wrinkles but not the one that actually breaks the harness. Fix: state §3.1 as the round-trip vector and §3.2 as decrypt-only, or run the §3.2 encrypt assertion against the RFC's stated 7/8 split.

    2. **"roughly 17.5 petabytes" is wrong by a factor of 1000 and inverts the ordering of two ceilings.** 2^32 x 4,079 = 17.5 **terabytes**. **Manager-confirmed:** 17,519,171,600,384 octets, and against the RFC's 398 TB safe-encryption limit the record ceiling is **22.7x tighter, not three orders looser**. Holds at every `rs` considered; crossover at `rs >= 92,684`. Neither binds at any plausible cap so the conclusion is safe, but rules 8 and 9 present the binding constraint as the slack one, in a document that can never change.

    3. **Two byte-layout tables both head a column "Octets 0 to 20" in different coordinate systems.** 1.1 is absolute object offsets; 3.2 is offsets inside record 0's decrypted plaintext. Both exactly 21 wide, offset from each other by exactly 21. Prose disambiguates, tables do not. For a document whose stated job is that an implementer can write a parser from it, and whose premise is that a writer bug is permanent, this is the highest-consequence presentation defect available. Label 3.2's column.

    4. **The quotation audit is not 35 of 35.** Two deviations, both manager-confirmed. `"unknown fields are refused rather than ignored"` against `format.md`'s **"Unknown** fields...", a case-altered initial letter, **which is the identical class the beat caught and corrected on 4.2 and then shipped again three sections later**. And the RFC 8188 4.3 nonce quote elides `[RFC5116]` and moves the period inside. Both benign in meaning; criterion 9's standard is verbatim and the report of "35 verbatim" is overstated. **No mode-3 fabrication exists**, confirmed by a full sweep with page-furniture stripping (31 lines removed from RFC 8188, matching the recorded 16 page boundaries).

    5. **An overstatement favouring the chosen option, which is this run's recurring failure mode.** The document calls rust-ece's "We do not support customizing the record size parameter during encryption" individually disqualifying because it forecloses both the record size and the envelope block. The next README sub-bullet, unquoted, reads "The default record size is 4096 bytes", which is exactly what section 3 decides, and the envelope block needs no `rs` customization since it is ordinary plaintext. **It forecloses neither.** The rejection stands on the other grounds, and the random-padding line genuinely is disqualifying.

    ## Should fix

    6. **The cap conversion silently refines a locked document.** Section 4 writes `encryptedSize(cap + (rs - 17), rs)` where `format.md` 3.11 writes `encryptedSize(published_plaintext_cap)`. **The document is correct and the locked version is incomplete**, but it lands as an aside rather than a flagged refinement, and "cap" is left ambiguous between content octets and plaintext-stream octets, which differ by 4,079 at the shipping `rs`. `design-storage-grant-and-cost` reads this without the reasoning attached.
    7. **Section 8 prices every version bump identically**, which mis-prices the extension `format.md` deliberately paid bytes to reserve. An envelope-only v2 is nearly free to dual-decode; a framing v2 is two crypto stacks. Stating one uniform cost makes the multi-file extension look as expensive as replacing the container.
    8. **A tenth nonce rule is available free, with a real detector.** Rules 3 through 7 close re-encryption, retry re-entry, encrypt-side seek, and republish, and rule 5 is confirmed in source (`seekOpts.startSeq` is decrypt-only). The one uncovered path is **CSPRNG failure**, the only way to reuse a CEK across relics. `format.md` 1.3 draws the ID from the same CSPRNG in the same pass, so a replayed state replays the ID and 1.4's collision refusal stops the publish before a byte is written. **1.4 already names the symptom without connecting it to nonce reuse.**
    9. `"the format floors rs at 1024"` is asserted; the derivation gives **548** (21 + 255 + 255 = 531 maximal envelope). A reader implementing 1024 refuses a legal relic in 548 to 1023.
    10. The two version fields have different ranges (16-bit envelope against two base-64 digits, 0 to 4095), while the document calls them one integer with two encodings.
    11. The header is fetched twice on the first range operation, since `decryptStreamRange` returns `{offset: 0, length: 21}` as its own first range.

    ## Verdicts on the five nominated weaknesses

    **`rs = 4096` survives, and the real finding is that the decision is unimportant rather than weak.** Every cell of the cost table re-derived exact. Then the beat **measured** what the document only counted: 64 MiB on Node, one AEAD call per record. 4096 gives 179 ms encrypt and 189 ms decrypt; 65536 gives 33 ms and 24 ms. Extrapolated to 100 MiB that is **0.30 s against 0.04 s to decrypt**. The 16x-WebCrypto-calls counterargument does not survive a measurement, and neither does the other arm at roughly $4 per 100K relics. **Keep 4096, add the measurement, cut the four-reason ranking to two**, and stop pricing in AEAD invocation count, which has no user-visible meaning.

    **The deep import survives exactly as stated**, with one mitigating fact to add: the exact-version pin means it can only break on a deliberate upgrade, never on an install.

    **The `rs - 17` block survives and buys more than the document claims.** It sidesteps the library's degenerate `encryptedSize(0, rs) = 21` case, and it keeps the padding delimiter as the final octet of every record. The beat specifically checked whether content ending in NUL octets could be truncated by `unpad`'s backward scan: **it cannot, precisely because the block makes every non-final record exactly one octet of padding.** A real hazard closed by this decision that the document never notices.

    **125 over 122 does not survive as a weakness, and the self-criticism is wrong.** Both encode to 25 characters, so 125 costs nothing and delivers three more bits plus a uniformly random first character. That is a dominance argument. **Drop the self-deprecation, keep the decision.**

    **The 255 caps mostly survive, with one factual overstatement.** "matches the 255-octet per-component limit every mainstream filesystem enforces" is not accurate: NTFS and APFS limit 255 UTF-16 code units, so the cap is conservative rather than matching.

    ## Verified clean, stated so a thin pass is distinguishable from a clean one

    Scope discipline holds: `format.md` 4.4 and 4.6 are not decided, outright or by implication. All eleven criteria re-run independently. Two-way orphan check on the sources manifest is an exact match. Section 8's TTL bound was chased against the sibling specs for an edge-cache, lifecycle-lag, or soft-delete extension and **no defect was found**, because clamping validity at mint means no URL to a post-TTL object can exist. Every library behavior claim re-read in source.

    **Believed and not verified, flagged rather than dropped:** that browser WebCrypto carries higher per-call overhead than Node's OpenSSL path, which would widen the `rs` gap on mobile; and that a fork-unsafe or snapshot-rolled CSPRNG is a live risk for this binary specifically. Finding 8's value does not depend on the latter, since the detector is free either way.

    ## One item for drift routing, not this unit's to fix

    `format.md` 3.4 quotes RFC 8188 as `keyid` "SHOULD be a UTF-8-encoded string" where the RFC reads "SHOULD be a UTF-8-encoded **[RFC3629]** string." Same elision class as finding 4, in a locked sibling.
- worker: resolver
  started_at: 2026-07-30T12:23:38.291765+00:00
  completed_at: 2026-07-30T12:23:38.291765+00:00
  result: advance
  note: |-
    Resolve complete at `a07dafd`, one file, 5,605 to 8,464 words, worktree clean. **All eleven findings fixed, all five verdicts applied, one drift item routed.**

    **Gates re-run independently by the manager:** artifact-exists PASS; substance-floor 8464 against 2400; sources 13 against 6; all 13 URLs resolve; zero dashes; `AES-128` twice. **Spot-checked every headline fix:** "petabyte" now returns **zero** hits, `17,519,171,600,384` present with "22.7 times tighter than the encryption limit, not looser than it"; §3.2 stated decrypt-only; both `format.md` 4.4 and 4.6 disclaimers intact; "per 100 MB" gone with "100 MiB" in four places; the `[RFC3629]` drift item present.

    ## It re-ran every script rather than trusting either beat

    `repro32.mjs` independently reproduced finding 1: the 7/8 split matches the published body at 73 octets, the minimal-padding 8/7 split gives 72 and does not. `repro31.mjs` re-confirmed the §3.1 vector byte for byte. `arith.mjs` re-derived every cell of the cost table exact.

    **It re-ran the benchmark twice rather than quoting a single run**, and wrote the document to the honest figure across both: 4096 decrypts 64 MiB in 201 and 214 ms, 65536 in 26 and 25 ms. The document says "roughly 0.3 s" against "roughly 0.04 s" extrapolated to 100 MiB, which holds under both runs.

    **New evidence it generated for a claim the challenge pass only asserted.** `nul.mjs` ran the reference implementation's own `pad`/`unpad` over 3,000 NUL octets of content, with and without the envelope block, across one, two, and three records. Exact round trip every time, deepest backward scan one octet. That is now what the `rs - 17` claim rests on rather than reasoning.

    It also derived the full ceiling table: the record ceiling binds first at **every** `rs` in the document, 92.0x tighter at 1024 through 1.41x at 65536, crossover at 92,684.

    ## The quotation audit was worse than either beat reported, and is now mechanically checkable

    **The make pass claimed 35 of 35. The true prior count was 42 audited, 40 verbatim, 2 deviations**, both confirmed against re-fetched raw source. Both fixed.

    **Final state: 50 audited, 50 verbatim, zero deviations**, covering 39 double-quoted runs and 11 backticked source strings. And it did something better than fix the count: **it converted the four remaining scare-quotes to non-quotation form, so every double-quoted run in the document is now a source quotation.** Criterion 9 is mechanically checkable instead of requiring judgment about which quotes count.

    **A fourth false-negative mode, recorded for the next checker:** an apparent third deviation was its own extraction artifact. The GFM punctuation quote fails if `<code>` tags are stripped to bare text and is verbatim once code spans are preserved as backticks.

    ## Two things neither beat listed, both found by the resolver

    - **A units defect in the cost table.** The column read "Records per 100 MB" while every value in it was computed for 100 **MiB** (100e6 gives 24,517 at 4096, not 25,708), and the prose repeated the wrong unit. Both fixed, which also makes the table consistent with the benchmark.
    - **An overstatement it introduced and removed before committing.** A draft of rule 9 claimed no plausible cap "lands within six orders of magnitude" of the ceiling, which implies a cap at or below 17.5 MB and is wrong for a 1 GB cap at 4.2 orders. Replaced with an unquantified statement that also avoids constraining the sibling's cap choice.

    ## Where the fixes were better than the instruction

    - **Finding 8's tenth nonce rule is written to sit inside what `format.md` 1.4 already prescribes** (draw a new ID and retry) rather than beside it, so it reads as naming a property of a locked rule rather than overriding it.
    - **Finding 5's fix keeps the rejection and narrows only the false part.** The record-size line moves out of the disqualifying set into its own sub-bullet titled as a line that reads disqualifying and is not, quoting the README's "The default record size is 4096 bytes". Only random padding is now called individually disqualifying.
    - **The 255-octet fix needed no new citation.** It replaced the false filesystem claim with pure arithmetic: a 255-octet UTF-8 string is never more than 255 characters and never more than 255 UTF-16 code units, so the cap is conservative rather than matching.
    - **Criterion 7 is now genuinely passable**, which it was not before. §3.1 is the round-trip vector at the shipping `rs`, §3.2 is decrypt-only, and the document explains why an encrypt assertion there tests padding policy rather than conformance.

    ## Tone changes that matter as much as the content

    `rs = 4096` is kept and **reframed as unimportant rather than finely balanced**, with the four-reason ranking cut to two, AEAD invocation count explicitly retired as a cost with the reason, and the measurement table replacing the count. The section now says outright that being wrong about both reasons would be defensible.

    The **125-over-122 self-deprecation is gone**, restated as the dominance argument it always was: identical cost at 25 characters, three more bits, uniformly random first character, nothing traded.

    ## Drift routed, not fixed

    New §10 records that `format.md` 3.4 quotes RFC 8188's `keyid` line eliding `[RFC3629]`, routes it to `specify`, and states explicitly that `format.md` is locked and this document does not edit it. Both strings verified verbatim against their own raw sources. This is the same elision class as the fix in finding 4, one document over.

    ## Scope

    `format.md` 4.4 and 4.6 remain undecided. The resolver re-grepped every `cap` and `object metadata` hit to confirm each is a disclaimer, a conversion function carrying no value, or a need statement naming the owner. Sibling-obligation phrasing returns empty. Two-way orphan check on the manifest is exact.
reviews:
  fit:
    at: 2026-07-30T11:40:36.253906+00:00
  reversibility:
    at: 2026-07-30T11:39:37.092582+00:00
  simplicity:
    at: 2026-07-30T11:41:12.361511+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/design/container.md
- name: substance-floor
  command: test "$(wc -w < docs/design/container.md)" -ge 2400
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/design/container.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/container.sources.txt'
---

# Goal

Write `docs/design/container.md`: the decided container framing, key material, and reference implementation for Relic. Plus `docs/design/container.sources.txt`, one URL per line, trailing newline.

**This is the only decision in the run that is irreversible once a single relic exists.** Everything else that lives in a stored object can be migrated or redeployed. **The name is the exception and it is not yours:** it is free today and closes at the domain purchase, which is already a stated deployment blocker, and `design-topology-and-origins` owns it. Do not de-rank it in passing. A relic encrypted under the wrong framing is unreadable forever, and a writer bug ships permanently into every object written under it.

**Read first:** `darkrun_knowledge_list` in full. Load-bearing here: `rfc8188-container-facts-and-implementation-landscape`, `browser-crypto-and-large-file-constraints` (**already corrected in place; do not re-derive its wrong version**), `citation-defects-and-the-three-checks-that-catch-them`, `cross-document-gaps-no-criterion-catches`.

Then read, from the repo root, **do not `cd` into a subdirectory**: `docs/frame.md`, `docs/preconditions.md`, and `docs/spec/format.md`, which is **locked** and routes these decisions to you. Also read `docs/spec/viewer.md` on decryption and platform ceilings, and `docs/spec/publish.md` on retry and re-encryption.

# Source discipline. This run's dominant failure mode.

Five citation defects shipped in `specify`, in four modes: a fabricated quotation attributed to an RFC section where it appears **zero times in 10,785 lines**; two pages cited for claims they never make; a relay of a relay presented as first-hand; one wrong word inside quotation marks. **Not one would have failed the URL-resolution gate, because in every case the URL resolved.**

- **Pull raw source text and grep it.** RFCs as `.txt` from rfc-editor.org. For browser compat, `mdn/browser-compat-data` JSON is authoritative where prose is not.
- **Never use WebFetch on a specification.** It was caught on this run returning text that flatly inverted RFC 9110's meaning.
- **Audit every quoted string before you finish.** Criterion 9 makes this checkable and it is not optional.

# Already decided. Do not relitigate.

From `format.md`, locked: RFC 8188 `aes128gcm` is the framing family. `keyid` is unused and `idlen` MUST be 0, refused after the fetch. Unknown container versions refuse at both refusal points. The version marker lives in the **fragment**, not the container. Every relic gets a fresh key; convergent encryption is drift routing back to `frame`. The published size number is a plaintext number.

# What `format.md` §4 routes here, and what it does not

`format.md` §4 routes six items. **Four are yours: 4.1 the wire format and framing, 4.2 key length, 4.3 the ID entropy bit count, 4.5 bucket padding.** The other two are not, and this is the single-owner assignment for the station, so do not treat a sweep of §4 as authority over them:

- **4.4, whether the cap is on plaintext or ciphertext and its value**, belongs to `design-storage-grant-and-cost`. It is the same decision `publish.md` 6.3 and `viewer.md` 7.2 also route, the binding arithmetic is in `service.md` 2.3, and storage is the unit that holds that arithmetic. Your document may cite the cap once it exists; it does not pick it.
- **4.6, whether object metadata is set at upload at all**, also belongs to `design-storage-grant-and-cost`, which holds the grant-branch evidence that decides it.

# The decisions

## 1. The key material, routed wrong, and it must be restated before it can be decided

`format.md` 4.2 routes "key length, 128 or 256 bits" as though `shape` picks cipher strength. **Under `aes128gcm` it does not.** The coding uses one fixed primitive set, and cipher agility is achieved by defining a new content coding. The fragment value is not the content-encryption key; it is input-keying material that HKDF-SHA256 turns into a 16-octet CEK using the header salt.

**Restate the decision as IKM length, decide it, and say AES-128 out loud** so no later reader takes "256-bit key" to mean AES-256. Decide, with consequences stated:

- What IKM length ships, and what it buys. A 32-byte IKM buys fragment entropy, not cipher strength.
- **The implementation cost of exceeding 16 bytes.** The reference implementation's `Keychain` hard-rejects anything else, and it is the only implementation anywhere with progressive range decryption, which `frame.md`'s wedge boundary makes non-negotiable. Exceeding 16 bytes means driving the lower-level module directly. Price that against the entropy gained.
- The resulting fragment length in the chosen encoding, checked against `format.md` 2.3's terminal-character rule and its named check.

## 2. The framing parameters

- **`rs`, and the rule that makes it cheap.** `rs` sits in each object's plaintext header, so a decryptor that reads it keeps every old relic working when the default moves. **State the mandatory rule: the reader takes `rs` from the header, never from a compiled-in default**, because the reference implementation throws when the caller's value disagrees with the stream. With that rule stated, decide the writer's default and show the arithmetic: overhead per record, range granularity, and the floor it puts under `format.md` 3.1's envelope header caps.
- **Padding.** `format.md` 4.5 routes bucket padding. RFC 8188 §4.8 recommends distributing non-padding data across records precisely because trailing pad-only records leak size information under observation, which is what a naive bucket pad produces. The reference implementation emits minimal padding only and has no bucket mode. Decide, and if bucket padding ships, say plainly it is a fork or a custom encryptor rather than a flag, and reconcile it with the RFC's own advice rather than ignoring it.
- **Header layout and exact byte arithmetic** at `idlen = 0`, so an implementer can write a parser from this document.

## 3. The reference implementation, and the second-implementation problem

The viewer must be JavaScript, so a JS reader exists regardless. **If any non-JS writer ships, it is a second implementation of a format that can never change**, and a writer bug is permanent.

- Decide the writer's language and library, or decide the writer is JS too.
- **Price the alternatives honestly.** The only maintained Rust crate carries "This crate has not been security reviewed yet, use at your own risk" in its own README, exposes a web-push-shaped API with the relevant module private, and offers no streaming and no way to supply your own IKM, salt, or `rs`. The Go option has a single-digit star count. Neither is disqualifying alone; both are facts the decision must state.
- **If two implementations ship, mandate cross-implementation verification against the RFC's published test vectors**, and note that one vector carries a non-zero `keyid` the product forbids, so the harness must parse what production refuses.
- Name the two properties the reference implementation gives you free that `format.md` already requires: a non-zero `idlen` refusal, and a size derivation matching 3.3 including its minimal-padding qualifier.

## 4. The v2 migration cost, stated rather than feared

`format.md` says the format cannot change after content is encrypted, which is true of a given relic and misleading about the system. Because the version marker is in the fragment and therefore **pre-fetch**, a v2 viewer refuses or routes a v1 relic without minting and without spending egress. State the real migration cost: the viewer carries both decoders for as long as any v1 relic can be alive, which a mandatory TTL bounds. State what would make it unbounded, which is a writer that keeps writing v1.

**The bound is only as real as the TTL ceiling, and that ceiling is `design-storage-grant-and-cost`'s decision, not yours.** Do not write a bounded-sounding claim resting on a number nobody has picked. Name the mandatory TTL as the bound, name storage as the unit that sets its ceiling, and state the need in the sibling form below rather than asserting a value.

## 5. Nonce discipline, as rules an implementer can follow

`format.md` 3.10 and `publish.md` 4.4 both carry the nonce-reuse consequence. Turn it into implementation rules: how the record sequence is derived, what resuming at the correct index requires of the writer, and what the writer must do rather than merely must not do.

## 6. The ID entropy bit count, which is a number and not a floor

`format.md` 4.3 routes the bit count here. Generation is fixed client-side in 1.3, and 1.2 fixes 122 bits as a **floor**, not the answer. `design-operations-and-abuse` will record enumeration as settled at the entropy floor already fixed, which reads the floor as the decision. Pick the number so that record is true rather than circular.

Decide the bit count and state both costs: the ID's length in characters under `format.md` 1.1's Crockford base32, at 5 bits per character, against the enumeration arithmetic at the value you choose. State the character count that follows from the bit count you pick, and check it against `format.md` 1.5's floor of 25 characters and the margin 1.5 states over `manifest.webmanifest`, the longest reserved word at 20, which the floor clears by five.

# Do not assign obligations to siblings

`specify`'s two audit blockers both came from a unit finishing before the documents that assign it obligations. **If you need something a sibling owns, state the need and the behaviour that follows, and name the sibling.** Never write that another document "must add" something. Siblings: `design-storage-grant-and-cost`, `design-topology-and-origins`, `design-product-surface`, `design-operations-and-abuse`.

# Style

Direct, dry, confident, contractions used naturally, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** No emoji. No placeholders, no hedging verbs.

# Completion criteria

1. `test -f docs/design/container.md` exits 0.
2. `test "$(wc -w < docs/design/container.md)" -ge 2400` exits 0. The floor is a stub guard with no ceiling. Never pad, and never cut a decided rule to hit a number.
3. `bash -c 'set -eu; n=$(grep -c . docs/design/container.sources.txt); test "$n" -ge 6'` exits 0.
4. Every source resolves, verified by the `every-cited-url-resolves` gate. Orphan check both directions.
5. **The document restates the key-length decision as IKM length and states the cipher is AES-128 regardless.** Verify: `grep -c 'AES-128' docs/design/container.md` returns at least 1.
6. **The document states the rule that the reader takes `rs` from the header rather than a compiled-in default**, and states the failure that rule prevents.
7. **The document decides the writer implementation and, if a second implementation ships, mandates cross-implementation verification against the RFC's published test vectors**, naming the non-zero-`keyid` wrinkle.
8. **The document states the v2 migration cost in bounded terms, names the mandatory TTL as the bound, and states that the TTL ceiling is `design-storage-grant-and-cost`'s decision** rather than asserting a value. It also names what would make the cost unbounded.
9. **Every string presented inside quotation marks as coming from a source has been verified verbatim against that source's raw text, and the beat reports the audit as a list**: each quoted string, its source, confirmed or corrected.
10. **The four `format.md` §4 items routed to this document are each decided with the consequence stated, or explicitly eliminated with the reason: 4.1 the wire format and framing, 4.2 key length restated as IKM length, 4.3 the ID entropy bit count, 4.5 bucket padding.** Name all four in the document. **`format.md` 4.4, the cap side and value, and 4.6, object metadata at upload, are not decided here.** They belong to `design-storage-grant-and-cost` and deciding either one in this document is a defect, not thoroughness.
11. `test "$(grep -c '[—–]' docs/design/container.md)" -eq 0` exits 0.

# Files touched

- `docs/design/container.md`, `docs/design/container.sources.txt` (create)

# Out of scope

- The grant shape, storage topology, cost, **the hard size cap value and its referent (`format.md` 4.4), and whether object metadata is set at upload (`format.md` 4.6)**. Sibling `design-storage-grant-and-cost`.
- Origins, TLS, edge, which origin serves what, **and the name**. Sibling `design-topology-and-origins`.
- Viewer screens, art direction, the taskbar, platform memory ceilings. Sibling `design-product-surface`.
- Abuse operations and legal posture. Sibling `design-operations-and-abuse`.
- Any product code. This station designs; it does not implement.
