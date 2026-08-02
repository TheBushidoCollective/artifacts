---
station: specify
phase: pre
created_at: 2026-07-30T04:36:37.041402+00:00
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
