---
station: frame
created_at: 2026-07-30T04:10:32.959549+00:00
---
# Frame station retrospective

## What manufacturing revealed that the spec did not anticipate

**The station's real defect class was not wrong-thing, it was unverifiable-thing.** The spec pointed at "solves a problem nobody has." What actually kept surfacing, in every single pass, was claims that could not be checked: a success metric with no path to a number, a control reporting a count for something it never does, a condition observable only from inside a third party. Five distinct instances across two documents, each subtler than the last, and three of them found *after* an explicit sweep for exactly that pattern.

The progression matters more than the count. Instance 1 named a capability that is an explicit non-goal (an account). Instance 5 sat inside a *mechanism clause* of a condition a prior reader had already flagged and reviewed. **Fully fabricated claims get caught. Half-true ones do not.** A metric that is 80 percent computable reads as computable.

This was not in the spec at the start. It became a mandatory gated criterion on the second unit only because the first unit bled. Carrying forward: `shape` and `build` should treat "name the mechanism that produces this number, and say which half is not observable" as a standing authoring rule, not a review finding.

**Second unanticipated pattern: every pass that verified a *default* or an *expiry* rather than a *decision* found something.** GCS soft delete on by default (7-day retention, silently falsifying three takedown claims). Search Console verification expiring and re-checking rather than being a one-time gate. Domain registration lapsing, where a lapsed relic domain is worse than a flagged one because someone else can buy it and inherit every link ever shared. Nobody chose any of these, which is exactly why nobody checked them. **The dangerous configuration is the one nobody chose; the dangerous fact is the one that stops being true while nobody is looking.**

## Where the work fought back

**Word-floor calibration was wrong twice, in both directions, and I set it both times.** `frame-artifact` shipped at 900, which turned out toothless: a document could drop the confound subsection, the standing assumption, and the wedge boundary entirely and still pass. Raised to 1300 for the same unit, and criterion 2's accompanying guidance text ("lands near 1,400 words written tightly") was already stale when written, because it predated criterion 9 growing to four parts. The document landed at 2449 and the distiller proved by decomposition that there was no prose slack. On `frame-preconditions` I set 1000 against a document that landed at 4662.

The lesson is not "pick better numbers." It is that **a length gate calibrated before the criteria are final is guessing, and a mandated-beat count is the only honest way to size a document.** The distiller's method is the one to reuse: measure what fraction of the text sits inside contract-mandated clauses. It found 64 percent of section 3 was mechanism and limit clauses criterion 9 requires verbatim, which settled the length question with evidence instead of opinion.

**Background-agent delivery cost two wasted round trips at the start.** Both explorers went idle having produced work and delivered nothing, because a background agent's final text goes nowhere. Every dispatch after that carried an explicit "call SendMessage with to: main" instruction and none failed again. Cheap fix, but it should be in the dispatch template from agent one.

**Cross-unit inputs are not in the worktree until the engine lands them.** `frame-preconditions` declared `docs/frame.md` as an input and never had it: units land onto the station branch at wave end, not per-unit. All three of its beats read the sibling via `git show <unit-branch>:docs/frame.md`, read-only, which is correct behavior and worth making explicit in future unit bodies rather than leaving each beat to discover it.

## What I would do differently

**Ask reviewers to attack their own fix, not confirm it.** The single highest-value move of this station: after addressing `fb-01`, I asked the value reviewer to be adversarial about two specific weaknesses in *my* fix rather than to verify it. That produced `fb-03`, which found the publisher-versus-recipient exclusion failed asymmetrically in the direction that hides a loss. A confirming re-review would have passed it. Do this every time a fix is non-trivial.

**Tell the third reader to sample what the first two marked clean.** Both times a reader was pointed at conditions already declared fine, it found something. The challenger found two defects in the framer's "fully observable" set; the distiller found three more after that. Attention follows flags, so unflagged material is where defects accumulate.

**Do not force engine state when the engine returns a noop.** I marked `frame-artifact` completed by hand after the loop finished, then wrongly concluded that had broken unit landing. It had not: the engine lands at wave end and did so correctly. Compounding that, my re-check read clean only because my shell had drifted into a subdirectory and `git ls-tree` silently scopes to the current prefix. **Two process errors stacked into a confident wrong diagnosis that I reported to the operator.** Absolute paths, or explicit `cd` to repo root, on every verification command.

**Verify a summarized claim before persisting it.** I recorded the GCS soft-delete finding into durable cross-run knowledge from the challenger's summary. The distiller fetched the page, grepped the raw text, and found the challenger had gotten "set at bucket creation" wrong; the policy is editable at any time. My knowledge topic carried that error for an hour. A claim that arrives already summarized, from a reader you trust, is still a claim.

## Did this eliminate wrong-thing more or less than expected

**More, and not where expected.** The discovery pass found that file.kiwi already ships the crypto, the fragment key, no-account publishing, and an MCP server, for free, and that PrivateBin has shipped the identical construction since 2012. That reframed the entire value case from "zero-knowledge sharing" to "the rendering destination for agent output Artifacts cannot carry," with zero-knowledge demoted to the permission slip that lets a developer use it without a security review. That reframing is the station's biggest single output and it came from an explorer, before any document existed.

Two locked operator decisions were also overturned on evidence: the server-returned script (CVE-2025-6514 shape, CVSS 9.6, and a local stdio server achieves identical zero-knowledge with zero Bash prompts) and the `relics.thebushido.co` domain (Immich had `*.immich.cloud` flagged wholesale, twice, from PR preview environments). Both were the operator's stated design and both were wrong for reasons no amount of careful building would have surfaced.

## What the Units taught

**`frame-artifact`:** a metric that cannot be computed under the architecture that produced it is a wish, not a metric. And when a confound is genuinely unsolvable under the locked non-goals, the correct output is to document its permanence, name both failure directions, name a discriminator, and state what that discriminator misses. "We fixed it" would have been a lie; "here is exactly how much you can trust this number" is usable.

**`frame-preconditions`:** binary conditions are harder to write than they look. The framer's own weakest paragraph was the one place it slipped into a recommendation, and it named that itself. A document whose job is "state when the answer is do not build" fails the moment any part of it reads as advice.

**Both units' authors named their own weakest work in their handoffs rather than defending it.** That made every challenge pass faster and sharper. It should be a standing instruction, not a happy accident: the make pass ends by naming what it would attack first.
