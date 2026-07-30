---
name: Decide the origins, the edge, and when the mint fires
unit_type: ''
status: in_progress
depends_on:
- design-container-and-crypto
worker: ''
model: opus
station: shape
inputs:
- frame.md
- spec.md
- docs/design/container.md
outputs:
- docs/design/topology.md
- docs/design/topology.sources.txt
branch: darkrun/relic/units/shape/design-topology-and-origins
started_at: 2026-07-30T12:54:23.852329+00:00
iterations:
- worker: designer
  started_at: 2026-07-30T12:54:23.852329+00:00
  completed_at: 2026-07-30T12:54:23.852329+00:00
  result: advance
  note: |-
    `docs/design/topology.md` (7,457 words) and `topology.sources.txt` (23 URLs) committed at `3d54b6c`. Worktree clean.

    **Gates re-run independently by the manager:** artifact-exists PASS; substance-floor 7457 against 2400; sources 23 against 6; all 23 URLs resolve; zero dashes. **Criterion 16 spot-checked:** the four routed items that are not this unit's appear exactly once, in the disclaimer naming their owners, and nowhere else.

    ## A precondition deviation that was correct, and an engine-state item for audit

    The beat reported that `docs/design/container.md` was **not** in its worktree, and took the spec's documented `git show` fallback rather than stopping. **Manager-verified: it was right, and the fallback was necessary.** `git ls-tree darkrun/relic/shape -- docs/design/` returns **empty**, so container's output has not landed on the station branch despite the unit being `completed` with all four gates recorded.

    **Flagging for audit: the land has not happened.** This is the same class as the `specify` station's land question, which resolved itself at unit completion there. It has not here. The two remaining waves both declare sibling inputs, so every downstream beat will hit the same gap and take the same fallback. That works, but it means no unit is reading its sibling from the station branch.

    ## Decisions

    Download path: **`blob:` save on the viewing origin under `a[download]`**, with all three paths enumerated and the other two rejected against locked rules. Edge: decided on render path with both candidates priced. Mint: **first trusted user input**, rejecting every passive signal. Dedup interval: **300 seconds**. Edge fidelity: **`deny(429)`**, with `503` identified as the status the edge cannot emit so that code can only come from the application. Name: **not picked**, stated as a blocker.

    ## Criterion 7 satisfied in all four parts, which is the hard one

    The site-versus-origin distinction is stated with the consequence that every per-relic label shares one registrable domain and buys no process isolation while every cost stays. **What survives is worked out per reason rather than asserted:** the site-keyed rationale is gone, the origin-keyed one survives because same-origin policy compares scheme, host, and port, and `document.domain` is checked three independent ways and comes out not making the second reason PSL-dependent. Both branches designed with costs owned, and the document states explicitly that it does not pick. Drift routed to `specify` with the two sentences quoted and the unavailable-at-this-scale scope carried.

    ## The quotation sweep found six real defects that its own claim list missed

    **The beat shipped six and caught all six on the sweep.** Every one was a case alteration or a markup boundary inside a run it had bolded as if quoting a locked document: five initial-capital alterations, and one where the source's asterisks sit inside the quoted span. Fixed as three verified block quotes and three rewrites into unambiguous paraphrase.

    **Its hand-built claim list contained none of the six.** That is the second independent confirmation on this run that the sweep beats the claim list, and the mechanism is now clear: a writer cannot list a quotation they did not notice themselves making.

    It also adopted the container resolve pass's discipline unprompted, so **zero double-quoted runs of 12 or more characters exist outside block quotes** and criterion 15 is mechanically checkable. Three MISSes during verification were confirmed false negatives from markup boundaries rather than defects.

    ## What the challenge pass should attack, in the beat's own ranking

    1. **The mint trigger is the weakest load-bearing claim.** It rejected visible-and-focused on the grounds that a headless browser reports both by default, and **says plainly it did not verify that against a source; it is reasoning, not evidence.** If wrong, a cheaper gate exists and the wedge was taxed for nothing. **Verify this first.**
    2. **300 seconds is a judgment number with no measurement behind it.** The beat argued itself down from 3600 mid-draft on the grounds that the interval's only job is a recipient reload and that stretching it to catch scanners repeats the anchor mistake `service.md` 2.2 already records. It does not defend 300 against 180 or 600.
    3. **The `blob:` download attribution is unverified and the beat says so.** Its defence is that the sandbox path is closed by locked rules regardless, so the decision is forced independently of the answer. **Attack whether that is actually true**, because if it is not, the section's Safe Browsing framing is decorative.
    4. **Certificate Manager removing the DNS-credential problem is its best finding and it flips the spec's stated cost.** It rests on the `_acme-challenge` CNAME delegating the challenge, read off the docs and quoted, but no certificate was stood up to prove renewal needs no further DNS writes.
    5. **The signed URL crossing a third-party edge at TLS termination** is derived rather than sourced, and it is doing real work in the edge decision.

    Two it is more confident of than their length suggests: the `document.domain` analysis, checked three ways; and the edge-status completeness argument, which is exhaustive over the whole valid set rather than a preference.

    ## One finding no criterion covers, and it is operator-relevant

    **The availability check caught its own failure mode.** An RDAP aggregator reported `relic.io` as unregistered; each registry's own RDAP service, resolved through the IANA bootstrap, returns 200 and shows it registered and parked. `relic.com`, `relic.dev`, `relic.app`, `relic.host`, and `getrelic.com` are also all registered. **If any other beat on this run has checked domain availability through an aggregator, that result is suspect.**
- worker: pressure_tester
  started_at: 2026-07-30T13:13:30.596049+00:00
  completed_at: 2026-07-30T13:13:30.596049+00:00
  result: advance
  note: |-
    Fourteen findings against `3d54b6c`, plus verdicts on all five nominated weaknesses. **Two attacks were settled by running Google Chrome 150 headless on this machine rather than by argument.**

    **Its closing line is the finding of the station:** every decision in this document survives. What does not survive is the **stated basis** for three of them, which is the failure mode this run keeps recording and which no criterion in the unit catches.

    **Manager-verified the three decisive claims before recording.**

    ## The nominations, and three come out stronger than the beat believed

    | # | Nomination | Verdict |
    |---|---|---|
    | 1 | Mint trigger | **Survives. The beat worried about the wrong half of its own paragraph.** |
    | 2 | 300 seconds | **Does not survive, and it is worse than nominated.** |
    | 3 | `blob:` attribution | **Survives. The defence is right.** |
    | 4 | Certificate Manager | **Survives in substance; the renewal half is unsourced.** |
    | 5 | Third-party edge sees the signed URL | **Survives, and it is sourced rather than derived.** |

    ## Must fix

    **F1, high. The load-bearing sentence of the mint decision is false, and it is the one the beat did not flag.** The document says a headless previewer structurally cannot produce a trusted user input event. **Measured false:** headless Chrome driven over CDP delivers `pointerdown`, `mousedown`, `click`, `keydown`, and `wheel` all with `isTrusted=true`. Events injected at the browser process are indistinguishable from a human's, and `isTrusted` has never discriminated automation.

    Meanwhile **the half the beat did flag is true and understated.** In both headless modes with no user present, the browser **synthesizes a real focus event at 3ms** and settles at `visibilityState=visible`, `hasFocus=true`, with no `visibilitychange` ever firing. Against the measured 20-second previewer execution budget the margin is three orders of magnitude.

    So rejecting visible-and-focused is correct and now has evidence, while the reason given for preferring trusted input is counterfeit. The fix is to replace the structural claim with the behavioral one that actually holds: link-preview fetchers do not click and have nowhere to click, so the gate defeats the **observed** previewer population and is **not** a barrier against an adversary who wants to burn the cap, because that adversary can inject trusted input for free. F10 and F11 inherit the same overclaim.

    **F2, high. The 300-second rationale rests on a case a locked rule removes.** The document says what is left for the interval is a hard reload, a reopen, or a second tab, and that those happen on a scale of minutes. **A hard reload cannot produce a mint at all.** Manager-confirmed at `format.md:113`: "**A reload loses the key.** The reloaded page is dead and must say so." Strike it and the surviving cases are a reopen or a second tab from the original link, **neither of which is bounded in time**, so the phrase carrying the entire justification for 300 rests on the one case that cannot occur. That is worse than a judgment number with no measurement.

    **Second-order, and it is inherited drift:** `service.md` 2.2 justifies the interval by "a recipient reloading the page," which is in the same tension with `format.md` §2.5. The topology document repeated it rather than catching it. Route as drift alongside the §1.7 routing already there.

    **F3, high. Branch B's edge cost is justified by a reason the document's own cited source contradicts.** It claims the two-domain split is what puts something in front of Cloud Run. The page already in its manifest and quoted three times says "You can map multiple custom domains to the same Cloud Run service." Domain count is not the blocker; the preview status the document itself quotes is. The conclusion survives, but a reader who checks the stated reason lands on "branch B needs no edge, so branch B is free," dropping a standing cost from an already-tilted comparison.

    **F4, high. The ALB is priced as fixed-only and two documented cost terms are missing.** The $18.25 forwarding-rule arithmetic is right and is not the whole cost. Load-balancer data processing is $0.008 per GiB inbound and outbound on the page already cited, and it lands on exactly the traffic §5.3 identifies as recurring egress that **the kill switch cannot stop**, because unfurls do not mint. Cloud Armor is named three times and priced zero times. **Manager-verified arithmetic: $5.00 per policy per month plus $1.00 per rule, so one policy with the four named rules the document deliberately creates gives a $27.25 floor rather than $18.25**, plus per-GiB and per-million-requests. Every omitted term cuts toward the rejected candidate, on a project whose cost precondition is a kill switch.

    ## Should fix

    **F5, medium. The availability table applies one condition and reports two dispositions.** The method says every check resolved through the IANA bootstrap. **Manager-verified against the live bootstrap, publication 2026-07-23: `.io` and `.sh` are both absent.** One row reports a registry RDAP 200 and the other reports no service in the bootstrap. The conclusion is right and independently confirmed by delegation to a parking service, but the stated basis could not have produced it, in the section whose entire value is being trustworthy about exactly this. It also lightly undercuts the beat's own operator finding: it correctly distrusted the aggregator, then recorded a basis its stated method could not yield. Every other row re-verified correct.

    **F6, medium. Both branches are designed and the framing is not symmetric.** Branch A gets one benefit, two negations, and six costs. Branch B gets one loss bounded by "That is the whole of the loss," five cost-removals in positive voice, and two bonus upsides. **The sharpest tell: the passive-DNS residual is a cost of branch A and appears nowhere in A's cost list, only in B's section as B's third advantage.** A reader finishes with a clear preference. That is the smuggling the unit forbids even though no sentence picks.

    **F7, medium.** The mint decision's empirical basis is a 2020 measurement asserted in the present tense, of two vendors that have both rebuilt their preview infrastructure since. The quotes verify; the date is undisclosed. The unit spec inherited the same framing, so this is not the beat's invention.

    **F8, medium. The Certificate Manager mechanism verifies and its renewal half does not.** The CNAME delegation is on the cited page with a worked example and both block quotes verbatim. "Google answers the challenge on every renewal" is **not** on that page; the sentence that closes it is on the overview page, which is neither cited nor in the manifest. **A larger gap in the same section:** choosing Certificate Manager means the CA is Google and the issuance is not ACME, which **moots the entire preceding Let's Encrypt analysis**, and the document never says so. It also states no limit for the CA it does choose, where the relevant one exists: SANs capped at 100 under DNS authorization.

    **F9 through F14, lower.** The third-party-edge cost assumes an unstated deployment and the worse version is missing (a third party serving the shim reads **plaintext**, not just ciphertext). `wheel` is the weakest member of the qualifying input set, since scrolling is exactly what a screenshotting previewer does. §8's "nothing here depends on the number" is wrong, because 300 seconds is a floor constraint on a sibling's validity window and should be routed as one. The 71-character URL ceiling holds over the listed candidates, not over the decision. `frame.md` marks its 120 seconds provisional and this document treats it as fixed. One citation is topical but does not address its claim, low consequence because a neighbouring quote carries it.

    ## Verified clean, and it checked rather than trusted

    **All 61 block quotes verbatim** under the full ordered normalization. Ten initial misses all resolved as documented false negatives: four from markup boundaries, six from locked project documents absent from its web haystack, each then confirmed by direct grep. **No mode 3 defect exists.** The make pass's six fixes held.

    **The mechanical-checkability claim is true and was not taken on trust:** zero double-quoted runs of 12 or more characters outside block quotes.

    **Criterion 7(b) is genuinely done**, with all three `document.domain` checks verified against MDN.

    **And the document is more careful than the unit spec I wrote.** My spec said `document.domain` is "deprecated and inert by default in current Chrome." That is wrong; it is inert **with** COOP/COEP or `Origin-Agent-Cluster`, not by default. The document says "inert under modern isolation," which is correct. **It declined to repeat an overclaim it was handed**, which is the fifth manager error caught on this station.

    **Nomination 3's defence holds and matters:** the sandbox download path is closed by locked rules independently of the attribution question, so the Safe Browsing framing is load-bearing rather than decorative. The document's handling of the open residual is exemplary and should not be softened.

    Gates re-verified, orphan check clean both directions, criterion 16 clean with **no decision-by-implication** against the four foreign routed items. Arithmetic re-derived rather than read, with no factor-class error anywhere.

    ## Suggested order

    F1 and F2 change what the document asserts and are both cheap. F3 and F4 make the edge decision honest without changing it. F5, F6, F8 are integrity repairs to sections whose conclusions stand. The rest are one-sentence additions. **Nothing here argues for reversing a decision.**
- worker: resolver
  started_at: 2026-07-30T13:38:14.510060+00:00
  completed_at: 2026-07-30T13:38:14.510060+00:00
  result: advance
  note: |-
    Resolve complete at `18494dc`, 7,457 to 10,213 words, manifest 23 to 25 URLs, worktree clean. **All fourteen findings fixed. No decision reversed.**

    **Gates re-run independently by the manager:** 10213 words against 2400; 25 sources against 6; all 25 URLs resolve; zero dashes. **Scope re-verified:** A and B still not picked, the name still not picked, the four foreign routed items still appear exactly once in the disclaimer.

    ## It corrected the challenge pass three times, and all three corrections hold

    **1. The Cloud Armor arithmetic is $25.25, not $27.25.** The challenge pass assumed four named rules. The resolver checked: `grep -oh '[a-z_]*rate_limited' docs/spec/*.md` returns exactly **two** codes, `mint_rate_limited` and `publish_rate_limited`, and §6's rule is one rule per code. **Manager-confirmed: two codes, and one policy plus two rules plus the forwarding rule is $25.25.** It also states the per-rule term explicitly so the figure moves a dollar at a time if the count grows.

    **2. The Certificate Manager CA framing was wrong in the challenge note.** That note said the CA is Google and issuance is not ACME. The overview page says Certificate Manager supports **both the Public CA and the Let's Encrypt CA**. The accurate load-bearing point is that the ACME account, client, and challenge response are Certificate Manager's rather than Relic's, so the Let's Encrypt analysis describes the path not taken rather than a mooted CA.

    **3. It could not reproduce the 3ms focus-event timestamp**, because its listener attached post-load, so the document states the settled state it measured and does not repeat 3ms. **It documents the artifact reading in the text**, so anyone repeating the test is not misled.

    ## It also diagnosed its own contradictory measurement rather than picking a side

    Its first focus probe returned `hasFocus() === false`, diverging from the challenge pass. It found the cause: it had navigated into a tab opened at `about:blank` and never focused. Re-run with the page as the browser's **startup URL**, which is how a previewer actually drives it, gives `visible`, `hidden: false`, `hasFocus: true` in both headless modes, sampled to 3 seconds, with no `visibilitychange`. **The challenge pass's substance holds and now has a stated reproduction condition it lacked.**

    ## The two findings that changed what the document asserts

    **F1:** the structural claim is gone, replaced with the measured behavioral one. The gate defeats the observed previewer population and is not a barrier against an adversary who can inject trusted input. Decision unchanged.

    **F2:** the hard-reload case is struck against `format.md` §2.5, quoted, and 300 seconds is restated as a judgment value with nothing pinning it. `service.md` 2.2's tension with that locked rule is **routed as a second drift item**, alongside the PSL routing already present.

    ## F5 rebuilt on re-verified data, with a rule stated

    Live IANA bootstrap, publication `2026-07-23T02:00:03Z`, independently confirmed: `.io` and `.sh` absent, eight other TLDs present. Every row re-queried. The table now splits basis by registrar and states the rule that makes one absence mean registered and another mean not established: **positive evidence promotes, absence never does.**

    ## F6 fixed in the direction that matters

    The passive-DNS residual moved into branch A's cost list where it belongs, branch A given a closing paragraph matching B's, and B's two consequences relabeled as mirrors of A's costs rather than upsides. Brittle cost counts removed.

    ## One it caught on its own review

    It had written the validity-window constraint **backwards** in §5.2, flooring the interval by the window rather than the window by the interval. Corrected, with §8 made to agree.

    ## Quotation audit

    **66 block quotes, 66 verbatim, zero defects.** Three MISSes all resolved as markup-boundary false negatives, confirmed against raw HTML: two from `<code>` spans inserting a space before punctuation, and one where the quote stops immediately before a literal em-dash entity, a deliberate truncation to keep criterion 17 clean.

    It also verified the PSL guidelines quotes resolve against the guidelines page itself rather than only against `viewer.md`, which quotes the same text. **That is the relay-of-a-relay check, run unprompted.**

    **The mechanical property is preserved:** zero double-quoted runs of 12 or more characters outside block quotes. All six new figures are stated in prose with citations rather than quoted from table cells, because those cells concatenate label and value across a markup boundary.

    ## Left alone, correctly

    Nomination 3's handling untouched, including the explicit statement that no source states the `blob:` attribution residual. Criterion 7(b) untouched, with `document.domain` still reading **inert under modern isolation** rather than the unit spec's incorrect "inert by default." Every decision block present and unreversed; the only decision-text change is `wheel` leaving the mint gate's qualifying set, which was F10.
reviews:
  fit:
    at: 2026-07-30T11:40:36.253906+00:00
  reversibility:
    at: 2026-07-30T11:39:37.092582+00:00
  simplicity:
    at: 2026-07-30T11:41:12.361511+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/design/topology.md
- name: substance-floor
  command: test "$(wc -w < docs/design/topology.md)" -ge 2400
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/design/topology.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/topology.sources.txt'
---

# Goal

Write `docs/design/topology.md`: the decided origin split, edge and TLS topology, domain workstream, the mint trigger, the mint dedup interval, and the naming decision as a blocker. Plus `docs/design/topology.sources.txt`, one URL per line, trailing newline.

**Read first:** `darkrun_knowledge_list`, especially `per-relic-subdomain-topology-wildcard-tls-psl-and-hsts`, `link-preview-and-unfurl-behavior-by-client`, `safe-browsing-delisting-and-why-a-zero-knowledge-operator-cannot-comply`, `domain-strategy-and-safe-browsing-blast-radius`, `relic-name-is-crowded-in-its-own-three-categories`, `gcs-cloud-run-architecture-constraints`, `relic-stack-options-and-what-each-forecloses`, `citation-defects-and-the-three-checks-that-catch-them`.

Then read from the repo root: `docs/frame.md` and `docs/preconditions.md`, locked; `docs/spec/viewer.md` (**§2 the sandbox origin's shape, in full and closely, because the section below turns on what it rests its decision on**, §1.7 redirects, §4 the boundary, §7 item 5 the PSL, which is the only `viewer.md` §7 item that is yours); `docs/spec/service.md` (§2 the static shell and the mint, **§2.2 the mint counting rules**, §6 third-party rewriters, **§7 items 1 and 7, which are yours**); and your sibling input `docs/design/container.md`.

**If `docs/design/container.md` is missing, fetch it via `git show darkrun/relic/units/shape/design-container-and-crypto:docs/design/container.md` and report which path you used.**

# Source discipline

Five citation defects shipped in `specify`, and **none would have failed the URL-resolution gate**. Pull raw text and grep it. **Never WebFetch a specification.** Audit every quoted string; criterion 15 makes it checkable.

# What is already foreclosed. Do not design against it.

- **The Public Suffix List.** A pre-launch project sits inside two published decline criteria, an honest rationale states the declined objective in the maintainers' own words, and a granted entry propagates on browser-release timescales. **Origin isolation comes from separate registrable domains alone.** Read the next section before you design anything against this one; the foreclosure has a consequence nobody carried.
- **Cloud Run's own custom domain mappings, and nothing wider.** They cannot carry a wildcard certificate and they are preview rather than production-ready, so they are out as the TLS and fronting layer. **That is the whole of the constraint. Cloud Run itself is not foreclosed.** A global external Application Load Balancer with a Certificate Manager wildcard under DNS authorization does support wildcards, and it says nothing about what sits behind it, which throughout this run's knowledge is Cloud Run. Treat the load balancer and a non-GCP edge as a live comparison in §2, not a forced choice.
  **Why the narrow reading matters, since this is a reversal argument in the other direction:** the over-broad reading pushes the design toward a third-party edge, and §2 already says what a third party in the render path costs belongs in the published disclosure statement. Walking a published disclosure back is a public revision of the zero-knowledge posture. That is a real reversal cost paid for a foreclosure that was never real, and it is the exact pattern `gcs-false-impossibility-claims` records: asserting an impossibility where the real answer is a cost or a design choice, after which nobody reopens a question the spec says is settled.
- **Any control keyed on User-Agent.** A major privacy-first client impersonates another client's UA in its own published source.

**One trap you must not fall into, and must state so nobody re-derives it:** a PSL entry would **not** break the wildcard certificate. The CA/Browser Forum requirement that appears to forbid it directs CAs to consult the ICANN section only, not private registrations, and a major CA confirmed that behaviour on the record. Carry the two qualifiers with the claim: the requirement is a SHOULD rather than a MUST, so it is CA-dependent, and the applicant here controls the entire namespace. Getting this backwards would be expensive in the wrong direction.

# The PSL foreclosure removes a locked rationale, and this is the first thing you handle

**Settle this before you price the edge in §2, because the answer changes whether a wildcard is needed at all.**

`viewer.md` §2 is locked and it decides per-relic subdomains over one fixed sandbox origin. It first concedes that the obvious objection to a fixed origin is not real: under §4's two-layer boundary every rendered document already sits in its own opaque origin, so two relics on one hostname are already mutually cross-origin, and the frame's sandbox flags answer that objection rather than the hostname. It then names what per-relic subdomains actually buy, which is **process-level isolation**, and quotes web.dev for the mechanism, that adding the parent to the PSL is what makes two labels under it cross-site and therefore fully isolated from each other. The same section states that PSL registration of the sandbox parent is required and routes to `shape`.

**This station forecloses the PSL, and process isolation keys on site rather than origin.** Without the entry every per-relic label shares one registrable domain and is same-site, so the mechanism the locked section quotes does not fire. That rationale is gone while every cost stays: the wildcard, DNS-01 and therefore DNS provider API credentials wherever issuance runs, the standing edge cost, and unbounded auto-generated hostnames under a wildcard, which `viewer.md` §2 itself names as exactly the trigger `preconditions.md` §2 describes.

**Criterion 6 does not catch this and cannot.** It forces you to state that the PSL is foreclosed and that a PSL entry would not break the wildcard. Both are true, both are worth stating, and a document can satisfy both while carrying this hole. That is why criterion 7 exists and why repeating the foreclosure does not discharge it.

Four things this document owes, all forced by criterion 7:

- **State the collapse, scoped precisely.** Not "the PSL is foreclosed" again, which is the sentence that hides it. State that the process-isolation rationale depended on the entry, does not survive without it, and that the costs survive regardless.
- **State what survives, checked rather than assumed.** Do not over-read the collapse. That is the same failure as the Cloud Run foreclosure above, one direction over, and this document has now been burned by it once. `viewer.md` §2 gives a **second** reason and calls it the durable one: a per-relic hostname is defense in depth against Relic's own future bugs, so a misconfigured sandbox flag costs one relic instead of every relic the recipient has open. Work out whether that reason depends on the PSL entry or only on distinct origins, and say which, with the mechanism. Same-origin policy and site-keyed process isolation are different boundaries and the foreclosure does not touch them equally. Check `document.domain` while you are in there, because it is the one origin-side mechanism a PSL entry genuinely touches, and expect it to come out not making the second reason PSL-dependent: it takes effect only where both documents set it, the victim relic's document is never attacker-controlled, and it is deprecated and inert by default in current Chrome.
- **Design both branches, and do not pick.** Per-relic subdomains retained, with whatever justification actually survives stated honestly and every cost owned. A single fixed sandbox origin, with what is lost named precisely and what the wildcard, the DNS-01 credentials, and the standing edge cost stop buying. `viewer.md` §2 decided per-relic and this station cannot silently undecide it, so the deliverable is two designed branches plus a routed question, never a reversal.
- **Route it as drift back to `specify`.** Name the sentence in `viewer.md` §2 whose basis is gone, so whoever reads this design knows a locked decision needs revisiting rather than discovering it in `build`. This is the station's standard form: where a finding pressures a locked decision, name it as drift routing back to its owner rather than proposing a change. **Do not edit `viewer.md`, do not propose replacement text for it, and do not treat this as authority to change what it decided.**

**On the foreclosure's honest scope:** the PSL decline criteria include a size gate, so the accurate statement is that an entry is unavailable to a pre-launch project at this scale, not that it is permanently foreclosed. State it that way, because the difference is load-bearing on the branch design: it makes the per-relic branch's process-isolation rationale recoverable at scale rather than dead, which is a different thing to hand `build`.

# The decisions

## 1. Which origin serves which response, which is baked into the URL scheme and the CSP

**The split is backwards from how it has been described.** The shared URL is on the **service** origin. The sandbox origin appears only in an iframe `src` and never in anything a human pastes. So the domain hosting attacker-controlled HTML is the one nobody links to and which costs one DNS change to replace, while the domain hosting nothing untrusted is the one in every shared link, every abuse report, and every Safe Browsing sample. **Losing the sandbox domain breaks HTML rendering. Losing the service domain breaks every relic ever shared.**

The two Safe Browsing categories Relic will actually sit in are the download categories, and they attach to whichever origin serves bytes to disk. **Decide whether the download and save path moves onto the disposable origin**, and if it cannot, say exactly why against the absolute rule that the sandbox origin never receives the key. Enumerate three paths and not two: the service origin, the sandbox origin, and a `blob:` save of already-decrypted content, which `safe-browsing-delisting-and-why-a-zero-knowledge-operator-cannot-comply` records as a different path from a direct link to the object. The irreversible term is not the URL scheme or the CSP, both of which are a header and a link target; it is the download-category reputation accrued on the domain that is in every shared link and cannot be replaced. Decide on that basis.

## 2. The edge and TLS

**Settle the PSL collapse section above first.** A single fixed sandbox origin needs no wildcard at all, so the branch question sits upstream of everything in this section; price both edges against the per-relic branch and state what the fixed-origin branch would cost instead.

Per-relic subdomains force a wildcard, and a wildcard forces something in front of the app rather than Cloud Run's own domain mappings. **Both remaining edges are live. Decide on cost and on what each puts in the render path, not on a foreclosure:**

- A Google global external Application Load Balancer with Certificate Manager, which supports wildcards under DNS authorization and carries a standing hourly forwarding-rule charge against a project whose cost precondition is a kill switch. Cloud Run sits behind it unchanged.
- A third-party edge offering free universal TLS covering exactly the first-level-subdomain shape the spec already constrains itself to, at the cost of a third party in the render path.

State what a third party in the render path means for a zero-knowledge claim, because that is the honest cost and it belongs in the disclosure statement rather than buried here. State the Cloud Run scope correctly while you are in this section, so no later reader inherits the wide version.

**The certificate rate limits are not the constraint anybody expects.** One wildcard renewed on a normal cadence sits nowhere near any published limit; the limits only bite a design nobody should pick, which is per-relic issuance. The real constraint is the **challenge type**: wildcards require DNS-01, which means DNS provider API credentials wherever issuance runs, and the CA itself names that as a risk. Decide where issuance runs and how those credentials are held.

## 3. The domain workstream, which has two months-long irreversible items and only one was costed

`viewer.md` §7 costs the PSL and says nothing about **HSTS preload**, which both `format.md` §5 and `viewer.md` §1.7 name as the preferred way to eliminate inside-the-service redirects. Preload entries are hardcoded into browser source and take months to reach stable, removal takes months more with no guarantees across browsers, and the required header's subdomain directive makes a valid certificate on every per-relic hostname a permanent availability dependency.

**State that PSL and HSTS preload are the same shape on the same domain: months in, months out, unexpeditable.** Both belong in the domain workstream at the moment of acquisition, ahead of work that looks more urgent. Produce the ordered workstream, and be explicit that the PSL is unavailable at this scale while HSTS preload is not, so they are sequenced for different reasons. The workstream starts at the name, per §6, because everything in it is keyed to a domain that cannot be bought until the name is settled.

## 4. When the mint fires, and the interval it is counted over

`service.md` §2 rests the no-mint-on-`/{id}` rule on non-executing fetchers and concedes that a scanner detonating with a real browser does run it. **That scanner is verified, not hypothetical:** at least two major platforms execute JavaScript on linked pages with substantial execution time. A JS-executing previewer runs the shell, mints a signed URL, and pulls ciphertext, which is a phantom open against the primary metric, a consumed unit of the download cap, and real egress, all before a human clicks.

**Decide: auto-mint on load, or mint behind a signal a headless previewer does not produce**, such as a real user gesture or visible-and-focused. State the cost either way. Gating buys back the metric and the cap and taxes the first five seconds, which is the wedge. Auto-on-load is cheap now and hard to change once the open counter has a baseline and the cap has a published value.

**Then decide the mint dedup interval, `service.md` 7.7, because your phantom-open argument is a counting argument and this is the number it counts with.** The rules around it are already fixed in `service.md` 2.2 and are not yours: a refused mint never counts as an open and never consumes cap, and a repeat inside the interval is not a distinct open and does consume cap. **The interval's value is yours.** It decides whether a previewer that hits the shell twice produces one phantom open or two, and whether a recipient who reloads burns a second unit of the cap that `design-storage-grant-and-cost` is sizing. State the value, state what it does to the phantom-open count under each mint-trigger branch, and reconcile it with the frame's 120-second window, which `service.md` 7.7 names as the interaction. `service.md` 2.2 also states the arithmetic this protects: the worst-case egress arithmetic in `docs/preconditions.md` collapses if a mint returns a usable URL without consuming the cap.

Also decide the static shell's markup order. The most consequential unfurler **range-fetches the head**, so the Open Graph block must sit early, ahead of scripts and styles, or the result is the blank card `viewer.md` §6.2 calls the visual shape of a phishing link. Note that the constant preview image is fetched on every unfurl and is real recurring egress on the service origin, bounded by that client's cache window, so it wants a long-cacheable static path.

## 5. Edge fidelity, which is `service.md` 7.1 and carries a locked-rule violation

The edge's rate-limit deny status is a one-line config with a spec-level consequence: the natural default is in the valid set and choosing it violates a locked rule, because it makes an MCP client prompt users to sign in against an authorization server that does not exist. Note also which status the edge **cannot** emit, so that code can only come from the application. Decide and state both.

Read this item as edge behavior only, exactly as `service.md` 7.1 scopes it. No status, code, or distinction in `service.md` §1 is yours; those are settled there and nothing here reopens the table. What is yours is which of them the deployed edge can actually produce under load shedding, and the edge's substitute behavior where it cannot emit a problem document per 1.5.

## 6. The name, which is free today and closes at the domain purchase

You own the domain workstream, so you own the decision that gates it. It is the only operator decision in this station with no unit and no forcing criterion, and it is structurally invisible to a routed-coverage audit because it is an operator decision rather than a routed one. `relic-name-is-crowded-in-its-own-three-categories` records the collision and the sequencing: the domain purchase is already a stated external dependency blocking deployment, so the naming decision sits immediately upstream of it.

**Do not pick the name. It is the operator's.** What this document owes is the decision stated as a blocker rather than a detail:

- **State that the naming decision blocks the domain purchase, which blocks deployment.** Free now, brutal after domains are bought and links are in the wild. `frame.md` locks no accounts, so there is no channel to tell an installed MCP client fleet that the domain moved, only the package registry.
- **Record the collision concretely.** The npm package name is taken by a client-side-encrypted secrets CLI whose own description reads as nearly Relic's positioning sentence, so the clash is in the product category and not only in the string.
- **Name what is still available**, checked rather than assumed: the candidate registrable domains and the package name, with the check you ran and when.
- **State what restarts from zero on a later rename:** HSTS preload, Safe Browsing standing, Search Console verification, and any download-category reputation from §1. That is why the workstream in §3 cannot start ahead of the name.

# Do not assign obligations to siblings

State needs and name the owner; never write that another document "must add" something. Siblings: `design-container-and-crypto`, `design-storage-grant-and-cost`, `design-product-surface`, `design-operations-and-abuse`.

# Style

Direct, dry, confident, contractions natural, authority through specificity. **Never an em-dash or en-dash.** No emoji, no placeholders, no hedging verbs.

# Completion criteria

1. `test -f docs/design/topology.md` exits 0.
2. `test "$(wc -w < docs/design/topology.md)" -ge 2400` exits 0. Stub guard, no ceiling.
3. Manifest has at least six sources, one per line, trailing newline.
4. Every source resolves. Orphan check both directions.
5. **The document decides which origin serves the download path**, enumerating all three paths including a `blob:` save, and ties the decision to the Safe Browsing download categories and the domain reputation that cannot be replaced.
6. **The document states that the PSL is foreclosed AND that a PSL entry would not break the wildcard**, so neither is re-derived wrongly, and carries the SHOULD qualifier with the second claim.
7. **The document states the PSL rationale collapse and designs both branches.** Criterion 6 is satisfied by the sentence "the PSL is foreclosed," and that sentence is exactly what hides this, so criterion 6 does not discharge criterion 7. All four required:
   - **(a)** The document states that `viewer.md` §2 rests per-relic subdomains on process-level isolation, that process isolation keys on site rather than origin, and that without the entry every per-relic label shares one registrable domain, is same-site, and buys no process isolation, while every cost remains.
   - **(b)** The document states which part of the locked rationale survives, with the mechanism, checked rather than asserted, including `viewer.md` §2's second reason, which that section itself calls the durable one.
   - **(c)** The document designs both branches, per-relic subdomains retained with the surviving justification and the costs owned, and a single fixed sandbox origin with what is lost named precisely, **and does not pick.** `viewer.md` §2 decided per-relic and this station does not undecide it.
   - **(d)** The document names this as drift routing back to `specify`, quoting the sentence in `viewer.md` §2 whose basis is gone, and states the foreclosure's honest scope as unavailable at this scale rather than permanent.
   A document that states the foreclosure without all four fails this criterion.
8. **The document costs HSTS preload as a months-long, effectively irreversible commitment** and places it in the domain workstream alongside the PSL.
9. **The document decides when the mint fires** and states the cost of the branch not taken.
10. **The document states the Open Graph placement rule** and the failure it prevents.
11. **The document decides the edge and states the Cloud Run scope correctly:** custom domain mappings cannot carry a wildcard and are preview, and Cloud Run behind a global external Application Load Balancer with a Certificate Manager wildcard is not foreclosed. Both edge candidates are priced, and the choice is made on cost and render path rather than on a foreclosure.
12. **The document decides the mint dedup interval as a value**, states what it does to the phantom-open count under the mint-trigger branch chosen in §4, and reconciles it with the frame's 120-second window.
13. **The document decides edge fidelity (`service.md` 7.1): the rate-limit deny status, naming the locked rule the natural default violates, and the status the edge cannot emit** so that code can only come from the application.
14. **The document states the naming decision as blocking the domain purchase**, records the npm package collision and the near-identical positioning sentence, names what is still available with the check that was run, and **does not pick the name**, which is the operator's.
15. **Every quoted string is verified verbatim against raw source text, and the beat reports the audit as a list.**
16. **The routed decisions assigned to this document are each decided with the consequence stated, or explicitly eliminated with the reason. The list, by name and with no others implied: `viewer.md` 7.5 PSL registration for the sandbox parent; `service.md` 7.1 edge fidelity; `service.md` 7.7 the mint dedup interval.** **`viewer.md` 7.1 platform memory ceilings, 7.3 the truncated-prefix size, and 7.4 the highlighted-region cap are not yours**; they are `design-product-surface`'s, which owns every viewer screen. **`viewer.md` 7.2, the hard size cap, is `design-storage-grant-and-cost`'s.** Deciding any of those four here is a defect, not thoroughness.
17. `test "$(grep -c '[—–]' docs/design/topology.md)" -eq 0` exits 0.

# Files touched

- `docs/design/topology.md`, `docs/design/topology.sources.txt` (create)

# Out of scope

- The container format and key material. Locked by `docs/design/container.md`.
- The grant construction, cost arithmetic, GCP project topology, **and the hard size cap value (`viewer.md` 7.2)**. Sibling `design-storage-grant-and-cost`.
- Viewer screens, copy, and art direction, **including platform memory ceilings (`viewer.md` 7.1), the truncated-prefix size (7.3), and the highlighted-region cap (7.4)**. Sibling `design-product-surface`.
- The abuse pipeline, legal posture, and the published SLA. Sibling `design-operations-and-abuse`.
- Picking the name itself. You state it as a blocker and name what is available; the operator chooses.
- **Reversing `viewer.md` §2's per-relic decision.** You design both branches and route the question as drift. Editing or rewriting any locked document is out of scope for this station.
- Product code.
