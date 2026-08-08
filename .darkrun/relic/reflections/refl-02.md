---
station: specify
created_at: 2026-07-30T09:38:52.222302+00:00
---
# `specify` retrospective

Four documents, 32,259 words, 62 sources, sixteen gates, thirteen feedback items across the station. Both lenses passed after one fix cycle. What follows is what actually happened, including the parts where I was the defect.

## The manager was wrong more than the beats were

This is the headline and it should change how the next station briefs its workers.

**My wrong directive propagated into a shipped document and survived to audit.** Early in the station I told a worker the redirect-fragment rule splits on cross-origin versus same-origin. The correct axis is the destination's trust boundary, because apex-to-`www` and HTTP-to-HTTPS both change origin without leaving Relic. `fb-09` corrected it in `format.md`. `viewer.md` reached the right answer independently. `service.md` had already landed carrying **my** version, nobody reconciled it, and it surfaced at audit as `fb-10` and `fb-12`, a blocker that deletes the recipient's key on any URL typed without a scheme or without `www`. The station's most serious defect was mine, laundered through a worker that had no reason to doubt me.

Other places the correction ran toward me, all verified before I accepted them:

- **`format.md` F6.** I directed that the renderer class go on the mint response. The tightener refused: the container already carries filename and declared mimetype inside the AEAD, tamper-evident and finer-grained. Mine would have put a publisher-asserted value on the viewing origin.
- **Timeout premises.** My brief gave 60-second time-to-first-byte and a five-minute idle window. Those are HTTP-side figures. The publishing client is stdio, where the docs say there is no per-request timer and the idle window is thirty minutes.
- **Stripe idempotency.** My brief asserted the prior art returns `409` for a still-running original. The writer said the page names no status. The adversary found the actual table row and quoted it. Both of us were partly wrong and the adversary settled it from the source.
- **`fb-09` framing.** I posed reopening a locked unit as a binary and recommended against it. The engine had a third path I had not accounted for, a fix-worker with its own worktree.
- **Group B code count.** I reported seventeen. Both reviewers independently counted fifteen. My regex swept the whole document for four prefixes and picked up two extension-member field names sitting in a table column. Wrong in a number I had already stated as verified.

Two more were self-inflicted reading errors: a cwd drift that made me announce the run state had regressed when it had not, and a stale remote-tracking ref that made me claim 26 unpushed commits before fetching.

**Carry forward:** state every premise in a brief as a checkable claim with its source, and tell the worker explicitly that correcting the brief is in scope. Every beat that worked from raw source text and grep beat my recollection. The ones that took my brief on faith shipped my errors.

## Failure mode one: citation defects, and the check that catches them

Five shipped across three units in four modes: a fabricated quotation attributed to RFC 9110 section 15.5.11 that appears zero times in 10,785 lines; two pages cited for claims they never make; one relay of a relay presented as first-hand; one wrong word inside quotation marks.

**Not one would have failed `every-cited-url-resolves`, because in every case the URL resolved.** The mechanism is not carelessness about sources. In all five the writer had read the right document and reached the right conclusion, and a confident paraphrase hardened into quotation marks. The argument survives and the evidence is counterfeit, which is why it passes any review that checks whether the reasoning is sound.

I added a verbatim-quotation criterion to the one unit still unwritten. It caught a defect mid-draft on first use, a period inside quotation marks the source places outside. The audit then found the other three units clean too: 78 quoted strings checked, all 78 verbatim, zero corrections. So the earlier defects were all caught by their own adversary passes before lock, and the criterion's value is that it makes the check mandatory instead of lucky.

**Carry forward:** every document unit carries the verbatim-quotation criterion from the start. Also: do not use WebFetch on a specification. It was caught returning text that flatly inverted RFC 9110's fragment-inheritance meaning. Raw text and grep, always.

## Failure mode two: sequential units writing against moving siblings

Both audit blockers had one root cause. `service.md` was finalized at `ed51b43`, before the `format.md` trust-boundary correction and before the entire publish contract. It was the only one of the four never revisited, and both failures landed on it.

`fb-13` is the purer case: `publish.md` made the challenge round trip unconditional at launch, correctly declined to invent an app-server code, and wrote "this code is `service.md`'s to add." `service.md` was already complete and contained zero occurrences of "nonce" or "challenge." The obligation was assigned to a document that could no longer receive it, and the consequence was a publisher whose challenge timed out taking a terminal failure where re-challenging would have worked.

**Carry forward:** when a later unit assigns an obligation to an earlier locked one, that is a hard signal, not a note. Either the earlier unit gets a reconciliation pass before the station closes, or the assignment is extracted mechanically and checked. Grep every document for phrases of the form "X's to add" and "assigned here by" before declaring manufacture done.

## What eliminated ambiguity more than expected

**The mechanical cross-document token diff.** Extracting every status, code, and field name one document claims to consume from another and diffing the sets turned "the mapping is clean" from a belief into an observation: nine Group A rows all resolving, zero missing field names, zero prefix collisions across fifteen Group B codes, zero broken section references across all four documents. It also found `fb-11`, because the one refusal with no code was visible as a row that could not be filled.

**Measuring density instead of arguing about it.** The largest document was suspected of padding. Words per decided rule: publish 65.1, service 68.4, format 71.2. The largest is the densest. Length was never the defect and the question died in one command.

## What eliminated ambiguity less than expected

**Per-unit completion criteria.** Both blockers and both unfiled cross-document gaps were invisible to them, because each document was internally complete and correct. A criterion set bounds one document; it cannot see a rule stated in the right words in the wrong file. Only walking the system end to end and asking "which document owns this, and did it decide it" surfaced them.

Two gaps found this way stayed unfiled because no criterion reaches them, and I recorded them as knowledge for `shape` rather than reopening a passed station: `viewer.md` has no screen for a post-mint object-fetch failure that `service.md` mandates specific copy for, and `mints_remaining` ships with a stated purpose and no specified consumer.

## Two reviewers on different lenses found the same two defects

`testability` filed `fb-10` and `fb-11`; `completeness` filed `fb-12` and `fb-13`. Same two defects, independently, from different questions. That convergence is worth more than either finding alone and it is an argument for keeping two lenses rather than merging them into one thorough pass.

The reviewers also disagreed on the remedy for the redirect defect, one arguing delete as out of scope and the other arguing correct because `format.md` assigns the rule by name. I chose correct-and-shorten. `completeness` then withdrew its objection with a better argument than mine: `service.md`'s link-shortener paragraph back-references "the same mechanism above," so deleting would have left that pointing at nothing. **A reviewer that argues its way to the other side is doing the job.**

## What the fix workers taught

The `fb-13` worker derived a consequence no brief asked for, and **without it the fix would have been inert.** Under the idempotency rules, results are stored under the key whether they succeed or fail and key-match runs before nonce validation, so resubmitting under the original key replays the stored refusal before the fresh nonce is ever examined. The client would spin to the retry cap reporting a dead challenge that was alive. The fix draws a fresh idempotency key for exactly that reason.

**Carry forward:** whenever a new error code is added that a client keys a recovery action on, trace that recovery through the idempotency layer before calling it done. A code without a reachable recovery is worse than no code, because it looks handled.

## What each unit taught

- **`spec-relic-format`:** running one unit alone ahead of a wave paid for itself. Three cross-document couplings resolved through it, and the two units that consumed it directly never had to guess. Its own criterion 7 was met by a better mechanism than the criterion imagined, a length guard plus an explicit table rather than an alphabet exclusion that would have been false as written. A criterion describing a mechanism rather than an outcome invites that mismatch; write outcomes.
- **`spec-service-surface`:** the cost of being finished first. Everything downstream assigns it work it can no longer accept. Whatever unit owns the shared taxonomy should close last, not first.
- **`spec-viewer`:** it refused a mandated instruction and was right to. The unit mandated a CSP sandbox header on the shim's own response; the document showed that makes the shim an opaque origin, which matches no `targetOrigin`, which forces the wildcard its own criterion forbids. It moved the sandbox to a second layer and said so. It also corrected a premise in its own brief about iOS Safari ServiceWorker support against compat data. **A unit that can refuse its instructions with a mechanism-level argument is worth more than one that complies.**
- **`spec-publish-contract`:** the deepest single finding of the station was a genuine logical deadlock, not a wrong fact. Four rules were jointly unsatisfiable: reuse the key on retry, count a redraw as a retry, store refusals under the key, match key before ID. The resolution kept both original protections by drawing a fresh idempotency key alongside the fresh ID. That class of defect is only findable by an adversary that traces sequences rather than reading rules, and no gate would ever have caught it.

## Process notes

- **Every gate was re-run by the manager rather than taken from a beat's self-report.** Two beats reported gate results that were correct; verifying anyway cost seconds and is the only reason the numbers in the brief are trustworthy. It also caught my own wrong Group B count, eventually.
- **The engine's phase field cycled in ways that did not match actual progress**, and I twice read it as a state problem. Both times the engine's routing was correct and my reading was wrong. Trust the returned action, not the phase name.
- **Fix worktrees forked off a station branch that had no `docs/spec/` at all** earlier in the station, producing a circular block. Verifying the fix worktree actually contains the artifacts before dispatching became standard for the rest of the station, and both later fixes went cleanly.
