
> **Run** `relic` · **Station** `shape` · **Phase** `manufacture`

> Eliminates: _expensive-structural-reversal_


# Manufacture — `shape`

This is the build floor. You run the **Pass loop** — _Plan → Make → Challenge → Resolve_ — over the wave-ready Units. The current beat is **designer**, on model **sonnet**.


**Contract**

- Do exactly the work this action describes — no more, no less. Don't skip ahead to a later phase.
- Treat the locked artifact (`design.md`) as the source of truth. Read it before you act; never silently rewrite a locked decision.
- Every claim you make must be backed by something you actually ran, read, or wrote. No assumed results.
- Be specific and committed. **No placeholders** — a `TBD`, `similar to …`, `add error handling`, `etc.`, or `…` is a hole, not a decision; name the actual, checkable condition. **No hedging** — when you report work done, use a verb of completed action (`added`, `implemented`, `fixed`), never `should`, `seems`, `probably`, `might`, or `looks like`. Hedging is the tell of unfinished work.
- When the action is finished, record your output where the station expects it, then call `darkrun_tick` again for the next instruction. The manager — not you — decides what comes next.



**Explorers** (3): `surface`, `architecture`, `risk`


**Workers** (5): `designer` → `visual_designer` → `spiker` → `pressure_tester` → `resolver`


**Reviewers** (3): `fit`, `reversibility`, `simplicity`


## This wave


Dispatch the **designer** beat in parallel across these wave-ready Units:

- `design-operations-and-abuse`

- `design-product-surface`




## Each Unit's spec — the contract the beat works against

The subagent you dispatch for a Unit gets **no context beyond what you hand it**. Pass the Unit's spec below into its dispatch verbatim — the completion criteria with their verify commands, the declared paths, and the scope boundary are the contract the beat is judged against.

### `design-operations-and-abuse` — Design the abuse pipeline and state what the go/no-go actually costs

- **inputs:** `frame.md`, `spec.md`, `docs/design/storage.md`, `docs/design/topology.md`, `docs/design/container.md`


- **outputs:** `docs/design/operations.md`, `docs/design/operations.sources.txt`


- **quality gates:** artifact-exists — `test -f docs/design/operations.md` · substance-floor — `test "$(wc -w < docs/design/operations.md)" -ge 2600` · sources-manifest-populated — `bash -c 'set -eu; n=$(grep -c . docs/design/operations.sources.txt); test "$n" -ge 8'` · every-cited-url-resolves — `bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/operations.sources.txt'`


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

### `design-product-surface` — Decide the art direction, the taskbar hierarchy, and every recipient state

- **inputs:** `frame.md`, `spec.md`, `docs/design/container.md`, `docs/design/topology.md`, `docs/design/storage.md`


- **outputs:** `docs/design/surface.md`, `docs/design/surface.sources.txt`


- **quality gates:** artifact-exists — `test -f docs/design/surface.md` · substance-floor — `test "$(wc -w < docs/design/surface.md)" -ge 2600` · sources-manifest-populated — `bash -c 'set -eu; n=$(grep -c . docs/design/surface.sources.txt); test "$n" -ge 6'` · every-cited-url-resolves — `bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/surface.sources.txt'`


# Goal

Write `docs/design/surface.md`: the decided art direction, the taskbar hierarchy, the renderer stack, and every recipient-facing state including the ones nobody has written. Plus `docs/design/surface.sources.txt`.

**Read first:** `darkrun_knowledge_list`, especially `firefox-send-shipped-and-unshipped-viewer-copy`, `viewer-renderer-libraries-measured-costs-and-the-tree-emitting-stack`, `link-preview-and-unfurl-behavior-by-client`, `relic-name-is-crowded-in-its-own-three-categories`, `cross-document-gaps-no-criterion-catches`.

Then read `docs/frame.md`, `docs/preconditions.md`, `docs/spec/viewer.md` in full, **`docs/spec/service.md` §§1, 2, 4.1, 5**, and `docs/spec/publish.md` §§1, 5. **§1 is not optional and it was missing before: it holds the status taxonomy your screens render, including 1.2 cap exhaustion and 1.4 takedown disclosure. You cannot write copy for statuses you never read.**

Sibling inputs: `docs/design/container.md`, `docs/design/topology.md`, and `docs/design/storage.md`. **If any is missing, fetch via `git show darkrun/relic/units/shape/<unit>:<path>` and report which path you used.** **`container.md` changed what your screens may display, so it is not background reading**: take from it the bucket-padding decision, which the pre-decryption bullet in §3 turns on, and the decided ID and fragment lengths, 25 characters and 24 characters for a 71-character relic URL on a twelve-character domain, which bound what your copy-link control and any displayed URL have to carry at a phone width. `topology.md` decides which origin serves the download path, which changes where your download control lives; do not redefine it. **`storage.md` holds every number your copy states**, which is the reason it is an input: the hard size cap, the per-object download cap, the signed-URL validity window, and the TTL, retention, and soft-delete posture that decide whether an object is gone, deleted, or expired. Take those values from it and cite them. Never invent one and never leave one abstract, which your own style section forbids.

# Art direction: the rule is originality, and the constraint is unusual

**Never ship a templated or default look.** Banned outright: warm cream plus serif plus terracotta on rounded cards; near-black with one acid-green or vermilion pop; blueprint hairlines; purple-to-blue gradient hero; Inter or Space Grotesk as the safe default; emoji as icons; everything centred with rounded corners and glassmorphism. Rotating through those is not variants, it is the same canned look in three coats.

**The register is available and it comes from the subject.** The name reads as something kept deliberately and handled once: reliquary, catalogue, label, archive, printed matter. Pull palette, type, and layout from that world, not from a SaaS starter. There is a real tension to resolve rather than ignore: a relic is old and static, and these payloads are new and TTL-bounded. The framing that reconciles them is **an archivist's handling protocol** rather than reverence, and it has the advantage of being honest about the mandatory TTL and the download cap, which are otherwise pure limitations.

**What it must never resemble, in order of damage:** a phishing page; a crypto or web3 product; a generic SaaS starter; a file locker. The receiving page has every phishing tell built into its premise, an unfamiliar domain arriving via a third party holding content it will not describe until you engage. `viewer.md`'s rule that there is **no key-entry field on the viewing origin, not configurable and not conditional**, is the single most important anti-phishing decision in the spec set, and nothing shaped like a credential field may reappear, including decoratively.

**The hard constraint that shapes the whole visual system:** the viewing origin forbids third-party scripts and its CSP blocks external resources, so **no icon kit and no web font can load**. Ship inline SVG icons and a self-hosted or data-URI typeface. This interacts directly with the bundle budget below and it is exactly the thing that gets discovered after a design is approved.

**Imagery is a first-class material where the surface can carry it.** The marketing and disclosure surfaces can; the viewing origin's chrome mostly cannot, for the same CSP reason. Say which surfaces carry imagery and which do not, rather than assuming.

# The decisions

## 1. Trust in the first five seconds, which is not a comprehension problem

Published research on security warnings found that a redesign **failed** at making the warning well understood and still moved adherence substantially, attributing the gain to opinionated design, visual cues that communicate the recommended action without being read. Field adherence rose from 37% to 62%. **So do not spend the pre-decryption window explaining zero-knowledge.** `viewer.md`'s budget of one line of plain-language explanation is correct and this is the evidence for holding it there under review pressure. The trust work is carried by visual specificity, which is the other reason a generic look is disqualifying rather than merely dull.

**The honesty register is settled prior art.** Mozilla's shipped copy for the closest predecessor never claimed the recipient was safe; it named what could not be verified. Match that posture. Their unshipped work is also instructive: the abuse-and-trust layer was the last thing they built and they killed the product before shipping it.

## 2. The taskbar, which is already overloaded and nobody could see it

Collected across four documents, the specs mandate **thirteen** elements on one bar: the bounded filename as a text node; a contents-do-not-match-the-name warning shown even when it renders; the sandbox notice and what it blocks; a blocked-external-resources notice; the Markdown source toggle; copy link, present from load; download; the abuse-report link on every screen including every error screen; the disclosure link; a truncation banner; the highlight cutoff; service name and one line of explanation; and a cap warning. Meanwhile the bar must never let a long filename push the abuse link, the copy control, or the sandbox notice off screen, and content is letterboxed because bar and content sit on different origins.

**Thirteen mandated elements plus letterboxing on a mobile-first surface. None of it is optional, so the work is hierarchy and progressive disclosure, not cutting.** Produce the actual hierarchy: what is always visible, what collapses, what moves behind a control, and what the bar looks like at a phone width.

## 3. The states nobody has written

Five gaps, all real, all yours:

- **No JavaScript.** `viewer.md` enumerates five states and none is "JavaScript unavailable," yet the static shell reaches every reader behind NoScript, a hardened browser mode, an enterprise policy, or a text browser. Today they get nothing, with no explanation and no report link. The project already values this path, since the abuse form is required to work without JavaScript. Mozilla shipped three strings for it.
- **The failed secure-context check.** `viewer.md` requires the check and a specific named error and notes a TLS-terminating proxy hits it in production. No copy exists, and a recipient cannot resolve it without being told what happened.
- **A post-mint object-fetch failure.** `service.md` mandates that a fetch failing not-found after a successful mint renders as no-longer-available and **never** as a decrypt failure, because a takedown otherwise reads to the recipient as a bad key and they blame the sender. `viewer.md` has no branch for it, so the nearest screen is the one `service.md` forbids. This arrives from `specify` as a named watch item. Whether the object is gone, soft-deleted, or lifecycle-expired is decided in `docs/design/storage.md`; read it and write the copy against what it decided.
- **Cap exhaustion versus takedown, which is the same screen twice.** `service.md` §1 returns the same status for both, and the distinct codes are for the operator's log rather than the recipient's screen. A scanner can exhaust a cap before a human ever opens the link, so a recipient on this screen may be looking at a deleted file or at a file still sitting there and out of budget. **You own every recipient-facing screen, so this decision is yours: decide whether the viewer distinguishes them, and state the support-load consequence either way.** `design-operations-and-abuse` states the need from the ticket side and consumes what you decide; it does not decide the screen. It runs after you and reads `docs/design/surface.md`.
- **The pre-decryption byte count, which went live after this brief was written.** `design-container-and-crypto` has already executed and **refused bucket padding, minimal only**, so `format.md` 3.3's qualifier is discharged and the size derivation is exact at version 1. That qualifier is the stated reason `viewer.md` §5 withholds the number, "because it changes what the viewer may display," and §5 states the rule absolutely: "the viewer never shows a plaintext byte count before decryption starts." **The rule is locked and the reason under it is gone, so decide the display question and write the copy either way.** What turns on it in each direction: a size before the recipient commits to a decrypt is a real signal on exactly the large payloads the wedge exists to carry, and a number on screen is also a disclosure surface rather than a neutral one, though `format.md` 3.8 already concedes per-relic length leakage to anyone holding the link, so displaying it surfaces a conceded leak rather than creating a new one. **If you conclude the number should appear, name that as drift routing back to `specify`**, quoting the sentence whose basis is gone, which is this station's standard form for a finding that pressures a locked decision. Do not edit `viewer.md` and do not treat this as authority to reverse it.

Also decide the **`mints_remaining` consumer**: `service.md` justifies the field by a viewer warning that `viewer.md` never specifies. Either specify the warning and its threshold, or state that the viewer does not warn, which makes that justification false and is worth saying out loud. **A threshold is meaningless without a denominator**, so state it against the per-object download cap in `docs/design/storage.md`, as a number or as a fraction of that cap.

And decide the **user-facing side of the abuse taxonomy**: whether the form shows a **personal-data category** and what it is labelled. A data subject reporting their own leaked file currently lands in `other`, and that is the report most likely to arrive from a non-technical person under stress. **The label and its place on the form are yours. The pipeline behind it, what a report in that category obliges and how it resolves, is `design-operations-and-abuse`'s.** State the need and name the owner rather than designing the handling here.

## 4. The renderer stack and the bundle budget

`viewer.md` requires highlighted output as DOM text nodes with no sanitize-then-parse escape on the viewing origin. **Two libraries satisfy that natively by emitting a tree; the popular defaults emit an HTML string, which is exactly the shape the spec forbids.** Decide the stack and state the foreclosure.

Measured gzipped sizes are in the knowledge topic, with a caveat that must travel with them: the measured entry points externalize their dependencies, so a highlighter's true cost is the entry plus the engine plus the chosen grammars. **The real lever is grammar loading, not library choice**, and the highlighted-region cap routed by `viewer.md` 7.4 is about CPU rather than bytes. Keep those separate and decide both. That cap is yours alone now; `design-topology-and-origins` is told explicitly that it is not its to decide.

## 5. The publishing moment

The tool result's shape is fixed, and the human hears whatever sentence the model composes around it. **MCP content is an array, so there is an unclaimed slot for one short human-readable sentence at the moment the URL appears.** Today the transcript disclosure lives in the tool description, read possibly weeks earlier, and a URL nobody clicks. Neither is a sentence at the moment it matters. Decide whether that slot is used and write the sentence. **The model paraphrases, so short and hard to drop beats complete**, and the honest phrasing names the transcript property without the reassurance the frame forbids.

Note the revision also offers optional display title and icon members on a tool definition as free branding, with the caveat that clients must treat such presentation as untrusted, so it is a hint and never a control.

This sentence is a different surface from the published disclosure statement in `service.md` §5, whose content, including where cross-relic correlation is disclosed, belongs to `design-operations-and-abuse`. Write yours; do not write theirs.

## 6. Three routed viewer decisions, which are yours and were pointed at the wrong unit

`viewer.md` §7 routes five items. **Three are viewer subject matter and they are yours.** The other two are not: 7.2, the hard size cap, is `design-storage-grant-and-cost`'s and arrives in `docs/design/storage.md`; 7.5, PSL registration, is `design-topology-and-origins`'s and arrives in `docs/design/topology.md`. Do not redecide either.

- **7.1, the platform memory ceilings, and whether they are hardcoded or feature-detected.** `viewer.md` §5 already requires feature detection for the streaming tier, so what is open is the in-memory ceiling's value. `viewer.md` 7.1 tells you what each candidate rests on: Apple publishes no per-tab ceiling, hat.sh's 1 GB is an empirical project decision whose stated rationale does not match current compatibility data, and the 500 to 800 MB band is one forum report. **State what your number rests on rather than inheriting one of those silently.** This value and the size cap in `docs/design/storage.md` decide together whether §5's three tiers are three or one, and storage has already stated where the collapse point sits against each candidate ceiling. Read that first, pick the ceiling, and say which outcome the pair produces.
- **7.3, the truncated-prefix size**, which `viewer.md` 7.3 notes the viewer states in its own copy. That makes it yours twice over, as a number and as a string. Decide the size and write the sentence, in the same voice as the truncation banner already mandated on the taskbar.
- **7.4, the highlighted-region cap**, decided in §4 above with the renderer stack, where the CPU-versus-bytes distinction lives. It is user-visible, so its copy is yours too.

# Do not assign obligations to siblings

State needs and name the owner. Siblings: `design-container-and-crypto`, `design-storage-grant-and-cost`, `design-topology-and-origins`, `design-operations-and-abuse`.

# Style

Direct, dry, confident, contractions natural. **Never an em-dash or en-dash.** No emoji as icons. No placeholders, no hedging verbs.

# Completion criteria

1. `test -f docs/design/surface.md` exits 0.
2. `test "$(wc -w < docs/design/surface.md)" -ge 2600` exits 0.
3. Manifest has at least six sources, one per line, trailing newline.
4. Every source resolves. Orphan check both directions.
5. **The document commits to one art direction derived from the subject**, names the banned defaults it is not, and passes its own check: this layout, palette, and type would not work unchanged on a different topic.
6. **The document states that no icon kit or web font can load on the viewing origin** and decides the substitute.
7. **All three missing states are specified with copy**: no-JavaScript, failed secure-context, and post-mint fetch failure.
8. **The `mints_remaining` consumer is decided**, either specified or explicitly declined, **and any threshold is stated against the per-object download cap in `docs/design/storage.md`** as a number or a fraction of it, never as an abstract quantity.
9. **The taskbar hierarchy is produced for a phone width**, accounting for all thirteen mandated elements plus letterboxing.
10. **The renderer stack is decided** and the string-emitting alternative is named as foreclosed with the reason.
11. **The document decides whether the viewer distinguishes cap exhaustion from takedown**, writes the copy for whichever it decided, and states the support-load consequence. This is the screen `design-operations-and-abuse` consumes; it does not decide it.
12. **The three `viewer.md` §7 items routed to this document are each decided with the consequence stated, or explicitly eliminated with the reason: 7.1 platform memory ceilings and whether they are hardcoded or feature-detected, 7.3 the truncated-prefix size, 7.4 the highlighted-region cap.** Name all three. **`viewer.md` 7.2, the hard size cap, and 7.5, PSL registration, are not decided here**; they belong to `design-storage-grant-and-cost` and `design-topology-and-origins`. The document states which in-memory ceiling it picked and whether the pair of that ceiling and storage's cap collapses `viewer.md` §5's three tiers into one.
13. **Every number this document states in recipient-facing copy is taken from a sibling document and cited to it**, never invented and never left abstract: the hard size cap, the per-object download cap, the signed-URL validity window, and the deleted-versus-expired distinction all come from `docs/design/storage.md`.
14. **Every quoted string is verified verbatim against raw source text, and the beat reports the audit as a list.**
15. **The pre-decryption byte count is decided.** `design-container-and-crypto` refused bucket padding, so `format.md` 3.3's minimal-padding qualifier is discharged and `viewer.md` §5's stated reason for withholding the number no longer holds. The document states whether an exact plaintext byte count appears before decryption, carries the copy for whichever it decided, and if it concludes the number should appear it names that as drift routing back to `specify` rather than reversing `viewer.md` §5 here. **Observing that the qualifier is discharged does not satisfy this criterion, and neither does noting that the size is now exactly derivable. Both are true, and both are the sentence that hides the decision.**
16. `test "$(grep -c '[—–]' docs/design/surface.md)" -eq 0` exits 0.

# Files touched

- `docs/design/surface.md`, `docs/design/surface.sources.txt` (create)

# Out of scope

- The container format. Locked by `docs/design/container.md`. **Its bucket-padding decision is an input to your §3 pre-decryption call, not a decision you reopen.**
- Origins, edge, TLS, the mint trigger, the mint dedup interval, PSL registration, and the name. Locked by `docs/design/topology.md`.
- The grant, cost, storage, **and every number they fix: the hard size cap, the download cap, the TTL, the retention window, the soft-delete posture, and the signed-URL validity window**. Locked by `docs/design/storage.md`. You write the copy that states them; you do not pick them.
- The abuse pipeline behind the form, the legal posture, and the legal content of the published disclosure statement including where cross-relic correlation is disclosed. Sibling `design-operations-and-abuse`. **The split is: you own every recipient-facing screen and its copy, including the cap-exhaustion-versus-takedown distinction and the personal-data category's label; operations owns the pipeline behind them.**
- Product code and actual image assets. This unit decides the direction and the rules.




## Each Unit has its own worktree — work in it

Every wave Unit is isolated on its own branch + worktree, forked off the station branch. Run that Unit's beat **inside its worktree** so its diff never tangles with another Unit's in-flight work; the manager lands each Unit back onto the station branch when it locks. Do **not** commit a Unit's work to the station branch yourself.

- `design-operations-and-abuse` → `/Users/jwaldrip/dev/src/github.com/thebushidocollective/artifacts/.darkrun/worktrees/relic/units/shape/design-operations-and-abuse` (branch `darkrun/relic/units/shape/design-operations-and-abuse`)

- `design-product-surface` → `/Users/jwaldrip/dev/src/github.com/thebushidocollective/artifacts/.darkrun/worktrees/relic/units/shape/design-product-surface` (branch `darkrun/relic/units/shape/design-product-surface`)





## The Pass loop — make → challenge → resolve

The Pass loop is adversarial on purpose: a single confident pass is exactly where LLM output is most often confidently wrong, so a second pass red-teams the first before anything locks.

- **make** — the worker produces the Unit's output against its completion criteria. Build the real thing, not a sketch.
- **challenge** — a second pass attacks what make produced: edge cases, missing handling, lazy assumptions. Assume the first pass was optimistic.
- **resolve** — reconcile make and challenge into a Unit that satisfies its completion criteria with the challenges answered.




**Quality-gate verifier nonce.** This dispatch carries a one-time verifier token: **`827b652b65f71f4c86c06f5c4311691d9ef55f9408e0f90a2dee35ca6b1f5387`**. When you record a quality gate with `darkrun_quality_gate_record`, pass it as `nonce`. The engine refuses a gate result without the matching token — so a gate is only ever recorded as part of a real verification dispatch, never self-certified. Run the gate's command for real, then record the actual outcome with this nonce.


Run **only the `designer` beat** this tick. When the beat finishes, **record it** with `darkrun_unit_iterate` — pass the `worker`, the `result` (`advance` or `reject`), and a `note`: on advance, what you did and what the next worker needs to know; on reject, why you bounced it (a reject without a reason is refused). That note becomes the next beat's handoff above. Then call `darkrun_tick`; the manager advances the loop or releases the next wave. A Unit is locked only after Resolve and its completion criteria pass.

A Unit gets a **bounded pass budget** — the manager escalates a Unit that can't converge within it to the operator rather than grinding forever. Don't paper over a stuck Unit to dodge the escalation; a Unit that needs more passes than the budget allows is a signal the spec, the scope, or the approach is wrong, and that's the operator's call to make.



## Done when

The `designer` beat is complete for every Unit in this wave and its output is recorded. Then call `darkrun_tick`.

---

# Provider contracts in effect

The project configures external-system providers whose behavior contracts apply to this phase. Follow them alongside the instructions above.

# Git Provider — Behavior Contract

darkrun is always git-backed when a `.git/` directory is present. This contract is **always active** in git environments — no settings activation needed.

## What you, the agent, must do

- Never run `git checkout`, `git merge`, `git branch -d`, or create branches manually during run operations. The engine owns branch topology, merge semantics, worktree creation, and station-branch enforcement.
- Commit substantive work (unit body edits, artifact writes, source changes) before calling `darkrun_tick` — the pre-tick clean-tree gate blocks the tick on loose agent work and hands the file list back. The engine commits its own `.darkrun/` state on every tick; it does NOT author your commits.
- **Never pair a VCS issue-closing keyword with a feedback id.** GitHub and GitLab parse `Closes`/`Fixes`/`Resolves`/`Implements` followed by an issue-shaped token as an external-issue closing reference — `Fixes fb-07` in a commit message or PR description renders a phantom closing link for a finding that is not a ticket. Use neutral phrasing — `addresses fb-07`, `per fb-07` — never a closing verb.
- Treat `git push` failures as non-fatal — the engine retries on the next tick. Don't block on a transient remote outage.
- If a station's gate is `external`, the engine watches for the PR merge signal. Don't flip frontmatter to fake the signal — the human's merge IS the decision.

## Branch architecture (read-only fact you operate against)

- **Run branch** `darkrun/<slug>/main` is the durable record. The engine commits state changes here and pushes on every tick (commit early, push often). The run's **delivery draft PR** opens against the project's default branch at run start and the engine flips it ready-for-review at seal.
- **Station branches** `darkrun/<slug>/<station>` accumulate station-scope work, synced downstream and landed by the engine.
- **Unit worktree branches** `darkrun/<slug>/units/<station>/<unit>` isolate each unit's diff — local-only, landed back onto the station branch when the unit locks.

## external_refs handling

The delivery PR's URL is stamped on `run.md` as `external_refs.pr_url` with its draft/ready status in `external_refs.other.pr_status`. You don't write these fields manually — the engine does — but you can read them to surface PR state to the operator. In DISCRETE mode the engine also opens a per-station draft PR at the station's external gate (recorded on `Station.pr_ref`); merging it is the approval.

## Proof asset uploads

Runtime-verification proof (screenshots, transcripts) is regenerated every run — attach it durably with `darkrun_proof_attach`, which records it on the run's proof ledger and posts it to the station's change request when one exists. Keep uploads idempotent — replace a re-run's proof rather than stacking duplicates.

## Non-git environments

When `.git/` is absent the engine falls back to filesystem persistence: no commits, no pushes, no worktrees, and `external` gates degrade to `ask` (there's no structural merge signal to enforce them). All run operations still work; this contract simply doesn't apply.