
> **Run** `relic` · **Station** `specify` · **Phase** `checkpoint`

> Eliminates: _ambiguity_


# Checkpoint — `specify`

Station **specify** has passed spec, review, manufacture, audit, and reflect. The gate is now open. Its kind is **`auto`** — that determines who decides whether the station locks.


**Contract**

- Do exactly the work this action describes — no more, no less. Don't skip ahead to a later phase.
- Treat the locked artifact (`spec.md`) as the source of truth. Read it before you act; never silently rewrite a locked decision.
- Every claim you make must be backed by something you actually ran, read, or wrote. No assumed results.
- Be specific and committed. **No placeholders** — a `TBD`, `similar to …`, `add error handling`, `etc.`, or `…` is a hole, not a decision; name the actual, checkable condition. **No hedging** — when you report work done, use a verb of completed action (`added`, `implemented`, `fixed`), never `should`, `seems`, `probably`, `might`, or `looks like`. Hedging is the tell of unfinished work.
- When the action is finished, record your output where the station expects it, then call `darkrun_tick` again for the next instruction. The manager — not you — decides what comes next.

Checkpoint walks two beats, in order: **brief → user**.

## 1. brief — produce the closing-brief summary

Write the tight closing brief for whoever holds the decision. It is the durable record of *why this station is allowed to lock*, so make it stand on its own:

- What this station eliminated: **ambiguity**.
- The locked artifact (`spec.md`) and where the evidence lives — specs, audit verdict, the green check run.
- Any concerns reviewers raised and how they were resolved.
- The retrospective learnings reflect surfaced, if they bear on the lock.

Persist it as the station's **outcome**: call `darkrun_brief_record` with `slug: relic`, `station: specify`, `phase: post`, and the closing brief as `body`. This is the durable "what the station produced" record the checkpoint surfaces — write it before clearing the gate.

## 2. user — the gate decision (`auto`)

The gate kind decides *who* clears it. Surface the brief above, then act per the kind:


**auto** — no human in the loop. The evidence already justifies the lock. Confirm the criteria are met, lock the station, and call `darkrun_tick` to advance.


## Done when

The gate is cleared per its kind and the station is locked, or the run is held for a decision. Either way, call `darkrun_tick` to record the outcome.