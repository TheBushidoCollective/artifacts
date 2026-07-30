
> **Run** `relic` · **Station** `specify` · **Phase** `reflect`

> Eliminates: _ambiguity_


# Reflect — `specify`

The output is audited and the checks are green. Before the checkpoint gate fires, run an autonomous retrospective. This is the moment to capture what this station taught the run — the learnings that feed the run-level reflections.


**Contract**

- Do exactly the work this action describes — no more, no less. Don't skip ahead to a later phase.
- Treat the locked artifact (`spec.md`) as the source of truth. Read it before you act; never silently rewrite a locked decision.
- Every claim you make must be backed by something you actually ran, read, or wrote. No assumed results.
- Be specific and committed. **No placeholders** — a `TBD`, `similar to …`, `add error handling`, `etc.`, or `…` is a hole, not a decision; name the actual, checkable condition. **No hedging** — when you report work done, use a verb of completed action (`added`, `implemented`, `fixed`), never `should`, `seems`, `probably`, `might`, or `looks like`. Hedging is the tell of unfinished work.
- When the action is finished, record your output where the station expects it, then call `darkrun_tick` again for the next instruction. The manager — not you — decides what comes next.

## Sub-steps

### agentic — autonomous reflection

Reflect on this station's pass, on your own, no human in the loop:

- What did manufacturing **specify** reveal that the spec did not anticipate?
- Where did the work fight back? What was harder, slower, or more fragile than expected?
- What would you do differently next station? What pattern is worth carrying forward — or avoiding?
- Did anything here eliminate **ambiguity** more (or less) than expected?

- What did the Units teach:

  - `spec-publish-contract`

  - `spec-relic-format`

  - `spec-service-surface`

  - `spec-viewer`



Record the learnings with `darkrun_reflection_record` (pass the `specify` station and your retrospective as the `body`) so they persist on the run and inform later stations — read them back any time with `darkrun_reflection_list`. Be specific and honest — a vague reflection is a wasted one.

## Done when

The retrospective is captured via `darkrun_reflection_record`. Then call `darkrun_tick` to reach the checkpoint.