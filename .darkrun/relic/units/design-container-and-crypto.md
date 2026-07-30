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
