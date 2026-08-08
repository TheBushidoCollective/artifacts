---
station: specify
phase: pre
created_at: 2026-07-30T09:34:13.315690+00:00
---
# Specify station spec

## The risk this station kills

**ambiguity.** Not "we have not written enough down," but the specific failure the explorers demonstrated repeatedly: **an unspecified boundary between two correct components produces a working attack.** Four key-disclosure paths were found in discovery alone, and none of them requires a bug in anything:

1. **SVG has no assigned class.** A client classes it `image`, the viewer routes `image` through the main origin's inactive-content path per Google's own guidance, and the SVG executes inline and reads `location.hash`.
2. **Redirects inherit the fragment.** RFC 9110 §10.2.2 makes it mandatory browser behavior. One fragment-less redirect to the sandbox origin hands it the key, defeating the entire two-domain split. §17.11 names the risk by name.
3. **The renderer class routing the viewer.** The class is a *publisher assertion*. If the viewer routes on it, a publisher declares `image` on an HTML payload and wins inline rendering on the origin holding the fragment. One step.
4. **Blob URLs inherit the creating origin.** A blob built from decrypted plaintext with an attacker-controlled MIME type, navigated to, executes on the origin holding the key.

That is what ambiguity costs here, and it is why this station's output is a set of stated rules rather than a description.

## What this station inherits

`docs/frame.md` and `docs/preconditions.md`, both locked on `darkrun/relic/frame`, plus 19 knowledge topics. The `contract` explorer produced a 28-item **ALREADY DECIDED** list, each with the locking quote, precisely so this station does not relitigate settled ground. Treat that list as binding.

## Discovery output, and how it maps to units

- `contract`: **69 ambiguities**, each naming what is undecided and what breaks downstream if it stays that way; plus the 28 already-decided items.
- `edge_case`: **78 required behaviors**, each pairing an edge case with the behavior the spec must mandate; plus **19 items blocked on `shape`**, each naming precisely what `shape` must choose first.

## The decomposition, and why this shape

Four units, split along surfaces that fail independently and that different people will implement.

**`spec-relic-format` runs first and alone.** It owns the URL and fragment format, the relic ID, and the ciphertext container. It runs alone because it is the only irreversible decision set in the station: the container format cannot be changed after content is encrypted, and three separate cross-document couplings resolve through it.

**The other three depend on it and run as one wave:** `spec-publish-contract`, `spec-viewer`, `spec-service-surface`.

That ordering is not stylistic. The explorers found three couplings where deciding independently produces the one bad combination:

1. **ID entropy must be settled before the expired-versus-404 status.** A short ID plus an informative `410` hands an enumerator a map of real IDs, and with it the operator-conceded metadata for every relic on the service.
2. **The retention window must outlive the TTL**, or the metric's publishing-IP filter silently stops firing on older relics.
3. **Whether a refused mint counts as an open**, and its twin, whether a repeated mint by the same IP counts. Both inflate the metric's first clause, which already carries a permanent confound.

## Out of scope for this station

- **Choosing values.** Every number is `shape`'s: the size cap, TTL, signed-URL validity, per-object cap, retention window, memory ceilings, truncation cutoffs. This station states what must be decided, what each choice costs, and what behavior follows from each; it does not pick.
- **Choosing the stack**: language, framework, hosting topology, and the specific wire format. `shape`.
- **Redefining the frame.** Where an edge case pressures a locked decision, name it as drift routing back to `frame` rather than proposing a change. Two are already identified: the 120-second window's *anchor* (tuning the value cannot fix it, because scanner fetches are anchored to delivery and the window to publish), and convergent encryption (it would make the blocklist work and would simultaneously let the operator confirm two users published the same file, trading zero-knowledge for an abuse control).
- **Implementation.** No code, no schemas expressed as code, no endpoint handler design.

## Decisions taken at this station so far

**The sandbox origin serves a strict CSP that blocks outbound requests**, matching Artifacts. Recorded in `sandbox-csp-decision-and-what-the-wedge-actually-is`, overridable by the operator. The reasoning: the wedge was never richer HTML, it is the types Artifacts refuses to accept and the contexts where Artifacts is unavailable. Loosening would ship an exfiltration channel Artifacts does not have, in a product whose whole story is privacy.

## Three disclosure obligations discovery surfaced

All three belong in the same published statement as the telemetry trade, and none is a defect:

1. **The key enters the model's context and the session transcript** on every publish, because the tool must return the full URL including the fragment. Zero-knowledge holds against the Relic operator and does not hold against the model provider. Structurally unfixable.
2. **"The key never reaches a server" is wrong as an unqualified claim.** The honest form is "your browser never sends the key to Relic's servers." Link shorteners, abuse-form pastes, and enterprise link rewriters are all cases where the key reaches some server with Relic's code doing nothing wrong.
3. **Deleted does not mean erased**, and any published byte-lifetime number must count TTL plus lifecycle lag plus the soft-delete window.

## Done when

Four units complete, each producing its document with every assigned ambiguity resolved into a stated rule or explicitly routed to `shape` with what `shape` must decide, and every assigned required behavior mandated in checkable terms. Then the station's checkpoint decides whether the ambiguity is genuinely bounded.

---

# Review outcome

Appended after manufacture and audit. Everything above is the plan as written before the units ran; this section is the result.

**Verdict: PASS.** Both lenses signed off on all four units after one fix cycle. `testability` stamped at 09:30:18, `completeness` at 09:30:39, zero units skipped in either stamp.

## What shipped

| document | words | sources | unit |
|---|---|---|---|
| `docs/spec/format.md` | 5495 | 12 | `spec-relic-format` |
| `docs/spec/service.md` | 6916 | 20 | `spec-service-surface` |
| `docs/spec/viewer.md` | 7883 | 17 | `spec-viewer` |
| `docs/spec/publish.md` | 11965 | 13 | `spec-publish-contract` |

Sixteen quality gates recorded, all pass. 62 cited URLs, zero dead. Zero em-dashes or en-dashes, zero placeholders. Nine Group A rows all mapping onto `service.md` with the set difference empty in both directions; fifteen Group B codes with zero collisions and prefix discipline intact; zero broken numbered cross-references.

## Both lenses failed round one on the same two defects

The reviewers ran different lenses and converged independently. `testability` filed `fb-10` and `fb-11`; `completeness` filed `fb-12` and `fb-13`. Four items, two defects.

**Both had one root cause: `service.md` was finalized before both documents that assign it obligations.** It landed at `ed51b43`; the trust-boundary correction to `format.md` landed after at `e2420ae`, and the publish contract after that at `4a9507c` and `e6ebc99`. It was the only one of the four never revisited, and both failures fell on it. Both defects are of the same class the plan above predicted: an unspecified boundary between two correct components.

### Defect A: the redirect rule contradicted two siblings and its version deleted the key

`service.md` §6 keyed the fragment-in-`Location` rule on the **origin boundary**, naming HTTP-to-HTTPS and apex-to-`www` as cases where the MUST bites, with a same-origin-only carve-out reaching neither. `format.md` §5 and `viewer.md` §1.7 key it on the **destination's trust boundary** and put both cases on the fragment-omitted side. As written, a recipient typing the URL without a scheme or without `www` lost the key and landed on the "link is missing its key" screen holding a link that was never broken.

This is disclosure path 2 from the plan above, resurfacing as an inconsistency rather than an omission.

**Remedy: correct and shorten, not delete.** The reviewers disagreed. `completeness` argued the paragraph is out of scope per the unit's own boundary; `testability` argued `format.md` §5 assigns "two rules about redirects" to this document **by name**, so deleting orphans the assignment. Correcting won, because deletion creates a new gap rather than closing one. Three full copies of one rule is how it drifted, so `service.md` now states it compactly and cites `format.md` §5 and `viewer.md` §1.7 as where both halves are developed. Fixed at `c6cf095`, one file, `+2/-1`.

### Defect B: a launch-required refusal had no code anywhere in the set

`publish.md` §3.1 makes the challenge round trip unconditional at launch, so a grant presenting an expired or never-issued nonce must be refused at grant time. It correctly declined to invent an app-server code and said the code was `service.md`'s to add. `service.md` contained **zero** occurrences of "nonce", "challenge", or "proof of work", so the refusal fell through to `app_response_unusable`, which §§2.2 and 4.6 make terminal and never retried. A publisher whose challenge timed out took a permanent failure where re-challenging would have worked.

**Remedy: add the code.** Folding it into an existing one destroys the re-challenge action, and no candidate fits. **One code covers both the expired and never-issued nonce**, because the client's action is identical and splitting them hands an attacker an oracle distinguishing "expired" from "never existed", the same reasoning `format.md` §1.2 applies to relic IDs.

**The status was argued and its cost paid openly.** `409`, on RFC 9110 §15.5.10's "might be able to resolve the conflict and resubmit the request". The document names the weakness in its own choice: §15.5.10's first sentence reads the conflict as being with the target resource, while this one is with the server's live-challenge state. It prices and rejects `400` (misroutes the outcome, since the other two `400`s name a client defect and this publisher did nothing wrong), `422` (says only "something was wrong" in a status-only surface), and `401`/`403` (barred by the locked rate-limiting decision). No `retry_after_seconds`, because the nonce is dead immediately and a number there would be a lie. Fixed at `8449071`, two files, `+8/-2`.

## The interaction nobody specified, derived by the fix worker and verified

**Without it the fix would have been inert.** Under §4.3's idempotency model, results are stored under the key whether they succeed or fail, and key-match runs before nonce validation, so a resubmit under the original key replays the stored `409` before the fresh nonce is examined. The client spins to the retry cap reporting a dead challenge that is alive. The §4.6 clause draws a **fresh idempotency key** for exactly that reason.

Three second-order properties traced and holding: the relic ID is reused rather than redrawn, because a refused grant creates no record and the ID is unspent (correctly different from the collision case, where redrawing is mandatory); the re-challenge is bounded by the retry counter without contradicting §4.6's rule that retries never apply to Group A refusals; no quota is charged, because §3.8 charges on grant issuance.

## Citation integrity

The station's dominant failure mode was citation defects: five across three units in four modes, including a quotation attributed to RFC 9110 §15.5.11 appearing zero times in 10,785 lines. **None would have failed the `every-cited-url-resolves` gate**, because every URL resolved. A verbatim-quotation criterion was added to the one unit still unwritten and caught a defect mid-draft on first use. The audit found the other three clean as well: **78 quoted strings checked across all four documents, all 78 verbatim, zero corrections.** Every quotation added by the two fixes was re-verified against raw RFC text, including a trimmed span checked rather than assumed safe.

The durable lesson: a resolving URL proves nothing about a quotation, and the only check that catches this class is pulling the source as raw text and substring-matching.

## What `shape` inherits

Twenty-three routed items, every one authorized by its unit's own route list and naming a decidable choice with stated consequences. No hole wearing routing's clothes. The load-bearing ones: the grant shape, where the two requirements pull against each other and the empirical check is assigned per branch; proof-of-work difficulty, with the wire shape fixed and only the value open; the size cap value and referent; the retry cap and backoff bounds; the viewer's in-memory ceiling and hard size cap; and whether object metadata is set at upload at all.

## Outstanding operator action, blocking deployment rather than design

Two registrable domains distinct from `thebushido.co`, one service and one sandbox origin. The Public Suffix List submission for the sandbox parent has no publishable lead time, sourced to the list's own guidelines stating there are no service level agreements on time and no way to expedite. It gates the sandbox origin's process isolation and starts before the work depending on it.
