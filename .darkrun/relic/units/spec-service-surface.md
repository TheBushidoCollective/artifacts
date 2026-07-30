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

Write `docs/spec/service.md`: the status taxonomy, expiry and lifecycle semantics, when a mint happens and what counts as an open, the delete-by-ID and abuse surface, **and the published disclosure statement**. Plus `docs/spec/service.sources.txt`, one URL per line, trailing newline.

**Read first:** `darkrun_knowledge_list` in full, especially `gcs-soft-delete-and-what-deletion-actually-means`, `abuse-liability-of-hosting-uninspectable-content`, `redirects-inherit-the-fragment-and-leak-the-key`, `agent-mediated-key-delivery-leaks-to-the-transcript`, `mcp-protocol-2026-07-28-constraints`, and `shape-inherited-constraints-from-frame`.

Then, **in your own worktree** (both files are present there; do not use `git show`, and do not `cd` into a subdirectory since `git ls-tree` scopes to the prefix):

- `docs/frame.md` and `docs/preconditions.md`, the **locked** upstream artifacts. Inputs, not subjects.
- `docs/spec/format.md`, your declared sibling input. **Its ID entropy decision determines several answers here**, so read it before writing section 1.

# Already decided. Do not relitigate.

- **Rate limiting returns `429`, never `401` or `403`.** Claude Code marks a server as needing auth on either.
- **Open counts are taken at signed-URL mint time**, never from a viewer-side script.
- **Delete-by-ID works without the secret.** Deletion, not revocation, is the takedown primitive, because signed URLs cannot be revoked individually.
- **Abuse intake exists on day one**, from every relic page, at a stable `/abuse` URL, plus a published email alias, with a named human behind it. Preconditions make this the go/no-go.
- **The blocklist is detect-and-delete after the object lands**, never a check at the door.
- **Upload IP plus timestamp are retained with a published window**, per sink.
- **`robots.txt` disallow plus `X-Robots-Tag: noindex`**, asserted on a real relic path rather than the apex, because the header is per-response.
- **No accounts**, so every control keys on IP, proof of work, or nothing.

# What this document must decide

## 1. The status taxonomy

**One taxonomy for all callers.** A taxonomy that varies by caller is a bug generator, and the same endpoint may be reachable from both the publishing client and a browser.

Enumerate and fix a status for each: bad ID that never existed; expired past TTL; deleted for abuse; deleted under legal process; blocklist hash match; grant expired with no object; declared size over cap at grant time; publish rate limited; mint rate limited; **per-object download cap exhausted**; egress kill switch engaged; malformed renderer class or client name; unknown container version (client-side, no status); decryption failure (client-side).

Three must be reasoned, not assigned:

- **Cap exhaustion is where two locked constraints collide.** Not a rate limit (waiting never helps) and not a resource that is gone (the object exists). The natural status is `403`, which is forbidden. `410` treats it as terminal, which it is, but conflates it with deletion in every log and dashboard. `429` with a long retry-after is a lie the client acts on. A `200` with an error body breaks caching, monitoring, and uptime checks. **Pick one and state the cost you accept.**
- **Whether expired is distinguishable from never-existed depends on the ID entropy decision in `format.md`. Read it first; do not re-decide it.** Against a short ID an informative `410` confirms an ID was real, letting an enumerator harvest a map of used IDs, disclosing publish volume and handing over the operator-conceded metadata in bulk. Against a full-entropy ID the distinction leaks nothing to anyone who does not already hold the URL. Counter-pressure is real: collapsing expired, wrong, and removed into "not found" produces exactly the "the link is dead" support stream the frame cited when it ruled out burn-after-reading. And the server never sees the fragment, so it can never tell a real recipient from a scanner.
- **Whether a takedown is disclosed as distinct from an expiry.** A publisher whose relic was removed in error needs to know it was removed, or they never appeal. Telling an abuser their campaign was caught is arguably a deterrent. A judgment call, not an engineering one. **Make it, or the error handler makes it by accident.**

**Decide the machine-readable problem-detail format.** Without a stable machine-readable code, the local publishing client string-matches on human prose and breaks on the first copy edit. **`spec-publish-contract` depends on this unit precisely so it can map publish failures onto the taxonomy you fix here, so the taxonomy must name every field a client needs to extract**, including the cap and actual size on a size rejection and the retry-after on a rate limit.

State that the status must be correct **at the deployed edge**, not only in the application, because anything in front that sheds load has its own default status and that is what the client sees.

## 2. Mint placement and counting

- **The mint is never a side effect of serving `/{id}`.** Serve a static shell with no mint; the mint is a distinct request. **This single rule keeps every non-JavaScript crawler off both the open counter and the download cap**, costs nothing, and follows from the frame's own metric definition. Safe Links scans before message delivery and is observed as a `HEAD` with User-Agent `Go-http-client/1.1` that burns single-use tokens on live products.
- **Decide whether a refused mint counts as an open, and whether a repeated mint by the same IP within some interval counts.** Both inflate the metric's first clause, which already carries a permanent confound. The second is worse for interactive publishers, who typically load the page more than once.
- **The status choice and the counter interact.** If cap-exhaustion and expiry share a status, the mint log cannot separate them afterward and no later query undoes it.
- **`robots.txt` stops indexing, not fetching.** Slack documents that it does not honor `robots.txt`. State that no control rests on it.
- **The 120-second post-publish window is anchored to publish time and is explicitly not a scanner filter.** Scanner fetches are anchored to delivery, and the gap is unbounded. **Tuning the value cannot fix this because the defect is in the anchor, and changing the anchor changes the frame's metric definition, so it is drift routing back to `frame`.** Name it; do not propose it.
- **State the per-object cap trade with arithmetic.** One relic mailed to a 40-person list inside a Defender tenant can draw 40 pre-delivery scans plus 40 time-of-click fetches. **A cap low enough to be a meaningful abuse control is high enough to break ordinary email distribution.**

## 3. Expiry, lifecycle, and time

- **A download that begins before expiry completes after it.** The app server is not in the data path and structurally cannot stop an in-flight transfer.
- **A signed URL minted just inside the ceiling is valid for its full lifetime past it.** Decide between clamping to `min(url_validity, relic_expiry)` at mint and accepting the overhang and publishing it. The overhang is a term in the worst-case egress arithmetic.
- **The publishing client's clock is never trusted.** Every timestamp feeding TTL, the telemetry window, and the retention window is the app server's own, NTP-disciplined, because a skewed server silently mis-enforces the TTL with no signal.
- **The lifecycle gap.** Granularity is days rounded to next UTC midnight, and a config change takes up to 24 hours during which Google may act on the old config. **Nothing is served in that gap.** State it so nobody later "fixes" it by serving from the object's continued existence. Three consequences: the bytes are billable storage throughout; **the ciphertext-hash scan must still cover objects inside the gap**, since skipping expired objects leaves blocklisted content undetected exactly where a record is most wanted; and any published byte-lifetime number counts TTL plus lifecycle lag plus the soft-delete window.
- **Deleted does not mean erased.** Soft delete is on by default at seven days, soft-deleted objects cannot be read or modified, and lifecycle-deleted objects land in the same state. Deletion stops serving immediately, which is the half that answers an abuse notice. **Do not promise erasure.** It remains a bucket-creation-time decision because a policy change only reaches objects deleted after it takes effect, so setting it late leaves a tail nobody can clear.
- **The delete-mint race.** A fetch failing not-found after a successful mint renders as "this relic is no longer available," never as a decrypt failure, or the viewer attributes a takedown to a bad key and the recipient blames the sender.

## 4. Delete-by-ID and the abuse surface

- **The delete endpoint carries an operator credential, and this needs saying.** It is the only authenticated surface in a product whose first locked non-goal is "no identity anywhere in the product." The non-goal bounds the product surface, not the operator's tooling. **The safe-looking misreading produces a token-in-an-env-var script with no audit trail, under exactly the time pressure the preconditions describe.**
- **Delete means delete the object and tombstone the row.** The preconditions require the object to stop serving *and* upload IP plus timestamp to survive for law enforcement. **Deleting both destroys the record the abuse process depends on, and it is the obvious implementation.** The tombstone is also what makes any `410` possible.
- **Hash before delete.** A delete that does not first capture the hash permanently loses the ability to blocklist that payload, and it is by then the one you most want blocklisted. **Decide whether delete automatically blocklists or whether it is a second call; a second call gets forgotten at 3am.**
- **Delete idempotency.** A `404` on a second delete makes "already handled" indistinguishable from "wrong ID" under a project-level suspension clock.
- **Bulk delete by publishing IP and time window.** Real notices are about campaigns. Without it the operator hand-loops an endpoint never designed for it, and the per-IP limiter may throttle their own tooling.
- **The abuse form strips the fragment, client-side and server-side.** A reporter will paste the entire URL. Storing it puts the key in the operator's hands and converts "we structurally cannot read it" into "we chose not to," undermining the plausible-deniability posture the preconditions list as lawyer-bound. Pasting into the *address bar* is harmless; the exposure is the textarea. The published policy asks for the relic ID only. **The email alias cannot be defended this way and is a stated residual.**
- **The form's required fields**, including the legal-versus-abuse distinction that decides a status in section 1, and whether it works without JavaScript.
- **The published SLA in hours is an external commitment**, a value `shape` sets. Say what it must account for.
- **State the coverage limit plainly:** the SLA measures responsiveness on reports **received**, never coverage, because the operator cannot inspect content and there is no denominator. A month of zero reports is either a clean service or a dead intake, and from the inside they are identical.

## 5. The published disclosure statement

**The frame conditions its telemetry trade on this document existing and being readable before publishing:** "Publishers must be able to see all of it in a published privacy statement before they publish." No other unit specifies it. **You own it.** Specify what it must contain and that it is reachable before a first publish and from every relic page.

It must carry, at minimum:

1. **The telemetry trade**: coarse renderer class, publishing client name, IP-correlated open activity, and what that moves the operator from and to.
2. **The transcript disclosure.** The publish tool must return the full URL including the fragment, so **the key enters the model's context and the session transcript on every publish.** Zero-knowledge holds against the Relic operator and does not hold against the model provider or transcript store. Structurally unfixable, because relaying the link is the product.
3. **The served-JavaScript caveat** the frame already locks: the decrypting code is served by the party the claim is made against, so it is a statement about operator intent rather than a recipient-verifiable property.
4. **The correct form of the fragment claim.** "The key never reaches a server" is wrong as an unqualified statement. The honest form is **"your browser never sends the key to Relic's servers."**
5. **Retention**: what is kept, per sink, for how long, and that deleted does not mean erased.

## 6. The key reaching a third party without Relic doing anything wrong

`spec-viewer` owns redirects **Relic itself issues**. **You own the cases where the key leaves via someone else**, which the fragment guarantee does not cover because it is a statement about what a browser puts in a request, not about what a human pastes.

- **Link shorteners.** A user pasting the full URL including the fragment into a shortener's form transmits the key in a request body and stores it on that service. Nothing technical prevents this. Note the shortened link often still works, because the click-time redirect inherits the fragment, which is the same mechanism working in the user's favor.
- **Enterprise link rewriters.** Microsoft Safe Links wraps URLs with the original as a query parameter; Proofpoint URL Defense encodes the original into the wrapper's path. **Neither documents what it does with a fragment.** Three outcomes are structurally possible: the `#` is percent-encoded into the wrapper and the key is transmitted to and logged by that vendor; it is left unencoded and stays on the wrapper, surviving to the relic via redirect inheritance; or it is dropped and the relic is un-openable in a way that looks exactly like a wrong key.
- **Required: mandate a pre-launch empirical test.** Publish a real relic, mail it through a Defender for Office 365 tenant, and record what arrives. It is one message and it settles an outcome no documentation states. **The disclosure statement's wording must be correct under all three outcomes until that test runs.**
- State that the Proofpoint fragment question belongs on the same unresolved list as the Proofpoint host-to-parent blocklist question already open in `docs/preconditions.md` section 5.

# Route to `shape`

Name each with what `shape` must choose: the exact status codes; the per-object cap value with the scanner arithmetic stated; the TTL ceiling and which lifecycle regime it lands in; the signed-URL validity window; **the retention window relative to the TTL, set together with it, because a retention window shorter than the TTL silently stops the metric's publishing-IP filter firing on older relics**; the published SLA; whether a refused or repeated mint counts as an open.

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji.

# Completion criteria

1. `test -f docs/spec/service.md` exits 0.
2. `test "$(wc -w < docs/spec/service.md)" -ge 2200` exits 0. A floor against a stub, not a target. Do not pad.
3. Manifest has at least five sources, one per line, trailing newline.
4. Every source resolves. **Do not invent citations.** Orphan check both directions.
5. Every item in "What this document must decide" is resolved into a stated rule or routed to `shape`.
6. The status taxonomy is complete, single, and states the cost accepted on cap exhaustion.
7. The expired-versus-never-existed decision explicitly references the ID entropy decision in `docs/spec/format.md` and is consistent with it.
8. The document states that the mint is never a side effect of serving `/{id}`.
9. The document states that delete tombstones the row rather than removing it, and that the hash is captured before deletion.
10. The document states that the abuse form strips the fragment client-side and server-side, and that the email alias is a residual.
11. The document states that the 120-second window is anchored to publish, is not a scanner filter, and that changing the anchor is drift routing to `frame`.
12. **Section 5 specifies the published disclosure statement's required contents, including all five items listed, and states it is reachable before a first publish.**
13. **Section 6 covers link shorteners and enterprise link rewriters, mandates the pre-launch Defender test, and states the three possible fragment outcomes.**
14. **The error taxonomy names every field a publishing client must extract**, so `spec-publish-contract` can map onto it without string-matching prose.

# Files touched

- `docs/spec/service.md`, `docs/spec/service.sources.txt` (create)

# Out of scope

- The URL, ID, and container format. Locked by `docs/spec/format.md`. **Its ID entropy decision is an input to section 1; do not re-decide it.**
- The MCP tool and publish contract. Sibling `spec-publish-contract`, which depends on this unit. You fix the taxonomy; it maps publish failures onto it.
- What the viewer *shows* for each state, rendering, routing, the sandbox. Sibling `spec-viewer`. You fix the states and statuses; it fixes the screens. **Redirects Relic itself issues are its item, not yours.**
- Any numeric value, the stack, and all implementation.
- Abuse-report and disclosure-page UI design. State required content, not the interface.
