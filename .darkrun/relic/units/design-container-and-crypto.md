---
name: Decide the container framing, the key material, and the reference implementation
unit_type: ''
status: pending
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

**This is the only decision in the run that is irreversible once a single relic exists.** Everything else can be migrated, redeployed, or renamed. A relic encrypted under the wrong framing is unreadable forever, and a writer bug ships permanently into every object written under it.

**Read first:** `darkrun_knowledge_list` in full. Load-bearing here: `rfc8188-container-facts-and-implementation-landscape`, `browser-crypto-and-large-file-constraints` (**already corrected in place; do not re-derive its wrong version**), `citation-defects-and-the-three-checks-that-catch-them`, `cross-document-gaps-no-criterion-catches`.

Then read, from the repo root, **do not `cd` into a subdirectory**: `docs/frame.md`, `docs/preconditions.md`, and `docs/spec/format.md`, which is **locked** and routes these decisions to you. Also read `docs/spec/viewer.md` on decryption and platform ceilings, and `docs/spec/publish.md` on retry and re-encryption.

# Source discipline. This run's dominant failure mode.

Five citation defects shipped in `specify`, in four modes: a fabricated quotation attributed to an RFC section where it appears **zero times in 10,785 lines**; two pages cited for claims they never make; a relay of a relay presented as first-hand; one wrong word inside quotation marks. **Not one would have failed the URL-resolution gate, because in every case the URL resolved.**

- **Pull raw source text and grep it.** RFCs as `.txt` from rfc-editor.org. For browser compat, `mdn/browser-compat-data` JSON is authoritative where prose is not.
- **Never use WebFetch on a specification.** It was caught on this run returning text that flatly inverted RFC 9110's meaning.
- **Audit every quoted string before you finish.** Criterion 9 makes this checkable and it is not optional.

# Already decided. Do not relitigate.

From `format.md`, locked: RFC 8188 `aes128gcm` is the framing family. `keyid` is unused and `idlen` MUST be 0, refused after the fetch. Unknown container versions refuse at both refusal points. The version marker lives in the **fragment**, not the container. Every relic gets a fresh key; convergent encryption is drift routing back to `frame`. The published size number is a plaintext number.

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

## 5. Nonce discipline, as rules an implementer can follow

`format.md` 3.10 and `publish.md` 4.4 both carry the nonce-reuse consequence. Turn it into implementation rules: how the record sequence is derived, what resuming at the correct index requires of the writer, and what the writer must do rather than merely must not do.

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
8. **The document states the v2 migration cost in bounded terms** and names what would make it unbounded.
9. **Every string presented inside quotation marks as coming from a source has been verified verbatim against that source's raw text, and the beat reports the audit as a list**: each quoted string, its source, confirmed or corrected.
10. **Every decision routed to this document by `format.md` §4 is decided with its consequence stated, or explicitly eliminated with the reason.** No routed item left open.
11. `grep -c '[—–]' docs/design/container.md` returns 0.

# Files touched

- `docs/design/container.md`, `docs/design/container.sources.txt` (create)

# Out of scope

- The grant shape, storage topology, and cost. Sibling `design-storage-grant-and-cost`.
- Origins, TLS, edge, and which origin serves what. Sibling `design-topology-and-origins`.
- Viewer screens, art direction, the taskbar. Sibling `design-product-surface`.
- Abuse operations and legal posture. Sibling `design-operations-and-abuse`.
- Any product code. This station designs; it does not implement.
