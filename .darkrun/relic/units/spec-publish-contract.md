---
name: Specify the MCP tool surface and the publish contract
unit_type: doc
status: pending
depends_on:
- spec-relic-format
worker: ''
model: opus
station: specify
inputs:
- docs/spec/format.md
outputs:
- docs/spec/publish.md
- docs/spec/publish.sources.txt
quality_gates:
- name: artifact-exists
  command: test -f docs/spec/publish.md
- name: substance-floor
  command: test "$(wc -w < docs/spec/publish.md)" -ge 1800
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/spec/publish.sources.txt); test "$n" -ge 5'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/publish.sources.txt'
---

# Goal

Write `docs/spec/publish.md`: the MCP tool surface and the two-hop publish contract, from the agent's tool call through to a relic that exists and a URL the publisher holds. Plus `docs/spec/publish.sources.txt`, one URL per line, trailing newline.

**Read first:** `darkrun_knowledge_list` in full; `docs/spec/format.md` in your worktree, which is this unit's declared input and settles the relic ID and container (do not redefine either); then the locked artifacts, read-only, from the repo root (**do not `cd` into a subdirectory**, `git ls-tree` scopes to the prefix):

```
git show darkrun/relic/frame:docs/frame.md
git show darkrun/relic/frame:docs/preconditions.md
```

# Already decided. Do not relitigate.

- **The MCP server is a local stdio binary that encrypts in-process.** It does not return a script.
- **Ciphertext never transits the app server.** Preconditions section 4: the client uploads straight to storage under a signed grant. Deviation routes back to `frame` as drift.
- **The size cap is enforced by a signed constraint on the grant**, not client-side. Preconditions: "That 'cannot' holds only for a grant shape that carries a signed size constraint, and not every shape does."
- **Rate limiting returns `429`, never `401` or `403`**, because Claude Code marks a server as needing auth on either.
- **No republish-to-same-URL and no versioning.** A new relic is a new URL.
- **No accounts**, so every control keys on IP, proof of work, or nothing.

# What this document must decide

## 1. The MCP tool surface

- **Tool name.** The MCP spec allows 1 to 128 chars, case-sensitive, ASCII letters/digits/underscore/hyphen/dot, and warns that "clients or proxies that aggregate tools from multiple servers MAY encounter naming collisions." A bare `publish` collides with incumbent publishing MCP servers a user may already have loaded (PreviewShip, hypertext.live's `publish_html`, file.kiwi's server), and **the model then picks whichever the client disambiguates to, which means the file can land on a service with different or no encryption.** That is a security outcome produced by a naming decision. Choose and justify.
- **Input schema: path versus inline content.** The local server has filesystem access, so a **path** keeps plaintext out of the model's context entirely. Accepting inline `content` puts the plaintext in the transcript, compounding the key leak documented in `agent-mediated-key-delivery-leaks-to-the-transcript` from "the key leaks upward" to "the key and the file leak upward." Accepting both without stating a preference means agents inline by default, because that is what a model already holds. Decide and state it in the schema.
- **Whether the caller may set the renderer class.** The frame locks that it is "declared at publish time by the local client, which holds the plaintext." If the tool exposes it, the taxonomy becomes model-attested rather than client-attested, and the metric's sharp second clause is reported by an unreliable narrator.
- **Directory input.** If a path may be a directory the client must archive it, forcing class `archive`, which is download-only in the first release. "Publish my report folder" then silently produces an unrenderable relic. Decide, and if permitted, require the tool to say so at publish time.
- **Whether a display title exists separately from the filename.**
- **Whether the client pre-checks the cap before requesting a grant.** Free, and turns a wasted grant plus a failed upload into an instant self-correctable error.
- **The result shape.** Must carry the full URL including the fragment (non-optional; the agent cannot hand over a link otherwise). Decide on each of: relic ID separately (without it a publisher cannot report their own relic without hand-parsing the URL), expiry timestamp (TTL is fixed and known, so it is free to include, and omitting it means the recipient learns the TTL by clicking a dead link), declared renderer class (so the agent can say "this will download rather than render"), filename echo, abuse URL.
- **`resource_link` is a trap.** It is "a link to a Resource that can be subscribed to or fetched by the client," so a client that helpfully fetches it mints a signed URL and **produces a phantom open against the frame's primary counter.** If used at all, it must not point at the viewer URL.
- **`outputSchema` versus error results.** Declaring a schema with `url` required, then returning an error with no `structuredContent`, is a shape the spec neither blesses nor forbids. The three resolutions each cost something: a permissive schema loses validation, omitting `outputSchema` loses typing, a conforming object with a null URL lies in a typed field. Pick one, or three implementers pick three.
- **`isError` mapping.** The spec splits protocol errors (unknown tool, malformed request, server error) from tool execution errors, which "contain actionable feedback that language models can use to self-correct." Map every publish failure: size rejection (**must name both the cap and the actual size**, or the model retries the identical file), rate limit (**must carry retry-after**, or the model retries immediately and deepens the limit), file not found, grant expired, network failure mid-upload. Note the scope correction: the 401/403 trap is a Claude Code MCP *client* behavior and stdio carries no HTTP status, so it binds directly only on a future remote MCP surface. Obey it everywhere anyway, and say why, because a reader noticing the gap may use 403 for a download-cap refusal, which is where it is most tempting.
- **Progress notifications are a requirement, not a nicety.** Claude Code's time-to-first-byte default is 60 seconds and its HTTP idle timeout is 5 minutes. A large upload exceeds that routinely, and the agent's response to a hung tool is to retry, which creates the duplicate-publish case. **Without progress, the client times out, the model reports failure, the upload completes anyway, and the result is an orphaned relic that consumed quota and storage and that nobody has the URL for.** It also biases the frame's metric downward as published-and-never-opened.
- **Tool count.** One tool or several. A `delete_relic` tool cannot be specified until publisher self-delete is decided; see below.

## 2. The grant hop (client to app server)

- **What the client sends:** declared size (**state whether plaintext or ciphertext, consistent with `format.md`**), declared renderer class, client name **and version** (without a version a bad release cannot be correlated with a failure spike and cannot be backfilled).
- **A content hash, and for which purpose.** Do **not** send one for blocklist purposes: the preconditions are explicit that the hash is computed over the object after it lands, and that there is no refusal count because the server never sees the upload stream. A hash may still be wanted for idempotency, and conflating the two purposes quietly reintroduces the door-check the preconditions ruled out.
- **Proof of work: decide now or foreclose it.** The knowledge base records PoW as a deployed rate limiter to "apply to publish, never to view." Neither locked document adopts or rejects it. **A challenge-then-grant flow is a different contract, not an added header, so if this is left open `shape` picks the one-round-trip grant and PoW becomes an unaddable breaking change.**
- **Grant expiry is a separate clock from the relic TTL.** Collapsing them kills slow uploads at the TTL boundary.
- **The response must never contain the fragment.** The server assembles everything except the key; the client appends it locally. The failure mode to guard against is a convenience "give me a share URL" endpoint added later that takes the key.
- **The grant carries a signed size constraint.** Grounded options: a signed policy document expressing `["content-length-range", min, max]`, or a resumable session with `X-Upload-Content-Length`. **A plain signed PUT ignores `Content-Length`**, so choosing it turns the cap into a client-side suggestion, present in the code and absent on the wire. Which shape is `shape`'s call; that the chosen one enforces size is this document's condition.
- **`ifGenerationMatch: 0` on the grant.** Without it, anyone holding the grant, including the same client retrying, can replace the ciphertext under an already-shared URL, after which the recorded class no longer describes the bytes. **The locked non-goal on republish supplies this enforcement rule for free; it just has to be written into the grant rather than assumed.**
- **Whether the per-IP publish quota is charged at grant-mint or at upload-completion.** Charging at completion lets an attacker mint unlimited grants for free. The preconditions describe the mechanism as mint-time, which is the safe direction, but it is not stated as a decision.

## 3. Completion, retry, and the failure cases

- **What confirms an upload completed.** Three options, each with a specific defect: lazy discovery at first mint (cheapest, and it records telemetry for relics that never landed, diluting the metric's first clause); an explicit client completion call (a relic that uploaded fine but whose call failed is stranded); a storage-side finalize notification (extra dependency, and eventual consistency means a viewer arriving in the first seconds sees a state with no name).
- **Grants never used.** Without a sweeper, metadata accumulates for relics that do not exist and the ID space fills with never-real IDs. **State that "relic ID with no object" is a normal expected state with a stated refusal, never a 500**, and that orphans are reaped on the same clock as objects.
- **Idempotency.** Retrying a grant request with no idempotency key mints a second grant, a second ID, and a second telemetry row; the agent gets one URL and the other relic is counted, never opened, and drags the metric down. Prior art with an exact answer: the `Idempotency-Key` header field, where a server seeing a duplicate key "SHOULD respond with the result of the previously completed operation" and responds 409 if the original is still running.
- **Retry safety on the upload leg.** A resumable session makes retry safe: a status query with `Content-Range: bytes */SIZE` returns `308` with a `Range` header of persisted bytes, and "Cloud Storage ignores any bytes you send at an offset that Cloud Storage has already persisted." **A plain signed PUT has no equivalent: a retry restarts at zero, doubling egress against a cost precondition the preconditions already call unbounded.** This is a second, independent reason to prefer a resumable session, and it points the same way as the size-enforcement reason.
- **Whether a retry re-encrypts.** Re-encrypting generates a fresh key, so the URL changes and any previously emitted URL is dead. Resuming under the same key **must** resume the record sequence at the correct index: RFC 8188 derives the nonce by XOR-ing a sequence number that starts at zero, so **restarting the sequence mid-object under the same key is the catastrophic nonce-reuse case, not a degraded mode.**
- **Retry count is capped**, because an unbounded loop against a per-IP quota converts a flaky network into a self-inflicted rate-limit ban whose error says nothing about the network.
- **Lost confirmation.** The worst failure in the system: the relic exists, is fetchable by anyone holding or guessing the ID, and the publisher has no URL, cannot share it, cannot delete it, and does not know it is there. **If `format.md` put ID generation on the client, this is a non-event and you say so. If it put it on the server, the ID must arrive in the grant, never in a post-upload confirmation.** Either way: the tool never reports success on a response it did not receive, and never reports failure in a way implying nothing was uploaded when it cannot know that. The honest message names the ambiguity, gives the URL, and asks the user to verify it opens.
- **Crash safety.** Encryption never writes a plaintext temp file; a ciphertext temp file is removed on crash or lives somewhere obviously ephemeral; **the source file is never modified or moved.** State that publishing is non-destructive to its input, because "publish" means "move" in other tools.
- **Double publish.** Two relics, two URLs, two independent TTLs. **Deduplication is not implemented as a storage optimization**, and convergent encryption is drift routing back to `frame`.
- **Whether a publisher can delete their own relic.** The locked non-goals forbid a dashboard and a relic list but not a per-relic delete capability, so "I published the wrong file" is currently unrecoverable until TTL. Decide, and note it gates whether a delete tool can exist.

## 4. The disclosure obligation

State plainly, in this document, that **the tool result necessarily carries the fragment into the model's context and the session transcript.** Relic's zero-knowledge property holds against the Relic operator and does not hold against the model provider or transcript store. It is unfixable inside this architecture, because relaying the link is the product. It belongs in the published privacy statement alongside the telemetry trade, and it bounds the honest marketing claim: "the service can't read your file" is true; "nobody but the recipient can read your file" is false whenever an agent produced the link.

# Route to `shape`

Name each with what `shape` must choose: the grant shape; whether PoW is in the flow and at what difficulty; the size cap value and its referent; the retry cap; whether object metadata is set at upload time at all, given the app server is structurally outside the upload path.

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji.

# Completion criteria

1. `test -f docs/spec/publish.md` exits 0.
2. `test "$(wc -w < docs/spec/publish.md)" -ge 1800` exits 0. A floor against a stub, not a target. Do not pad.
3. Manifest has at least five sources, one URL per line, trailing newline.
4. Every source resolves. **Do not invent citations**; a gate curls each one. Run the orphan check both directions.
5. Every item in "What this document must decide" is resolved into a stated rule or routed to `shape` with what `shape` must choose.
6. The document states the progress-notification requirement and the orphaned-relic failure it prevents.
7. The document states the `ifGenerationMatch: 0` rule and ties it to the locked republish non-goal.
8. The document states the nonce-reuse consequence of resuming a record sequence incorrectly.
9. The document contains the transcript disclosure obligation from section 4.

# Files touched

- `docs/spec/publish.md`, `docs/spec/publish.sources.txt` (create)

# Out of scope

- The URL, ID, and container format. Locked by `docs/spec/format.md`, your input. Reference it; never redefine it.
- Viewer behavior, rendering, routing, the sandbox boundary. Sibling `spec-viewer`.
- Status codes, expiry semantics, delete-by-ID, abuse intake, mint placement, counting rules. Sibling `spec-service-surface`. You may state that a publish-path failure needs a status; you do not fix the taxonomy.
- Any numeric value, the stack, and all implementation.
