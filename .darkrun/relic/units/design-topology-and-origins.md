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

Write `docs/design/topology.md`: the decided origin split, edge and TLS topology, domain workstream, and the mint trigger. Plus `docs/design/topology.sources.txt`, one URL per line, trailing newline.

**Read first:** `darkrun_knowledge_list`, especially `per-relic-subdomain-topology-wildcard-tls-psl-and-hsts`, `link-preview-and-unfurl-behavior-by-client`, `safe-browsing-delisting-and-why-a-zero-knowledge-operator-cannot-comply`, `domain-strategy-and-safe-browsing-blast-radius`, `citation-defects-and-the-three-checks-that-catch-them`.

Then read from the repo root: `docs/frame.md` and `docs/preconditions.md`, locked; `docs/spec/viewer.md` (§1.7 redirects, §2 the sandbox origin, §4 the boundary, §7 routed items); `docs/spec/service.md` (§2 the static shell and the mint, §6 third-party rewriters); and your sibling input `docs/design/container.md`.

**If `docs/design/container.md` is missing, fetch it via `git show darkrun/relic/units/shape/design-container-and-crypto:docs/design/container.md` and report which path you used.**

# Source discipline

Five citation defects shipped in `specify`, and **none would have failed the URL-resolution gate**. Pull raw text and grep it. **Never WebFetch a specification.** Audit every quoted string; criterion 10 makes it checkable.

# What is already foreclosed. Do not design against it.

- **The Public Suffix List.** A pre-launch project sits inside two published decline criteria, an honest rationale states the declined objective in the maintainers' own words, and a granted entry propagates on browser-release timescales. **Origin isolation comes from separate registrable domains alone.**
- **Cloud Run for the per-relic subdomain origin.** Wildcard certificates are excluded from that feature by name, and its domain mappings are preview and not production-ready.
- **Any control keyed on User-Agent.** A major privacy-first client impersonates another client's UA in its own published source.

**One trap you must not fall into, and must state so nobody re-derives it:** a PSL entry would **not** break the wildcard certificate. The CA/Browser Forum requirement that appears to forbid it directs CAs to consult the ICANN section only, not private registrations, and a major CA confirmed that behaviour on the record. Getting this backwards would be expensive in the wrong direction.

# The decisions

## 1. Which origin serves which response, which is baked into the URL scheme and the CSP

**The split is backwards from how it has been described.** The shared URL is on the **service** origin. The sandbox origin appears only in an iframe `src` and never in anything a human pastes. So the domain hosting attacker-controlled HTML is the one nobody links to and which costs one DNS change to replace, while the domain hosting nothing untrusted is the one in every shared link, every abuse report, and every Safe Browsing sample. **Losing the sandbox domain breaks HTML rendering. Losing the service domain breaks every relic ever shared.**

The two Safe Browsing categories Relic will actually sit in are the download categories, and they attach to whichever origin serves bytes to disk. **Decide whether the download and save path moves onto the disposable origin**, and if it cannot, say exactly why against the absolute rule that the sandbox origin never receives the key. Whatever is decided is baked into the URL scheme and the CSP, so decide it now or pay a migration.

## 2. The edge and TLS

Per-relic subdomains force a wildcard, and the obvious platform choice is foreclosed. Decide the edge, pricing the candidates honestly: a Google load balancer with certificate management carries a standing hourly forwarding-rule charge against a project whose cost precondition is a kill switch; a third-party edge offers free universal TLS covering exactly the first-level-subdomain shape the spec already constrains itself to, at the cost of a third party in the render path. State what a third party in the render path means for a zero-knowledge claim, because that is the honest cost and it belongs in the disclosure statement rather than buried here.

**The certificate rate limits are not the constraint anybody expects.** One wildcard renewed on a normal cadence sits nowhere near any published limit; the limits only bite a design nobody should pick, which is per-relic issuance. The real constraint is the **challenge type**: wildcards require DNS-01, which means DNS provider API credentials wherever issuance runs, and the CA itself names that as a risk. Decide where issuance runs and how those credentials are held.

## 3. The domain workstream, which has two months-long irreversible items and only one was costed

`viewer.md` §7 costs the PSL and says nothing about **HSTS preload**, which both `format.md` §5 and `viewer.md` §1.7 name as the preferred way to eliminate inside-the-service redirects. Preload entries are hardcoded into browser source and take months to reach stable, removal takes months more with no guarantees across browsers, and the required header's subdomain directive makes a valid certificate on every per-relic hostname a permanent availability dependency.

**State that PSL and HSTS preload are the same shape on the same domain: months in, months out, unexpeditable.** Both belong in the domain workstream at the moment of acquisition, ahead of work that looks more urgent. Produce the ordered workstream, and be explicit that the PSL is foreclosed while HSTS preload is not, so they are sequenced for different reasons.

## 4. When the mint fires, which is the default nobody chose

`service.md` §2 rests the no-mint-on-`/{id}` rule on non-executing fetchers and concedes that a scanner detonating with a real browser does run it. **That scanner is verified, not hypothetical:** at least two major platforms execute JavaScript on linked pages with substantial execution time. A JS-executing previewer runs the shell, mints a signed URL, and pulls ciphertext, which is a phantom open against the primary metric, a consumed unit of the download cap, and real egress, all before a human clicks.

**Decide: auto-mint on load, or mint behind a signal a headless previewer does not produce**, such as a real user gesture or visible-and-focused. State the cost either way. Gating buys back the metric and the cap and taxes the first five seconds, which is the wedge. Auto-on-load is cheap now and hard to change once the open counter has a baseline and the cap has a published value.

Also decide the static shell's markup order. The most consequential unfurler **range-fetches the head**, so the Open Graph block must sit early, ahead of scripts and styles, or the result is the blank card `viewer.md` §6.2 calls the visual shape of a phishing link. Note that the constant preview image is fetched on every unfurl and is real recurring egress on the service origin, bounded by that client's cache window, so it wants a long-cacheable static path.

## 5. Edge fidelity

The edge's rate-limit deny status is a one-line config with a spec-level consequence: the natural default is in the valid set and choosing it violates a locked rule, because it makes an MCP client prompt users to sign in against an authorization server that does not exist. Note also which status the edge **cannot** emit, so that code can only come from the application. Decide and state both.

# Do not assign obligations to siblings

State needs and name the owner; never write that another document "must add" something. Siblings: `design-container-and-crypto`, `design-storage-grant-and-cost`, `design-product-surface`, `design-operations-and-abuse`.

# Style

Direct, dry, confident, contractions natural, authority through specificity. **Never an em-dash or en-dash.** No emoji, no placeholders, no hedging verbs.

# Completion criteria

1. `test -f docs/design/topology.md` exits 0.
2. `test "$(wc -w < docs/design/topology.md)" -ge 2400` exits 0. Stub guard, no ceiling.
3. Manifest has at least six sources, one per line, trailing newline.
4. Every source resolves. Orphan check both directions.
5. **The document decides which origin serves the download path**, and ties the decision to the Safe Browsing categories that attach to it.
6. **The document states that the PSL is foreclosed AND that a PSL entry would not break the wildcard**, so neither is re-derived wrongly.
7. **The document costs HSTS preload as a months-long, effectively irreversible commitment** and places it in the domain workstream alongside the PSL.
8. **The document decides when the mint fires** and states the cost of the branch not taken.
9. **The document states the Open Graph placement rule** and the failure it prevents.
10. **Every quoted string is verified verbatim against raw source text, and the beat reports the audit as a list.**
11. **Every decision routed here by `viewer.md` §7 is decided with its consequence stated, or explicitly eliminated with the reason.**
12. `grep -c '[—–]' docs/design/topology.md` returns 0.

# Files touched

- `docs/design/topology.md`, `docs/design/topology.sources.txt` (create)

# Out of scope

- The container format and key material. Locked by `docs/design/container.md`.
- The grant construction, cost arithmetic, and GCP project topology. Sibling `design-storage-grant-and-cost`.
- Viewer screens, copy, and art direction. Sibling `design-product-surface`.
- The abuse pipeline and legal posture. Sibling `design-operations-and-abuse`.
- Product code.
