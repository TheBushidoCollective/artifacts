---
name: Decide the grant shape, the storage topology, and the cost controls
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
- docs/design/storage.md
- docs/design/storage.sources.txt
quality_gates:
- name: artifact-exists
  command: test -f docs/design/storage.md
- name: substance-floor
  command: test "$(wc -w < docs/design/storage.md)" -ge 2600
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/design/storage.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/storage.sources.txt'
---

# Goal

Write `docs/design/storage.md`: the decided grant construction, storage topology, and cost controls. Plus `docs/design/storage.sources.txt`, one URL per line, trailing newline.

**Read first:** `darkrun_knowledge_list`, especially `gcs-grant-shape-what-is-proven-and-the-open-experiment`, `egress-cost-controls-and-what-a-kill-switch-cannot-stop`, `gcs-false-impossibility-claims`, `citation-defects-and-the-three-checks-that-catch-them`.

Then read from the repo root: `docs/frame.md`, `docs/preconditions.md`, locked; `docs/spec/publish.md` (§3 the grant hop, §4 completion and retry, §6 routed items); `docs/spec/service.md` (§2.3 cap arithmetic, §3 lifecycle and soft delete, §7 routed items); and your sibling input `docs/design/container.md`, which fixes the overhead arithmetic your size math depends on.

**If `docs/design/container.md` is missing from your worktree, stop and fetch it before writing anything that depends on it.** Fall back to `git show darkrun/relic/units/shape/design-container-and-crypto:docs/design/container.md`. Report which path you used. Never redefine what it settles.

# Source discipline

Five citation defects shipped in `specify`, and **not one would have failed the URL-resolution gate**, because every URL resolved. Pull raw source text and grep it. **Never WebFetch a specification.** Audit every quoted string before you finish; criterion 10 makes it checkable.

**Two corrections you must carry rather than repeat.** `preconditions.md` and `service.md` both cite a third-party blog for "$0.12/GB for the first TB". Google's own table puts the tier boundary at **10 TiB**, and charges **$0.19/GiB to Australia** and **$0.23/GiB to China**, so a ceiling computed at a flat $0.12 understates badly for a non-US audience. And `preconditions.md` attributes "signed URLs cannot be individually revoked" to a page where the word "revoke" appears **zero times**; the claim is true in effect and the correct source carries an exception the claim omits. Cite the primary pricing and signed-URL pages, and note both corrections as drift routing back to their owners rather than editing locked documents.

# The decisions

## 1. The grant shape, which cannot be decided from documents

`publish.md` 3.6 routes three candidates. **All three fail a requirement, and the spec set has not noticed that two of them do.**

- **Resumable session.** Its size enforcement is **unverified**. The one demo that appears to prove it actually proves the V4 signature pins `x-upload-content-length` at initiation, and never sends more bytes to the session URI than it declared. Separately, the data leg uses **no signed URL** and accepts `X-Goog-Meta-*` on the final request, which **breaks the metadata-pinning argument** `format.md` 4.6 and `publish.md` 6.5 both rely on. Its session URI also lives one week regardless of grant expiry, shortened only by cancellation, which needs possession of the URI.
- **POST policy document.** The only construction expressing a **cap** rather than an exact value, via `content-length-range`. But "generation" appears **zero times** in its documented field set, so it cannot carry the `ifGenerationMatch: 0` that `publish.md` 3.7 requires on **every** grant.
- **Signed PUT with a signed `Content-Length`.** Now demonstrated to enforce, by signature pinning plus HTTP framing. But a V4 signature pins a **value**, never a range, so the constraint is necessarily the client's declared size, which contradicts `publish.md` 3.6's "computed against the cap rather than the declared size." The cap still holds transitively through the grant-time refusal; that sentence is not implementable as written on this branch.

**No single documented candidate satisfies a signed size constraint, the generation precondition, and resume-from-offset together.**

**Your job:** specify the probes that eliminate branches, present them as a runnable procedure, then decide **conditionally on each outcome**. Write the decision as a decision tree whose leaves are branch choices, so whoever runs the probes reads the answer off the result rather than reopening the design.

**The probes are specified, not run.** State that plainly and say why: they create buckets and objects, and the only authenticated local credential belongs to an unrelated venture. Each probe gets the request, the assertion, and **what the result eliminates**. At minimum: does the resumable data leg enforce the declared size, both with a known total and with `bytes 0-N/*` followed by a finalize; can client metadata be injected on the unsigned leg; does a POST policy accept a generation precondition at all, as a form field and as a policy condition; and is `ifGenerationMatch: 0` evaluated at initiation or at finalize on a resumable session, which decides whether the anti-substitution guarantee actually holds.

## 2. Cost controls, and what the kill switch cannot stop

- **Correct the egress arithmetic** against the primary source, including the destination dependence.
- **State plainly that Cloud Storage is not covered by platform spend caps.** Alerts-only budgets explicitly do not cap, and the enforcing spend-cap product's eligible-service list does not include Cloud Storage. Capping the app server stops **minting**; nothing at the platform level stops GCS egress.
- **Name the residual the kill switch cannot reach:** already-minted signed URLs do not care that minting stopped. The residual is live minted URLs times remaining validity times object size. **This makes the signed-URL validity window the blast time of the kill switch**, and that should dominate `service.md` §7's routed validity decision ahead of the mid-transfer ergonomics currently driving it. Decide the window on that basis.
- **Design signing-key rotation as an explicit second-stage kill switch.** It is the one instrument that invalidates outstanding URLs at once. It is indiscriminate and breaks honest in-flight downloads, which is the correct trade in a spend emergency. Specify the signing-identity mechanics so rotation does not lose the identity along with the money, and **mark the propagation timing as unverified** rather than assuming immediacy.
- Decide the per-object download cap and the per-IP publish quota, showing the arithmetic. Note that GCS charges nothing for operations returning 4xx, so refusals at the storage layer are free.

## 3. The GCP project topology

The abuse blast radius is **project-level**, and `frame.md` requires two registrable domains. Nobody has connected these. **Two domains in one project is one failure domain, not two:** a suspension takes down the API, the viewer, both buckets, and the abuse tooling you would use to answer the notice.

Design both branches, since this is an operator decision with a real cost: single project, and separate projects with separate billing. State what each buys and what each costs, and state that moving buckets and signing identities afterward is a migration rather than a config change.

## 4. Lifecycle, retention, and the published byte lifetime

Decide the TTL ceiling and lifecycle regime, the retention window against the publishing-IP filter, and the soft-delete posture. Note that a legal-preservation obligation can require retaining ciphertext the operator cannot read for a year, which the published byte-lifetime number must count alongside TTL and lifecycle lag.

# Do not assign obligations to siblings

State needs and name the owner; never write that another document "must add" something. Siblings: `design-container-and-crypto`, `design-topology-and-origins`, `design-product-surface`, `design-operations-and-abuse`.

# Style

Direct, dry, confident, contractions natural, authority through specificity. **Never an em-dash or en-dash.** No emoji, no placeholders, no hedging verbs.

# Completion criteria

1. `test -f docs/design/storage.md` exits 0.
2. `test "$(wc -w < docs/design/storage.md)" -ge 2600` exits 0. Stub guard, no ceiling. Never pad; never cut a decided rule to hit a number.
3. Manifest has at least six sources, one per line, trailing newline.
4. Every source resolves. Orphan check both directions.
5. **The document names the defect in each of the three grant candidates** and states that no documented candidate satisfies all three requirements together.
6. **The probes are specified with request, assertion, and what each result eliminates**, and the document states they were not run and why.
7. **The grant decision is written as a decision tree keyed on probe outcomes**, so no leaf is left undecided.
8. **The document states that Cloud Storage is not covered by platform spend caps**, and names the residual the kill switch cannot reach.
9. **Signing-key rotation is designed as a second-stage kill switch**, with propagation timing marked unverified.
10. **Every quoted string is verified verbatim against raw source text, and the beat reports the audit as a list.**
11. **Both project-topology branches are designed**, with cost and blast radius stated for each.
12. `grep -c '[—–]' docs/design/storage.md` returns 0.

# Files touched

- `docs/design/storage.md`, `docs/design/storage.sources.txt` (create)

# Out of scope

- The container format and key material. Locked by `docs/design/container.md`.
- Origins, TLS, edge, and which origin serves what. Sibling `design-topology-and-origins`.
- Viewer screens and art direction. Sibling `design-product-surface`.
- The abuse pipeline and legal posture. Sibling `design-operations-and-abuse`.
- Product code.
