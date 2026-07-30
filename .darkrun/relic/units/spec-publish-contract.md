---
name: Specify the MCP tool surface and the publish contract
unit_type: doc
status: completed
depends_on:
- spec-relic-format
- spec-service-surface
worker: ''
model: opus
station: specify
inputs:
- docs/spec/format.md
- docs/spec/service.md
outputs:
- docs/spec/publish.md
- docs/spec/publish.sources.txt
branch: darkrun/relic/units/specify/spec-publish-contract
started_at: 2026-07-30T07:59:00.999395+00:00
completed_at: 2026-07-30T08:47:39.360699+00:00
iterations:
- worker: spec_writer
  started_at: 2026-07-30T07:59:00.999395+00:00
  completed_at: 2026-07-30T07:59:00.999395+00:00
  result: advance
  note: |-
    `docs/spec/publish.md` (8832 words) and `docs/spec/publish.sources.txt` (13 URLs) committed at `4a9507c`. Worktree clean. Both siblings read via the unit-branch refs the manager verified in advance; the station refs still do not resolve.

    **Gates re-run independently by the manager:** artifact-exists PASS; substance-floor PASS at 8832 against 2200; sources 13 against 5; every URL resolves; zero dashes. Spot-checked criterion 15 (`relic_id_collision` cited three times) and four Group B codes present.

    ## Criterion 14 worked, and it caught a defect during writing rather than after

    **This is the first unit to carry the quotation-audit criterion, and it paid for itself on the first pass.** The beat pulled raw source text (RFCs as `.txt`, MCP and Claude Code docs as raw `.md`, GCS and Stripe tag-stripped), then **programmatically string-matched every double-quoted span** against it, normalizing only whitespace, RFC line-wrap de-hyphenation, and the space-before-punctuation artifact HTML stripping introduces.

    **47 quoted strings audited. All confirmed verbatim, one corrected mid-draft.** Item 25 closed an RFC 8188 quote as `...is not safe."` where the source reads `...is not safe [RFC5116].`, so the period was not part of the quoted string. Moved outside. **Manager-verified: the committed file reads `is not safe".`** That is a one-character defect inside quotation marks, the exact class that shipped four times across the sibling units, and it was caught by string comparison rather than by reading.

    The beat also declined one quote deliberately: it worked around the phrase "leaks the cipher's authentication key" because the source uses a typographic apostrophe and reproducing it as ASCII would have been a one-character alteration inside quotation marks. It additionally listed the seven quoted strings that are **coined phrasing rather than citations**, so no reader mistakes them for sources.

    ## The beat corrected the manager's brief, and was right

    **Judgment call (a), independently verified by the manager against the Claude Code docs: all three strings confirmed present.** My brief gave 60-second time-to-first-byte and a five-minute idle timeout. Those are HTTP-side figures. The publishing client is **stdio**, where the docs say "Stdio and WebSocket servers have no per-request timer" and the idle window is "30 minutes for stdio servers".

    The beat kept the progress requirement in full, restated the numbers for the transport Relic actually uses, and gave four reasons it still binds (user-settable idle variable, cap-sized uploads on poor links, an eventual remote surface, and that designing to the tighter figure costs nothing). It also surfaced a property that is easy to get backwards and is load-bearing: **progress defeats the idle timeout and does not defeat the wall-clock limit**, which "is a hard wall-clock limit per tool call, and progress notifications from the server don't extend it."

    This is the sixth upstream claim a beat has corrected on this run.

    ## Decisions the siblings and `shape` consume

    - **`outputSchema` declared and strict**, seven required success members, `structuredContent` on success only. Every failure returns `isError: true` with **no `structuredContent`**, carrying the RFC 9457 problem document in a text block. The legality argument is sharper than the brief's: the spec binds "structured results that conform to this schema", which constrains what a server provides rather than obliging one on every call.
    - **`isError` rule:** protocol-level JSON-RPC errors for exactly two cases, unknown tool name and `inputSchema` validation failure, both defects the tool body never runs for. Everything else sets `isError: true`.
    - **Twelve Group B codes**, leg-prefixed (`source_*`, `local_*`, `upload_*`), none colliding with `service.md`'s thirteen. **Three size refusals distinguished**, not two: `local_size_precheck_failed`, Group A's `size_over_cap`, and `upload_size_refused`. Group B problem documents **omit `status`** (RFC 9457: "The 'status' member, if present, is only advisory") and put storage-leg codes in a `storage_status` extension so nobody reads a GCS code as an app-server one.
    - **Group A invents nothing.** All eight rows map onto statuses, codes, and field names already fixed in `service.md` 1.1 and 1.6.

    ## Where the adversary should push

    Seven judgment calls surfaced, plus two sourced findings. Priority order:

    1. **PoW: the contract is decided now and only difficulty is routed.** Challenge-then-grant **unconditionally**, difficulty zero in the first release, solution member present but unvalidated. Reasoning: a conditional round trip is the same foreclosure in disguise, because the conditional branch never gets exercised. **Names a consequence rather than absorbing it: turning difficulty on creates a grant-time refusal `service.md` has no code for, and that code is `service.md`'s to add.**
    2. **The URL is emitted on the three unknown-completion upload failures**, inside the problem document and never in a typed field. Reasoning: the key lives only in process memory, so discarding it on an ambiguous failure means a landed object consumes quota and egress until TTL while being permanently unreadable by anyone including the publisher.
    3. **Idempotency serializes rather than returning an in-flight status.** The brief cited 409 as prior art; the current Stripe page does not say that, and inventing an app-server status is barred. Added rule: **key match is checked before ID existence**, without which a client's own retry hits `409 relic_id_collision` and follows the redraw instruction, which is exactly wrong for a duplicate of itself.
    4. **The `resource_link` phantom-open claim was qualified rather than restated.** Under `service.md` section 2, fetching `/{id}` returns a static shell and mints nothing, so a plain fetch does not hit the counter. The real hazard is narrower and the same rule follows.
    5. **Tool name `relic_publish`**, where the knowledge topic informally says `publish_relic`. One-token change if the reconciler prefers the topic's spelling.
    6. **`client_version` against `format.md` section 5**, which says nothing finer than the class and client name crosses. The beat sends it, states the reading (a content-leakage bar, and a version describes the client not the content), and names the narrower publisher fingerprint as the cost.
    7. **Grant expiry must be enforced on the storage leg**, because the app server is not in it. Under a signed URL the signature does it, bounded by 604800 seconds. Under a **server-initiated resumable session it does not come free**, since "A session URI expires after one week but can be cancelled prior to expiring." Invariant stated: no object may land after the app server declared the grant expired, because `service.md` case 6 makes that ID permanently unservable and the late object becomes billed storage nobody can reach.

    **The sharpest finding: the two grant-shape requirements pull against each other**, which is the real substance of routed item 1. The POST policy document is the shape whose size enforcement is documented explicitly and it has no resume story; the resumable session is the shape that satisfies the retry requirement. The beat required the same launch check under either: upload a body larger than the constraint under a real grant and assert refusal, so the enforcement claim becomes an observation rather than a reading of documentation.

    ## Word count

    8832, the largest in the station, against a floor of 2200. Not yet tested for padding; the adversary was not given a pass on that.
- worker: tightener
  started_at: 2026-07-30T08:45:02.136504+00:00
  completed_at: 2026-07-30T08:45:02.136504+00:00
  result: advance
  note: |-
    Resolve complete at `e6ebc99`, one file, +78/-30, worktree clean. All thirteen findings plus seven verdict items answered, and three new issues the beat found while reconciling.

    **Gates re-run independently by the manager:** artifact-exists PASS; substance-floor PASS at 11804 against 2200; sources 13 against 5; every URL resolves; zero dashes. Spot-checked each headline fix: `fresh idempotency key` present, `Malformed requests` / `Server errors` / `Input validation errors` all named, the three new codes present, F2's false claim gone, F12's boundary corrected. **Machine-checked the collision claim myself: zero shared codes and zero shared prefixes with `service.md`.**

    ## F1, the deadlock, resolved and traced

    The fix is the first option: **a collision redraw draws a fresh idempotency key alongside the fresh ID**, because a new ID makes it a new request rather than a retry. Three edits carry it. 4.3's header rule narrows reuse to "every retry of **that same grant request**." 4.6 replaces "collision retries count against the same cap" with "**Collision redraws are bounded by the same counter and they are not retries**", separating shared budget from shared request identity. 2.1 now has the client draw **three** fresh values on collision: ID, relic key, idempotency key.

    **Both original purposes survive, which is what makes this the right fix rather than a workaround.** Key-match-first still catches a client's own lost-response retry, because that retry reuses its key and replays the stored grant. The counter still bounds a genuinely broken RNG into a loud failure at the cap. The beat rejected the alternative fix on the record, adding a second reason beyond the one I gave: not storing refused grants would make a retry after a real `413` re-execute the grant instead of replaying its refusal.

    ## F3, decided: inputSchema failures moved to `isError: true`

    Not kept protocol-level. Three reasons, all on the page: the spec's Tool Execution Errors list contains its own worked example of exactly this case, its `isError: true` example is a bad date, and the protocol bullet is scoped to the `CallToolRequest` envelope rather than a tool's own schema. **The deciding reason is the client asymmetry**, that clients SHOULD hand tool execution errors to the model and merely MAY hand it protocol errors, so routing a missing required string to JSON-RPC is how a model that can trivially self-correct gets an error it may never see. The document now states all three spec categories up front, and files "Server errors" as an **explicit deliberate divergence with a stated reason** rather than presenting it as what the spec scopes.

    ## F8 and F13: three codes where I asked for one, correctly

    New `app_*` prefix for the client-to-app-server leg, defined as naming a **client-side classification and never an app-server status**. `app_response_unusable` is F8's terminal code, covering a bare status after the `429`/`503` fallbacks, an unparseable body, an unrecognized `code`, and F13's echoed-`relic_id` mismatch. `local_invalid_arguments` and `local_internal_error` are forced by the F3 decision and would have broken the verified prefix discipline if folded in.

    **F13 resolved by a third path I did not offer, and it is better than either of mine.** Rather than adopt Stripe's server-side parameter-match (which needs a refusal status `service.md` lacks) or decline it, the beat enforced the same protection **client-side**: the client compares the grant response's echoed `relic_id` against what it declared and refuses a mismatch before a byte moves. Same defect, same moment, no invented app-server code, and section 6 stays at five routed items.

    ## Remaining findings

    F2's false claim deleted and replaced with the verbatim Stripe table row plus the accurate divergence reason. F4 now opens "**Exactly one construction has documented enforcement. The other two are candidates whose enforcement is unverified**", with all three labeled and the launch check split by branch: a regression test under the documented one, and **the open empirical question run against a prototype grant before the branch is committed** under the other two, because a negative result eliminates a branch rather than filing a bug. F5 names cancellation as "a possession question" rather than a credentials one and states that client-side initiation **cannot** satisfy the invariant as the flow stands, with what `shape` must add. F6 re-attributed both quotes and added five citation links to sections that had zero. F7 split the consequence in two, making the nonce refusal **unconditional and needed at launch** while the solution refusal stays conditional. F9 through F12 fixed, including replacing the wrong warrant with the `declared_size_bytes` argument that proves the point from a decided sibling.

    **The PoW paragraph now leads with the right leg:** "its strongest justification has nothing to do with proof of work. It's a policy round trip that happens to carry a nonce." Deleting PoW entirely leaves the round trip shipping unchanged, so the ceremony objection has nothing to attach to. And the unknown-completion URL question is **closed outright** rather than outweighed, by citing `service.md` 1.6's viewer wording: the dead link the objection worries about does not exist on Relic's viewer.

    ## Three issues the beat found itself, two of them caused by its own fixes

    1. **Section 2.2's premise contradicted F8's fix.** It defined Group B as failures on legs the app server is not in, which adding an app-server-leg code falsifies. Rewritten as a **negative membership test**, no app-server status the client can read, covering both the absent legs and the case where a status arrived and the extraction rule still cannot act on it.
    2. **The omitted-`status` rule had the same problem**, justified by "no status to mirror" which a bare `500` falsifies. Re-justified on the document being the client's own, with observed statuses riding `storage_status` and now `app_status`.
    3. **`client_version` was called "a fourth thing"** where `format.md` 5 names two, so it is the third. Its own count was off by one in the sentence F9 was about.

    **One consequence stated rather than buried:** client-side initiation would make 3.1 a four-message flow, qualifying its "Three messages, always" heading on that branch alone. The beat wrote it into both 3.4 and section 6 instead of softening the heading, so the extra message argues against that branch when `shape` chooses.

    ## Quotation audit and word count

    **27 quoted strings added or moved, all 27 re-verified verbatim.** Three flagged on first pass were extraction artifacts, each re-verified individually. **On apostrophes: rather than silently normalize U+2019 inside quotation marks, the beat sliced every Stripe quote to an apostrophe-free span and carried the rest in its own prose.** That is the discipline this station spent five citation defects learning, applied without being asked.

    8832 to 11804, roughly 149 words per item across twenty items. Density held. Nothing decided was cut. Voice held or improved: contractions at the incoming rate, the appositive down from 1 per 736 to 1 per 787, zero dashes.
reviews:
  completeness:
    at: 2026-07-30T09:30:39.382518+00:00
  testability:
    at: 2026-07-30T09:30:18.432248+00:00
approvals:
  testability:
    at: 2026-07-30T09:36:02.428787+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/spec/publish.md
- name: substance-floor
  command: test "$(wc -w < docs/spec/publish.md)" -ge 2200
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/spec/publish.sources.txt); test "$n" -ge 5'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/publish.sources.txt'
gate_results:
- name: artifact-exists
  status: pass
  at: 2026-07-30T08:45:19.711151+00:00
  attempts: 1
  detail: '`test -f docs/spec/publish.md` exits 0. Run by the manager in the unit worktree at commit e6ebc99, not taken from a beat''s self-report.'
- name: substance-floor
  status: pass
  at: 2026-07-30T08:45:25.864890+00:00
  attempts: 1
  detail: |-
    `test "$(wc -w < docs/spec/publish.md)" -ge 2200` exits 0. Actual: 11804 words, up from 8832 at the writer's commit. Largest artifact in the station.

    **Density was measured rather than asserted, because this unit's size was the one open question the adversary was told not to take on trust.** It compared all three siblings with an identical script: publish 65.1 words per rule, service 68.4, format 71.2. The largest document is also the **densest**, sitting at the lean end of the run's own recorded 60-to-85 band. Length was never the defect.

    The +2972 is thirteen findings and seven verdict items at roughly 149 words each: three new error codes, four new rules in 4.3, the F1 collision trace written out end to end, the three-candidate grant-shape table, and the F5 branch analysis. Nothing decided was cut to hold a number, consistent with the precedent set three times earlier at this station.
- name: sources-manifest-populated
  status: pass
  at: 2026-07-30T08:45:29.223255+00:00
  attempts: 1
  detail: '13 non-empty lines against a floor of 5, one URL per line, trailing newline present. Run by the manager at e6ebc99. Unchanged across the resolve pass: the fb-style re-attribution in F6 moved two quotes onto a page already in the manifest and cited elsewhere, so no source was added or removed. Orphan check clean both directions at 13 and 13.'
- name: every-cited-url-resolves
  status: pass
  at: 2026-07-30T08:45:37.232491+00:00
  attempts: 1
  detail: |-
    All 13 URLs fetched, exit 0, no DEAD lines. Run by the manager at e6ebc99. Orphan check clean both directions.

    **This is the only unit in the station whose contract carried criterion 14, the verbatim quotation audit, and it is the only unit that shipped without a citation defect surviving to lock.** The other three shipped five between them, none of which this gate could detect, because in all five the URL resolved.

    The audit ran three times. The writer checked 47 quoted strings and caught one mid-draft (an RFC 8188 quote closing with a period the source places outside the span). The adversary independently re-verified 44 and found all verbatim, while catching what the audit structurally cannot see: **three claims presented as sourced that carry no quotation marks**, including a false possibility claim about GCS size enforcement and an inverted reading of the MCP spec's protocol-error categories. The tightener re-audited 27 added or moved strings, all verbatim, and **declined to normalize U+2019 apostrophes inside quotation marks**, instead slicing each Stripe quote to an apostrophe-free span and carrying the rest in its own prose.

    Two mis-attributions were also fixed: quotes sourced to `performing-resumable-uploads` that live on `access-control/signed-urls`. The manifest orphan check missed them because the correct page was already in the manifest and cited elsewhere, which is precisely the blind spot recorded in `citation-defects-and-the-three-checks-that-catch-them`.
---

# Goal

Write `docs/spec/publish.md`: the MCP tool surface and the two-hop publish contract, from the agent's tool call through to a relic that exists and a URL the publisher holds. Plus `docs/spec/publish.sources.txt`, one URL per line, trailing newline.

**Read first:** `darkrun_knowledge_list` in full, especially `mcp-protocol-2026-07-28-constraints`, `agent-mediated-key-delivery-leaks-to-the-transcript`, `citation-defects-and-the-three-checks-that-catch-them`, and `gcs-false-impossibility-claims`.

Then read, from the repo root (**do not `cd` into a subdirectory**, `git ls-tree` scopes to the prefix):

- `docs/frame.md` and `docs/preconditions.md`, the **locked** upstream artifacts. Both are on this station's branch, so they are in your worktree. **Do not run `git show darkrun/relic/frame:...`**; that ref no longer exists locally and exits 128.
- `docs/spec/format.md`, which settles the relic ID and container. **Do not redefine either.**
- `docs/spec/service.md`, which fixes the status taxonomy and machine-readable error format for **app-server-originated** failures.

**If either sibling input is missing from your worktree, stop and fetch it before writing anything that depends on it.** You declare two sibling inputs and are therefore the most exposed unit. Fall back in order:

```
git show darkrun/relic/specify:docs/spec/service.md
git show darkrun/relic/units/specify/spec-service-surface:docs/spec/service.md
```

**Never proceed by redefining what a sibling settles.** Report which path you used.

# Source discipline. This station's dominant failure mode.

**Five citation defects shipped across the three sibling units, and every one was found by grepping the source for the quoted string.** None would have failed the `every-cited-url-resolves` gate, because in all five the URL resolved. The modes, worst first:

1. **A fabricated quotation.** `service.md` attributed to RFC 9110 §15.5.11 a string that appears **zero times in all 10,785 lines**, sitting in a sentence whose other quote was verbatim.
2. **Unsupported citations.** Two pages cited for claims they never make.
3. **A relay of a relay**, presented as a first-hand observation when the cited page was quoting someone else's explicitly hedged belief.
4. **One wrong word inside quotation marks**, where an advisory says "(latest)" and the quote read "(current latest)".

The mechanism is not carelessness about sources. In every case the writer had read the right document and reached the right conclusion; a confident paraphrase hardened into quotation marks. The argument survives and the evidence is counterfeit, which is why it passes any review that checks whether the reasoning is sound.

**Rules for you:**

- **Pull raw source text and grep it.** RFCs as `.txt` from rfc-editor.org. For MDN, the `mdn/browser-compat-data` JSON is authoritative where prose is not.
- **Do not use WebFetch on a specification.** Its summarizer was caught on this run returning text that **flatly inverted** RFC 9110's fragment-inheritance meaning. Every beat that worked from raw text and grep produced findings that survived independent re-verification.
- **Before you finish, audit every quoted string you wrote** against its source. Criterion 14 makes this checkable.

# Already decided. Do not relitigate.

- **The MCP server is a local stdio binary that encrypts in-process.** It does not return a script.
- **Ciphertext never transits the app server.** The client uploads straight to storage under a signed grant. Deviation routes back to `frame` as drift.
- **The size cap is enforced by a signed constraint on the grant**, not client-side.
- **Rate limiting returns `429`, never `401` or `403`.**
- **No republish-to-same-URL and no versioning.** A new relic is a new URL.
- **No accounts**, so every control keys on IP, proof of work, or nothing.

**Pin the MCP protocol revision you are writing against, explicitly.** The current revision is `2026-07-28`, which removed the GET stream endpoint and protocol-level sessions, replaced the `initialize` handshake with per-request `_meta`, and added a mandatory `server/discover`. **Tool-result semantics are revision-dependent, so a document that does not name its revision is ambiguous by construction.**

# What `service.md` already settled that you consume

Read it directly; this is what to look for. **Its section 1.6 was added specifically for you** and carries three grant-time refusals `format.md` mandates:

- **`409 relic_id_collision`** is the code a client keys **redraw-and-retry** on, because `format.md` 1.4 obliges the client to draw a new ID and retry.
- **`400 invalid_relic_id`**, with an `id_validation_failure` extension member naming which of alphabet, length, or reserved-table failed.
- **`409 relic_not_yet_published`**, carrying `retry_after_seconds`, for a mint against a live grant whose object has not landed.

The error shape is **RFC 9457 `application/problem+json`**. The fields a client extracts are `code`, `retry_after_seconds`, `size_limit_bytes`, `declared_size_bytes`, `size_basis`, `relic_id`, `download_cap`, `report_url`. `code` is the bare token; `type` is the problems URL plus `code`, generated from one table. **`size_basis` is `plaintext` or `ciphertext`** and exists because `format.md` 3.11 requires the published number be a plaintext number while `shape` picks the enforced side.

# What this document must decide

## 1. The MCP tool surface

- **Tool name.** The spec allows 1 to 128 chars, case-sensitive, ASCII letters/digits/underscore/hyphen/dot, and warns that clients aggregating tools across servers may hit collisions. A bare `publish` collides with incumbent publishing MCP servers a user may already have loaded, and **the model then picks whichever the client disambiguates to, so the file can land on a service with different or no encryption.** A security outcome produced by a naming decision.
- **Input schema: path versus inline content.** The local server has filesystem access, so a **path** keeps plaintext out of the model's context entirely. Accepting inline `content` puts plaintext in the transcript, compounding the key leak from "the key leaks upward" to "the key and the file leak upward." Accepting both without stating a preference means agents inline by default, because that is what a model already holds.
- **Whether the caller may set the renderer class.** The frame locks it as declared by the local client, which holds the plaintext. Exposing it makes the taxonomy model-attested and the metric's sharp second clause reported by an unreliable narrator.
- **Directory input.** A directory forces class `archive`, download-only in the first release, so "publish my report folder" silently produces an unrenderable relic. Decide, and if permitted, require the tool to say so at publish time.
- **Whether a display title exists separately from the filename.**
- **Whether the client pre-checks the cap before requesting a grant.** Free, and it turns a wasted grant plus a failed upload into an instant self-correctable error.
- **The result shape.** Must carry the full URL including the fragment; the agent cannot hand over a link otherwise. Decide each of: relic ID separately, expiry timestamp, declared renderer class, filename echo, abuse URL.
- **`resource_link` is a trap.** It is a link a client may fetch, so a client that helpfully fetches it mints a signed URL and **produces a phantom open against the frame's primary counter.** If used at all, it must not point at the viewer URL.
- **`outputSchema` versus error results.** A schema with `url` required, plus an error result carrying no `structuredContent`, is a shape the spec neither blesses nor forbids. A permissive schema loses validation; omitting `outputSchema` loses typing; a conforming object with a null URL lies in a typed field. Pick one, or three implementers pick three.
- **Which failures set `isError: true` on the tool result, and which are protocol-level errors.** State the rule explicitly. The answer is close to forced, since every failure in section 2 is a tool execution error the model can read and act on rather than a malformed request, but **leaving it unstated is how an implementer returns a protocol error the model cannot self-correct from**, which throws away the entire point of the field-level error mapping below.
- **Progress notifications are a requirement, not a nicety.** Claude Code's time-to-first-byte default is 60 seconds and its HTTP idle timeout is 5 minutes. A large upload exceeds that routinely, and an agent's response to a hung tool is to retry, producing the duplicate-publish case. **Without progress the client times out, the model reports failure, the upload completes anyway, and the result is an orphaned relic that consumed quota and storage and that nobody has the URL for.**
- **Tool count.** One tool or several. A delete tool cannot be specified until publisher self-delete is decided below.

## 2. Error mapping, and the two legs the app server is not in

The spec splits protocol errors from tool execution errors, which carry actionable feedback the model self-corrects from. **Publish failures fall into two disjoint groups and you must handle both.**

**Group A, app-server-originated.** These reach the client as an HTTP response, so **map them onto the statuses and named machine-readable fields `docs/spec/service.md` defines and invent nothing**: grant refused because declared size exceeds the cap; publish rate limited; malformed renderer class or client name; grant expired at mint; egress kill switch engaged; **plus all three of section 1.6's grant-time refusals, including the collision the client must redraw on.** State the extraction rule: the client reads the machine-readable code and named fields, **never** the human-readable prose, because prose changes on a copy edit. Two fields are load-bearing: a size rejection must surface **both the cap and the actual size**, or the model retries the identical file; a rate limit must surface **retry-after**, or the model retries immediately and deepens the limit.

**Group B, failures with no app-server status, because the app server is structurally not in that path.** `docs/spec/service.md` cannot assign these a status and must not be forced to. **You own their tool-error codes.** At minimum:

- **File not found or unreadable.** Purely local; no HTTP request is made at all.
- **Network failure mid-upload**, on the client-to-GCS leg the preconditions keep the app server out of by design.
- **Upload-time size refusal by the signed constraint**, which GCS answers. Distinct from the grant-time refusal in Group A, and the preconditions are explicit that the app server cannot see it. **Name both refusals separately so a reader never conflates them.**
- **Storage-leg errors generally**, including a grant that expired before the upload finished.

Define a stable machine-readable code for each Group B failure in the same shape `service.md` uses, so the client's error handling is uniform across both groups even though the origins differ.

**Note the scope of the 401/403 rule.** It is a Claude Code MCP *client* behavior and stdio carries no HTTP status, so it binds directly only on a future remote MCP surface. Obey it everywhere anyway and say why.

## 3. The grant hop

- **What the client sends:** declared size (**state plaintext or ciphertext, consistent with `format.md` and with `service.md`'s `size_basis`**), declared renderer class, client name **and version**.
- **A content hash, and for which purpose.** Do **not** send one for blocklist purposes: the hash is computed over the object after it lands, and there is no refusal count because the server never sees the upload stream. A hash may still be wanted for idempotency, and conflating the two purposes quietly reintroduces the door-check the preconditions ruled out.
- **Proof of work: decide now or foreclose it.** A challenge-then-grant flow is a different contract, not an added header, so leaving it open means `shape` picks the one-round-trip grant and PoW becomes an unaddable breaking change.
- **Grant expiry is a separate clock from the relic TTL.** Collapsing them kills slow uploads at the TTL boundary.
- **The response never contains the fragment.** The server assembles everything except the key; the client appends it locally. Guard against a later convenience endpoint that takes the key to build a share URL.
- **The grant carries a signed size constraint.** Options: a signed policy document expressing a content-length range, or a resumable session with `X-Upload-Content-Length`. **A plain signed PUT ignores `Content-Length`**, so choosing it turns the cap into a client-side suggestion.
- **`ifGenerationMatch: 0` on the grant.** Without it, anyone holding the grant can replace the ciphertext under an already-shared URL. **The locked republish non-goal supplies this enforcement rule for free.**
- **Whether the per-IP publish quota is charged at grant-mint or at upload-completion.** Charging at completion lets an attacker mint unlimited grants for free.

## 4. Completion, retry, and failure

- **What confirms completion.** Lazy discovery at first mint is cheapest and records telemetry for relics that never landed. An explicit completion call strands a relic whose call failed. A storage-side finalize notification adds a dependency and an eventually-consistent window with no name.
- **Grants never used.** State that "relic ID with no object" is a **normal expected state with a stated refusal, never a 500**, and note that `service.md` 1.6 already gives it a code.
- **Idempotency.** Without an idempotency key a retried grant request mints a second grant, ID, and telemetry row. The `Idempotency-Key` header field is the prior art: a duplicate key returns the original result, and a still-running original returns 409.
- **Retry safety on the upload leg.** A resumable session makes retry safe: a status query returns `308` with a `Range` header of persisted bytes, and Cloud Storage ignores bytes sent at an already-persisted offset. **A plain signed PUT has no equivalent, so every retry restarts at zero and doubles egress against a cost precondition already called unbounded.**
- **Whether a retry re-encrypts.** Re-encrypting generates a fresh key, so the URL changes and any previously emitted URL is dead. Resuming under the same key must resume the record sequence at the correct index: **restarting the sequence mid-object under the same key is the catastrophic nonce-reuse case, not a degraded mode.**
- **Retry count is capped**, because an unbounded loop against a per-IP quota converts a flaky network into a self-inflicted rate-limit ban.
- **Lost confirmation.** The worst failure: the relic exists, is fetchable, and the publisher has no URL. **`format.md` put ID generation on the client, so say plainly that this is a non-event and why.** The tool never reports success on a response it did not receive, and never reports failure implying nothing was uploaded when it cannot know that.
- **Crash safety.** Encryption never writes a plaintext temp file; a ciphertext temp file is removed on crash; **the source file is never modified or moved.** Publishing is non-destructive to its input, because "publish" means "move" in other tools.
- **Double publish.** Two relics, two URLs, two independent TTLs. **Deduplication is not a storage optimization here**, and convergent encryption is drift routing back to `frame`.
- **Whether a publisher can delete their own relic.** The non-goals forbid a dashboard and a relic list, not a per-relic delete capability. Decide, and note it gates whether a delete tool can exist.

## 5. The disclosure obligation

State plainly that **the tool result necessarily carries the fragment into the model's context and the session transcript.** Zero-knowledge holds against the Relic operator and does not hold against the model provider or transcript store. Unfixable inside this architecture, because relaying the link is the product. Reference that `docs/spec/service.md` section 5 owns the published statement carrying it, and that this bounds the honest claim.

# Route to `shape`

Name each with what `shape` must choose: the grant shape; whether PoW is in the flow and at what difficulty; the size cap value and its referent; the retry cap; whether object metadata is set at upload time at all. **Note that `service.md` corrected an earlier false claim here: the app server can set and patch GCS custom metadata through the API, and can pin client-supplied metadata by signing headers into the grant. Do not restate the impossibility version.**

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji. The "X, not Y" appositive was flagged at one per 195 words as a tic on a sibling; use it where it carries a decision, not as a default rhythm.

# Completion criteria

1. `test -f docs/spec/publish.md` exits 0.
2. `test "$(wc -w < docs/spec/publish.md)" -ge 2200` exits 0. **Calibration:** roughly 38 mandated items at an observed 60 to 85 words per item, so a compliant document lands between about 2280 and 3230 words. 2200 sits just below that band deliberately. **The floor is a stub guard with no ceiling.** The three siblings landed at 5365, 6551, and 7883 because answering findings adds rules. Never pad, and never cut a decided rule to hit a number.
3. Manifest has at least five sources, one per line, trailing newline.
4. Every source resolves. **Do not invent citations.** Orphan check both directions.
5. Every item in "What this document must decide" is resolved into a stated rule or routed to `shape`. **Routing is legitimate only for items named in this unit's own "Route to `shape`" section; routing anything else fails this criterion.**
6. The document names the MCP protocol revision it is written against.
7. The document states the progress-notification requirement and the orphaned-relic failure it prevents.
8. The document states the `ifGenerationMatch: 0` rule and ties it to the locked republish non-goal.
9. The document states the nonce-reuse consequence of resuming a record sequence incorrectly.
10. The document contains the transcript disclosure obligation from section 5.
11. **Every app-server-originated failure maps onto a status and named fields from `docs/spec/service.md`, inventing no status**, and the document states the client extracts codes and fields rather than matching prose.
12. **Every failure with no app-server status is enumerated in Group B with its own stable machine-readable code**, and the document names the grant-time and upload-time size refusals separately.
13. **The document states which failures set `isError: true` and which are protocol-level errors, consistently with its `outputSchema` decision.**
14. **Every string the document presents inside quotation marks as coming from a source has been verified verbatim against that source's raw text, and the beat reports the audit.** Extract each quoted string, pull the source as raw text, and substring-match. This criterion exists because five citation defects shipped across the three sibling units and **not one of them would have failed criterion 4**, since every URL resolved. Report the audit as a list: each quoted string, its source, and confirmed or corrected.
15. **The document states the code a publishing client keys redraw-and-retry on**, sourced from `service.md` 1.6 rather than invented, since `format.md` 1.4 obliges the client to draw a new ID and retry on collision.

# Files touched

- `docs/spec/publish.md`, `docs/spec/publish.sources.txt` (create)

# Out of scope

- The URL, ID, and container format. Locked by `docs/spec/format.md`.
- **The status taxonomy for app-server-originated failures**, locked by `docs/spec/service.md`. You map onto it and never invent an app-server status or field name. **Group B codes are yours**, because no app server participates in those paths.
- Viewer behavior, rendering, routing, the sandbox boundary. Sibling `spec-viewer`.
- Any numeric value, the stack, and all implementation.
