---
topic: cross-document-gaps-no-criterion-catches
created_at: 2026-07-30T09:37:01.517196+00:00
updated_at: 2026-07-30T09:37:01.517196+00:00
---
Two rules in the `specify` spec set are stated by one document and consumed by another that never implements them. Neither fails any unit's completion criteria, both reviewers correctly declined to file them, and both stations' gates pass. `shape` closes them or the implementer ships the defect.

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
