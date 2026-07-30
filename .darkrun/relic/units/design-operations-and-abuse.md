---
name: Design the abuse pipeline and state what the go/no-go actually costs
unit_type: ''
status: pending
depends_on:
- design-storage-grant-and-cost
- design-topology-and-origins
worker: ''
model: opus
station: shape
inputs:
- frame.md
- spec.md
- docs/design/storage.md
- docs/design/topology.md
outputs:
- docs/design/operations.md
- docs/design/operations.sources.txt
quality_gates:
- name: artifact-exists
  command: test -f docs/design/operations.md
- name: substance-floor
  command: test "$(wc -w < docs/design/operations.md)" -ge 2600
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/design/operations.sources.txt); test "$n" -ge 8'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/operations.sources.txt'
---

# Goal

Write `docs/design/operations.md`: the abuse pipeline, the monitoring surface, and a precise statement of what the operator is being asked to commit to. Plus `docs/design/operations.sources.txt`.

**This unit exists to make one decision answerable.** `preconditions.md` states the go/no-go: if the team will not commit to ongoing abuse operations, the correct answer is do not build. That has been true and unpriced for the whole run. **Your job is to price it,** so the answer is a decision rather than a hope.

**Read first:** `darkrun_knowledge_list`, especially `legal-obligations-of-a-no-accounts-hosting-service`, `safe-browsing-delisting-and-why-a-zero-knowledge-operator-cannot-comply`, `egress-cost-controls-and-what-a-kill-switch-cannot-stop`, `abuse-liability-of-hosting-uninspectable-content`.

Then read `docs/frame.md` and `docs/preconditions.md`, locked; **`docs/spec/service.md` §1 in full**, because you reason about the status taxonomy your tickets arrive as, including 1.2 cap exhaustion and 1.4 takedown disclosure, plus §§4, 4.1, 5, 6, **and §7 item 6, the published SLA, which is the one routed decision that is yours**; and sibling inputs `docs/design/storage.md` and `docs/design/topology.md`. **If either is missing, fetch via `git show darkrun/relic/units/shape/<unit>:<path>` and report which path you used.**

**`design-product-surface` runs beside you, not ahead of you, and you do not read its output.** It owns every recipient-facing screen and its copy. Where your pipeline depends on a screen it decides, **state the need and design your side against both branches in one pass**, which is the same discipline every unit in this station follows. Do not wait on it, do not assume an answer, and do not decide a screen.

# The boundary you must hold, and it is itself a deliverable

**You are not a lawyer and this document is not legal advice.** Report what the raw statutory and regulatory text says, quote it, cite it, and then **name plainly what needs real counsel**. Two of the load-bearing questions are not answerable by more reading, and no amount of further research closes them. Blurring that line into confident summary is the failure mode. Keeping it sharp is the value.

**Read legal text raw.** Never WebFetch it and never rely on a summarizer; WebFetch was caught on this run flatly inverting a specification's meaning. Note that one EU source blocks scripted fetch and returns a stub, and there is a working alternative host recorded in the knowledge topic.

# What the sources already establish, verified. Build on it, do not re-derive it.

- **The favourable text is stronger than the spec set claims.** Both regimes explicitly impose no general obligation to monitor stored information or to actively seek indications of illegal activity, and the US statute separately says nothing requires a provider to monitor users or to affirmatively search, screen, or scan. The "you cannot require somebody to moderate what they cannot read" posture has real statutory backing, and `preconditions.md` calling it an untested theory understates the text while being right about outcomes.
- **Takedown by ID works and satisfies both regimes**, which ask a notice to identify the material's location sufficiently to find it. A reporter holding a relic URL supplies exactly that.
- **The asymmetry that costs you:** a compliant notice creates knowledge from the reporter's assertion, never from inspection. An operator who cannot read the content cannot verify a claim and cannot safely ignore it.
- **One place the no-accounts non-goal reduces the compliance surface:** the statement-of-reasons duty applies only where contact details are known, and there are none.
- **Micro-enterprise relief** exempts a whole section and the annual transparency report, while several articles apply regardless of size.

# The decisions

## 1. The triage policy, which has a forced answer

The operator cannot triage on content, so every report is acted on or refused on the reporter's say-so. **The cost asymmetry is stark:** deleting a legitimate relic costs a publisher one republish, given no versioning, no accounts, no dashboard, and a short TTL anyway, while not deleting risks a project-level suspension that takes down the abuse tooling along with the service.

**Decide delete-on-plausible-report with no adjudication, and write it into the published terms as a policy rather than discovering it later as a capitulation.** Then state the two consequences out loud in the same document: it is a griefing vector, bounded by whoever holds the link and unbounded for a publicly posted relic; and it converts the "non-arbitrary and objective" standard from an exposure into a defensible position, because it is one rule applied uniformly with no discretion.

## 2. The pipeline: what automates, and what cannot

Specify the intake-to-resolution path end to end, distinguishing:

- **Automatable:** receipt acknowledgement, which satisfies the confirmation duty; URL-to-ID extraction; delete-by-ID; ciphertext-hash blocklist add; publishing-IP lookup; bulk delete by publishing IP and time window. Most of these already exist in `service.md` §4.
- **Not automatable:** the criminal-threat branch, a mandatory-report filing, a law-enforcement request, a reconsideration request, and the judgement of whether a report is credible at all. **That last one is answered by §1, which is what makes one person viable.**

**Design the handling for a data-subject report, which is the pipeline question and is yours regardless of the form.** A person reporting their own leaked file is owed the same handling whether or not the form offers them a category to say so, so specify the path, the obligations it triggers, and its resolution against the report type rather than against a label. **Whether the form shows a personal-data category, and what it is called, is `design-product-surface`'s decision and it is not in your inputs.** State the need, name surface as the owner, and note what changes for intake in each case: a dedicated category routes these reports directly, and no category means they arrive in `other` and the pipeline has to detect them from free text. Design for both. Do not add a category to the form.

## 3. The reconsideration artifact, which must exist before it is needed

The listing appeal is not a remedy the operator controls: canonicalization strips the fragment, so the sample URL handed to the operator is the one form of the link that cannot open the content, and the review flow asks the operator to confirm the issue, fix it, and document the outcome. **The only truthful request a zero-knowledge operator can file describes a process and a takedown log rather than a fix.** So specify that document now, name where it lives, and state that it must be publishable before the first listing rather than written under one.

Note the one category the service sits in permanently: every relic is unique ciphertext under a unique key and therefore a file the reputation system has never seen, and the automatic-lift condition can never fire on an encrypted object. **Whether that surfaces as a user-visible browser download warning depends on the download delivery path and is unverified**; put it in the same pre-launch empirical bundle as the mail-gateway test `service.md` already mandates.

## 4. The monitoring surface

Specify the standing checks, each with what it catches and what its absence loses: the abuse and policy URLs returning success; public listing status; search-console verification **with a second verified owner**, because losing the only owner loses the property in exactly the flagged-and-blind state verification exists to prevent; registrar expiry and auto-renew; the agent-registration renewal clock; and egress against the ceiling from `docs/design/storage.md`.

## 5. Two leaks and one non-issue, none of which any document owns

**This section is the highest-value gap-closing work in the unit and criterion 11 forces all three items. None of them closes by omission.**

- **Cross-relic correlation.** `format.md` concedes per-relic length leakage paired with the stored class. The aggregate is not stated anywhere: the mint log retains requesting IP and the relic row holds class and size, so across many relics from one publishing IP the operator holds a cadence and size profile that fingerprints a pipeline or a person. `frame.md` requires publishers to see all of it before publishing, so **decide where this is disclosed.** The published disclosure statement in `service.md` §5 is yours for legal content, so this is your sentence to write. `design-product-surface` writes the sentence at the publishing moment in the MCP tool result, which is a different surface.
- **Cap exhaustion and takedown are the same experience for a recipient.** Both return the same status, and the distinct codes are for the operator's log rather than the recipient's screen. Scanners can exhaust a cap before a human opens the link, producing a ticket indistinguishable from "the operator deleted my file." **The screen is `design-product-surface`'s decision and you do not have its answer, so state the need and design your side against both branches:** if the viewer distinguishes the two, say what the ticket volume and the triage path look like; if it does not, say the same for a support queue that cannot tell a deleted relic from an exhausted one without an operator-side log lookup, and specify that lookup. State the support-load consequence of each branch and which one is cheaper for a one-person operation, then say plainly that surface owns the choice. Whether the exhaustion case can arise at all is `design-topology-and-origins`'s mint-trigger decision, which **is** in your inputs; read it and state which branch it took.
- **Enumeration is settled and should be recorded as settled**, so a later station does not relitigate it as a reason to shorten IDs. At the entropy value `design-container-and-crypto` decided, walking the ID space is arithmetic rather than a threat model. Quote the decided number rather than the floor. **This is forward-looking protection for `build` and nothing else in this station checks that it was written.**

## 6. The price of yes, stated as a list the operator can answer

Close with the commitment, itemized and concrete, covering at minimum: the designated agent as a named human at a publicly listed street address with its renewal clock and the narrow waiver condition; the possible EU representative who can be held liable, with geoblocking named as a real alternative; **the published SLA as a number of hours**; the second verified owner; availability for the criminal-threat and mandatory-report branches with the statutory exposure named; and acceptance of delete-on-report with no adjudication.

**The SLA is `service.md` 7.6 and it is a routed decision, not a line item.** Price it against the inputs in 4.1. No regime anchors it, so whatever number is published becomes the standard the operator is measured against. A list entry reading "the published SLA in hours" satisfies nothing; the number is the decision.

**State plainly that deciding no now is a good outcome for this run, and deciding it after launch with relics in the wild and a suspension notice running is the bad one.**

# Do not assign obligations to siblings

State needs and name the owner. Siblings: `design-container-and-crypto`, `design-storage-grant-and-cost`, `design-topology-and-origins`, `design-product-surface`.

# Style

Direct, dry, confident, contractions natural. **Never an em-dash or en-dash.** No emoji, no placeholders, no hedging verbs. Never soften a number or an obligation to make it read easier.

# Completion criteria

1. `test -f docs/design/operations.md` exits 0.
2. `test "$(wc -w < docs/design/operations.md)" -ge 2600` exits 0.
3. Manifest has at least eight sources, one per line, trailing newline.
4. Every source resolves. Orphan check both directions.
5. **The document states explicitly that it is not legal advice and separates what the text says from what needs counsel**, listing the counsel questions by name.
6. **The triage policy is decided**, written as publishable policy language, with both consequences stated.
7. **The pipeline separates automatable from non-automatable steps** and names every step in each, **and specifies the data-subject report path against both branches of the form's category question**, naming `design-product-surface` as the owner of the category itself.
8. **The reconsideration artifact is specified** and stated as required before the first listing.
9. **The monitoring surface names each standing check with what its absence loses.**
10. **The price of yes is an itemized list the operator can answer**, with statutory exposure named where it exists, **and every item that routes a number carries the number. The published SLA is stated in hours as a decided value**, not as a line item to be filled in later.
11. **Section 5's three items are each written and none is left implicit:** where cross-relic correlation is disclosed, decided as a location; the support-load consequence of the cap-exhaustion-versus-takedown screen **designed for both branches**, with the triage path specified for each and `design-product-surface` named as the owner of the choice, plus which mint-trigger branch `docs/design/topology.md` took; and enumeration recorded as settled at the entropy value `design-container-and-crypto` decided, so a later station does not relitigate it as a reason to shorten IDs.
12. **The one routed decision assigned to this document is decided: `service.md` 7.6, the published SLA in hours.** It is a number, priced against `service.md` 4.1's inputs, and it is the only routed item that is yours.
13. **Every quoted string is verified verbatim against raw source text, and the beat reports the audit as a list.** Legal text especially: quote it or do not claim it.
14. `test "$(grep -c '[—–]' docs/design/operations.md)" -eq 0` exits 0.

# Files touched

- `docs/design/operations.md`, `docs/design/operations.sources.txt` (create)

# Out of scope

- The container format, the grant construction, origins, and art direction. Owned by the four siblings.
- **Recipient-facing screens and their copy, including the cap-exhaustion screen and the abuse form's category labels. Sibling `design-product-surface`, which runs beside you and whose output you do not read.** You own the pipeline behind those screens and the legal content of the published disclosure statement; surface owns the screens and the sentence at the publishing moment in the MCP tool result. Where you need one of its answers, design both branches and name it as the owner.
- Choosing whether to build. This unit prices the decision; the operator makes it.
- Product code.
