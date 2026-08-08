---
station: shape
phase: post
created_at: 2026-08-02T21:14:48.485586+00:00
---
# `shape` closing brief

**The station locks.** Five design documents, 51,479 words, 82 sources. Twenty quality gates green on the landed station branch. Twenty-six feedback items, all addressed, none open. Three reviewers signed all five units.

## What this station eliminated

**Expensive structural reversal.** The spec was clear; what was open was whether the chosen structure would collide with reality only after code existed. Five decisions were load-bearing enough to force a rewrite if wrong, and each is now either measured, explicitly deferred with an owner, or foreclosed by a locked rule:

- **The container framing and key material** (`container.md`). RFC 8188 vectors reproduced byte-for-byte on Node by three separate beats, the reference implementation's source read directly rather than trusted from its docs. One shared implementation serves both writer and viewer, so cross-implementation divergence cannot arise at v1.
- **Origins, edge, and the mint trigger** (`topology.md`). The trusted-input claim was measured with headless Chrome over CDP rather than asserted, and the measurement's own artifact was published alongside it: an unfocused tab yields a reading that discriminates on the test harness rather than on the presence of a human.
- **The grant shape and storage topology** (`storage.md`). Deliberately locks nothing it cannot prove. Five probes specified with request, assertion, and elimination, stated plainly as not run, and assigned to `build` ahead of committing the branch. Every leaf of the decision tree is decided regardless of what the probes return.
- **The renderer stack** (`surface.md`). `highlight.js` and `prismjs` are foreclosed by direct quotation of their own API docs against `viewer.md` 3.3's no-sanitize-then-parse rule, which has no escape hatch. Genuinely foreclosed rather than disfavored.
- **The in-memory ceiling** (`surface.md`). This was the one gap, and it is now closed. See below.

## The locked artifact and where the evidence lives

The station's `locked_artifact` is nominally `design.md`. **What it actually produced is five documents under `docs/design/`**, one per unit, and that is the correct shape for this run: the risk classes are independent and each needed its own completion criteria. Recorded here so a later station does not go looking for a single file that was never written.

Everything is on `darkrun/relic/shape`, tip `70cc0c1`:

| Document | Words | Sources | Unit |
|---|---|---|---|
| `container.md` | 8,464 | 13 | `design-container-and-crypto` |
| `topology.md` | 10,213 | 25 | `design-topology-and-origins` |
| `storage.md` | 11,459 | 18 | `design-storage-grant-and-cost` |
| `surface.md` | 10,748 | 14 | `design-product-surface` |
| `operations.md` | 10,874 | 12 | `design-operations-and-abuse` |

**Evidence:** twenty gates re-run by the manager against the landed branch, twenty pass, zero fail, with an assertion enforcing four gates per unit so the run cannot under-report. Zero em-dashes or en-dashes across all five. Per-unit `gate_results` carry the manager's independently observed values rather than the worker's reported ones. Audit verdict PASS with `approvals.fit`, `approvals.reversibility`, and `approvals.simplicity` stamped on all five units. Retrospective at `refl-03`.

## Concerns reviewers raised, and how they resolved

**`fb-25`, high, from the reversibility reviewer.** `surface.md` hardcoded the in-memory ceiling at 500,000,000 octets, collapsing `viewer.md` section 5's three streaming tiers into one, on the strength of a single forum thread reporting an `OperationError` at 800 MB, with no source URL in its manifest and no validation assigned to anyone. The document's own text calls this the largest structural consequence in the station after the container framing and states that raising the cap later means building tier 1 and its ServiceWorker rules rather than editing a value.

**The defect was never the number; it was the inconsistency.** Three sibling units either measured their unproven empirics or explicitly deferred them to `build`. This one did neither. **Resolved additively at `287b0f4`, three insertions and zero deletions**: the 500,000,000 decision stands untouched, and a pre-Build measurement is now named with what gets measured (the real crash threshold for the four-copy worst case against the 319,208,240-octet peak), on which engines (mobile Safari by name, because the taskbar's targets are phones), who owns it (`build`), and the consequence if it lands at or below that peak (tier 1 stops being deferred). The reviewer re-verified and cleared it against the `storage.md` 2.2 pattern it had cited.

**`fb-26`, medium, from the simplicity reviewer.** `operations.md`'s free-text matcher for personal-data reports was argued to be two guards for one failure, since the mandatory screen already reads every report end to end.

**The premise was true but incomplete, and the manager found the defect one layer deeper.** The screen's specified question at `operations.md:108` covered items 2 through 5 plus counsel question 9, and the data-subject determination was none of those, while line 143 relied on the screen as backstop for exactly that. Both could not stand. **Actioning the feedback as filed would have deleted the matcher and left branch B detected by a screen whose own specification did not cover it.** Resolved at `555af2c` by widening the screen's question to include the data-subject determination first, then removing the matcher and the adjacency and English-only limitations it carried. Section 6.3's SLA reasoning was explicitly re-checked and holds: a third disjunct is one more thing noticed during a read that already happens, not a second read, so 24 hours stands.

**One concern named and deliberately not filed.** The simplicity reviewer flagged, and correctly ruled out of its own lane, that a human read now covers more conditions including the mandatory-report branch carrying $600,000 and $850,000 exposure. **Manager adjudication: a real residual risk and not a Shape defect**, because the remedy is a checklist or a second reader, which is a process change rather than a structural rewrite. Recorded in `refl-03` for `build` rather than filed.

## Retrospective learnings that bear on the lock

**The station's real defect class was unreceived sibling input, not wrong structure.** Both decision-changing defects in the final wave were reception failures: `surface.md` contradicted itself about mint-response timing while quoting the very rule it violated, and `operations.md` declared `storage.md` an input while never reading the section that decides its central scenario. **Both were produced by the rule that makes this station work**, since units are forbidden their siblings' output so they design against both branches in one pass. No unit criterion catches this; only the station-level audit can. It did.

**Two beat notes asserted content the artifacts do not contain**, caught independently by a fix worker and by the reviewer that wrote the note. Substance held both times, sourcing did not. Recorded as durable knowledge, because the note is the handoff and a wrong note is a wrong work order.

**No unit used the `spiker` beat.** The empirical work happened inline instead, and the reversibility reviewer ruled that acceptable for a station producing documents rather than code. The absent beat was not the problem; the single unit that skipped the empirical discipline was, and `fb-25` closed it.

## What `build` inherits

Five open items, all named rather than implied: the memory-ceiling measurement now assigned by `fb-25`; the screen attention-dilution question; three items routed to `specify` that currently live only as prose in `surface.md` section 10 and `topology.md` sections 1.7 and 8, with nothing outside those documents obliging anyone to act on them; whether `operations.md` was right to treat `storage.md`'s two-project *recommendation* as binding, which the simplicity reviewer named and no reviewer adjudicated; and three empirical unknowns (MCP client icon-fetch timing, the taskbar at true phone widths, and the IBM Plex Mono byte measurements, which carry no source URL).

**The station is allowed to lock because every structural decision is proven, explicitly deferred with a named owner, or foreclosed by a locked rule, and because the one decision that was none of those is now the first.**
