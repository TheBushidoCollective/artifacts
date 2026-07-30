---
name: Decide the art direction, the taskbar hierarchy, and every recipient state
unit_type: ''
status: pending
depends_on:
- design-container-and-crypto
- design-topology-and-origins
worker: ''
model: opus
station: shape
inputs:
- docs/design/container.md
- docs/design/topology.md
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

Then read `docs/frame.md`, `docs/preconditions.md`, `docs/spec/viewer.md` in full, `docs/spec/service.md` §§2, 4.1, 5, and `docs/spec/publish.md` §§1, 5. Sibling inputs: `docs/design/container.md` and `docs/design/topology.md`. **If either is missing, fetch via `git show darkrun/relic/units/shape/<unit>:<path>` and report which path you used.** `topology.md` decides which origin serves the download path, which changes where your download control lives; do not redefine it.

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

Three gaps, all real, all yours:

- **No JavaScript.** `viewer.md` enumerates five states and none is "JavaScript unavailable," yet the static shell reaches every reader behind NoScript, a hardened browser mode, an enterprise policy, or a text browser. Today they get nothing, with no explanation and no report link. The project already values this path, since the abuse form is required to work without JavaScript. Mozilla shipped three strings for it.
- **The failed secure-context check.** `viewer.md` requires the check and a specific named error and notes a TLS-terminating proxy hits it in production. No copy exists, and a recipient cannot resolve it without being told what happened.
- **A post-mint object-fetch failure.** `service.md` mandates that a fetch failing not-found after a successful mint renders as no-longer-available and **never** as a decrypt failure, because a takedown otherwise reads to the recipient as a bad key and they blame the sender. `viewer.md` has no branch for it, so the nearest screen is the one `service.md` forbids. This arrives from `specify` as a named watch item.

Also decide the **`mints_remaining` consumer**: `service.md` justifies the field by a viewer warning that `viewer.md` never specifies. Either specify the warning and its threshold, or state that the viewer does not warn, which makes that justification false and is worth saying out loud.

And decide whether the abuse taxonomy needs a **personal-data category**. A data subject reporting their own leaked file currently lands in `other`, and that is the report most likely to arrive from a non-technical person under stress.

## 4. The renderer stack and the bundle budget

`viewer.md` requires highlighted output as DOM text nodes with no sanitize-then-parse escape on the viewing origin. **Two libraries satisfy that natively by emitting a tree; the popular defaults emit an HTML string, which is exactly the shape the spec forbids.** Decide the stack and state the foreclosure.

Measured gzipped sizes are in the knowledge topic, with a caveat that must travel with them: the measured entry points externalize their dependencies, so a highlighter's true cost is the entry plus the engine plus the chosen grammars. **The real lever is grammar loading, not library choice**, and the highlighted-region cap routed by `viewer.md` is about CPU rather than bytes. Keep those separate and decide both.

## 5. The publishing moment

The tool result's shape is fixed, and the human hears whatever sentence the model composes around it. **MCP content is an array, so there is an unclaimed slot for one short human-readable sentence at the moment the URL appears.** Today the transcript disclosure lives in the tool description, read possibly weeks earlier, and a URL nobody clicks. Neither is a sentence at the moment it matters. Decide whether that slot is used and write the sentence. **The model paraphrases, so short and hard to drop beats complete**, and the honest phrasing names the transcript property without the reassurance the frame forbids.

Note the revision also offers optional display title and icon members on a tool definition as free branding, with the caveat that clients must treat such presentation as untrusted, so it is a hint and never a control.

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
8. **The `mints_remaining` consumer is decided**, either specified or explicitly declined.
9. **The taskbar hierarchy is produced for a phone width**, accounting for all thirteen mandated elements plus letterboxing.
10. **The renderer stack is decided** and the string-emitting alternative is named as foreclosed with the reason.
11. **Every quoted string is verified verbatim against raw source text, and the beat reports the audit as a list.**
12. `grep -c '[—–]' docs/design/surface.md` returns 0.

# Files touched

- `docs/design/surface.md`, `docs/design/surface.sources.txt` (create)

# Out of scope

- The container format. Locked by `docs/design/container.md`.
- Origins, edge, TLS, the mint trigger. Locked by `docs/design/topology.md`.
- The grant, cost, and storage. Sibling `design-storage-grant-and-cost`.
- Abuse operations and legal posture. Sibling `design-operations-and-abuse`.
- Product code and actual image assets. This unit decides the direction and the rules.
