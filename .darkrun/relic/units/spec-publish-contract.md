---
name: Specify the MCP tool surface and the publish contract
unit_type: doc
status: pending
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
reviews:
  completeness:
    at: 2026-07-30T05:31:07.501358+00:00
  testability:
    at: 2026-07-30T05:14:48.190501+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/spec/publish.md
- name: substance-floor
  command: test "$(wc -w < docs/spec/publish.md)" -ge 2200
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/spec/publish.sources.txt); test "$n" -ge 5'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/publish.sources.txt'
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
