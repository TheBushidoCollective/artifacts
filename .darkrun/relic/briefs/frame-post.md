---
station: frame
phase: post
created_at: 2026-07-30T04:11:57.439308+00:00
---
# Frame station: closing brief

**Verdict: locked.** Every criterion met, both audit roles approved, all checks green on the integrated tree.

## What this station eliminated

**wrong-thing.** And it earned that, because the frame it locked is materially different from the one it was handed.

Discovery established that the operator's original value case was already commoditized: **file.kiwi ships client-side AES-GCM, key-in-fragment, no-account publishing, no size limit, 96-hour expiry, and an MCP server, free**, and PrivateBin has shipped the identical construction since 2012. `docs/frame.md` concedes all of that by name and draws the conclusion against its own interest: neither the crypto nor agent-native publishing is defensible ground. The wedge was moved to **opinionated, mimetype-aware rendering of agent output**, with zero-knowledge demoted to the permission slip that lets a developer use the thing without a security review.

Two locked operator decisions were overturned on evidence, both endorsed by the operator afterward:

1. **No server-returned executable script.** A local stdio MCP server encrypts in-process. Identical zero-knowledge, zero Bash approval prompts instead of one per invocation, and it removes a CVSS 9.6-shaped hole that CVE-2025-6514 proved is reachable through a mere metadata string.
2. **Relic does not run under `thebushido.co`.** Two registrable domains distinct from it. Immich had all of `*.immich.cloud` flagged wholesale, twice, triggered by PR preview environments.

A third risk class was eliminated that the station was not strictly obligated to produce: `docs/preconditions.md` states that even a correct product may not be operable, with a binary "do not build" branch that closes the escape hatches by name (not a smaller version, not a private beta, not v2).

## The locked artifacts, and where the evidence lives

On station branch `darkrun/relic/frame`, pushed to origin:

- **`docs/frame.md`** (2449 words, 11 sources) plus `docs/frame.sources.txt`
- **`docs/preconditions.md`** (4662 words, 22 sources) plus `docs/preconditions.sources.txt`

Evidence: the spec and review record in this station's `pre` brief; three findings (`fb-01`, `fb-02`, `fb-03`) all resolved `addressed`; six Pass-loop beats recorded on the two units with full handoffs; both audit roles stamped `approval`; the retrospective at `refl-01`.

**Green check run, re-executed against the integrated tree by the feasibility auditor rather than inherited from unit worktrees: 8 of 8 gates exit 0. All 33 cited URLs fetched individually, 33 of 33 HTTP 200.** Blob SHAs identical between unit-branch tips and the landed station branch on all four files, which is stronger than an empty diff. Both unit tips are ancestors of the station branch. Zero unicode dashes and zero non-ASCII characters in all four files, verified by grep.

## Reviewer concerns and their resolution

**`fb-01` (value, high).** Three defects. The primary metric was unmeasurable under the architecture this same station had just locked: it needed the mimetype of *opened* relics, but the server holds only ciphertext, sniffing happens post-decryption, and the viewing origin forbids analytics. It would have silently degraded to raw opens, precisely the number that cannot distinguish Relic from a worse file.kiwi. Resolved by requiring the frame to state the minimum telemetry and its metadata cost. Also fixed: the wedge was unbounded (now a wedge-boundary section that tells `shape` range-decryptable framing is required regardless), and the Anthropic window risk was unstated (now a falsifying trigger routing back as drift).

**`fb-02` (feasibility, high).** The anti-fabrication gate failed open on the last line of a manifest without a trailing newline, so a fabricated URL there would have passed. Reproduced, fixed with `|| [ -n "$u" ]`, verified exit 6 instead of 0. Definitively closed on the integrated tree: both manifests end `0x0a` and the auditor fetched line 11 and line 22 explicitly.

**`fb-03` (value, high).** The `fb-01` fix was half-closed. Excluding opens from the publishing IP fails **asymmetrically**: same-NAT undercounts (safe), but the publisher opening from cellular or a second machine counts as a recipient and inflates the exact clause the metric rests on, which is the mainline path for a product shipping a PWA built for mobile viewing. Resolved by requiring the document to state the confound is **permanent** under the non-goals, name both directions, name a server-side discriminator, state what that discriminator misses, and state a trust condition. This finding exists because the reviewer was asked to attack the fix rather than confirm it.

**Two items the auditors raised and correctly declined to file**, recorded in `shape-inherited-constraints-from-frame`: the published retention window must outlive the TTL or the confound filter silently stops firing on older relics, and whether a refused mint counts as an open is undecided and inflates the metric if picked wrong. Both are invisible inside either document alone.

## Retrospective learnings bearing on the lock

**The station's real defect class was not wrong-thing, it was unverifiable-thing.** Five distinct instances of claiming a number the system cannot produce, across two documents, each subtler than the last, three of them found *after* an explicit sweep for exactly that pattern. Fully fabricated claims get caught; half-true ones do not. It is now a mandatory gated criterion and a durable knowledge topic.

**Every pass that verified a default or an expiry rather than a decision found something.** GCS soft delete on by default. Search Console verification expiring. Domain registration lapsing. Nobody chose any of them, which is why nobody checked them.

**Convergence, not exhaustion, justifies the lock.** Findings fell in severity across every pass and moved from load-bearing claims to qualifiers on already-correct mechanisms. The final resolve pass found three qualifiers plus one factual error in a peer's summary, and the audit found nothing.

## What the next station inherits

`shape` picks the server language, framework, hosting topology, and encryption wire format. It inherits, and may not quietly settle: range-decryptable framing, ciphertext never transiting the app server (deviation routes back here as drift), a signed size constraint on the upload grant, `429` for rate limiting, separate-origin rendering, and a GCS soft-delete decision before first deploy. Full list in `shape-inherited-constraints-from-frame`.

## Outstanding operator action

**Two registrable domains distinct from `thebushido.co` must be acquired before anything deploys.** Named in `docs/preconditions.md` as an external dependency blocking deployment, explicitly not blocking design. The run proceeds without it.
