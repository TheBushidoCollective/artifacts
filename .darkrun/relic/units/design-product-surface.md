---
name: Decide the art direction, the taskbar hierarchy, and every recipient state
unit_type: ''
status: pending
depends_on:
- design-container-and-crypto
- design-topology-and-origins
- design-storage-grant-and-cost
worker: ''
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
quality_gates:
- name: artifact-exists
  command: test -f docs/design/surface.md
- name: substance-floor
  command: test "$(wc -w < docs/design/surface.md)" -ge 2600
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/design/surface.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/surface.sources.txt'
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
