---
name: 'Write preconditions.md: the operating conditions and the go/no-go'
unit_type: doc
status: pending
depends_on:
- frame-artifact
worker: ''
model: opus
station: frame
inputs:
- docs/frame.md
outputs:
- docs/preconditions.md
- docs/preconditions.sources.txt
reviews:
  feasibility:
    at: 2026-07-30T02:44:12.712554+00:00
  value:
    at: 2026-07-30T02:45:12.239582+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/preconditions.md
- name: substance-floor
  command: test "$(wc -w < docs/preconditions.md)" -ge 700
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/preconditions.sources.txt); test "$n" -ge 5'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/preconditions.sources.txt'
---

# Goal

Write `docs/preconditions.md`: the conditions that must hold for Relic to be buildable and operable at all, and the explicit go/no-go that follows from them. This is the honest gate on the entire run. `harden` inherits it most directly, but every station is bound by it.

Also write `docs/preconditions.sources.txt`, a citation manifest: one URL per line, no other text, listing every external source this document relies on. End the file with a trailing newline.

**Read `darkrun_knowledge_list` first, in full**, and read `docs/frame.md`, which this unit depends on. You have no other context. Write the preconditions against the frame that unit settled; do not redefine the problem, the user, or the wedge.

# Why this document exists separately

Relic hosts content the operator is structurally unable to inspect, on a public unauthenticated endpoint. That is the exact shape that killed Firefox Send and AnonFiles. The frame says what Relic is for. This document says what has to be true for it to survive contact with the real world, and states plainly when the answer is "do not build."

# Required content

## 1. The abuse-operations commitment (the go/no-go)
State it as a binary condition, not a recommendation. Google Cloud's AUP makes this contractual, not optional: for organizations hosting third-party content, Google requires a published prohibited-content policy, a reporting intake process (a webform or email alias), prompt review and removal, and log monitoring. Failure to respond to an abuse notice risks **project-level** suspension, not just bucket removal.

Say what that obligates: a named human who answers the abuse address, a takedown path documented publicly at a stable URL, and an SLA. Then state the go/no-go: if that commitment is not made, the correct decision is not to build. Mozilla had a legal team and shut Send down rather than carry this.

## 2. The domain preconditions
Two registrable domains distinct from `thebushido.co` must be acquired before anything deploys: one for the service (API and PWA), one for the sandbox origin that renders untrusted HTML. `thebushido.co` carries marketing and email and never hosts user-generated content.

Ground this in the Immich precedent (October 2025): Google flagged all of `*.immich.cloud`, including internal-only services, triggered by per-PR preview environments, and it recurred after a successful appeal. Their fix was a separate registrable domain. Note that Microsoft's Tenant Allow/Block List blocks a URL domain and all subdomains by default.

State the Search Console precondition: every domain verified **before** launch, because the Security Issues report is the only place a listing's triggering URLs are visible. Unverified means flagged and blind.

Mark domain acquisition as an **external dependency requiring operator action**. Name it as a blocker on deployment, not on design.

## 3. The v1 control set
List the controls that must ship in the first release rather than being deferred. Each stated as a checkable condition, not an aspiration. Drawn from `abuse-liability-of-hosting-uninspectable-content`: mandatory non-configurable TTL, hard size cap, per-IP publish quota, per-object download cap, per-IP download rate limit, global egress spend kill switch, delete-by-ID that works without the decryption secret, ciphertext-hash blocklist, upload IP plus timestamp retention with a published window, abuse reporting reachable from every relic page and a stable `/abuse` URL and a published email alias, and `robots.txt` disallow plus `X-Robots-Tag: noindex`.

Explain briefly why each is load-bearing rather than listing them bare. Two points worth making explicitly: mandatory short TTL is the single highest-leverage control because it bounds how long abuse circulates, and delete-by-ID works precisely because the relic ID is not secret, only the key is.

State the cost precondition too: GCS internet egress runs $0.12/GB for the first TB, and an unauthenticated endpoint has no identity to throttle against, so the spend kill switch is a v1 requirement.

## 4. The security preconditions that constrain design
Short, so `shape` and `build` inherit them as constraints rather than discovering them late:
- Untrusted content renders on a **separate origin**, never the origin holding the fragment secret. Origin isolation is the first layer; sanitization is the second.
- Never set both `allow-scripts` and `allow-same-origin` on the render iframe.
- The viewing origin carries no third-party scripts, no analytics, and no error reporting, because any same-origin script can read `location.hash`. Note that `docs/frame.md` specifies the run's only telemetry, and that all of it is collected server-side at publish and at signed-URL mint, never by a script on the viewing origin. These two requirements are compatible; say so explicitly so nobody later reads the telemetry decision as license to add a script here.
- Rate limiting returns `429`, never `401` or `403`, or Claude Code will flag the server as needing OAuth sign-in against an authorization server that does not exist.

## 5. What is honestly unresolved
List the open questions that remain genuinely unsettled, so nobody downstream mistakes silence for a decision. At minimum: whether a Safe Browsing listing on a subdomain degrades the parent's Gmail sender reputation (industry consensus says yes, Google publishes nothing); how Proofpoint's URI blocklist treats host-to-parent relationships (unpublished); Google's actual timeline between abuse notification and project suspension (documented only as "timely"); and the legal exposure of the plausible-deniability posture, which is a lawyer question, not a research question.

Be honest that these are unknown. Do not paper over them.

# Style

Write as Jason Waldrip would: direct, dry, confident, contractions, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never use an em-dash or an en-dash.** Rewrite with a comma, a colon, parentheses, or two sentences. No emoji.

# Completion criteria

1. `docs/preconditions.md` exists → `test -f docs/preconditions.md` exits 0.
2. It is substantive → `test "$(wc -w < docs/preconditions.md)" -ge 700` exits 0.
3. `docs/preconditions.sources.txt` lists at least five sources, one URL per line, nothing else, ending with a trailing newline → `bash -c 'set -eu; n=$(grep -c . docs/preconditions.sources.txt); test "$n" -ge 5'` exits 0.
4. Every listed source resolves over the network → `bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/preconditions.sources.txt'` exits 0. **Do not invent citations.** Every URL comes from the recorded knowledge topics or is one you verified yourself.
5. The document states the abuse-operations go/no-go as a binary condition with an explicit "do not build" branch.
6. The document names domain acquisition as an external dependency blocking deployment.
7. The document contains a section of honestly unresolved questions.
8. Section 4 states explicitly that the run's telemetry is collected server-side only and does not conflict with the no-script-on-the-viewing-origin rule.

# Files touched

- `docs/preconditions.md` (create)
- `docs/preconditions.sources.txt` (create)

# Out of scope

- Restating or redefining the problem, user, value, success metric, or telemetry decision. Those are locked in `docs/frame.md`.
- Choosing the server language, framework, hosting topology, or encryption wire format. That is `shape`.
- Endpoint design, schemas, relic ID format.
- Actually buying domains, configuring GCP, or writing any code, config, or infrastructure.
- Designing the abuse-report UI. State the requirement, not the interface.
