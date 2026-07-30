---
name: Specify the status taxonomy, expiry semantics, mint rules, and the abuse surface
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
- docs/spec/service.md
- docs/spec/service.sources.txt
quality_gates:
- name: artifact-exists
  command: test -f docs/spec/service.md
- name: substance-floor
  command: test "$(wc -w < docs/spec/service.md)" -ge 1800
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/spec/service.sources.txt); test "$n" -ge 5'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/service.sources.txt'
---

# Goal

Write `docs/spec/service.md`: the status taxonomy, expiry and lifecycle semantics, when a mint happens and what counts as an open, and the delete-by-ID and abuse surface. Plus `docs/spec/service.sources.txt`, one URL per line, trailing newline.

**Read first:** `darkrun_knowledge_list` in full, especially `gcs-soft-delete-and-what-deletion-actually-means`, `abuse-liability-of-hosting-uninspectable-content`, `mcp-protocol-2026-07-28-constraints`, and `shape-inherited-constraints-from-frame`. Then `docs/spec/format.md` in your worktree, your declared input, which settles the relic ID (**its entropy decision determines several answers here**, so read it before writing section 1). Then the locked artifacts, read-only, from the repo root (**do not `cd` into a subdirectory**, `git ls-tree` scopes to the prefix):

```
git show darkrun/relic/frame:docs/frame.md
git show darkrun/relic/frame:docs/preconditions.md
```

# Already decided. Do not relitigate.

- **Rate limiting returns `429`, never `401` or `403`.** Claude Code marks a server as needing auth on either.
- **Open counts are taken at signed-URL mint time**, and never from a viewer-side script.
- **Delete-by-ID works without the secret**, and deletion, not revocation, is the takedown primitive, because signed URLs cannot be revoked individually.
- **Abuse intake exists on day one**, from every relic page, at a stable `/abuse` URL, plus a published email alias, with a named human behind it. Preconditions make this the go/no-go.
- **The blocklist is detect-and-delete after the object lands**, never a check at the door.
- **Upload IP plus timestamp are retained with a published window**, per sink.
- **`robots.txt` disallow plus `X-Robots-Tag: noindex`**, asserted on a real relic path rather than the apex, because the header is per-response.
- **No accounts**, so every control keys on IP, proof of work, or nothing.

# What this document must decide

## 1. The status taxonomy

**One taxonomy for all callers.** A taxonomy that varies by caller is a bug generator, and the same endpoint may be reachable from both the publishing client and a browser.

Enumerate and fix a status for each: bad ID that never existed; expired past TTL; deleted for abuse; deleted under legal process; blocklist hash match; grant expired with no object; declared size over cap at grant time; publish rate limited; mint rate limited; **per-object download cap exhausted**; egress kill switch engaged; malformed renderer class or client name; unknown container version (client-side, no status); decryption failure (client-side).

Three of these are genuinely hard and must be reasoned, not assigned:

- **Cap exhaustion is where two locked constraints collide.** It is not a rate limit (waiting never helps) and not a resource that is gone (the object exists). The natural status is `403`, which is forbidden. `410` treats it as terminal, which it is, but conflates it with deletion in every log and dashboard. `429` with a long retry-after is a lie the client will act on. A `200` with an error body breaks caching, monitoring, and uptime checks. **Pick one and state the cost you are accepting.**
- **Whether expired is distinguishable from never-existed depends on the ID entropy decision in `format.md`, and you must read that before answering.** Against a short ID, an informative `410` confirms an ID was real, letting an enumerator harvest a map of used IDs, which discloses publish volume and hands over the operator-conceded metadata in bulk. Against a full-entropy bearer-token ID, the distinction leaks nothing to anyone who does not already hold the URL. **Deciding these two independently produces the one bad combination.** Counter-pressure is real: a recipient clicking a dead link deserves to know whether it expired, was wrong, or was removed, and collapsing all three into "not found" produces exactly the "the link is dead" support stream the frame cited when it ruled out burn-after-reading. And the server never sees the fragment, so it can never tell a real recipient from a scanner.
- **Whether a takedown is disclosed as distinct from an expiry.** A publisher whose relic was removed in error needs to know it was removed, or they never appeal. Telling an abuser their campaign was caught is arguably a deterrent rather than a cost. This is a judgment call, not an engineering one. **Make it, or the error handler makes it by accident.**

Also decide: whether to use a machine-readable problem-detail format. Without a stable machine-readable code, the local publishing client string-matches on human-readable prose and breaks on the first copy edit to an error message.

State that the status must be correct **at the deployed edge**, not only in the application, because anything in front that sheds load has its own default status and that is what the client actually sees.

## 2. Mint placement and counting

- **The mint is never a side effect of serving `/{id}`.** Serve a static shell with no mint; the mint is a distinct request. **This single rule keeps every non-JavaScript crawler off both the open counter and the download cap**, it costs nothing, and it follows from the frame's own metric definition. Safe Links is documented to scan URLs before message delivery and is observed in the field as a `HEAD` with User-Agent `Go-http-client/1.1` that burns single-use tokens on live products. A `HEAD` to `/{id}` costs nothing once minting is separate.
- **Decide whether a refused mint counts as an open**, and its twin, **whether a repeated mint by the same IP within some interval counts.** Both inflate the metric's first clause, which already carries a permanent confound. The second is worse for interactive publishers, since a publisher self-checking on a phone typically loads the page more than once. `shape-inherited-constraints-from-frame` already flags the first; the second is its unflagged twin.
- **The status choice and the counter interact.** If cap-exhaustion and expiry share a status, the mint log cannot separate them afterward and no later query undoes it. **Specify the taxonomy and the counting rule together.**
- **`robots.txt` stops indexing, not fetching.** Slack documents that it does not honor `robots.txt`. State that no control rests on it, so no later station reads it as protection against fetches.
- **The 120-second post-publish exclusion window is anchored to publish time and is explicitly not a scanner filter.** A scanner's fetch is anchored to delivery time and the gap is unbounded, so a relic published at 09:00 and mailed at 14:00 draws its scan five hours outside the window. **Tuning the value cannot fix this, because the defect is in the anchor. Changing the anchor changes the frame's metric definition, so it is drift routing back to `frame`.** Name it; do not propose it.
- **The per-object cap trade must be stated with arithmetic, not left to be tuned after the first complaint.** One relic mailed to a 40-person distribution list inside a Defender tenant can draw 40 pre-delivery scans plus 40 time-of-click fetches. **A cap low enough to be a meaningful abuse control is high enough to break ordinary email distribution.** Both numbers are `shape`'s; the trade is yours to state.

## 3. Expiry, lifecycle, and time

- **A download that begins before expiry completes after it.** The app server is not in the data path and structurally cannot stop an in-flight transfer. State it plainly, or someone downstream writes "expired relics are not served" as if it were exact.
- **A signed URL minted just inside the ceiling is valid for its full lifetime past it.** Decide between clamping expiry to `min(url_validity, relic_expiry)` at mint (free, and it removes a class of ambiguity) and accepting the overhang and publishing it. The overhang is a term in the worst-case egress arithmetic the preconditions require.
- **The publishing client's clock is never trusted for anything.** Every timestamp feeding the TTL, the telemetry window, and the retention window is the app server's own, and that server's clock must be NTP-disciplined, because a skewed app server silently mis-enforces the TTL with no signal.
- **The lifecycle gap, the largest interval in the system.** Lifecycle granularity is days rounded to the next UTC midnight, and a config change takes up to 24 hours during which Google may still act on the old config. **Nothing is served in that gap**: the app server refuses to mint, no signed URL exists, and the bytes are unreachable though they exist. State it so nobody later "fixes" the gap by serving from the object's continued existence. Three consequences: the bytes are billable storage for the whole gap; **the ciphertext-hash scan must still cover objects inside the gap**, since a scan skipping expired objects leaves blocklisted content undetected precisely where the operator most wants a record; and any published byte-lifetime number must count TTL plus lifecycle lag plus the soft-delete window.
- **Deleted does not mean erased.** Soft delete is on by default at seven days, soft-deleted objects cannot be read or modified, and objects deleted by lifecycle land in the same state. Deletion stops serving immediately, which is the half that answers an abuse notice. **Do not write a contract that promises erasure.** Note the precondition reason it is still a bucket-creation-time decision: a policy change only reaches objects deleted after it takes effect, so setting it late leaves a tail nobody can retroactively clear.
- **The delete-mint race.** A mint succeeds a moment before a delete, then the fetch hits a deleted object. **Required: a fetch failing not-found after a successful mint renders as "this relic is no longer available," never as a decrypt failure**, or the viewer attributes a takedown to a bad key and the recipient blames the sender.

## 4. Delete-by-ID and the abuse surface

- **The delete endpoint carries an operator credential, and this needs saying.** It is the only authenticated surface in a product whose first locked non-goal is "no identity anywhere in the product," and someone will read that non-goal as forbidding an operator credential. It does not: the non-goal bounds the product surface, not the operator's tooling. **The safe-looking misreading produces a token-in-an-env-var deletion script with no audit trail, under exactly the time pressure the preconditions describe.**
- **Delete means delete the object and tombstone the row.** The preconditions require both that the object stops being served and that upload IP plus timestamp survive to answer law enforcement. **Deleting both destroys the record the abuse process depends on, and it is the obvious implementation.** The tombstone is also what makes any `410` answer possible.
- **Hash before delete.** The blocklist hash is computed over the object after it lands. A delete that does not first capture the hash permanently loses the ability to blocklist that payload, and it is by then the payload you most want blocklisted. **Decide whether delete automatically blocklists or whether it is a second call; if it is a second call, it will be forgotten at 3am.**
- **Delete idempotency.** Operators retry. A `404` on a second delete makes "already handled" indistinguishable from "wrong ID" under a project-level suspension clock.
- **Bulk delete by publishing IP and time window.** Real abuse notices are about campaigns, not single objects, and the preconditions retain IP plus timestamp specifically so the operator can answer them. **Without bulk delete the operator hand-loops an endpoint never designed for it, and the per-IP limiter may throttle their own tooling.**
- **The abuse form must strip the fragment, client-side and server-side.** A reporter will paste the entire URL. Storing it puts the decryption key in the operator's hands and converts "we structurally cannot read it" into "we chose not to," which directly undermines the plausible-deniability posture the preconditions list as unresolved and lawyer-bound. Note the mechanic: pasting into the *address bar* is harmless, the exposure is the textarea. The published policy asks for the relic ID only. **The email alias cannot be defended this way and is a stated residual, not a solved problem.**
- **The form's required fields**, including the legal-versus-abuse distinction that decides the status question in section 1, and whether it works without JavaScript, since a report from a hardened browser is still a report.
- **The published SLA in hours is an external commitment** shown to reporters and potentially to Google's abuse process. It is a value `shape` sets; say so and say what it must account for.
- **State the coverage limit plainly**, as the preconditions already do: the SLA measures responsiveness on reports **received**, never coverage, because the operator cannot inspect content and there is no denominator. A month of zero reports is either a clean service or a dead intake and from the inside they are identical.

# Route to `shape`

Name each with what `shape` must choose: the exact status codes; the per-object cap value with the scanner arithmetic stated; the TTL ceiling and which lifecycle regime it lands in; the signed-URL validity window; **the retention window relative to the TTL, which must be set together with it, because a retention window shorter than the TTL silently stops the metric's publishing-IP filter firing on older relics**; the published SLA; whether a refused or repeated mint counts as an open.

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji.

# Completion criteria

1. `test -f docs/spec/service.md` exits 0.
2. `test "$(wc -w < docs/spec/service.md)" -ge 1800` exits 0. A floor against a stub, not a target. Do not pad.
3. Manifest has at least five sources, one per line, trailing newline.
4. Every source resolves. **Do not invent citations.** Orphan check both directions.
5. Every item in "What this document must decide" is resolved into a stated rule or routed to `shape`.
6. The status taxonomy is complete, single, and states the cost accepted on cap exhaustion.
7. The expired-versus-never-existed decision explicitly references the ID entropy decision in `docs/spec/format.md` and is consistent with it.
8. The document states that the mint is never a side effect of serving `/{id}`.
9. The document states that delete tombstones the row rather than removing it, and that the hash is captured before deletion.
10. The document states that the abuse form strips the fragment client-side and server-side, and that the email alias is a residual.
11. The document states that the 120-second window is anchored to publish and is not a scanner filter, and that changing the anchor is drift routing to `frame`.

# Files touched

- `docs/spec/service.md`, `docs/spec/service.sources.txt` (create)

# Out of scope

- The URL, ID, and container format. Locked by `docs/spec/format.md`, your input. **Its ID entropy decision is an input to your section 1; do not re-decide it.**
- The MCP tool and publish contract. Sibling `spec-publish-contract`. You fix the status taxonomy; that sibling maps publish failures onto it.
- What the viewer *shows* for each state, rendering, routing, the sandbox. Sibling `spec-viewer`. You fix the states and their statuses; that sibling fixes the screens.
- Any numeric value, the stack, and all implementation.
- Abuse-report UI design. State the requirement, not the interface.
