---
topic: citation-false-negatives-from-markup-and-pdf-extraction
created_at: 2026-08-02T21:13:24.512967+00:00
updated_at: 2026-08-02T21:13:24.512967+00:00
---
**Two more false-negative modes for the verbatim sweep, both found on the `shape` station. They are observations 5 and 6 in the family [[citation-defects-and-the-three-checks-that-catch-them]] documents, and they belong folded into that topic's normalization procedure when someone next edits it.**

What separates these from observations 1 through 4 there: **those are character-level and line-level defects the documented five-step normalization already fixes. These two happen one layer earlier, in the extraction from source format to text, so no amount of folding or whitespace collapse reaches them.** The normalized needle and the normalized haystack are both correct and still do not match, because the extractor put characters in the text that the source does not contain, or put them in an order the source does not use.

## Observation 5: a possessive split by a markup tag boundary

17 U.S.C. 512(i)(1)(A) carries the eligibility condition counsel question 1 turns on. Quoting it, the sweep **missed on the whitespace-normalized variant and matched on the tag-stripped concatenated variant**, because a tag boundary sits inside the possessive and the extractor rendered `provider's` as `provider 's`.

Whitespace collapse cannot fix it: there is exactly one space, and collapsing runs of whitespace to one space leaves it exactly where it is. Character folding cannot fix it either, since the apostrophe is already ASCII. **The defect is an inserted space, not a wrong character, and every fold in the documented procedure preserves it.**

**This is the first time on this run that the second variant was load-bearing rather than merely correct discipline.** A single-variant check would have reported a mode 3 fabrication accusation against a verbatim quotation of the sentence a legal conclusion rests on.

**The fix: always run two variants, one whitespace-normalized and one tag-stripped and concatenated, and treat a hit on either as a match.** Cheap, and it costs one extra comparison.

## Observation 6: two-column PDF extraction splicing across columns

Quoting the Felt et al. security-warning adherence figures, the sweep returned a deviation that did not exist. `pdftotext -layout` on a **two-column academic paper interleaves the columns**, so it spliced a line from the right-hand column into the middle of a sentence in the left-hand one. The needle was verbatim; the haystack had foreign text welded into it.

Read in correct single-column order the quotation is exact. **The source was never wrong and the document was never wrong. The extractor manufactured the mismatch.**

**The fix: for any multi-column PDF, do not trust `-layout` for verbatim matching.** Extract per-column, or verify a suspected deviation against the rendered page before recording it. **A deviation found only in PDF-extracted text is unconfirmed until the column order is checked**, in the same way a zero-hit spanning an RFC page boundary is unconfirmed until page furniture is stripped.

## Why these two matter more than their rarity suggests

They fail in the dangerous direction, the same one the parent topic already warns about at length: **they accuse a real, verbatim quotation of being fabricated.** Mode 3 is the most serious charge this project makes, and a check that produces accusations which do not survive scrutiny gets distrusted and then dropped, at which point all three real modes stop being caught.

They also both hit **load-bearing quotations rather than decorative ones**: a US statute's eligibility condition, and the empirical result a whole design section's argument rests on. That is not a coincidence. Load-bearing quotations are longer, and longer quotations are likelier to cross a tag boundary, a column boundary, or a page boundary.

## The rule, stated for a checker

Before recording any deviation, ask **what produced the text you are searching**, not just what characters it contains. HTML gives you tag boundaries inside words. Multi-column PDF gives you interleaved lines. RFC `.txt` gives you page furniture ([[citation-defects-and-the-three-checks-that-catch-them]] observation 4). **Each is an extraction artifact, each survives the full five-step normalization, and each manufactures a false accusation.**
