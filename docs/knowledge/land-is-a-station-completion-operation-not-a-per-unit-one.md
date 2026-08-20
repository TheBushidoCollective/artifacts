---
topic: land-is-a-station-completion-operation-not-a-per-unit-one
created_at: 2026-07-30T15:13:31.148856+00:00
updated_at: 2026-07-30T15:13:31.148856+00:00
---
# Sibling artifacts do not appear on the station branch mid-station, and that is correct

Three `shape` units in a row reported the same condition: `git ls-tree darkrun/relic/shape -- docs/design/` returns empty even though the sibling units are `completed` with all gates recorded. Every downstream beat reached its inputs through `git show darkrun/relic/units/shape/<unit>:<path>`.

**The manager flagged this for the station audit as an anomaly. It is not one.** Recording the correction so the audit does not chase a fault that does not exist.

## What the branch topology actually shows

```
docs/ on darkrun/relic/main      -> frame.md, preconditions.md, spec/{format,publish,service,viewer}.md
docs/ on darkrun/relic/shape     -> the same six, and nothing under docs/design/
darkrun/relic/specify            -> branch no longer exists locally
```

Land works, and it has worked twice. `frame` produced two units and its output is on `main`. `specify` produced four and its output is on `main`. The `specify` branch was removed after the station completed, which is the normal post-land lifecycle rather than a loss.

The flow is **unit branch, to station branch at station completion, to `darkrun/relic/main`, then synced back down to the next station's branch.** That is why `shape` carries `specify`'s four documents: it inherited them through `main`, not directly from `specify`.

## Why the empty result is expected

`shape` is mid-manufacture. Its wave 4 was still running when this was checked. **Land fires when the station completes, not when a unit does.** A unit reaching `completed` with green gates means its branch is ready to be landed, not that it has been.

The `pre-land` sync commits on the station branch are the engine staging that operation:

```
f02f1bc darkrun: sync darkrun/relic/main -> darkrun/relic/shape (pre-land)
4186f3c darkrun: sync main -> darkrun/relic/main (pre-land)
```

Those are preparation, not evidence that a land was attempted and failed.

## The other thing that looks wrong and is not

`git merge-base --is-ancestor darkrun/relic/shape <unit-branch>` fails for all three completed units, which reads as divergence. It is: the station branch has advanced with `.darkrun/` state commits (beat records, gate results, unit updates) while the unit branches sat forked at an earlier point doing their own work. **The engine commits run state to the station branch on every tick.** Divergence by state commits is the expected steady state during manufacture and says nothing about whether the artifacts are recoverable.

## What to do about it

Nothing, other than keep using the `git show` fallback for sibling inputs mid-station and stop reporting it as a degradation. It is worth stating the fallback explicitly in every unit brief that has sibling inputs, which this station already does, because a beat that does not know about it will otherwise stop and report a blocker.

**The one real check worth keeping** is the direction this was originally worried about: confirm each unit's work is committed on its own branch and reachable. It is, and `git ls-tree -r <unit-branch> -- docs/design/` is the one-line proof. Reachability on the unit branch is what [[never-non-recoverable]] asks for; presence on the station branch is a scheduling detail.
