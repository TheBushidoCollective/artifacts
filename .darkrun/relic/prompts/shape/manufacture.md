
> **Run** `relic` · **Station** `shape` · **Phase** `manufacture`

> Eliminates: _expensive-structural-reversal_


# Manufacture — `shape`

This is the build floor. You run the **Pass loop** — _Plan → Make → Challenge → Resolve_ — over the wave-ready Units. The current beat is **designer**, on model **sonnet**.


**Contract**

- Do exactly the work this action describes — no more, no less. Don't skip ahead to a later phase.
- Treat the locked artifact (`design.md`) as the source of truth. Read it before you act; never silently rewrite a locked decision.
- Every claim you make must be backed by something you actually ran, read, or wrote. No assumed results.
- Be specific and committed. **No placeholders** — a `TBD`, `similar to …`, `add error handling`, `etc.`, or `…` is a hole, not a decision; name the actual, checkable condition. **No hedging** — when you report work done, use a verb of completed action (`added`, `implemented`, `fixed`), never `should`, `seems`, `probably`, `might`, or `looks like`. Hedging is the tell of unfinished work.
- When the action is finished, record your output where the station expects it, then call `darkrun_tick` again for the next instruction. The manager — not you — decides what comes next.



**Explorers** (3): `surface`, `architecture`, `risk`


**Workers** (5): `designer` → `visual_designer` → `spiker` → `pressure_tester` → `resolver`


**Reviewers** (3): `fit`, `reversibility`, `simplicity`


## This wave


Dispatch the **designer** beat in parallel across these wave-ready Units:

- `design-container-and-crypto`




## Each Unit's spec — the contract the beat works against

The subagent you dispatch for a Unit gets **no context beyond what you hand it**. Pass the Unit's spec below into its dispatch verbatim — the completion criteria with their verify commands, the declared paths, and the scope boundary are the contract the beat is judged against.

### `design-container-and-crypto` — Decide the container framing, the key material, and the reference implementation

- **inputs:** `frame.md`, `spec.md`


- **outputs:** `docs/design/container.md`, `docs/design/container.sources.txt`


- **quality gates:** artifact-exists — `test -f docs/design/container.md` · substance-floor — `test "$(wc -w < docs/design/container.md)" -ge 2400` · sources-manifest-populated — `bash -c 'set -eu; n=$(grep -c . docs/design/container.sources.txt); test "$n" -ge 6'` · every-cited-url-resolves — `bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/container.sources.txt'`


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

Decide the bit count and state both costs: the ID's length in characters under 2.3's unpadded base64url encoding, which `format.md` 1.5 makes the primary reserved-word guard, against the enumeration arithmetic at the value you choose. Apply the same terminal-character check §1 applies to the fragment.

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




## Each Unit has its own worktree — work in it

Every wave Unit is isolated on its own branch + worktree, forked off the station branch. Run that Unit's beat **inside its worktree** so its diff never tangles with another Unit's in-flight work; the manager lands each Unit back onto the station branch when it locks. Do **not** commit a Unit's work to the station branch yourself.

- `design-container-and-crypto` → `/Users/jwaldrip/dev/src/github.com/thebushidocollective/artifacts/.darkrun/worktrees/relic/units/shape/design-container-and-crypto` (branch `darkrun/relic/units/shape/design-container-and-crypto`)





## The Pass loop — make → challenge → resolve

The Pass loop is adversarial on purpose: a single confident pass is exactly where LLM output is most often confidently wrong, so a second pass red-teams the first before anything locks.

- **make** — the worker produces the Unit's output against its completion criteria. Build the real thing, not a sketch.
- **challenge** — a second pass attacks what make produced: edge cases, missing handling, lazy assumptions. Assume the first pass was optimistic.
- **resolve** — reconcile make and challenge into a Unit that satisfies its completion criteria with the challenges answered.




**Quality-gate verifier nonce.** This dispatch carries a one-time verifier token: **`827b652b65f71f4c86c06f5c4311691d9ef55f9408e0f90a2dee35ca6b1f5387`**. When you record a quality gate with `darkrun_quality_gate_record`, pass it as `nonce`. The engine refuses a gate result without the matching token — so a gate is only ever recorded as part of a real verification dispatch, never self-certified. Run the gate's command for real, then record the actual outcome with this nonce.


Run **only the `designer` beat** this tick. When the beat finishes, **record it** with `darkrun_unit_iterate` — pass the `worker`, the `result` (`advance` or `reject`), and a `note`: on advance, what you did and what the next worker needs to know; on reject, why you bounced it (a reject without a reason is refused). That note becomes the next beat's handoff above. Then call `darkrun_tick`; the manager advances the loop or releases the next wave. A Unit is locked only after Resolve and its completion criteria pass.

A Unit gets a **bounded pass budget** — the manager escalates a Unit that can't converge within it to the operator rather than grinding forever. Don't paper over a stuck Unit to dodge the escalation; a Unit that needs more passes than the budget allows is a signal the spec, the scope, or the approach is wrong, and that's the operator's call to make.



## Done when

The `designer` beat is complete for every Unit in this wave and its output is recorded. Then call `darkrun_tick`.

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