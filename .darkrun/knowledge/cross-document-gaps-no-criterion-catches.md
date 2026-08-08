---
topic: cross-document-gaps-no-criterion-catches
created_at: 2026-07-30T09:37:01.517196+00:00
updated_at: 2026-07-30T11:24:45.729357+00:00
---
Rules stated by one document and consumed by another that never implements them. Neither fails any unit's completion criteria, reviewers correctly decline to file them, and the gates pass. The next station closes them or the implementer ships the defect.

## The class

When a station splits one system across several documents, each unit's criteria bound only its own document. A rule that document A states **about** document B's surface is checkable in A and invisible in B. Reviewers catch these by walking seams end to end rather than reading each document against its own criteria, which is the only method that surfaces this class.

Distinct from a contradiction. A contradiction has two answers and one is wrong. This has one answer sitting in the wrong document, so nothing is wrong and nobody implementing from the owning document ever sees it.

## Instance 1, load-bearing, with a stated user-facing consequence

`service.md` 3.2 mandates: "A fetch that fails not-found after a successful mint renders as 'this relic is no longer available', never as a decrypt failure. Get this backwards and a takedown reads to the recipient as a bad key, and they blame the sender."

`viewer.md` 6.1 enumerates "the five states, of which two collapse" and has **zero** occurrences of that copy or any branch for a post-mint object-fetch failure. Verified: `grep -ci 'no longer available' docs/spec/viewer.md` returns 0.

So the document that owns every recipient-facing screen has no state for this one, and the nearest screen an implementer reaches for is the decrypt-failure screen `service.md` explicitly forbids. The delete-mint race is real: mint succeeds, the object is deleted for abuse or under legal process before the fetch completes, and the recipient sees a bad-key error for a relic that was taken down.

## Instance 2, smaller

`service.md` 2.1 justifies a mint-response field: "**`mints_remaining`** so the viewer can warn before the cap kills the link rather than after."

`viewer.md` never mentions `mints_remaining`. Verified: 1 occurrence in `service.md`, 0 in `viewer.md`. The field ships with a stated purpose and no specified consumer.

## Instance 3, and it is the one that exposed the guard's blind spot

Found in `shape`, after the `specify` instances were already recorded and after a rule had been installed specifically to prevent this class.

`design-container-and-crypto` decided **bucket padding refused, minimal only**. That discharges `format.md` 3.3's minimal-padding qualifier, which is the stated reason `viewer.md` 5 withholds a pre-decryption byte count, carried in its own words "because it changes what the viewer may display." With padding minimal the size derivation is exact, so whether the viewer displays a plaintext byte count before decryption became a live recipient-facing decision **that did not exist when the units were written**.

The container beat did everything right. It stated the fact, stated the behaviour either way, named `design-product-surface` as the owner, and explicitly declined to assign it. **The receiving unit had no hook for it.** A grep over product-surface's brief for `pre-decryption|before decryption|byte count|exact size|padding|minimal` returned one unrelated hit.

**The tell was an asymmetry in the read list**, and it is worth learning to look for: product-surface had explicit consumption sentences for two sibling inputs and carried the third as a bare input path plus an out-of-scope line. A sibling input with no stated purpose is a sibling whose output nobody is prepared to receive.

## The guard, and the hole in it

After the first two instances, `shape` installed a rule in every unit body: **no unit assigns an obligation to a sibling; it states the need and names the owner.** The station's close pass greps every document for assignment phrasing (`must add`, `must carry`, `is obliged to`, `has to add`, `needs to add`).

**That guard catches the bad pattern and is blind to the good one.** A unit that correctly states a need, in exactly the form the rule demands, produces no assignment phrasing at all. So a properly-stated need that no sibling is equipped to receive is invisible to the grep, invisible to the owning unit's criteria, and invisible to the receiving unit's criteria. It is the intended behaviour of the rule, executed correctly, failing silently.

**So the rule needs a matching second sweep, and one sweep without the other is worse than neither, because the first sweep's clean result reads as coverage.**

## The two checks, run together

1. **Assignment sweep.** Grep every document for assignment phrasing. Catches a unit overreaching into a sibling's scope.
2. **Reception sweep.** Extract every stated need that names a sibling, then grep the named sibling for a hook that receives it: a body bullet placing the decision, and a criterion that fails a document which ignores it. **A need with no hook is this defect.**

Supporting check, cheap and diagnostic: for each unit, confirm every declared sibling input has an explicit consumption sentence saying what to read it for. A bare input path is the asymmetry that found instance 3.

## Why timing makes this worse in a design station

Instance 3 did not exist when the units were written. It was **created by a decision made during manufacture**: refusing bucket padding discharged a qualifier that another document's behaviour rested on. So the reception sweep cannot run once at decomposition and be trusted. **It runs again after each wave**, because a decided unit can discharge a premise that a not-yet-written unit was relying on, and no criterion written before that decision can anticipate it.

## The check that finds the static form of this class

For every rule one document states about another document's surface, grep the target document for the behaviour. A rule appearing exactly once, in the document that does not implement it, is this defect. Neither URL resolution, nor a substance floor, nor a per-unit criteria audit will catch it, because each document is internally complete and correct.

Related: [[citation-defects-and-the-three-checks-that-catch-them]] is the same shape one level down. There the evidence is counterfeit while the argument is sound; here the rule is sound while its home is wrong. Both survive every check that reads one artifact at a time.
