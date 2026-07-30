
> **Run** `relic` · **Station** `frame` · **Phase** `manufacture`

> Eliminates: _wrong-thing_


# Manufacture — `frame`

This is the build floor. You run the **Pass loop** — _Plan → Make → Challenge → Resolve_ — over the wave-ready Units. The current beat is **framer**, on model **sonnet**.


**Contract**

- Do exactly the work this action describes — no more, no less. Don't skip ahead to a later phase.
- Treat the locked artifact (`frame.md`) as the source of truth. Read it before you act; never silently rewrite a locked decision.
- Every claim you make must be backed by something you actually ran, read, or wrote. No assumed results.
- Be specific and committed. **No placeholders** — a `TBD`, `similar to …`, `add error handling`, `etc.`, or `…` is a hole, not a decision; name the actual, checkable condition. **No hedging** — when you report work done, use a verb of completed action (`added`, `implemented`, `fixed`), never `should`, `seems`, `probably`, `might`, or `looks like`. Hedging is the tell of unfinished work.
- When the action is finished, record your output where the station expects it, then call `darkrun_tick` again for the next instruction. The manager — not you — decides what comes next.



**Explorers** (2): `context`, `value`


**Workers** (3): `framer` → `challenger` → `distiller`


**Reviewers** (2): `value`, `feasibility`


## This wave


Dispatch the **framer** beat in parallel across these wave-ready Units:

- `frame-preconditions`




## Each Unit's spec — the contract the beat works against

The subagent you dispatch for a Unit gets **no context beyond what you hand it**. Pass the Unit's spec below into its dispatch verbatim — the completion criteria with their verify commands, the declared paths, and the scope boundary are the contract the beat is judged against.

### `frame-preconditions` — Write preconditions.md: the operating conditions and the go/no-go

- **inputs:** `docs/frame.md`


- **outputs:** `docs/preconditions.md`, `docs/preconditions.sources.txt`


- **quality gates:** artifact-exists — `test -f docs/preconditions.md` · substance-floor — `test "$(wc -w < docs/preconditions.md)" -ge 1000` · sources-manifest-populated — `bash -c 'set -eu; n=$(grep -c . docs/preconditions.sources.txt); test "$n" -ge 5'` · every-cited-url-resolves — `bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/preconditions.sources.txt'`


# Goal

Write `docs/preconditions.md`: the conditions that must hold for Relic to be buildable and operable at all, and the explicit go/no-go that follows from them. This is the honest gate on the entire run. `harden` inherits it most directly, but every station is bound by it.

Also write `docs/preconditions.sources.txt`, a citation manifest: one URL per line, no other text, listing every external source this document relies on. End the file with a trailing newline.

**Read `darkrun_knowledge_list` first, in full**, and read `docs/frame.md`, which this unit depends on and which is already locked. You have no other context. Write the preconditions against the frame that unit settled; do not redefine the problem, the user, the wedge, the success metric, or the telemetry decision.

**A warning about the citation manifest.** Some knowledge topics contain illustrative URL-shape examples rather than citations, such as `https://file.kiwi/abcdef12#secretKey` and `https://wormhole.app/{roomId}#{mainSecretKey}`. Those are templates, not sources. They 404 and will fail the gate. Only real, resolvable sources go in the manifest.

# MANDATORY: the unobservable-quantity sweep

**Read `unobservable-quantities-are-this-projects-failure-mode` before you write, and run its sweep on your finished draft before you commit.**

This project's specific, recurring authoring defect is claiming a number the system cannot actually produce. It was caught four times in the sibling unit `frame-artifact`, by four different readers, three of them after an explicit sweep for exactly this. Each instance was subtler than the last. The dangerous ones are *partially* observable: a wholly fabricated metric gets caught, a half-true one does not.

Your document is dense with checkable conditions, so it is more exposed to this defect than any other unit in the run. **For every condition you state as checkable, name the exact mechanism that produces the number, and confirm the locked architecture permits it.** Where a quantity is partly observable and partly not, say which half is not, in the same breath as the claim.

Two live examples from `frame-artifact` to calibrate on. A claim that the client-type split is computable from publishing client name is half-wrong, because a Claude Code run inside a GitHub Action reports the same client name as an interactive one. A claim that mail-gateway blocklisting is checkable on a schedule is half-wrong, because a block inside a single company's tenant is invisible from outside and surfaces as a recipient reporting a dead link. Both were fixed by stating the limit alongside the claim, not by removing the condition.

This applies with particular force to your section 3, where every control is stated as a checkable condition.

# Why this document exists separately

Relic hosts content the operator is structurally unable to inspect, on a public unauthenticated endpoint. That is the exact shape that killed Firefox Send and AnonFiles. The frame says what Relic is for. This document says what has to be true for it to survive contact with the real world, and states plainly when the answer is "do not build."

# Required content

## 1. The abuse-operations commitment (the go/no-go)
State it as a binary condition, not a recommendation. Google Cloud's AUP makes this contractual, not optional: for organizations hosting third-party content, Google requires a published prohibited-content policy, a reporting intake process (a webform or email alias), prompt review and removal, and log monitoring. Failure to respond to an abuse notice risks **project-level** suspension, not just bucket removal.

Say what that obligates: a named human who answers the abuse address, a takedown path documented publicly at a stable URL, and an SLA. Then state the go/no-go: if that commitment is not made, the correct decision is not to build. Mozilla had a legal team and shut Send down rather than carry this.

## 2. The domain preconditions
Two registrable domains distinct from `thebushido.co` must be acquired before anything deploys: one for the service (API and PWA), one for the sandbox origin that renders untrusted HTML. `thebushido.co` carries marketing and email and never hosts user-generated content.

Ground this in the Immich precedent (October 2025): Google flagged all of `*.immich.cloud`, including internal-only services, triggered by per-PR preview environments, and it recurred after a successful appeal. Their fix was a separate registrable domain. Note that Microsoft's Tenant Allow/Block List blocks a URL domain and all subdomains by default.

State the Search Console precondition: every domain verified **before** launch, because the Security Issues report is the only place a listing's triggering URLs are visible. Unverified means flagged and blind.

Mark domain acquisition as an **external dependency requiring operator action**. Name it as a blocker on deployment, not on design.

## 3. The v1 control set
List the controls that must ship in the first release rather than being deferred. Each stated as a checkable condition, not an aspiration, and each subject to the sweep above. Drawn from `abuse-liability-of-hosting-uninspectable-content`: mandatory non-configurable TTL, hard size cap, per-IP publish quota, per-object download cap, per-IP download rate limit, global egress spend kill switch, delete-by-ID that works without the decryption secret, ciphertext-hash blocklist, upload IP plus timestamp retention with a published window, abuse reporting reachable from every relic page and a stable `/abuse` URL and a published email alias, and `robots.txt` disallow plus `X-Robots-Tag: noindex`.

Explain briefly why each is load-bearing rather than listing them bare. Two points worth making explicitly: mandatory short TTL is the single highest-leverage control because it bounds how long abuse circulates, and delete-by-ID works precisely because the relic ID is not secret, only the key is.

State the cost precondition too: GCS internet egress runs $0.12/GB for the first TB, and an unauthenticated endpoint has no identity to throttle against, so the spend kill switch is a v1 requirement.

## 4. The security preconditions that constrain design
Short, so `shape` and `build` inherit them as constraints rather than discovering them late:
- Untrusted content renders on a **separate origin**, never the origin holding the fragment secret. Origin isolation is the first layer; sanitization is the second.
- Never set both `allow-scripts` and `allow-same-origin` on the render iframe.
- The viewing origin carries no third-party scripts, no analytics, and no error reporting, because any same-origin script can read `location.hash`. Note that `docs/frame.md` specifies the run's only telemetry, and that all of it is collected server-side at publish and at signed-URL mint, never by a script on the viewing origin. These two requirements are compatible; say so explicitly so nobody later reads the telemetry decision as license to add a script here.
- Rate limiting returns `429`, never `401` or `403`, or Claude Code will flag the server as needing OAuth sign-in against an authorization server that does not exist.

## 5. What is honestly unresolved
List the open questions that remain genuinely unsettled, so nobody downstream mistakes silence for a decision. At minimum: whether a Safe Browsing listing on a subdomain degrades the parent's Gmail sender reputation (industry consensus says yes, Google publishes nothing); how Proofpoint's URI blocklist treats host-to-parent relationships (unpublished); Google's actual timeline between abuse notification and project suspension (documented only as "timely"); and the legal exposure of the plausible-deniability posture, which is a lawyer question, not a research question.

Be honest that these are unknown. Do not paper over them.

# Style

Write as Jason Waldrip would: direct, dry, confident, **contractions**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never use an em-dash or an en-dash.** Rewrite with a comma, a colon, parentheses, or two sentences. No emoji.

On contractions specifically: the sibling unit's first draft contained **zero** contractions across 2542 words, every apostrophe a possessive, and that was flagged as a high-severity voice defect and one of the strongest AI tells there is. Use them naturally. Do not use them mechanically either: keep the flat form where a human would say "is not" for emphasis, particularly on load-bearing claims.

# Completion criteria

1. `docs/preconditions.md` exists → `test -f docs/preconditions.md` exits 0.
2. It is substantive and complete, not a subset → `test "$(wc -w < docs/preconditions.md)" -ge 1000` exits 0. This floor is a completeness signal, not a target. It sits below the natural length of a compliant document (five sections, one enumerating roughly twelve controls with a rationale line each) so it cannot block correct work, but high enough that a document missing a whole section fails it. Do not pad to reach it, and do not treat clearing it as evidence of completeness; criteria 5 through 9 are what actually check that.
3. `docs/preconditions.sources.txt` lists at least five sources, one URL per line, nothing else, ending with a trailing newline → `bash -c 'set -eu; n=$(grep -c . docs/preconditions.sources.txt); test "$n" -ge 5'` exits 0.
4. Every listed source resolves over the network → `bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/preconditions.sources.txt'` exits 0. **Do not invent citations.** Every URL comes from the recorded knowledge topics or is one you verified yourself. Run the orphan check in both directions: every manifest URL cited in the body, and every body URL present in the manifest.
5. The document states the abuse-operations go/no-go as a binary condition with an explicit "do not build" branch.
6. The document names domain acquisition as an external dependency blocking deployment.
7. The document contains a section of honestly unresolved questions.
8. Section 4 states explicitly that the run's telemetry is collected server-side only and does not conflict with the no-script-on-the-viewing-origin rule.
9. **Every checkable condition in the document names the mechanism that produces its number, and any condition that is only partially observable says so in the same breath.** This is the mandatory sweep above, and it is the criterion most likely to be violated. No gate can check it; it is verified by reading.

# Files touched

- `docs/preconditions.md` (create)
- `docs/preconditions.sources.txt` (create)

# Out of scope

- Restating or redefining the problem, user, value, success metric, or telemetry decision. Those are locked in `docs/frame.md`.
- Choosing the server language, framework, hosting topology, or encryption wire format. That is `shape`.
- Endpoint design, schemas, relic ID format.
- Actually buying domains, configuring GCP, or writing any code, config, or infrastructure.
- Designing the abuse-report UI. State the requirement, not the interface.




## Each Unit has its own worktree — work in it

Every wave Unit is isolated on its own branch + worktree, forked off the station branch. Run that Unit's beat **inside its worktree** so its diff never tangles with another Unit's in-flight work; the manager lands each Unit back onto the station branch when it locks. Do **not** commit a Unit's work to the station branch yourself.

- `frame-preconditions` → `/Users/jwaldrip/dev/src/github.com/thebushidocollective/artifacts/.darkrun/worktrees/relic/units/frame/frame-preconditions` (branch `darkrun/relic/units/frame/frame-preconditions`)





## The Pass loop — make → challenge → resolve

The Pass loop is adversarial on purpose: a single confident pass is exactly where LLM output is most often confidently wrong, so a second pass red-teams the first before anything locks.

- **make** — the worker produces the Unit's output against its completion criteria. Build the real thing, not a sketch.
- **challenge** — a second pass attacks what make produced: edge cases, missing handling, lazy assumptions. Assume the first pass was optimistic.
- **resolve** — reconcile make and challenge into a Unit that satisfies its completion criteria with the challenges answered.




**Quality-gate verifier nonce.** This dispatch carries a one-time verifier token: **`bf819a71a9fdd6f5237799caf05d16272bca8ceca28c5eb4b906f6846a00002a`**. When you record a quality gate with `darkrun_quality_gate_record`, pass it as `nonce`. The engine refuses a gate result without the matching token — so a gate is only ever recorded as part of a real verification dispatch, never self-certified. Run the gate's command for real, then record the actual outcome with this nonce.


Run **only the `framer` beat** this tick. When the beat finishes, **record it** with `darkrun_unit_iterate` — pass the `worker`, the `result` (`advance` or `reject`), and a `note`: on advance, what you did and what the next worker needs to know; on reject, why you bounced it (a reject without a reason is refused). That note becomes the next beat's handoff above. Then call `darkrun_tick`; the manager advances the loop or releases the next wave. A Unit is locked only after Resolve and its completion criteria pass.

A Unit gets a **bounded pass budget** — the manager escalates a Unit that can't converge within it to the operator rather than grinding forever. Don't paper over a stuck Unit to dodge the escalation; a Unit that needs more passes than the budget allows is a signal the spec, the scope, or the approach is wrong, and that's the operator's call to make.



## Done when

The `framer` beat is complete for every Unit in this wave and its output is recorded. Then call `darkrun_tick`.

---

# Provider contracts in effect

The project configures external-system providers whose behavior contracts apply to this phase. Follow them alongside the instructions above.

# Git Provider — Behavior Contract

darkrun is always git-backed when a `.git/` directory is present. This contract is **always active** in git environments — no settings activation needed.

## What you, the agent, must do

- Never run `git checkout`, `git merge`, `git branch -d`, or create branches manually during run operations. The engine owns branch topology, merge semantics, worktree creation, and station-branch enforcement.
- Commit substantive work (unit body edits, artifact writes, source changes) before calling `darkrun_tick` — the pre-tick clean-tree gate blocks the tick on loose agent work and hands the file list back. The engine commits its own `.darkrun/` state on every tick; it does NOT author your commits.
- **Never pair a VCS issue-closing keyword with a feedback id.** GitHub and GitLab parse `Closes`/`Fixes`/`Resolves`/`Implements` followed by an issue-shaped token as an external-issue closing reference — `Fixes fb-07` in a commit message or PR description renders a phantom closing link for a finding that is not a ticket. Use neutral phrasing — `addresses fb-07`, `per fb-07` — never a closing verb.
- Treat `git push` failures as non-fatal — the engine retries on the next tick. Don't block on a transient remote outage.
- If a station's gate is `external`, the engine watches for the PR merge signal. Don't flip frontmatter to fake the signal — the human's merge IS the decision.

## Branch architecture (read-only fact you operate against)

- **Run branch** `darkrun/<slug>/main` is the durable record. The engine commits state changes here and pushes on every tick (commit early, push often). The run's **delivery draft PR** opens against the project's default branch at run start and the engine flips it ready-for-review at seal.
- **Station branches** `darkrun/<slug>/<station>` accumulate station-scope work, synced downstream and landed by the engine.
- **Unit worktree branches** `darkrun/<slug>/units/<station>/<unit>` isolate each unit's diff — local-only, landed back onto the station branch when the unit locks.

## external_refs handling

The delivery PR's URL is stamped on `run.md` as `external_refs.pr_url` with its draft/ready status in `external_refs.other.pr_status`. You don't write these fields manually — the engine does — but you can read them to surface PR state to the operator. In DISCRETE mode the engine also opens a per-station draft PR at the station's external gate (recorded on `Station.pr_ref`); merging it is the approval.

## Proof asset uploads

Runtime-verification proof (screenshots, transcripts) is regenerated every run — attach it durably with `darkrun_proof_attach`, which records it on the run's proof ledger and posts it to the station's change request when one exists. Keep uploads idempotent — replace a re-run's proof rather than stacking duplicates.

## Non-git environments

When `.git/` is absent the engine falls back to filesystem persistence: no commits, no pushes, no worktrees, and `external` gates degrade to `ask` (there's no structural merge signal to enforce them). All run operations still work; this contract simply doesn't apply.