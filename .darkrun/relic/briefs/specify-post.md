---
station: specify
phase: post
created_at: 2026-07-30T09:39:54.166844+00:00
---
# `specify` closing brief

**The station locks.** Every criterion is met, every gate is green, both reviewer lenses cleared all four units, and both defects found at audit were fixed and independently verified.

## What this station eliminated

**Ambiguity**, in the specific form the plan named: an unspecified boundary between two correct components producing a working attack. Discovery found four key-disclosure paths of that shape, none requiring a bug in anything. All four are now closed by stated rules:

1. **SVG has no assigned class.** `format.md` assigns it; `viewer.md` 3.2 makes SVG download-only in the first release, on the reasoning that a spec saying "still images render inline" without carving out SVG ships the CVE.
2. **Redirects inherit the fragment.** Settled in three documents on one axis, the destination's trust boundary. This is the defect audit caught and fixed.
3. **The renderer class routing the viewer.** `format.md` 3.6 and `viewer.md` 1.1 both state the class never routes, and both state why publisher attestation does not repair it.
4. **Blob URLs inherit the creating origin.** `viewer.md` 1.5 states the rule and the octet-stream download consequence.

## The artifacts

| document | words | sources |
|---|---|---|
| `docs/spec/format.md` | 5495 | 12 |
| `docs/spec/service.md` | 6916 | 20 |
| `docs/spec/viewer.md` | 7883 | 17 |
| `docs/spec/publish.md` | 11965 | 13 |

All on `darkrun/relic/specify`, worktree clean.

## The evidence

**Sixteen quality gates recorded, all pass**, each re-run by the manager in the worktree rather than taken from a beat's self-report. Verified on the final tree after both fixes:

- Four artifact-exists, four substance-floor (every document above its floor, the smallest by 3.4x), four sources-manifest, four every-cited-url-resolves.
- **62 cited URLs, zero dead.** Orphan-checked both directions on all four manifests.
- **Zero em-dashes or en-dashes. Zero placeholders.**
- **Nine Group A rows all mapping onto `service.md` statuses, codes, and field names**, set difference empty in both directions. Fifteen Group B codes, zero collisions, prefix discipline intact. Zero broken numbered cross-references across all four documents.
- **78 quoted strings verified verbatim against raw source text, zero corrections**, spanning all four documents including the three whose units carried no quotation criterion.
- **Twenty-three routed-to-`shape` items, every one authorized** by its unit's own route list and naming a decidable choice with stated consequences.

Audit verdict: **PASS**. Reviewer stamps: `testability` and `completeness`, all four units, zero skipped in either.

## Concerns raised and how they resolved

Both lenses failed the first audit round and **converged independently on the same two defects**, filing four items for two problems. Both had one root cause: `service.md` was finalized before both documents that assign it obligations.

**Defect A, blocker.** `service.md` 6 keyed the redirect-fragment rule on the origin boundary while `format.md` 5 and `viewer.md` 1.7 keyed it on the destination's trust boundary, putting HTTP-to-HTTPS and apex-to-`www` on opposite sides. As written, a recipient typing the URL without a scheme or without `www` lost the key and landed on the "missing its key" screen holding a link that was never broken. Fixed at `c6cf095`, one file, `+2/-1`. All three documents now assign every case identically. Resolved `fb-10` and `fb-12`.

**Defect B, high.** The challenge round trip is unconditional at launch, so a grant presenting an expired or never-issued nonce must be refused at grant time, and no code existed anywhere in the set. The refusal fell through to `app_response_unusable`, which is terminal and never retried, so a publisher whose challenge timed out took a permanent failure where re-challenging would have worked. Fixed at `8449071` by adding `409 invalid_challenge_nonce` to `service.md` 1.6 with an argued status, the Group A row, the 3.1 rewrite, and a 4.6 re-challenge clause. Two files, `+8/-2`. Resolved `fb-11` and `fb-13`.

**One remedy was contested and the disagreement was resolved on the merits.** `completeness` argued the redirect paragraph should be deleted as out of scope; `testability` argued it should be corrected, since `format.md` 5 assigns the rule to that document by name. Correct-and-shorten was chosen. `completeness` then withdrew its objection with a stronger argument than the one that overrode it: `service.md` 6's link-shortener paragraph back-references "the same mechanism above," so deletion would have left that pointing at nothing.

**The fix for Defect B required a consequence no brief specified.** Under the idempotency rules, results are stored under the key whether they succeed or fail and key-match runs before nonce validation, so resubmitting under the original key would replay the stored refusal before the fresh nonce was ever examined, and the client would spin to the retry cap reporting a dead challenge that was alive. The fix draws a fresh idempotency key. Without it the fix would have been inert. Verified by both reviewers tracing the sequence rather than reading it.

## Retrospective findings that bear on the lock

Two cross-document gaps were found by seam-walking, fail no criterion, and were correctly not filed. They are recorded in run knowledge as `cross-document-gaps-no-criterion-catches` and **`shape` closes them or the implementer ships the defect**:

1. `service.md` 3.2 mandates that a fetch failing not-found after a successful mint renders as "this relic is no longer available", never as a decrypt failure, because a takedown otherwise reads to the recipient as a bad key. `viewer.md` 6.1 enumerates five states and has no branch for it, so the nearest screen an implementer reaches for is the one `service.md` forbids.
2. `service.md` 2.1 justifies `mints_remaining` by a viewer warning behavior that `viewer.md` never specifies.

Neither blocks the lock. Both documents are internally complete and the rules exist in the set; the placement is what needs deciding, and that decision is `shape`'s.

## Outstanding operator action, blocking deployment rather than design

Two registrable domains distinct from `thebushido.co`, one service origin and one sandbox origin. The Public Suffix List submission for the sandbox parent has no publishable lead time, sourced to the list's own guidelines stating there are no service level agreements on time and no way to expedite. It gates the sandbox origin's process isolation and starts before the work that depends on it.

## Why the lock is justified

The station was asked to resolve every assigned ambiguity into a stated rule or an explicitly routed decision, and to mandate every assigned behavior in checkable terms. Both reviewers confirmed that item by item across four units: nothing MISSING, no unauthorized routing, no drift from the locked frame. The two real defects were caught by the audit that exists for exactly that purpose, fixed at the root rather than papered over, and re-verified independently before the stamps. The ambiguity this station owns is bounded.
