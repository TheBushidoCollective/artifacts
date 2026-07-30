---
name: Decide the origins, the edge, and when the mint fires
unit_type: ''
status: pending
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
reviews:
  fit:
    at: 2026-07-30T11:40:36.253906+00:00
  reversibility:
    at: 2026-07-30T11:39:37.092582+00:00
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
