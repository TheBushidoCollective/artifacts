---
topic: citation-defects-and-the-three-checks-that-catch-them
created_at: 2026-07-30T07:02:55.867354+00:00
updated_at: 2026-07-30T10:15:56.642300+00:00
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

## The false-negative mode: when a zero-hit is the checker's fault

**This is a caveat on the method above, not a weakening of the four defects recorded here. All four were real and all four were confirmed by grep.** What follows is the failure that runs the other way, and it was hit **twice on this run, independently, from two directions**.

**The rule: a zero-hit on a quote that spans more than one source line means "re-check with whitespace flattened and hyphenation rejoined" before it means "fabricated."** Only after a normalized match still fails is mode 3 the live hypothesis.

**Why it outranks the defects it qualifies.** A missed defect and a false positive are not symmetric costs. A missed defect ships one bad citation. **A false positive accuses a real, verbatim quotation of being fabricated, and mode 3 is the most serious charge this project makes.** Once the check produces accusations that do not survive scrutiny, it stops being trusted and gets dropped, and then all three real modes stop being caught. The caveat is what keeps the check usable.

### Observation 1: source line wrapping (found on the `shape` risk beat)

The GCS signed-URLs page states, verbatim, **"Anyone who knows the URL can access the resource until the expiration time for the URL is reached or the key used to sign the URL is rotated"** (https://cloud.google.com/storage/docs/access-control/signed-urls). The source HTML **hard-wraps immediately after "is reached or the key"**, so the extracted text carries a newline between `the key` and `used to sign`.

A single-line `grep -F` of the full sentence returns **zero hits**. Flattened, it returns one. A reviewer independently reproduced both results before the correction was accepted. Had the zero-hit been taken at face value under the rule as previously written, it would have produced a mode 3 accusation against a quotation that is verbatim and load-bearing.

### Observation 2: hyphenation at line breaks (found by the `completeness` reviewer on the `specify` audit)

That beat reported two apparent defects on its first pass and **both were artifacts of its own normalizer**, because RFCs break compound words after the hyphen. Verified directly here: **RFC 9110 has 70 lines ending in a hyphen**, all genuine mid-compound breaks. Concretely, the raw text contains:

```
'stateless application-\n   level protocol'
```

Naive newline-flattening yields `application-    level`, which does **not** match `application-level`. Rejoining hyphenation yields `application-level`, which does.

**The two fixes are in tension and the order matters.** Whitespace collapse run first turns `application-\n   level` into `application- level`, after which a hyphenation rule looking for `-\n\s+` no longer fires. **Hyphenation rejoin must run before whitespace collapse.** Getting one right and missing the other still manufactures false accusations, which is precisely how the `completeness` beat produced two.

### Observation 3: typographic characters (a third trap in the same family)

An earlier beat on this run worked around a quotation containing a typographic apostrophe instead of normalizing it. The scale of that trap is larger than it looks. Measured on the raw text of 17 USC 512 as served by Cornell (https://www.law.cornell.edu/uscode/text/17/512): **29 occurrences of U+2019 and zero ASCII apostrophes in the entire document.** Every possessive in US Code text will fail a match typed with a normal `'`. The DSA text is worse because it is *mixed*: 144 U+2019 against 16 ASCII, so the same document fails inconsistently depending on which sentence you quote.

Non-breaking spaces belong here too. EUR-Lex writes cross-references as `Article 6`, so **"for the purposes of Article 6"** typed with ordinary spaces returns zero against DSA Article 16(3), where the sentence is genuinely present.

### The normalization a checker must apply, in this order

Apply it to **both the haystack and the needle**. Normalizing only the source is the mistake that leaves the typographic-character trap live.

1. **Fold characters:** U+2018/U+2019 to `'`, U+201C/U+201D to `"`, U+00A0 to a space, the U+2010 to U+2015 dash range to `-`.
2. **Rejoin hyphenation at breaks:** `-\n\s+` becomes `-`. Must precede step 3.
3. **Collapse whitespace:** `\s+` becomes a single space. This subsumes plain wrapping, leading indentation, and the folded non-breaking spaces from step 1.
4. **Then match.**

`tr '\n' ' '` alone is not sufficient. It handles the unindented wrap case only, which is why it worked on the HTML page in observation 1 and would have failed on the indented RFC in observation 2.

### What still counts as a real mode 3

A quote that fails after full normalization, on raw text pulled from the authoritative source. That is the standard all four defects above were confirmed against, and the standard the fifth (the GCS `access-control` "revoke" attribution, recorded in [[gcs-cloud-run-architecture-constraints]]) was confirmed against: `revoke` is absent from that page **flattened as well as raw**, so the finding holds under the stricter test.

## Why this keeps happening

The mechanism is not carelessness about sources. In all four cases the writer had read the right document, understood it correctly, and reached the right conclusion. What failed was the last step: a confident paraphrase hardening into quotation marks. The conclusion survives; the evidence is counterfeit. That is why it passes every review that checks whether the argument is sound, and only fails a check that compares strings.

Related: [[gcs-false-impossibility-claims]] and [[browser-crypto-and-large-file-constraints]] record the same shape in a different register, where a correctly-understood constraint gets generalized one step too far. [[substance-floor-calibration-rule]] records the third variant, where the number is right and the stated reason is not.
