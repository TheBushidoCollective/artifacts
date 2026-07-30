---
topic: citation-defects-and-the-three-checks-that-catch-them
created_at: 2026-07-30T07:02:55.867354+00:00
updated_at: 2026-07-30T07:02:55.867354+00:00
---
**Every unit this run has produced has shipped a citation defect, and they are three different failure modes with three different detectors. Only one of the three is covered by a quality gate.** Any station that cites sources should install all three checks.

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
