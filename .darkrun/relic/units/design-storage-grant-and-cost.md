---
name: Decide the grant shape, the storage topology, and the cost controls
unit_type: ''
status: pending
depends_on:
- design-container-and-crypto
- design-topology-and-origins
worker: ''
model: opus
station: shape
inputs:
- frame.md
- spec.md
- docs/design/container.md
- docs/design/topology.md
outputs:
- docs/design/storage.md
- docs/design/storage.sources.txt
reviews:
  reversibility:
    at: 2026-07-30T11:39:37.092582+00:00
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

Write `docs/design/storage.md`: the decided grant construction, storage topology, cost controls, and the hard size cap. Plus `docs/design/storage.sources.txt`, one URL per line, trailing newline.

**Read first:** `darkrun_knowledge_list`, especially `gcs-grant-shape-what-is-proven-and-the-open-experiment`, `egress-cost-controls-and-what-a-kill-switch-cannot-stop`, `gcs-soft-delete-and-what-deletion-actually-means`, `gcs-false-impossibility-claims`, `citation-defects-and-the-three-checks-that-catch-them`.

Then read from the repo root: `docs/frame.md`, `docs/preconditions.md`, locked; `docs/spec/publish.md` (§3 the grant hop, §4 completion and retry, §6 routed items, all five of which are yours); `docs/spec/service.md` (**§2.3 the cap arithmetic, which is the binding constraint on the size cap**, §3 lifecycle and soft delete, §7 routed items 2, 3, 4, 5); `docs/spec/format.md` (**§3.11 the referent constraint, §4.4 and §4.6**); `docs/spec/viewer.md` (**§5 the tiering consequence and §7.2**); and your sibling inputs `docs/design/container.md`, which fixes the overhead arithmetic your size math depends on, and `docs/design/topology.md`, which fixes the mint trigger your cap arithmetic depends on.

**If either sibling input is missing from your worktree, stop and fetch it before writing anything that depends on it.** Fall back to `git show darkrun/relic/units/shape/design-container-and-crypto:docs/design/container.md` and `git show darkrun/relic/units/shape/design-topology-and-origins:docs/design/topology.md`. Report which path you used. Never redefine what either settles.

# Source discipline

Five citation defects shipped in `specify`, and **not one would have failed the URL-resolution gate**, because every URL resolved. Pull raw source text and grep it. **Never WebFetch a specification.** Audit every quoted string before you finish; criterion 14 makes it checkable.

**Two corrections you must carry rather than repeat.** `preconditions.md` and `service.md` both cite a third-party blog for "$0.12/GB for the first TB". Google's own table puts the tier boundary at **10 TiB**, and charges **$0.19/GiB to Australia** and **$0.23/GiB to China**, so a ceiling computed at a flat $0.12 understates badly for a non-US audience. And `preconditions.md` attributes "signed URLs cannot be individually revoked" to a page where the word "revoke" appears **zero times**; the claim is true in effect and the correct source carries an exception the claim omits. Cite the primary pricing and signed-URL pages, and note both corrections as drift routing back to their owners rather than editing locked documents.

# The decisions

## 1. The grant shape, which cannot be decided from documents

`publish.md` 3.6 routes three candidates. **All three fail a requirement, and the spec set has not noticed that two of them do.**

- **Resumable session.** Its size enforcement is **unverified**. The one demo that appears to prove it actually proves the V4 signature pins `x-upload-content-length` at initiation, and never sends more bytes to the session URI than it declared. Separately, the data leg uses **no signed URL** and accepts `X-Goog-Meta-*` on the final request, which **breaks the metadata-pinning argument** `format.md` 4.6 and `publish.md` 6.5 both rely on. Its session URI also lives one week regardless of grant expiry, shortened only by cancellation, which needs possession of the URI.
- **POST policy document.** The only construction expressing a **cap** rather than an exact value, via `content-length-range`. But "generation" appears **zero times** in its documented field set, so it cannot carry the `ifGenerationMatch: 0` that `publish.md` 3.7 requires on **every** grant.
- **Signed PUT with a signed `Content-Length`.** Now demonstrated to enforce, by signature pinning plus HTTP framing. But a V4 signature pins a **value**, never a range, so the constraint is necessarily the client's declared size, which contradicts `publish.md` 3.6's "computed against the cap rather than the declared size." The cap still holds transitively through the grant-time refusal; that sentence is not implementable as written on this branch.

**No single documented candidate satisfies a signed size constraint, the generation precondition, and resume-from-offset together.**

**Your job:** specify the probes that eliminate branches, present them as a runnable procedure, then decide **conditionally on each outcome**. Write the decision as a decision tree whose leaves are branch choices, so whoever runs the probes reads the answer off the result rather than reopening the design.

**A leaf that names a candidate has not finished.** Each leaf must also name which of the four requirements that branch sacrifices and which locked sentence that contradicts. The four are `publish.md` 3.6's signed size constraint computed against the cap, 3.7's `ifGenerationMatch: 0` on every grant, 3.4's grant expiry the storage leg actually enforces, and 4.4's resume from a byte offset. Those sentences sit in a locked document, so **a leaf that drops one is a drift routing and not a decision this station can take alone.** Name the sacrifice, name the document and the sentence, and route it as drift to its owner. Leaving the sacrifice implicit is the part that gets reopened later, which is the whole reason the tree exists.

**The probes are specified, not run.** State that plainly and say why: they create buckets and objects, and the only authenticated local credential belongs to an unrelated venture. Each probe gets the request, the assertion, and **what the result eliminates**. At minimum: does the resumable data leg enforce the declared size, both with a known total and with `bytes 0-N/*` followed by a finalize; can client metadata be injected on the unsigned leg; does a POST policy accept a generation precondition at all, as a form field and as a policy condition; and is `ifGenerationMatch: 0` evaluated at initiation or at finalize on a resumable session, which decides whether the anti-substitution guarantee actually holds.

## 2. Cost controls, and what the kill switch cannot stop

- **Correct the egress arithmetic** against the primary source, including the destination dependence.
- **State plainly that Cloud Storage is not covered by platform spend caps.** Alerts-only budgets explicitly do not cap, and the enforcing spend-cap product's eligible-service list does not include Cloud Storage. Capping the app server stops **minting**; nothing at the platform level stops GCS egress.
- **Name the residual the kill switch cannot reach:** already-minted signed URLs do not care that minting stopped. The residual is live minted URLs times remaining validity times object size. **This makes the signed-URL validity window the blast time of the kill switch**, and that should dominate `service.md` 7.4's routed validity decision ahead of the mid-transfer ergonomics currently driving it. Decide the window on that basis, including the minimum viable validity below which a clamped mint is refused, and note the 604800 second upper bound.
- **Design signing-key rotation as an explicit second-stage kill switch.** It is the one instrument that invalidates outstanding URLs at once. It is indiscriminate and breaks honest in-flight downloads, which is the correct trade in a spend emergency. Specify the signing-identity mechanics so rotation does not lose the identity along with the money, and **mark the propagation timing as unverified** rather than assuming immediacy.
- **Decide the per-object download cap, computed against the mint-trigger branch `design-topology-and-origins` chose.** `service.md` 2.3 gives the arithmetic and the range: a floor of 40 legitimate mints for a 40-person distribution list, and a ceiling near 80 where scanners detonate with a browser. **Which end of that range binds is topology's decision and not yours to guess.** Gate the mint behind a signal a headless previewer does not produce and the ceiling collapses toward the floor of 40; leave it on load and the cap has to absorb up to 80 mints per relic before a human clicks, which roughly doubles the number and the worst-case egress it feeds. Read `docs/design/topology.md` first, state in your own document which branch it chose and which dedup interval it set, and compute the cap against that branch. Getting this wrong in either direction is a real failure: a cap sized for scanner detonation against a gated mint is slack in exactly the dimension `preconditions.md` calls the go/no-go, and a cap sized for 40 against auto-mint-on-load breaks ordinary email distribution on legitimate traffic alone, which `service.md` 2.3 already warns about.
- Decide the per-IP publish quota, showing the arithmetic. Note that GCS charges nothing for operations returning 4xx, so refusals at the storage layer are free.

## 3. The hard size cap, which three documents route and only you can decide

The same decision is routed three times: `format.md` 4.4 as whether the cap is on plaintext or ciphertext and its value, `publish.md` 6.3 as the size cap value and its referent, and `viewer.md` 7.2 as the hard size cap value. **One decision, one owner, and it is you.** `design-container-and-crypto` does not decide it and `design-topology-and-origins` does not decide it; both are told so explicitly. Do not read either sibling document as having settled it, and do not defer to a value one of them mentions in passing.

You hold it because the binding constraint is arithmetic you already own. `service.md` 2.3 is where it lives and it is in your read list. `format.md` 3.11 constrains the referent. `viewer.md` §5 carries the consequence that makes this structural rather than a number in a config file.

Decide, and state each consequence:

- **The referent, plaintext or ciphertext**, against `format.md` 3.11, and the value. `docs/design/container.md` fixes the per-record overhead, so the two referents are convertible only after you read it.
- **What it does to the viewer, which is the largest structural consequence in this station after the container framing.** `viewer.md` 7.2 states it plainly: the cap determines whether §5's tiering is required at all, because a cap below the in-memory ceiling collapses three tiers into one. A cap arrived at by omission either builds a three-tier streaming viewer that was never needed or forecloses one that was. Say which outcome your value produces. **The in-memory ceiling itself is `design-product-surface`'s decision under `viewer.md` 7.1 and it runs after you**, so state your value against each candidate ceiling and say where the collapse point sits. State the need and name the owner; do not pick the ceiling here.
- **What it fixes downstream.** From `publish.md` 6.3: `size_limit_bytes`, `size_basis`, the client pre-check in 1.2, and the signed constraint in 3.6, which is §1's decision tree. From `format.md` 4.4: the grant's signed size constraint and the worst-case egress arithmetic in the preconditions, which is §2's.

## 4. Three routed items that were assigned to nobody, and are now yours

None of these appeared in any unit's prose. Each is a value with a stated consequence in a locked document, so leaving one open ships a hole into `build` against a sentence nobody can edit.

- **Whether proof of work is in the flow, and at what difficulty.** `publish.md` 6.2. The wire shape is fixed in 3.1, so this is a value rather than a protocol change. It is the primary anti-abuse control available to a service with no accounts, and the per-IP publish quota you decide in §2 is the alternative instrument, so **decide this one on its merits rather than letting the quota close it by omission.** State the consequence `publish.md` 6.2 states: if difficulty is non-zero, `service.md` gains one grant-time refusal code for an invalid or expired solution. That code is `service.md`'s to define and never yours, so state the need and name the owner.
- **The retry cap and the backoff bounds.** `publish.md` 6.4, against 4.6. Once picked, this fixes when `upload_retries_exhausted` fires and how much egress a single failing publish can consume. `upload_retries_exhausted` is an error code already fixed in a locked document, so the value is what decides when it fires. The second half is your own arithmetic: without this number, the worst-case egress ceiling and the kill-switch residual in §2 are unbounded from the publish side.
- **Whether object metadata is set at upload at all.** `format.md` 4.6 and `publish.md` 6.5, the same decision routed twice. Both documents establish that nothing here is a capability question: the app server can set, patch, and delete custom metadata with credentials it already holds, and it can pin client-supplied values by signing `x-goog-meta-*` into the grant. `format.md` 3.2 already bars anything content-descriptive. **What is genuinely open is whether any metadata is needed at all.** Decide that, and state the two consequences both documents name: whether the grant must sign metadata constraints, and whether the blocklist scanner reads metadata or only object bytes. Your §1 holds the evidence nobody else has, since the resumable data leg accepts `X-Goog-Meta-*` on an unsigned request, so a yes here interacts with the grant branch.

## 5. The GCP project topology

The abuse blast radius is **project-level**, and `frame.md` requires two registrable domains. Nobody has connected these. **Two domains in one project is one failure domain, not two:** a suspension takes down the API, the viewer, both buckets, and the abuse tooling you would use to answer the notice.

Design both branches, since this is an operator decision with a real cost: single project, and separate projects with separate billing. State what each buys and what each costs, and state that moving buckets and signing identities afterward is a migration rather than a config change. State the sharper version too: the migration is cheap when you do not need it and impossible at the moment you do, because a suspended project cannot be migrated out of.

## 6. Lifecycle, retention, and the published byte lifetime

Decide the TTL ceiling and lifecycle regime, the retention window against the publishing-IP filter, and the soft-delete posture. **These are values, not considerations, and they are the run's permanently unfixable items.** `preconditions.md` states the property in its own words: setting the soft-delete policy late leaves a tail nobody can retroactively clear, and it has to match the retention window published below, which is what makes it a precondition rather than an operational detail.

- **Soft delete.** Read `gcs-soft-delete-and-what-deletion-actually-means`, which is the knowledge topic written for exactly this decision. Decide the posture and state what deletion actually means to a recipient, to an abuse reporter, and to a legal-preservation request.
- **The TTL ceiling and its lifecycle regime.** `service.md` 7.3 notes anything under a day is inexpressible in lifecycle and is enforced only at the application layer, per 3.1. Say which regime your ceiling lands in. **This number also bounds `design-container-and-crypto`'s v2 migration cost**, which is stated as bounded on the strength of a mandatory TTL. An undecided ceiling leaves that bound unproven, so the station's strongest reassurance about the container framing rests on this value.
- **The retention window, set together with the TTL.** `service.md` 7.5: a retention window shorter than the TTL silently stops the metric's publishing-IP filter firing on older relics, and neither locked document contains a number that would catch it. It also bounds how long the tombstone and the mint log's `code` survive, which the cap-exhaustion cost in `service.md` 1.2 depends on. State the two numbers against each other.
- Note that a legal-preservation obligation can require retaining ciphertext the operator cannot read for a year, which the published byte-lifetime number must count alongside TTL and lifecycle lag.

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
7. **The grant decision is written as a decision tree keyed on probe outcomes**, so no leaf is left undecided, **and every leaf names which of the four requirements that branch sacrifices, which locked sentence that contradicts, and routes that sacrifice as drift to the document's owner.** The four are `publish.md` 3.6, 3.7, 3.4, and 4.4. A leaf that names a candidate and leaves the sacrifice implicit does not satisfy this criterion.
8. **The document states that Cloud Storage is not covered by platform spend caps**, and names the residual the kill switch cannot reach.
9. **Signing-key rotation is designed as a second-stage kill switch**, with propagation timing marked unverified.
10. **The hard size cap is decided as a referent plus a value**, cited to `service.md` 2.3's arithmetic and `format.md` 3.11's constraint, **and the document states whether that value collapses `viewer.md` §5's three tiers into one**, against each candidate in-memory ceiling, naming `design-product-surface` as the owner of the ceiling itself. The document also names the three routings it closes: `format.md` 4.4, `publish.md` 6.3, `viewer.md` 7.2.
11. **The per-object download cap is a number computed against the mint-trigger branch in `docs/design/topology.md`**, and the document states which branch that was, which dedup interval it set, and how the cap would differ under the other branch.
12. **The three previously unowned items are each decided as a value with the stated consequence: proof of work and its difficulty, the retry cap and the backoff bounds, and whether object metadata is set at upload.** Each names the locked consequence that follows: the grant-time refusal code, when `upload_retries_exhausted` fires and the per-publish egress bound, and whether the grant signs metadata constraints and what the blocklist scanner reads.
13. **The soft-delete posture, the TTL ceiling and its lifecycle regime, and the retention window are each decided as a value, not as a consideration.** The document states the retention window against the TTL and names the publishing-IP filter failure a shorter window causes, states which lifecycle regime the ceiling lands in, and states that the TTL ceiling is what bounds `design-container-and-crypto`'s v2 migration claim.
14. **Every quoted string is verified verbatim against raw source text, and the beat reports the audit as a list.**
15. **Both project-topology branches are designed**, with cost and blast radius stated for each.
16. **Every routed decision assigned to this document is decided with its consequence stated, or explicitly eliminated with the reason. The list, by name and with no others implied:** `publish.md` 6.1 the grant shape, 6.2 proof of work and difficulty, 6.3 the size cap value and referent, 6.4 the retry cap and backoff bounds, 6.5 object metadata at upload; `format.md` 4.4 the cap side and value, 4.6 object metadata at upload, which are the same two decisions routed twice; `viewer.md` 7.2 the hard size cap value, the third routing of the same decision; `service.md` 7.2 the per-object download cap, 7.3 the TTL ceiling and lifecycle regime, 7.4 the signed-URL validity window including the minimum viable validity below which a clamped mint is refused, 7.5 the retention window. **Nothing on this list closes by omission, and nothing on it belongs to a sibling.**
17. `test "$(grep -c '[—–]' docs/design/storage.md)" -eq 0` exits 0.

# Files touched

- `docs/design/storage.md`, `docs/design/storage.sources.txt` (create)

# Out of scope

- The container format and key material. Locked by `docs/design/container.md`.
- Origins, TLS, edge, which origin serves what, the mint trigger, the mint dedup interval, and the name. Locked by `docs/design/topology.md`.
- Viewer screens, art direction, platform memory ceilings, the truncated-prefix size, and the highlighted-region cap. Sibling `design-product-surface`.
- The abuse pipeline, legal posture, and the published SLA. Sibling `design-operations-and-abuse`.
- Product code.
