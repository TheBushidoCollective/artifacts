---
topic: unobservable-quantities-are-this-projects-failure-mode
created_at: 2026-07-30T03:20:54.202072+00:00
updated_at: 2026-07-30T03:20:54.202072+00:00
---
**Relic's specific, recurring authoring defect is claiming a number the system cannot actually produce.** It was caught four times in a single document, by four different readers, three of them after an explicit sweep for exactly this. Treat it as the default suspicion on any measurable claim in this project, not as a thing that might happen.

## Why this project in particular

Relic's architecture forbids most of the obvious observation points. The server holds only ciphertext and never receives the key. Mimetype sniffing happens after decryption, in the browser. The viewing origin carries no analytics, because any same-origin script can read `location.hash`. There are no accounts. So the set of things the operator can actually observe is small and non-obvious, while the set of things it feels natural to write is large. Every gap between those two sets is a defect that reads as a fact.

## The four instances, as a pattern library

1. **A quantity requiring a capability that is an explicit non-goal.** A draft trust condition read "100 relics per week from more than one publishing **account**." Accounts are a non-goal. The document named a thing the product does not have.
2. **A quantity the architecture forbids observing.** The original success metric required the mimetype of *opened* relics, which is knowable only after in-browser decryption, on an origin where no script may run.
3. **A quantity where one half is observable and the other is not.** A condition claimed the headless/CI versus non-Claude client split was computable from the publishing client name. A Claude Code run inside a GitHub Action reports the same client name as an interactive one, so the non-Claude half computes and the headless/CI half does not.
4. **A quantity observable only from inside a third party.** A condition claimed the service domain staying unflagged by "Safe Browsing, VirusTotal consensus, and the major mail-gateway blocklists" was checkable on a schedule. The first two answer a scheduled query. **A block inside a single company's mail tenant is invisible from outside**, and surfaces as a recipient reporting a dead link rather than as a check going red. This was the worst instance, because that condition's consequence is "shut it down," so a false sense of detection is the most expensive possible blind spot.

Note the progression: each instance was subtler than the last, and instances 3 and 4 are *partially* observable, which is exactly why they survive review. A wholly fabricated metric gets caught. A half-true one does not.

## The rule

**Every claim of the form "we can measure X" must name the mechanism that produces X, and that mechanism must be one the locked architecture actually permits.** Where a quantity is partially observable, state which half is not, in the same breath as the claim. Never let a partially observable quantity read as fully observable.

The sweep is not optional and not incidental: enumerate every quantity in any measurement claim, and for each one name the exact server-side event or record it comes from. If you cannot name it, the claim is defective regardless of how reasonable it sounds.

## A design detail worth carrying forward

**The publishing-IP filter is a no-op for the headless and CI segment.** A CI runner's egress IP will never match a human viewer's, so the filter either fails in the safe direction or does not fire at all. Harmless, and the publisher-versus-recipient confound barely applies to that segment anyway, because there is no publisher sitting at a phone to self-check their own link. Worth knowing when a later station tunes the 120-second post-publish exclusion window (see [[relic-telemetry-trade-and-measurability]]), since the window is doing all the work for interactive publishers and none for CI ones.
