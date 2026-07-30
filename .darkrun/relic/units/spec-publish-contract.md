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

**Read first:** `darkrun_knowledge_list` in full, especially `mcp-protocol-2026-07-28-constraints` and `agent-mediated-key-delivery-leaks-to-the-transcript`.

Then read, from the repo root (**do not `cd` into a subdirectory**, `git ls-tree` scopes to the prefix):

- `docs/frame.md` and `docs/preconditions.md`, the **locked** upstream artifacts. Both are on this station's branch, so they are in your worktree. **Do not run `git show darkrun/relic/frame:...`**; that ref no longer exists locally and exits 128.
- `docs/spec/format.md`, which settles the relic ID and container. **Do not redefine either.**
- `docs/spec/service.md`, which fixes the status taxonomy and machine-readable error format for **app-server-originated** failures.

**If either sibling input is missing from your worktree, stop and fetch it before writing anything that depends on it.** You declare two sibling inputs and are therefore the most exposed unit; worktree fork timing relative to a sibling's land is not guaranteed, and in the previous station a dependent unit's declared input was genuinely absent. Fall back in order:

```
git show darkrun/relic/specify:docs/spec/service.md
git show darkrun/relic/units/specify/spec-service-surface:docs/spec/service.md
```

**Never proceed by redefining what a sibling settles.** Report which path you used.

# Already decided. Do not relitigate.

- **The MCP server is a local stdio binary that encrypts in-process.** It does not return a script.
- **Ciphertext never transits the app server.** The client uploads straight to storage under a signed grant. Deviation routes back to `frame` as drift.
- **The size cap is enforced by a signed constraint on the grant**, not client-side.
- **Rate limiting returns `429`, never `401` or `403`.**
- **No republish-to-same-URL and no versioning.** A new relic is a new URL.
- **No accounts**, so every control keys on IP, proof of work, or nothing.

**Pin the MCP protocol revision you are writing against, explicitly.** The current revision is `2026-07-28`, which removed the GET stream endpoint and protocol-level sessions, replaced the `initialize` handshake with per-request `_meta`, and added a mandatory `server/discover`. **Tool-result semantics are revision-dependent, so a document that does not name its revision is ambiguous by construction.**

# What this document must decide

## 1. The MCP tool surface

- **Tool name.** The spec allows 1 to 128 chars, case-sensitive, ASCII letters/digits/underscore/hyphen/dot, and warns that clients aggregating tools across servers may hit collisions. A bare `publish` collides with incumbent publishing MCP servers a user may already have loaded (PreviewShip, hypertext.live's `publish_html`, file.kiwi's server), and **the model then picks whichever the client disambiguates to, so the file can land on a service with different or no encryption.** A security outcome produced by a naming decision.
- **Input schema: path versus inline content.** The local server has filesystem access, so a **path** keeps plaintext out of the model's context entirely. Accepting inline `content` puts plaintext in the transcript, compounding the key leak from "the key leaks upward" to "the key and the file leak upward." Accepting both without stating a preference means agents inline by default, because that is what a model already holds.
- **Whether the caller may set the renderer class.** The frame locks it as declared by the local client, which holds the plaintext. Exposing it makes the taxonomy model-attested and the metric's sharp second clause reported by an unreliable narrator.
- **Directory input.** A directory forces class `archive`, download-only in the first release, so "publish my report folder" silently produces an unrenderable relic. Decide, and if permitted, require the tool to say so at publish time.
- **Whether a display title exists separately from the filename.**
- **Whether the client pre-checks the cap before requesting a grant.** Free, and it turns a wasted grant plus a failed upload into an instant self-correctable error.
- **The result shape.** Must carry the full URL including the fragment; the agent cannot hand over a link otherwise. Decide each of: relic ID separately (without it a publisher cannot report their own relic without hand-parsing the URL), expiry timestamp (TTL is fixed and known, so it is free, and omitting it means the recipient learns the TTL by clicking a dead link), declared renderer class (so the agent can say "this will download rather than render"), filename echo, abuse URL.
- **`resource_link` is a trap.** It is a link a client may fetch, so a client that helpfully fetches it mints a signed URL and **produces a phantom open against the frame's primary counter.** If used at all, it must not point at the viewer URL.
- **`outputSchema` versus error results.** A schema with `url` required, plus an error result carrying no `structuredContent`, is a shape the spec neither blesses nor forbids. A permissive schema loses validation; omitting `outputSchema` loses typing; a conforming object with a null URL lies in a typed field. Pick one, or three implementers pick three.
- **Progress notifications are a requirement, not a nicety.** Claude Code's time-to-first-byte default is 60 seconds and its HTTP idle timeout is 5 minutes. A large upload exceeds that routinely, and an agent's response to a hung tool is to retry, producing the duplicate-publish case. **Without progress the client times out, the model reports failure, the upload completes anyway, and the result is an orphaned relic that consumed quota and storage and that nobody has the URL for.** It also biases the frame's metric downward as published-and-never-opened.
- **Tool count.** One tool or several. A delete tool cannot be specified until publisher self-delete is decided below.

## 2. Error mapping, and the two legs the app server is not in

The spec splits protocol errors from tool execution errors, which carry actionable feedback the model self-corrects from. **Publish failures fall into two disjoint groups and you must handle both.**

**Group A, app-server-originated.** These reach the client as an HTTP response from the app server, so **map them onto the statuses and named machine-readable fields `docs/spec/service.md` defines and invent nothing**: grant refused because declared size exceeds the cap; publish rate limited; malformed renderer class or client name; grant expired at mint; egress kill switch engaged. State the extraction rule: the client reads the machine-readable code and named fields, **never** the human-readable prose, because prose changes on a copy edit. Two fields are load-bearing: a size rejection must surface **both the cap and the actual size**, or the model retries the identical file; a rate limit must surface **retry-after**, or the model retries immediately and deepens the limit.

**Group B, failures with no app-server status, because the app server is structurally not in that path.** `docs/spec/service.md` cannot assign these a status and must not be forced to. **You own their tool-error codes.** At minimum:

- **File not found or unreadable.** Purely local; no HTTP request is made at all.
- **Network failure mid-upload**, on the client-to-GCS leg the preconditions keep the app server out of by design.
- **Upload-time size refusal by the signed constraint**, which GCS answers. Distinct from the grant-time refusal in Group A, and the preconditions are explicit that the app server cannot see it. **Name both refusals separately so a reader never conflates them.**
- **Storage-leg errors generally**, including a grant that expired before the upload finished.

Define a stable machine-readable code for each Group B failure in the same shape `service.md` uses, so the client's error handling is uniform across both groups even though the origins differ.

**Note the scope of the 401/403 rule.** It is a Claude Code MCP *client* behavior and stdio carries no HTTP status, so it binds directly only on a future remote MCP surface. Obey it everywhere anyway and say why, because a reader who notices the gap may reach for `403` on a download-cap refusal, which is where it is most tempting and where `service.md` has already ruled.

## 3. The grant hop

- **What the client sends:** declared size (**state plaintext or ciphertext, consistent with `format.md`**), declared renderer class, client name **and version** (without a version a bad release cannot be correlated with a failure spike and cannot be backfilled).
- **A content hash, and for which purpose.** Do **not** send one for blocklist purposes: the hash is computed over the object after it lands, and there is no refusal count because the server never sees the upload stream. A hash may still be wanted for idempotency, and conflating the two purposes quietly reintroduces the door-check the preconditions ruled out.
- **Proof of work: decide now or foreclose it.** A challenge-then-grant flow is a different contract, not an added header, so leaving it open means `shape` picks the one-round-trip grant and PoW becomes an unaddable breaking change.
- **Grant expiry is a separate clock from the relic TTL.** Collapsing them kills slow uploads at the TTL boundary.
- **The response never contains the fragment.** The server assembles everything except the key; the client appends it locally. Guard against a later convenience endpoint that takes the key to build a share URL.
- **The grant carries a signed size constraint.** Options: a signed policy document expressing a content-length range, or a resumable session with `X-Upload-Content-Length`. **A plain signed PUT ignores `Content-Length`**, so choosing it turns the cap into a client-side suggestion, present in the code and absent on the wire.
- **`ifGenerationMatch: 0` on the grant.** Without it, anyone holding the grant, including the same client retrying, can replace the ciphertext under an already-shared URL, after which the recorded class no longer describes the bytes. **The locked republish non-goal supplies this enforcement rule for free.**
- **Whether the per-IP publish quota is charged at grant-mint or at upload-completion.** Charging at completion lets an attacker mint unlimited grants for free.

## 4. Completion, retry, and failure

- **What confirms completion.** Lazy discovery at first mint is cheapest and records telemetry for relics that never landed, diluting the metric's first clause. An explicit completion call strands a relic whose call failed. A storage-side finalize notification adds a dependency and an eventually-consistent window with no name.
- **Grants never used.** State that "relic ID with no object" is a **normal expected state with a stated refusal, never a 500**, and that orphans are reaped on the same clock as objects.
- **Idempotency.** Without an idempotency key a retried grant request mints a second grant, ID, and telemetry row; the agent gets one URL and the other relic is counted, never opened, and drags the metric down. The `Idempotency-Key` header field is the prior art: a duplicate key returns the original result, and a still-running original returns 409.
- **Retry safety on the upload leg.** A resumable session makes retry safe: a status query returns `308` with a `Range` header of persisted bytes, and Cloud Storage ignores bytes sent at an already-persisted offset. **A plain signed PUT has no equivalent, so every retry restarts at zero and doubles egress against a cost precondition already called unbounded.** A second, independent reason pointing the same way as size enforcement.
- **Whether a retry re-encrypts.** Re-encrypting generates a fresh key, so the URL changes and any previously emitted URL is dead. Resuming under the same key must resume the record sequence at the correct index: **restarting the sequence mid-object under the same key is the catastrophic nonce-reuse case, not a degraded mode.**
- **Retry count is capped**, because an unbounded loop against a per-IP quota converts a flaky network into a self-inflicted rate-limit ban whose error says nothing about the network.
- **Lost confirmation.** The worst failure: the relic exists, is fetchable, and the publisher has no URL, cannot share it, cannot delete it, and does not know it is there. **If `format.md` put ID generation on the client, this is a non-event and you say so. If on the server, the ID arrives in the grant, never in a post-upload confirmation.** Either way the tool never reports success on a response it did not receive, and never reports failure implying nothing was uploaded when it cannot know that. The honest message names the ambiguity, gives the URL, and asks the user to verify it opens.
- **Crash safety.** Encryption never writes a plaintext temp file; a ciphertext temp file is removed on crash or lives somewhere obviously ephemeral; **the source file is never modified or moved.** Publishing is non-destructive to its input, because "publish" means "move" in other tools.
- **Double publish.** Two relics, two URLs, two independent TTLs. **Deduplication is not a storage optimization here**, and convergent encryption is drift routing back to `frame`.
- **Whether a publisher can delete their own relic.** The non-goals forbid a dashboard and a relic list, not a per-relic delete capability, so "I published the wrong file" is currently unrecoverable until TTL. Decide, and note it gates whether a delete tool can exist.

## 5. The disclosure obligation

State plainly that **the tool result necessarily carries the fragment into the model's context and the session transcript.** Zero-knowledge holds against the Relic operator and does not hold against the model provider or transcript store. Unfixable inside this architecture, because relaying the link is the product. Reference that `docs/spec/service.md` owns the published statement carrying it, and that this bounds the honest claim: "the service can't read your file" is true; "nobody but the recipient can read your file" is false whenever an agent produced the link.

# Route to `shape`

Name each with what `shape` must choose: the grant shape; whether PoW is in the flow and at what difficulty; the size cap value and its referent; the retry cap; whether object metadata is set at upload time at all, given the app server is structurally outside the upload path.

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji.

# Completion criteria

1. `test -f docs/spec/publish.md` exits 0.
2. `test "$(wc -w < docs/spec/publish.md)" -ge 2200` exits 0. **Calibration:** roughly 31 mandated items at an observed 60 to 85 words per item, so a compliant document lands between about 1860 and 2635 words. 2200 sits inside that band; if you are near it, check for skipped items before assuming you are short.
3. Manifest has at least five sources, one per line, trailing newline.
4. Every source resolves. **Do not invent citations.** Orphan check both directions.
5. Every item in "What this document must decide" is resolved into a stated rule or routed to `shape`. **Routing is legitimate only for items named in this unit's own "Route to `shape`" section; routing anything else fails this criterion.**
6. The document names the MCP protocol revision it is written against.
7. The document states the progress-notification requirement and the orphaned-relic failure it prevents.
8. The document states the `ifGenerationMatch: 0` rule and ties it to the locked republish non-goal.
9. The document states the nonce-reuse consequence of resuming a record sequence incorrectly.
10. The document contains the transcript disclosure obligation from section 5.
11. **Every app-server-originated failure maps onto a status and named fields from `docs/spec/service.md`, inventing no status, and the document states the client extracts codes and fields rather than matching prose.**
12. **Every failure with no app-server status is enumerated in Group B with its own stable machine-readable code, and the document names the grant-time and upload-time size refusals separately.**

# Files touched

- `docs/spec/publish.md`, `docs/spec/publish.sources.txt` (create)

# Out of scope

- The URL, ID, and container format. Locked by `docs/spec/format.md`.
- **The status taxonomy for app-server-originated failures**, locked by `docs/spec/service.md`. You map onto it and never invent an app-server status or field name. **Group B codes are yours**, because no app server participates in those paths.
- Viewer behavior, rendering, routing, the sandbox boundary. Sibling `spec-viewer`.
- Any numeric value, the stack, and all implementation.
