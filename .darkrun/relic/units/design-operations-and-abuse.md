---
name: Design the abuse pipeline and state what the go/no-go actually costs
unit_type: ''
status: completed
depends_on:
- design-storage-grant-and-cost
- design-topology-and-origins
- design-container-and-crypto
worker: ''
model: opus
station: shape
inputs:
- frame.md
- spec.md
- docs/design/storage.md
- docs/design/topology.md
- docs/design/container.md
outputs:
- docs/design/operations.md
- docs/design/operations.sources.txt
branch: darkrun/relic/units/shape/design-operations-and-abuse
started_at: 2026-07-30T15:34:52.492520+00:00
completed_at: 2026-08-02T20:43:14.776677+00:00
iterations:
- worker: designer
  started_at: 2026-07-30T15:34:52.492520+00:00
  completed_at: 2026-07-30T15:34:52.492520+00:00
  result: advance
  note: |-
    `docs/design/operations.md` (9,164 words) and `operations.sources.txt` (12 URLs) committed at `5179000`. Worktree clean.

    **Gates re-run independently by the manager:** 9,164 against 2,600; 12 sources against 8; all 12 resolve; zero dashes. `git diff --name-only HEAD~1 HEAD` returns exactly the two artifact files, no locked file. All three sibling inputs via `git show`, and it read storage at the resolved tip `a9cea77` rather than `95853da`, which is what the numbers in §5 and §6 depend on.

    **Manager-verified independently, not taken from the report:** criterion 11's three items each present and decided; criterion 5's counsel questions in their own section; the SLA a real number with both bounds; and `container.md`'s enumeration conclusion quoted **verbatim**, confirmed by normalized match against the sibling file. That last one matters because `container.md` §7 wrote its conclusion anticipating this exact consumer, saying this unit "can record it as settled and the record is true rather than circular." **Cross-unit reception worked as designed rather than by luck.**

    ## The beat found a defect in my brief

    **I told it receipt acknowledgement satisfies "the confirmation duty." DSA Article 16(4) is conditional**, on the notice carrying electronic contact information, and the document carries the condition rather than repeating my unconditional framing. My brief inherited that overstatement from the knowledge topic. It also **extended the Article 13(3) quotation to its full clause rather than cutting at "non-compliance" as the knowledge topic does.** Both are corrections to the run's own record, not to a source.

    It also found **a second place the no-accounts non-goal reduces the compliance surface**, where the brief established only one: Article 16(2)(c) excuses reporter contact details for the offences it names, so on an anonymous report there is no duty, no address, and nothing owed.

    ## The scope-resolution check transferred to legal text and immediately paid

    The fifth citation mode was recorded against a pricing page. **Its legal analogue is sharper and the beat hit it head-on.** DSA Article 13 reads as a general obligation to appoint a liable EU representative; its entire trigger lives in **Article 3, heading "Definitions"**, two pages earlier, at points (d) and (e). Quoting 13 without 3 would state an obligation whose applicability is unresolved as though it were settled. It also caught Article 19(1) being **doubly** scoped, to Section 3 only and to online platforms only, and 18 U.S.C. 2258A(f) being a construction rule about that section rather than the general immunity it reads as. **Every statutory quotation in its audit carries its heading and scope clause, not just an article number.**

    ## The two-variant sweep stopped a false deviation on the load-bearing DMCA quotation

    17 U.S.C. 512(i)(1)(A) **missed in the space-separated variant and matched in the concatenated one**, because a tag boundary rendered `provider 's`. That is a fifth false-negative mode, the possessive split by markup, and it is the first time the second variant has been load-bearing rather than merely correct discipline. **A single-variant check would have reported a false deviation on §512's eligibility condition**, which is the sentence counsel question 1 turns on.

    Audit: 83 candidates swept, 76 source quotations, **76 verified, zero deviations**, with the 7 non-source runs classified rather than dropped. It independently confirmed storage's `preconditions.md` substitution finding from its own raw pull.

    ## Decisions

    **SLA 24 hours**, bounded from both sides with real constraints: shorter is unmeetable by one human without follow-the-sun coverage and a missed published number is evidence in exactly the processes this document exists to survive; longer is capped because a takedown SLA approaching the 259,200-second TTL makes deletion indistinguishable from expiry. It names **two clocks the SLA does not govern**, so nobody reads 24 hours as covering the mandatory report or the criminal-threat notification.

    Branch B's operator-side lookup is specified in **five ordered steps**, and the fifth is the one nobody else states: past storage's 90-day record limit the three-way split collapses to `relic_not_found` and **the operator cannot answer at all**. It puts that in the disclosure statement rather than leaving a publisher to find it.

    ## Its ranked weaknesses, and the one worth attacking first

    It ranked honestly and **attacked its own SLA from both sides**, which no prior beat has done: it ruled out 8 hours on one-human-plus-same-timezone-backup grounds, then noted `preconditions.md` requires only "a named backup" and never says same-timezone, so a backup in another timezone closes the sleep gap and makes 24 loose by a factor of three.

    Its number one is **§5.2's claim that branch A is cheaper**, resting on an unsupported empirical sentence: that an exhaustion screen is self-explaining enough that recipients ask the sender rather than the operator. **Every Relic error screen carries a report link by mandate**, which is the counter it names against itself. If ticket volumes converge the recommendation to surface is wrong.

    Its number two is the branch-B free-text matcher, with a concrete failure it supplies: "this file contains employee records from my former employer" attaches the possessive to the employer, not the subject, so the trigger misses and the obligations go unmet silently.

    **Base rate to carry into the challenge: three units in a row had their number-one nomination come back sound. Do not let this list steer the sweep.**
- worker: resolver
  started_at: 2026-08-02T20:43:08.471529+00:00
  completed_at: 2026-08-02T20:43:08.471529+00:00
  result: advance
  note: |-
    `docs/design/operations.md` resolved and committed at `19f4c58`. **All seven defects fixed. One sub-part of defect 4 is an explicitly named residual risk rather than a silent gap.** Worktree clean.

    **Gates re-run independently by the manager:** 10,933 words against 2,600; 12 sources against 8; all 12 resolve; zero dashes; trailing newline confirmed. `git diff --name-only HEAD~1 HEAD` returns `docs/design/operations.md` alone. Orphan check clean manager-side.

    **Verified in the file rather than on the note's word:** the Branch A/B grep returns only the two pre-existing unrelated pairs at 139/141 and 259/261/273/365, with nothing new; "Nine standing checks" agrees at both call sites, line 225 and line 333 item 13; counsel questions 9 and 10 are present at 355 and 356; the screen is item 1 of section 2.2; and section 1 and section 6.5 both now name the two-project topology.

    ## Defect 1 changed the architecture, and the SLA survived its own justification

    **The screen fires before deletion.** The beat grounded that on locked text rather than preference, quoting `service.md` 4.1's "The clock starts at arrival, not at triage" and reasoning that **a clock refusing to start at triage only makes sense if triage sits between arrival and the action being timed.** That is the right way to settle it: the spec already implied the answer and nobody had read it out.

    Section 2.2 gained item 1, and the framing is careful where it needed to be: **"That is a routing decision, not a credibility one: section 1 already forecloses judging whether the underlying claim is true, and the screen does not reopen that question."** Naming a human step in a delete-on-plausible-report pipeline risks smuggling adjudication back in, and this explicitly refuses that. Section 2.1's closing sentence became "A report that clears the screen described in section 2.2 travels this remaining distance, steps 2 through 8, with no further human decision."

    **The SLA stays 24 hours and criterion 12 is now genuinely satisfied rather than nominally.** The number never moved, but its justification did: the sleep-gap argument always assumed a human on the critical path, and naming the screen made section 6.3 consistent with section 2.1 instead of contradicting it. Section 2.2's items renumbered 1-5 to 2-6, and item 6 now distinguishes itself from the screen, "what makes a one-person operation viable against everything except the screen above."

    ## Defect 2 was larger than the challenge found, and the beat said so

    **The one-project assumption was not confined to line 329.** It was load-bearing in section 1's entire forced-answer argument at the old lines 55 to 61. **Fixing only section 6.5, which is what the work order literally asked for, would have left one section describing a survivable suspension and another describing total loss.** The beat found that itself and fixed both. That is the correct instinct: the work order named the symptom, not the extent.

    Section 1 now quotes `preconditions.md`'s locked blast-radius sentence and then states the decision, that the sentence "describes what one project holding everything costs, and it is exactly the risk `docs/design/storage.md` section 6 designs against." The consequences were rewritten downstream so "total loss of service" became "every live relic going dark, with no accounts and no channel to tell any holder of a link why." **The triage decision is still forced, now on a severe but factually correct asymmetry rather than an overstated one.**

    Section 6.5 closes honestly rather than comfortably: the wind-down tooling survives, "what does not survive is the service itself, dark for as long as the suspension runs," and it is a smaller bad outcome "only because section 1 spent the cost storage.md section 6 names for it."

    **The vocabulary collision was handled better than instructed.** The beat drafted a version attributing the recommendation as "names its branch B there," judged that this still carried collision risk against the two existing unrelated pairs, and **removed the clause before committing.** Every reference is the spelled-out "two-project topology" with `storage.md` section 6 cited by name. The manager's grep confirms zero new occurrences.

    ## The remaining five

    **Defect 3:** the volumetric vector is now priced separately from the per-relic griefing vector, with the asymmetry named against locked text: publish and mint carry `publish_rate_limited` and `mint_rate_limited` in `service.md`'s status table, `publish.md` 3.1 scopes proof of work to publish alone, and `/abuse` has neither. **It routed the owner correctly and non-obviously:** not to a sibling, but to `build`, "because it is a gap in the locked rate-limiting scheme itself" needing a refusal code `service.md` does not yet have. Standing check 9 was added, and its rationale names the trap directly, that check 8 "reading better during the attack" is itself the anomaly.

    **Defect 4:** counsel question 9 added, plus an interim operational default stated rather than left implicit: every `csam`-category report is filed on pending counsel. **The reasoning is the statute's own asymmetry**, that 2258A(e) penalizes failure to report and never a report filed on a claim later shown mistaken, so over-filing costs nothing under the statute. **The residual is named, not fixed away:** the filing duty widens past "rare" if such reports arrive at volume, and mislabeling stays free to an attacker. That is honest, and it is the correct call, because the underlying question is one of the two this document says up front cannot be closed by more reading.

    **Defect 5:** adjacency loosened to same-sentence or same-clause co-occurrence, using the challenge's own counter-example verbatim in the text. English-only stated as an explicit v1 limitation carried into the disclosure statement, with the French example marked "for instance" so it carries no verbatim obligation. **The backstop is the sharpest part:** the section 2.2 screen reads every report's free text end to end regardless of what the matcher catches, "for as long as report volume stays inside what one person can read, which is what section 1's rate-limit fix and section 4's ninth check exist to keep true." **Defects 1, 3 and 5 were resolved into one coherent mechanism rather than three patches.**

    **Defect 6:** counsel question 10 added, and section 2.3 states the discipline explicitly, that Article 12(3) "carries no equivalent textual condition" and "this document does not import that resolution here by silent analogy." It names both readings rather than picking one.

    **Defect 7:** "same-day" replaced with one rolling day, made concrete, "a report arriving at 23:00 gets until 23:00 the next day, never until the following midnight." **It left the one remaining use in section 3 untouched and said why**, because that instance reports `preconditions.md`'s own phrasing rather than making this document's argument. Correct scoping.

    ## Verification the beat ran on itself

    Two new load-bearing quotations, both checked against the locked files in the worktree with `grep -o` rather than curl since both are local: `preconditions.md`'s blast-radius sentence and `service.md` 4.1's clock sentence. Both match exactly. **It noted that its inline quote drops the source's markdown bold while the words are unchanged**, which is the right level of precision. No other new quotations were introduced; the rest is paraphrase without quotation marks and therefore carries no verbatim obligation. The challenge's 76-quotation audit stands untouched.

    **It grepped every `2.1`, `2.2` and `2.3` cross-reference before and after the renumbering** to confirm none broke. That was the only structural change with real cross-reference risk and it was the one thing it checked mechanically.

    ## Residual risk Build inherits

    **The defect 4 default and the defect 3 rate limit lean on each other, and Build needs to know that.** In the beat's own framing: if the `/abuse` limiter is loose or merely per-endpoint rather than tuned against the volumetric scenario, `csam`-labeled volume can grow past what section 2.2's rare framing assumes, and the mandatory-report duty scales with it. **Build should treat the rate limiter as protecting the mandatory-report cost model, not only the griefing vector it was originally scoped for.**

    Carried to the station audit, unclosed by design: counsel questions 1 through 10, the two of which this document has always said no further reading can answer; whether the operational predictions hold at real report volume, since the monitoring surface measures SLA latency and now report rate, but nothing measures comprehension; and whether `design-product-surface` actually received the two choices this unit designed both branches for. **That last one is now checkable at the station level and was not checkable from inside either unit**, since each was forbidden the other's output. `surface.md` decided the viewer distinguishes cap exhaustion from takedown, and `operations.md` recommends the merged screen as cheaper for a one-person operation while naming surface as the owner. **The two documents disagree on the recommendation, which is exactly the shape the split was designed to produce, and the audit should confirm operations' triage path matches the branch surface actually chose.**
reviews:
  fit:
    at: 2026-07-30T11:40:36.253906+00:00
  reversibility:
    at: 2026-07-30T11:39:37.092582+00:00
  simplicity:
    at: 2026-07-30T11:41:12.361511+00:00
approvals:
  fit:
    at: 2026-08-02T20:49:17.865667+00:00
  reversibility:
    at: 2026-08-02T21:08:30.142205+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/design/operations.md
- name: substance-floor
  command: test "$(wc -w < docs/design/operations.md)" -ge 2600
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/design/operations.sources.txt); test "$n" -ge 8'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/operations.sources.txt'
gate_results:
- name: artifact-exists
  status: pass
  at: 2026-08-02T20:41:36.734226+00:00
  attempts: 1
  detail: '`test -f docs/design/operations.md` exits 0 at `19f4c58`. Companion manifest `docs/design/operations.sources.txt` present. Manager-run in the unit worktree, not taken from the worker''s report. `git diff --name-only HEAD~1 HEAD` returns `docs/design/operations.md` alone, so the resolve pass touched no locked file and no sibling''s document.'
- name: substance-floor
  status: pass
  at: 2026-08-02T20:41:40.414565+00:00
  attempts: 1
  detail: '`wc -w` returns 10,933 against a floor of 2,600. Grew from 9,164 at the designer beat, +1,769 words, the largest resolve growth in the station. The bulk is the two decision-changing fixes: naming the screening step and rebuilding section 2.2 and the section 6.3 SLA justification on it, and adopting the two-project topology with its consequences carried through section 1, the monitoring surface, and the price-of-yes list. No ceiling on this gate.'
- name: sources-manifest-populated
  status: pass
  at: 2026-08-02T20:41:43.733664+00:00
  attempts: 1
  detail: 12 non-empty lines against a floor of 8, one URL per line, trailing newline confirmed by `tail -c1 | xxd` returning `0a`. Unchanged from the designer beat, consistent with the resolve diff touching only `operations.md`. The Google Cloud project-suspension support page the two-project topology fix quotes was already in the manifest and cited, so the fix added evidence weight without adding a source.
- name: every-cited-url-resolves
  status: pass
  at: 2026-08-02T20:41:48.577354+00:00
  attempts: 1
  detail: 'All 12 URLs return success under the gate''s own curl invocation, manager-run at `19f4c58`. Orphan check run manager-side in the manifest-to-prose direction, every manifest URL appears cited in the body, zero orphans. Criterion 14''s dash check independently returns 0. Recording the standing caveat with extra force on this unit: the challenge beat established that three of these 12 sources return a bot-block page, an RDF stub, or a content-negotiation error under a naive request, and this gate passes on all three regardless because it only proves the URL answers. Resolution is not verification. What actually protects the legal quotations here is the raw fetch with correct headers plus scope resolution to the governing heading, both of which the challenge ran and reported.'
---

# Goal

Write `docs/design/operations.md`: the abuse pipeline, the monitoring surface, and a precise statement of what the operator is being asked to commit to. Plus `docs/design/operations.sources.txt`.

**This unit exists to make one decision answerable.** `preconditions.md` states the go/no-go: if the team will not commit to ongoing abuse operations, the correct answer is do not build. That has been true and unpriced for the whole run. **Your job is to price it,** so the answer is a decision rather than a hope.

**Read first:** `darkrun_knowledge_list`, especially `legal-obligations-of-a-no-accounts-hosting-service`, `safe-browsing-delisting-and-why-a-zero-knowledge-operator-cannot-comply`, `egress-cost-controls-and-what-a-kill-switch-cannot-stop`, `abuse-liability-of-hosting-uninspectable-content`.

Then read `docs/frame.md` and `docs/preconditions.md`, locked; **`docs/spec/service.md` §1 in full**, because you reason about the status taxonomy your tickets arrive as, including 1.2 cap exhaustion and 1.4 takedown disclosure, plus §§4, 4.1, 5, 6, **and §7 item 6, the published SLA, which is the one routed decision that is yours**; and sibling inputs `docs/design/storage.md`, `docs/design/topology.md`, and `docs/design/container.md`. **If any of the three is missing, fetch via `git show darkrun/relic/units/shape/<unit>:<path>` and report which path you used.**

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
