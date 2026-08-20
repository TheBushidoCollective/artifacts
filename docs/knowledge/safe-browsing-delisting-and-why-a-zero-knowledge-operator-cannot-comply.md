---
topic: safe-browsing-delisting-and-why-a-zero-knowledge-operator-cannot-comply
created_at: 2026-07-30T09:55:39.966546+00:00
updated_at: 2026-07-30T09:55:39.966546+00:00
---
The blast-radius half of the Safe Browsing problem is recorded in [[domain-strategy-and-safe-browsing-blast-radius]]. This topic covers the **remediation** half: what getting delisted actually requires, and why every step of it is a content-inspection step a zero-knowledge operator structurally cannot perform.

## The review flow is built entirely on looking at the content

From https://support.google.com/webmasters/answer/9044101 (Security issues report), verbatim:

- **"Expand an issue description to see a list of sample affected URLs. This list is not necessarily complete, but just a sample of pages on your site affected by the selected issue. Occasionally you might have a security issue with no example URLs; this does not mean that no pages are affected, only that we could not generate samples for some reason."**
- Every one of the malware, code-injection, deceptive-pages, deceptive-resources, and harmful-downloads flows begins with a variant of **"Confirm the presence of the issue on one of the example URLs shown in the Security Issues report."**
- The request itself: **"When all issues listed in the report are fixed in all pages, select Request Review in the Security Issues report. In your reconsideration request, describe your fixes. A good request does three things: Explains the exact quality issue on your site. Describes the steps you've taken to fix the issue. Documents the outcome of your efforts."**
- Timing: **"A review can take from a few days to a few weeks to complete."** For reconsideration generally: **"Most reconsideration reviews can take several days or weeks."** And a warning with teeth: **"Submitting a reconsideration request when the issue hasn't been fixed can cause longer turnaround time for the next request, or even get you marked as a repeat offender."**

## The finding that makes this structural rather than merely hard

**Safe Browsing canonicalizes URLs by stripping the fragment before doing anything else.** https://developers.google.com/safe-browsing/reference/URLs.and.Hashing, verbatim: **"Second, if the URL ends in a fragment, remove the fragment. For example, shorten 'http://google.com/#frag' to 'http://google.com/'."**

For Relic the fragment **is** the decryption key. So:

1. **The sample URL Google hands the operator in Search Console is the one form of the URL that cannot open the content.** The operator can visit it and will see the viewer's "missing its key" state, forever, no matter what the relic contains.
2. **Google's classifier may well have seen the plaintext.** Wherever a full link was posted (a paste site, a GitHub issue, a public channel), a fetcher that renders JavaScript executes the viewer with the key present and observes decrypted content. Whether Googlebot or the Safe Browsing crawler retains and replays fragments is **not documented and is unverified here** — treat the mechanism as plausible, not established. What *is* established is the asymmetry direction: a crawler that follows a posted link has strictly more than the operator does, because the operator only ever receives the canonicalized form.
3. **The result is a verdict delivered with the evidence removed.** "Confirm the issue, fix it, document the outcome" is unanswerable. The only truthful reconsideration request a zero-knowledge operator can file is "we deleted the objects at these IDs and here is our abuse process", which describes a process rather than a fix, and which Google's own guidance does not contemplate.

**Design consequence:** the appeal is not a technical remedy the operator controls, so it cannot be a mitigation the design leans on. Assume flagged, make the flag cost one domain, and have the takedown story and abuse-process documentation written **before** the first listing, because that document is the entire content of the reconsideration request.

## The one category Relic will sit in permanently

Also from the same page, verbatim: **"Uncommon downloads — Your site is offering a download that Google Safe Browsing hasn't seen before. The Chrome browser may warn that the file is uncommonly downloaded and could be dangerous. These warnings are lifted automatically if Google Safe Browsing verifies that the files are safe. Note that example URLs are not always given for this issue."** It **"will not prevent your page or site from appearing in Google Search results, but it will show a warning in the Chrome browser when a user initially requests to download unknown files."**

Every relic is, by construction, a file Safe Browsing has never seen: unique ciphertext under a unique key. **The auto-lift condition ("verifies that the files are safe") can never fire on an encrypted object.** Whether that surfaces as a user-visible Chrome download warning depends on how the viewer delivers bytes to the user (a `blob:` save of already-decrypted content is a different path from a direct link to the object), and **that behavior is unverified and should be tested empirically before launch**, alongside the Defender for Office 365 mail test the spec set already mandates.

## Good news, verified: Safe Browsing itself cannot leak the key

A reasonable worry is that URL reputation checks transmit relic links, and therefore keys, to Google. They do not. Standard mode uses local hash prefixes; real-time mode (https://developers.google.com/safe-browsing/reference/Real.Time.Mode) maintains lists **"formatted as SHA256 hash prefixes of host-suffix/path-prefix URL expressions"** and sends hash prefixes, capped at 30 per request, with decoy prefixes permitted. Those expressions are derived from the canonicalized URL, which per the quote above has already had the fragment removed. **Safe Browsing, in every v5 mode, is not a key-leak channel.** The remaining leak channels are link *rewriters* and *detonators* (Microsoft Safe Links, Proofpoint), which are a different mechanism entirely and stay an open empirical question.

## The Public Suffix List is probably not available, on eligibility grounds

`docs/preconditions.md` lists as unresolved whether PSL registration of the sandbox parent prevents a listing at that parent. The prior step is whether a PSL entry can be obtained at all. From https://github.com/publicsuffix/list/wiki/Guidelines, verbatim non-acceptance criteria:

- **"We do not accept entries that have the objective of getting around limitations that have been put in place by a vendor to protect internet users. The PSL is not a 'workaround', and Pull Requests that appear to be doing this should expect to be declined. Be thorough and candid with the rationale furnished with the request."** A submission whose honest rationale is "limit Safe Browsing's listing scope" describes that objective in Google's own vocabulary. The guidelines also demand candour, so misstating the rationale is not an option.
- **"Projects that are smaller in scale or are temporary or seasonal in nature will likely be declined. Examples of this might be private-use, sandbox, test, lab, beta, or other exploratory nature changes or requests. It should be expected that despite whatever site or service referred a requestor to seek addition of their domain(s) to the list, projects not serving more then thousands of users are quite likely to be declined."**
- **"We now require that domains submitted as private section entries have expiration dates more than 2 years beyond the submitting date of a PR"**, plus a commitment to keep more than a year of term.
- Process reality: **"There are NO SERVICE LEVEL AGREEMENTS ON TIME nor any expectation of processing speed or urgency."** Validation is by a `_psl` TXT record referencing the PR, which must stay in the zone permanently: **"LEAVE THESE _psl IN PLACE WITHIN YOUR ZONES POST-VALIDATION"**, since missing records will later be used to prune stale entries. And **"Modifications take time to reach software that uses the PSL"**.

**Conclusion to carry forward: treat PSL registration as unavailable at launch.** It is not merely unproven as a defence; a pre-launch project of this size is squarely inside two published decline criteria, the term requirement adds a domain-registration cost, and even a granted entry propagates on browser-release timescales. Any design that needs the PSL to be correct is a design that does not ship. Origin isolation must come from separate registrable domains alone, which is what [[domain-strategy-and-safe-browsing-blast-radius]] already requires.
