
> **Run** `relic` · **Station** `shape` · **Phase** `merge_conflict`

> Eliminates: _expensive-structural-reversal_


# Resolve Merge Conflict — `darkrun/relic/main`

A land (or a downstream sync) left **genuine content conflicts** in-tree on `darkrun/relic/main`. The merge is **not** aborted — `MERGE_HEAD` is still set and the conflict markers are present, waiting on you. Merge resolution preempts everything: the run can't advance while a merge is half-applied.


**Contract**

- Do exactly the work this action describes — no more, no less. Don't skip ahead to a later phase.
- Treat the locked artifact (`design.md`) as the source of truth. Read it before you act; never silently rewrite a locked decision.
- Every claim you make must be backed by something you actually ran, read, or wrote. No assumed results.
- Be specific and committed. **No placeholders** — a `TBD`, `similar to …`, `add error handling`, `etc.`, or `…` is a hole, not a decision; name the actual, checkable condition. **No hedging** — when you report work done, use a verb of completed action (`added`, `implemented`, `fixed`), never `should`, `seems`, `probably`, `might`, or `looks like`. Hedging is the tell of unfinished work.
- When the action is finished, record your output where the station expects it, then call `darkrun_tick` again for the next instruction. The manager — not you — decides what comes next.

## What happened

Merging into `darkrun/relic/main` could not auto-resolve every path. Engine-owned `.darkrun/relic/…` state was already force-held to the target side; what remains is **real agent content** the two sides both touched.

While this merge is in progress the engine **suspends** its ownership / lifecycle / branch-enforcement write guards so you *can* edit the conflicted files directly — schema validation stays on, so a malformed resolution still fails loudly.

## Conflicted paths

- `.darkrun/knowledge/browser-crypto-and-large-file-constraints.md`
- `.darkrun/knowledge/gcs-cloud-run-architecture-constraints.md`


## What to do

1. **Open each conflicted path** and resolve the `<<<<<<<` / `=======` / `>>>>>>>` markers — keep the correct content from both sides.
2. **Stage** each resolved file (`git add`).
3. **Commit** the merge (`git commit --no-edit`) to finish it. Do **not** `git merge --abort` — that throws away the land.
4. Re-run `darkrun_tick`. The next tick re-derives this action until the merge is no longer in progress, then resumes the run.

## Done when

Every conflicted path is resolved and staged, the merge is committed (no `MERGE_HEAD`), and `darkrun_tick` advances past this action.