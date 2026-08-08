---
name: Decide the art direction, the taskbar hierarchy, and every recipient state
unit_type: ''
status: in_progress
depends_on:
- design-container-and-crypto
- design-topology-and-origins
- design-storage-grant-and-cost
worker: resolver
model: opus
station: shape
inputs:
- frame.md
- spec.md
- docs/design/container.md
- docs/design/topology.md
- docs/design/storage.md
outputs:
- docs/design/surface.md
- docs/design/surface.sources.txt
branch: darkrun/relic/units/shape/design-product-surface
started_at: 2026-07-30T15:42:37.067275+00:00
iterations:
- worker: designer
  started_at: 2026-07-30T15:42:37.067275+00:00
  completed_at: 2026-07-30T15:42:37.067275+00:00
  result: advance
  note: |-
    `docs/design/surface.md` (9,511 words) and `surface.sources.txt` (14 URLs) committed at `01c88af`. Worktree clean.

    **Gates re-run independently by the manager:** 9,511 against 2,600; 14 sources against 6; all 14 resolve; zero dashes; diff is exactly the two artifact files with no locked file. Read `storage.md` at `a9cea77` by explicit SHA rather than branch name, having first checked the log to confirm the resolve sat on top of `95853da`.

    ## The arithmetic is exact and the manager re-derived all of it

    `105,298,736 + 104,857,600 + 104,857,600 + 4,194,304 = 319,208,240`, matching to the octet. Factors 1.57, 2.51, 3.13 under the three candidate ceilings all confirm. Prefix 50x below the cap, highlight cap one eighth of the prefix, threshold 8 as one eighth of 64, decimal MB 104.9 and 105.3. **Every number checks.**

    **The strongest cross-unit result in the station: storage found a break condition and this unit closed it.** `storage.md` 1.2 found a four-copy case at 524,729,136 octets that **breaches** a 500 MB floor candidate, driven by a whole-plaintext UTF-16 decode. This beat sized the truncated prefix at 2 MiB specifically against that, dropping the decode term from 209,715,200 to 4,194,304 and bringing peak to 319,208,240. **It reproduced storage's 524,729,136 exactly as a check on its own arithmetic before building on it.** That is deliberate consumption of a sibling's finding, not luck.

    ## The sweep caught two deviations the beat would not have listed, and the second fix is the right kind

    Both found by sweeping the committed blob, not the worktree, and both fixed before commit. A case fold with a dropped terminal period on `viewer.md` §5, and an ASCII single-for-double substitution on a nested token.

    **The second fix is structural rather than another normalization fold.** It converted the clause to a block quote so the source's own double quotes stand, instead of adding a single-to-double fold that would silently rewrite genuine apostrophes. That is the remedy the citation topic prescribes and the first beat to reach for it.

    Audit: 36 double-quoted runs, 31 source quotations, **31 of 31 verified**, 5 non-source classified rather than dropped, plus 40 block-quote lines of which 2 are source and both verified. It also caught its own **test harness** dropping a `§` from a needle and correctly concluded the document was never wrong.

    ## Two provenance dimensions nobody asked for

    **Heading resolution on eleven quotations**, and it found the MCP page **renders its body twice**, with the same strings appearing again around offsets 619k and 766k under a different governing heading, because the page embeds a copy for its llms/print surface. It used the canonical body and said so. That is the fifth defect mode handled at a level past what the brief specified.

    **Firefox Send branch provenance per key.** `downloadConfirmDescription` and `reportReasonPii` exist only in v4 and are cited as unshipped; six others exist in both and are cited to v3 as shipped. **Shipped and unshipped are different evidence classes** and nothing in the criteria checks that distinction.

    ## Decisions

    **In-memory ceiling 500,000,000 octets, hardcoded**, at the bottom of the band, with hat.sh's 1 GB rejected on `viewer.md` §5's own record that its rationale is superseded and Apple rejected because inventing a number they do not publish is fabrication. **It pre-empts the misreading**: `viewer.md` §5 bans a hardcoded browser list for tier selection, and that ban stands untouched; this is one global scalar with no user-agent branch, and streaming feature detection stays required. Detection eliminated on the merits, including that `measureUserAgentSpecificMemory()` needs cross-origin isolation, which fights the shim `viewer.md` §4 makes the architecture.

    **The pair collapses three tiers into one**, and it carries the cost honestly rather than burying it: with no streaming path, raising the cap later is building tier 1 and its ServiceWorker rules, not a config change. Tier 3's screen ships anyway as an invariant alarm.

    **Highlight cap 262,144 octets plus an independent 8,192-octet single-line guard.** The second guard exists because `viewer.md` 3.3's pathological input is many megabytes on one line, and **a byte cap alone does not answer a grammar going superlinear inside one long line well within 256 KiB.** Two guards, two different failures.

    **§7.2: no plaintext byte count before decryption, and it found a better reason than the discharged one.** Exactly derivable and trustworthy are different properties and only the first was discharged. The surviving reason is that the number is unauthenticated, outside every AEAD tag and operator-mutable per `container.md` 3.2, while the envelope's content length inside the AEAD is authoritative. It substitutes `object_length`, which `service.md` 2.1 already carries and `viewer.md` §5 already certifies exact, and **defers the plaintext number to the first moment it is authenticated rather than withholding it.**

    **It routed drift anyway, at §10, though criterion 15 did not force it**, because the discharge belongs to the owner of the locked text even when the rule survives. The request is to restate the reason, not change the rule, and it says explicitly that nothing downstream should read this as permission to act on the discharge. **That is the trap the basis-discharge topic names and it did not take it.**

    ## Its ranking, which it reordered against its own interest

    It moved two items above the one instinct put first, saying plainly it would not leave the ranking where it flattered itself.

    **Number one: the icon-URI-as-callback finding in §9 has no source.** It asserts a client rendering the tool list fetches an HTTPS icon URI, turning discovery into a beacon. It verified `icons` exists and that the spec calls icon bytes untrusted; **it verified nothing about when clients fetch**, and this is the primary stated reason for refusing `icons`.

    **Number four it labels itself**: a 71-character URL wrapping claim derived from 71 being greater than 62 rather than from rendering anything, and it names the shape, "a decorative rationale under a sound rule, which is the shape this run keeps catching." **Applying the run's own lesson to itself.**

    **Base rate for the challenge: four units in a row have had their number-one nomination come back sound. Do not let this list steer the sweep.** The unstated minimum viewport width at nomination 2 is a criterion-9 deliverable with an unstated bound and is the one I would look at hardest.
- worker: pressure_tester
  started_at: 2026-08-02T20:19:38.193881+00:00
  completed_at: 2026-08-02T20:19:38.193881+00:00
  result: advance
  note: |-
    **6 defects, ordered by severity. Two change a decision. Nothing edited, nothing committed; worktree verified clean at `01c88af`.**

    ## Manager verification, run independently rather than taken from the report

    I re-derived both decision-changing defects from the raw files before recording this beat. Both hold, and the first is sharper than the pass reported.

    **Defect 1 confirmed, and the document convicts itself twice.** `viewer.md` 6.3 enumerates exactly what renders before decryption: "the branded taskbar, the service name, one line of plain-language explanation of what Relic is and what's about to happen, the abuse-report link, and the privacy-statement link." No filename, no size, no expiry. `service.md` 2.1 puts `object_length` and `relic_expires_at` on the mint response, and `topology.md` 5.1 fires the mint on the first trusted user input event and never on load. So the pre-gesture plate cannot hold either number.

    `surface.md:200` states the contradiction in a single sentence: it **quotes `topology.md` 5.1's trigger** and then concludes "the pre-decryption plate carries the service name, the custody line, the one line of explanation, the transfer size, and the expiry." It read the rule and wrote past it. `surface.md:348` then gets the identical reasoning right for `mints_remaining`: "It arrives on the mint response, so it appears after the gesture and never on the pre-decryption plate." **Same field class, same source, opposite answer, 148 lines apart.** That is not a missing fact, it is an unreconciled contradiction inside one document, which is why it ranks first.

    **Defect 2 confirmed arithmetically and it is load-bearing in two places, not one.** `surface.md:69` sets "Mono at 15px, 1.6 leading, and a 62-character measure" and calls the measure "enforced rather than incidental." At the 0.6em advance every monospace face uses, that is 62 x 15 x 0.6 = **558px** of column before any padding, against 375px on an iPhone SE and 393px on an iPhone 15. The section titled for "a phone width" specifies a measure wider than the whole device. **The second place matters more than the first:** `surface.md:434` derives the 71-character URL wrap, and with it the copy-link control's whole rationale, from that same 62-character measure. A measure that cannot exist on the target viewport cannot support a derivation.

    ## The two defects that change a decision

    ### 1. The pre-gesture plate shows data the mint has not returned yet

    The recipient's filename lives in record 0 of the encrypted object (`container.md` 3.2) and is unreadable until the object is fetched and decrypted, which cannot happen before the mint. `service.md` 2.1 lists the mint-response fields and `service.md` §2 confirms the static shell at `/{id}` mints nothing.

    `surface.md` asserts otherwise in four places: line 87 ("Before the recipient does anything, the page already shows: the service name, the custody line naming the file, the transfer size, the four margin controls, and the expiry"), section 7.1, section 6 Zone C (line 184), and section 7.2's worked example at line 222 (`TRANSFER 105.3 MB`).

    **Failing scenario:** a recipient loads `/{id}`. Nothing beyond the static shell has run. The design specifies the plate reads `TRANSFER 105.3 MB` and the header rail shows the real filename at a moment when the client has not sent the request that would produce either.

    **Fix:** revise line 87, section 6 Zone A and Zone C, and sections 7.1 through 7.2 so the pre-gesture plate carries only what `viewer.md` 6.3 licenses, the service name and the one line of explanation. Move custody line, transfer size, and expiry to arrive with the mint response, rendering at the start of the Fetching phase `viewer.md` 6.4 already defines. **Zone A's custody-line content for the interstitial state between click and mint response is currently undefined and must be specified;** "the state name once a state mark applies" does not cover it, because no state mark has fired. The "five true things" framing in section 3 drops to what actually precedes the click.

    ### 2. The 62-character measure cannot fit the phone width the section is titled for

    **Failing scenario:** the failed secure-context error copy in section 7.4 is two sentences, exactly the prose class section 2 assigns the 62-character measure. On a 375px phone at 15px it cannot be honored. Either it silently narrows, contradicting "enforced rather than incidental," or it overflows the viewport. Neither is written down.

    **Fix:** state the design's minimum supported viewport width once, then either state a narrower measure for the viewing origin specifically and reserve 62 characters for desk width (section 6 already says nothing about the hierarchy changes there), or state the reflow rule at narrow widths explicitly. **Whichever you pick, revisit line 434:** the 71-character URL wrap is derived from the 62-character measure, so if the measure changes on phones, that derivation needs restating or dropping.

    ## The remaining defects

    ### 3. The icon-URI-as-callback claim in section 9 has no source, independently confirmed

    Section 9 states as fact that "every client that renders the tool list fetches it, which tells Relic's origin that a given address has the publishing client installed, before any publish," citing the MCP base protocol page only for the adjacent untrusted-metadata sentence. The pass curled `basic/index` (447,502 raw bytes) and `server/tools` (840,621 bytes) and found no statement about when or whether a client fetches an icon URI. The security-precautions list ("fetch without credentials," "verify same-origin," "validate MIME types before rendering") presupposes some clients fetch icons and says nothing about universality or timing.

    **This does not reverse the decision.** The asymmetric-cost argument, zero cost to omitting against nonzero cost if the claim holds, favors declining `icons` either way. What is wrong is an unverified behavioral inference presented as protocol fact beside a citation that does not cover it.

    **Fix:** rephrase as an inference from ordinary client UI convention, analogous to browsers fetching favicons on tab render, or drop the timing claim and rest the refusal on the same-origin-verification requirement the spec does state.

    ### 4. Cap-exhaustion copy gives one remedy to two populations and recreates the failure for one of them

    `storage.md` 4.4 sets the download cap at 64 against a sourced floor of 40. Section 7.6's copy reads "Ask the sender to publish it again. A new relic gets a new link and a fresh count." For a distribution list materially larger than 40, republishing produces another 64-cap relic that the same oversized list exhausts again. The copy does not separate "a scanner caught you" from "your list is bigger than the cap," and the advice fails silently for the second.

    **Fix:** one conditional clause naming that a large list may need multiple relics. This is surface's copy to write even though the cap value is not, and it costs nothing against `storage.md`.

    ### 5. `report_url`'s distinctness is argued but never wired to a distinct control

    Section 7.6 makes `report_url`'s presence on `relic_removed` and absence on `download_cap_exhausted` the second of three reasons the screens must differ: a merged screen "either shows an appeal link that is wrong half the time or drops the field `service.md` 1.4 calls the thing that makes the appeal path real." But the removed screen's copy, "the report link below reaches a person," points at the generic Zone D report control present on every screen. The argument's evidentiary weight is not reflected in a differentiated control.

    **Fix:** one sentence stating whether the margin's report control routes through `report_url` on this screen, or is generic with the field's use left to `design-operations-and-abuse`.

    ### 6. `3 more notices` reads as a literal string

    Section 6 Zone B backtick-formats it like every other literal UI string, but the count is dynamic, 0 to 3, since 5 notices minus 2 always-expanded leaves at most 3. An implementer copying backtick strings literally ships a permanently wrong count.

    **Fix:** format as `N more notices`, or state that 3 is the worst case rather than the string.

    ## Quotation audit

    **35 double-quoted runs of 8 or more characters swept. 1 markup-parsing artifact, 6 non-source, 28 source quotations, 28 of 28 verified, zero deviations.** The designer self-reported 36; the one-off is a threshold difference in the regex, not a missed defect. The 6 non-source runs are classified rather than dropped: the document's own rhetorical and UI-copy uses, including the explicitly rejected overclaim "Nobody but the recipient can read your file," and "A new relic gets a new link," which the document itself discloses as paraphrase.

    **Three false negatives resolved by the exact normalizations the citation-defects topic prescribes, none surviving as real defects.** MDN Secure Contexts wraps `https://` in a code tag mid-sentence and matches tag-stripped. ogp.me carries a raw newline inside "The four required properties for every page are" and matches whitespace-normalized. The Felt et al. adherence quotation failed only because `pdftotext -layout` interleaves the paper's two columns and spliced a citation line into the middle of the sentence; read in single-column order it is exact. **That third one is a new false-negative mode for this run: two-column PDF extraction, not markup.** Worth carrying into the remaining sweeps.

    **Block quotes: 40 lines, matching the designer's count. 2 are source, both verified verbatim against `viewer.md` in the worktree. The other 38 are the document's own authored recipient-facing copy, which is the deliverable itself.**

    **The double-rendered MCP page reproduces, and on both pages rather than one.** `server/tools` carries "Optional array of icons for display in user interfaces" at offsets 181,991, 593,302 and 740,333, three occurrences rather than two; `basic/index` carries the untrusted-metadata string at 212,526 and 443,126. In both files the first offset sits inside genuine rendered article HTML, confirmed by pulling the surrounding markup and finding real `h3`, `ul` and `li` tags, while every later offset sits inside an escaped JSX/RSC hydration payload. **Unlike the storage.md wrong-table trap this duplication carries no scope risk, because every copy says the same thing.** The citations point at the canonical occurrence in both files, as claimed.

    **Arithmetic re-derived independently, not trusted.** `105,298,736 + 104,857,600 + 104,857,600 + 4,194,304 = 319,208,240` exact. Factors 1.57, 2.51 and 3.13 confirmed against the three candidate ceilings. `104,857,600 / 2,097,152 = 50`, `2,097,152 / 8 = 262,144`, `64 / 8 = 8`, and both decimal MB conversions round correctly. **`storage.md` was pulled at both `95853da` and `a9cea77` and diffed: the four-copy break case at 524,729,136 octets that section 4.4 sizes the 2 MiB truncation against exists only at `a9cea77`,** confirming the designer built its load-bearing arithmetic on the resolved tip rather than the stale base.

    ## Adjudication of the designer's nominations

    **Nomination 1, the unsourced icon-URI-as-callback claim: real, confirmed on independent fetch rather than on trust.** Both spec pages were curled and contain zero text on fetch timing or universality. It is a citation-integrity defect, an inference dressed as fact, not a reason to reverse the decision to omit `icons`. **Ranked 3 rather than 1 here precisely because it does not change what the document decides**, which is the distinction the designer's own ranking blurred.

    **Nomination 2, the unstated minimum viewport width: sound, and sharper than flagged.** The designer named it as the item to look at hardest and was right. It is not an absence, it is an arithmetic conflict between two numbers the document commits to. Promoted to a decision-changing defect.

    **Nomination 4, the 71-character URL wrapping claim: decorative as self-labeled, and harmless on its own terms.** The decision it attaches to, that the copy-link control copies rather than displays, is independently justified by section 1's no-credential-field-lookalike rule and holds regardless of wrapping. **It stops being harmless only through defect 2**, since it is derived from the measure that cannot exist on a phone. Fix it there, not here.

    **That makes five units in a row where the number-one self-nomination came back sound or real. The base-rate warning is now well evidenced and the challenge should keep ignoring the ranking, which is exactly what happened: the two defects that change a decision were found by sweep, and one of them the designer never nominated at all.**

    ## What a verbatim sweep structurally cannot catch

    Whether real MCP clients fetch icon URIs at tool-list-render time; no spec text answers it either way and only testing clients resolves it. Whether the taskbar's fixed-width zones and flexible custody line lay out at true phone widths, and what the measure does when it cannot fit, which needs a browser rather than a text audit. Whether the IBM Plex Mono byte measurements of 10,052, 10,120 and 20,172 octets are current: **no URL is cited for the measurement itself**, unlike the renderer costs which trace to a dated knowledge-topic table, so it could not be reproduced. **Add a source for those three numbers or mark them as measured-here with a date.** Whether the `report_url` distinction matters depends on operations' not-yet-written pipeline. Whether the cap-exhaustion copy gap is a real support cost depends on list-size distribution nobody has.
reviews:
  fit:
    at: 2026-07-30T11:40:36.253906+00:00
  reversibility:
    at: 2026-07-30T11:39:37.092582+00:00
  simplicity:
    at: 2026-07-30T11:41:12.361511+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/design/surface.md
- name: substance-floor
  command: test "$(wc -w < docs/design/surface.md)" -ge 2600
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/design/surface.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/surface.sources.txt'
gate_results:
- name: artifact-exists
  status: pass
  at: 2026-08-02T20:30:37.034586+00:00
  attempts: 1
  detail: '`test -f docs/design/surface.md` exits 0 at `5e7685a`. Companion manifest `docs/design/surface.sources.txt` present. Manager-run in the unit worktree, not taken from the worker''s report. `git diff --name-only HEAD~1 HEAD` returns `docs/design/surface.md` alone, so the resolve pass touched no locked file and no sibling''s document.'
- name: substance-floor
  status: pass
  at: 2026-08-02T20:30:40.219051+00:00
  attempts: 1
  detail: '`wc -w` returns 10,480 against a floor of 2,600. Grew from 9,511 at the designer beat, +969 words across 18 insertions and 10 deletions, all of it the two decision-changing fixes: the pre-gesture plate correction with the newly specified interstitial state, and the 320 CSS pixel viewport floor with the fluid prose measure. No ceiling on this gate.'
---

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
