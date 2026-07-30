---
topic: shape-inherited-constraints-from-frame
created_at: 2026-07-30T04:11:04.160990+00:00
updated_at: 2026-07-30T04:11:04.160990+00:00
---
Constraints and open values the `frame` station deliberately left for `shape`, plus two cross-document interactions that are invisible inside either document alone and will collide if `shape` picks values independently. Surfaced by the value audit reading both locked artifacts in one tree.

## Two interactions that will break silently if picked wrong

**1. The retention window must outlive the TTL.** The success metric's baseline confound filter compares a viewer's requesting IP against the relic's publishing IP, which requires that IP still be on record at open time. `docs/preconditions.md` mandates a published retention window for upload IP plus timestamp but deliberately sets no value; `docs/frame.md` mandates a TTL but sets no value either. **If the retention window is shorter than the TTL, the filter silently stops firing on older relics** and the metric's first clause degrades with no alarm. Neither document can catch this, because neither contains a number.

**2. Decide explicitly whether a refused mint counts as an open.** The per-object download cap, the per-IP download rate limit, and the frame's open counter all read the same mint log. Neither document says whether a rate-limited or cap-refused mint increments the metric. **Getting this wrong inflates the metric's first clause**, which is the clause already carrying a permanent confound (see [[relic-telemetry-trade-and-measurability]]).

## Values `frame` left open on purpose

Every one of these is deliberately unset so `shape` can decide, and every one is currently unconstrained by any number in either locked document: the TTL ceiling, the signed-URL validity window, the hard size cap, the global egress spend ceiling, and the per-object download cap. Note that **the real bound on how long a relic circulates is TTL plus signed-URL validity**, not TTL alone, because a URL minted a second inside the ceiling stays valid for its own lifetime.

## Hard constraints `shape` inherits and may not quietly settle

- **Range-decryptable wire format is required.** The value case includes in-page archive browsing and seekable media even though neither ships in the first release. The framing choice is irreversible once content is encrypted (see [[archive-browsing-and-mimetype-detection]]). This is a constraint on reversibility, not a request to build the feature.
- **Ciphertext never transits the app server.** `docs/frame.md` locks only the download leg (its telemetry counts opens at signed-URL mint). The publish leg is stated as a precondition in `docs/preconditions.md` section 4, because four of that document's sharpest limit clauses are structurally made of the server being outside the data path. **Deviation routes back to `frame` as drift**, not to a `shape` decision.
- **The size cap only holds with a grant carrying a signed size constraint.** A plain signed PUT does not bound body length (`Content-Length` is ignored), so choosing the convenient grant shape turns the cap into a client-side suggestion, present in the code and absent on the wire. Which grant shape is `shape`'s call; that the chosen one enforces size is not.
- **Rate limiting returns `429`, never `401` or `403`** (see [[mcp-protocol-2026-07-28-constraints]]).
- **Untrusted content renders on a separate origin**, and the viewing origin carries no third-party scripts, analytics, or error reporting. Note the trap the frame station found late: **a bundled first-party-served SDK satisfies `script-src 'self'` and presents no external host to scan for**, so neither a CSP fetch nor a third-party-host scan catches it. Sentry's browser SDK is exactly that shape.
- **GCS soft delete is a bucket-level decision that must be made before the first deploy** (see [[gcs-soft-delete-and-what-deletion-actually-means]]).

## The observability bill `shape` inherits

Keeping the server out of the data path costs three things the operator then cannot see: upload rejection counts, bytes actually served, and hash comparison at the door. The audit verified `docs/frame.md` makes no claim on any of the three (its egress condition reads the billing export, not bytes served), so the preconditions do not invoice the frame for anything it claimed. **Preserve that discipline: if `shape` adds a claim that depends on one of those three, it is reintroducing the defect class in [[unobservable-quantities-are-this-projects-failure-mode]].**
