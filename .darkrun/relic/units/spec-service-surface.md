---
name: Specify the status taxonomy, expiry semantics, mint rules, and the abuse surface
unit_type: doc
status: in_progress
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
branch: darkrun/relic/units/specify/spec-service-surface
started_at: 2026-07-30T06:46:17.115603+00:00
iterations:
- worker: spec_writer
  started_at: 2026-07-30T06:46:17.115603+00:00
  completed_at: 2026-07-30T06:46:17.115603+00:00
  result: advance
  note: |-
    `docs/spec/service.md` (4808 words) and `docs/spec/service.sources.txt` (19 URLs) committed at `6e74350` on the unit branch. Worktree clean.

    **Gates reported by the beat:** exists 0; floor 0 at 4808 against 2800; 19 sources against a floor of 5; urls exit 0; zero em-dashes or en-dashes; trailing newline present. The beat ran the orphan check itself with `comm`, found two orphaned manifest entries (GCP AUP and RFC 6585), and **fixed them by adding real cited claims rather than deleting the sources**, which is the right direction. Remaining regex hits are the placeholder `https://<relic-domain>/problems/` and Microsoft's own verbatim `https://<DataCenterLocation>.safelinks.protection.outlook.com`, both quoted format text rather than citations.

    **Sibling input read via `git show darkrun/relic/units/specify/spec-relic-format:docs/spec/format.md`**, the fallback rung the manager verified in advance. The station ref still does not resolve. The ID entropy dependency checks out: it quotes `format.md` 1.2's "The ID carries full bearer-token entropy... it is unguessable, not merely unique" and the clause naming the consequence for this unit directly, and cites the section rather than re-deciding it.

    ## The three reasoned status decisions

    - **Cap exhaustion: `410 download_cap_exhausted`.** The cap has no reset window, so the relic is terminal for its remaining life, making RFC 9110's "no longer available at any location" literally true. **Cost accepted and stated:** cap exhaustion, expiry, and all three deletion flavors share one status, so no status-grouped view separates them and no later query undoes it. Paid for with a hard rule that the mint log records `code` and not only status, and that every dashboard, alert, and abuse metric keys on `code`.
    - **Expired versus never-existed: distinguished.** `410 relic_expired` against `404 relic_not_found`, resting on the full-entropy ID. Stated limit: the informative `410` is served to scanners too, which costs nothing because a scanner holding the ID already had the URL.
    - **Takedown disclosure: the fact is disclosed, the reason is not.** Abuse, legal process, and blocklist match all return `410 relic_removed`, with the reason class recorded privately on the tombstone. Decided here, not routed, per criterion 15.

    ## The mint response field set, for `spec-viewer`

    `url`, `url_expires_at`, `relic_expires_at`, `object_length`, `object_crc32c`, `mints_remaining`. Two expiry fields because either can outlive the other. **Explicitly excluded:** filename, declared mimetype, renderer class (barred by `format.md` 3.2 and 3.6), and the format version (lives in the fragment, so a second copy could only disagree).

    **This independently reconciles with `spec-viewer`**, which was written in parallel and asked for the URL, its absolute expiry, object length, CRC32C, and a machine-readable refusal reason. This set is a superset of that ask. The two units converged without coordination, which is the decomposition working.

    ## The error shape, for `spec-publish-contract`

    RFC 9457 `application/problem+json`, standard members plus **every field a client extracts:** `code`, `retry_after_seconds`, `size_limit_bytes`, `declared_size_bytes`, `size_basis`, `relic_id`, `download_cap`, `report_url`. `code` is the bare token and `type` is the problems URL plus `code`, generated from one table so they cannot disagree. `size_basis` is `plaintext` or `ciphertext`, and it exists because `format.md` 3.11 requires the published number be a plaintext number while `shape` picks the enforced side. Ten codes over twelve cases, since the three deletion cases share `relic_removed`. Edge degradation specified: a bare `429` reads as the endpoint's rate-limit code, a bare `503` as `service_paused`.

    ## Where the adversary should push

    Eight judgment calls, surfaced rather than buried. Two are potentially serious and the adversary was pointed at both first.

    1. **It fixed every status value AND routed "the exact status values" to `shape`.** It reports its two instructions genuinely conflicted, resolved in favor of fixing them, and narrowed the route item to edge fidelity. This is either a criterion 5 violation, a criterion 6 satisfaction, or an incoherence that must resolve one way. Most consequential item.
    2. **It widened the 401/403 ban from rate limiting to every public endpoint**, scoping an exception for the operator admin prefix. The preconditions lock it **only** for rate limiting. The beat calls this a tightening rather than a loosening, which is fair, but **a tightening of a locked constraint is still a modification of locked material**, and that is drift unless it survives scrutiny.
    3. **`413` for size-over-cap is admitted as a stretch.** RFC 9110 defines `413` in terms of request content, and the grant request's content is small; what is oversized is the declared object. `403` fits better and is banned. The beat took `413` and said so plainly.
    4. **Case 6, grant expired with no object, got `410` rather than `404`**, justified by the server never overwriting so the ID is permanently spent.
    5. **Dedup applies to the open counter but not the download cap.** Neither locked document says. Reasoning: the preconditions' worst-case egress arithmetic collapses if a successful mint returns a usable URL without consuming cap.
    6. **Delete blocklists automatically only for `abuse` and `blocklist_match`**, not legal process, so a legal takedown of lawful content does not poison the blocklist.
    7. **Retention published per sink rather than as one number**, on the judgment that a single figure is the claim that goes false first.
    8. **A new sourced observation, stated as a caveat and not a change:** a URL disallowed in `robots.txt` never has its indexing rules read, so the locked `X-Robots-Tag: noindex` does its work on fetchers that ignore the disallow rather than on Googlebot. Both controls ship exactly as locked; only the interaction is named.

    **Two claims the beat correctly attributed rather than overstated.** The `Go-http-client/1.1` HEAD observation rests on an Authelia issue, a practitioner report, attributed as observed rather than documented. And it reports reading the Safe Links and Proofpoint pages itself to confirm the **negative** claim that neither documents fragment handling. Negative claims resting on a single reader are exactly what the adversary beat exists to double-check, and it was told so.

    ## On word count

    4808 against a 2460 to 3485 band, treated as guidance rather than a ceiling per the precedent set when `format.md` landed at 5365. The beat attributes the overage to the twelve-case table, the reasoning on each contested status, and 15 inline citations. The adversary was asked to test that rather than accept it.
reviews:
  completeness:
    at: 2026-07-30T05:31:07.501358+00:00
  testability:
    at: 2026-07-30T05:14:48.190501+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/spec/service.md
- name: substance-floor
  command: test "$(wc -w < docs/spec/service.md)" -ge 2800
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/spec/service.sources.txt); test "$n" -ge 5'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/service.sources.txt'
---

# Goal

Write `docs/spec/service.md`: the status taxonomy, expiry and lifecycle semantics, when a mint happens and what counts as an open, the delete-by-ID and abuse surface, and the published disclosure statement. Plus `docs/spec/service.sources.txt`, one URL per line, trailing newline.

**Read first:** `darkrun_knowledge_list` in full, especially `gcs-soft-delete-and-what-deletion-actually-means`, `abuse-liability-of-hosting-uninspectable-content`, `redirects-inherit-the-fragment-and-leak-the-key`, `agent-mediated-key-delivery-leaks-to-the-transcript`, `mcp-protocol-2026-07-28-constraints`, and `shape-inherited-constraints-from-frame`.

Then read, from the repo root (**do not `cd` into a subdirectory**, `git ls-tree` scopes to the prefix):

- `docs/frame.md` and `docs/preconditions.md`, the **locked** upstream artifacts. Both are on this station's branch, so they are in your worktree. **Do not run `git show darkrun/relic/frame:...`**; that ref no longer exists locally and exits 128.
- `docs/spec/format.md`, your declared sibling input. **Its ID entropy decision determines several answers here**, so read it before writing section 1.

**If `docs/spec/format.md` is not in your worktree, stop and fetch it before writing section 1.** Worktree fork timing relative to a sibling's land is not guaranteed, and in the previous station a dependent unit's declared input was genuinely absent. Fall back in order:

```
git show darkrun/relic/specify:docs/spec/format.md
git show darkrun/relic/units/specify/spec-relic-format:docs/spec/format.md
```

**Never proceed by redefining what a sibling settles.** Report which path you used.

# Already decided. Do not relitigate.

- **Rate limiting returns `429`, never `401` or `403`.**
- **Open counts are taken at signed-URL mint time**, never from a viewer-side script.
- **Delete-by-ID works without the secret.** Deletion, not revocation, is the takedown primitive, because signed URLs cannot be revoked individually.
- **Abuse intake exists on day one**, from every relic page, at a stable `/abuse` URL, plus a published email alias, with a named human behind it. The preconditions make this the go/no-go.
- **The blocklist is detect-and-delete after the object lands**, never a check at the door.
- **Upload IP plus timestamp are retained with a published window**, per sink.
- **`robots.txt` disallow plus `X-Robots-Tag: noindex`**, asserted on a real relic path rather than the apex.
- **No accounts**, so every control keys on IP, proof of work, or nothing.

# What this document must decide

## 1. The status taxonomy

**One taxonomy for all callers.** A taxonomy that varies by caller is a bug generator, and the same endpoint may be reachable from both the publishing client and a browser.

**Scope note:** you own statuses for failures the **app server originates**. Failures on legs the app server is structurally not in (a purely local file error, the client-to-GCS upload leg, a storage-side refusal) have no app-server status and are owned by `spec-publish-contract`. Do not invent statuses for them, and do not let their absence read as an omission.

Enumerate and fix a status for each app-server-originated case: bad ID that never existed; expired past TTL; deleted for abuse; deleted under legal process; blocklist hash match; grant expired with no object; declared size over cap at grant time; publish rate limited; mint rate limited; **per-object download cap exhausted**; egress kill switch engaged; malformed renderer class or client name. **That is twelve cases, and the enumeration is the criterion 6 completeness bar.**

Three must be reasoned, not assigned:

- **Cap exhaustion is where two locked constraints collide.** Not a rate limit (waiting never helps) and not a resource that is gone (the object exists). The natural status is `403`, which is forbidden. `410` treats it as terminal, which it is, but conflates it with deletion in every log and dashboard. `429` with a long retry-after is a lie the client acts on. A `200` with an error body breaks caching, monitoring, and uptime checks. **Pick one and state the cost you accept.**
- **Whether expired is distinguishable from never-existed depends on the ID entropy decision in `format.md`. Read it first; do not re-decide it.** Against a short ID an informative `410` confirms an ID was real, letting an enumerator harvest a map of used IDs and the operator-conceded metadata in bulk. Against a full-entropy ID the distinction leaks nothing to anyone who does not already hold the URL. Counter-pressure is real: collapsing expired, wrong, and removed into "not found" produces exactly the "the link is dead" support stream the frame cited when it ruled out burn-after-reading. And the server never sees the fragment, so it can never tell a real recipient from a scanner.
- **Whether a takedown is disclosed as distinct from an expiry.** A publisher whose relic was removed in error needs to know it was removed, or they never appeal. Telling an abuser their campaign was caught is arguably a deterrent. **This is a judgment call, not a value, so decide it here. It is not in this unit's Route-to-`shape` list and routing it fails criterion 5.**

**Decide the machine-readable problem-detail format.** Without a stable machine-readable code, the local publishing client string-matches on human prose and breaks on the first copy edit. **`spec-publish-contract` depends on this unit, so the taxonomy must name every field a client extracts**, including the cap and actual size on a size rejection and the retry-after on a rate limit. State the shape well enough that `spec-publish-contract` can define matching codes for the legs you do not own.

State that the status must be correct **at the deployed edge**, not only in the application, because anything in front that sheds load has its own default status and that is what the client sees.

## 2. Mint placement, the mint response, and counting

- **The mint is never a side effect of serving `/{id}`.** Serve a static shell with no mint; the mint is a distinct request. **This single rule keeps every non-JavaScript crawler off both the open counter and the download cap**, costs nothing, and follows from the frame's own metric definition. Safe Links scans before message delivery and is observed as a `HEAD` with User-Agent `Go-http-client/1.1` that burns single-use tokens on live products.
- **You own the mint response's field set.** `spec-viewer` needs fields on it (an expiry so it can tell whether a still-valid URL can be reused, and possibly object length and CRC32C so transport corruption is separable from a wrong key). It states the need; you define the response.
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

**The frame conditions its telemetry trade on this document existing and being readable before publishing:** "Publishers must be able to see all of it in a published privacy statement before they publish." No other unit specifies it. **You own it.** Specify its required contents and that it is reachable before a first publish and from every relic page:

1. **The telemetry trade**: coarse renderer class, publishing client name, IP-correlated open activity, and what that moves the operator from and to.
2. **The transcript disclosure.** The publish tool must return the full URL including the fragment, so **the key enters the model's context and the session transcript on every publish.** Zero-knowledge holds against the Relic operator and does not hold against the model provider or transcript store. Structurally unfixable, because relaying the link is the product.
3. **The served-JavaScript caveat** the frame already locks: the decrypting code is served by the party the claim is made against, so it is a statement about operator intent rather than a recipient-verifiable property.
4. **The correct form of the fragment claim.** "The key never reaches a server" is wrong unqualified. The honest form is **"your browser never sends the key to Relic's servers."**
5. **Retention**: what is kept, per sink, for how long, and that deleted does not mean erased.

## 6. The key reaching a third party without Relic doing anything wrong

`spec-viewer` owns redirects **Relic itself issues**. **You own the cases where the key leaves via someone else**, which the fragment guarantee does not cover, because it is a statement about what a browser puts in a request, not about what a human pastes.

- **Link shorteners.** Pasting the full URL into a shortener's form transmits the key in a request body and stores it on that service. Nothing technical prevents it. Note the shortened link often still works, because the click-time redirect inherits the fragment, the same mechanism working in the user's favor.
- **Enterprise link rewriters.** Safe Links wraps URLs with the original as a query parameter; Proofpoint URL Defense encodes the original into the wrapper's path. **Neither documents what it does with a fragment.** Three outcomes are structurally possible: the `#` is percent-encoded into the wrapper and the key is transmitted to and logged by that vendor; it is left unencoded and stays on the wrapper, surviving to the relic via redirect inheritance; or it is dropped and the relic is un-openable in a way that looks exactly like a wrong key.
- **Mandate a pre-launch empirical test.** Publish a real relic, mail it through a Defender for Office 365 tenant, record what arrives. One message, and it settles an outcome no documentation states. **The disclosure statement's wording must be correct under all three outcomes until that test runs.**
- State that the Proofpoint fragment question belongs on the same unresolved list as the Proofpoint host-to-parent blocklist question already open in `docs/preconditions.md` section 5.

# Route to `shape`

Name each with what `shape` must choose: the exact status **values** (the taxonomy's shape and which cases are distinguishable are yours); the per-object cap value with the scanner arithmetic stated; the TTL ceiling and which lifecycle regime it lands in; the signed-URL validity window; **the retention window relative to the TTL, set together with it, because a retention window shorter than the TTL silently stops the metric's publishing-IP filter firing on older relics**; the published SLA in hours; whether a refused or repeated mint counts as an open.

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji.

# Completion criteria

1. `test -f docs/spec/service.md` exits 0.
2. `test "$(wc -w < docs/spec/service.md)" -ge 2800` exits 0. **Calibration:** this unit carries roughly 41 mandated items, including the twelve-case status enumeration in section 1, at an observed 60 to 85 words per item, so a compliant document lands between about 2460 and 3485 words. 2800 sits inside that band. **The floor is a stub guard, never a target**, and completeness here is carried by criteria 5 through 15, not by word count. If you are near the floor, check for skipped items before assuming you are short, and never pad to clear it.
3. Manifest has at least five sources, one per line, trailing newline.
4. Every source resolves. **Do not invent citations.** Orphan check both directions.
5. Every item in "What this document must decide" is resolved into a stated rule or routed to `shape` **with what `shape` must choose named. Routing is legitimate only for items named in this unit's own "Route to `shape`" section; routing anything else fails this criterion.**
6. The status taxonomy is complete for all twelve app-server-originated cases, single, and states the cost accepted on cap exhaustion.
7. The expired-versus-never-existed decision explicitly references the ID entropy decision in `docs/spec/format.md` and is consistent with it.
8. The document states that the mint is never a side effect of serving `/{id}`, and defines the mint response's field set.
9. The document states that delete tombstones the row rather than removing it, and that the hash is captured before deletion.
10. The document states that the abuse form strips the fragment client-side and server-side, and that the email alias is a residual.
11. The document states that the 120-second window is anchored to publish, is not a scanner filter, and that changing the anchor is drift routing to `frame`.
12. Section 5 specifies the published disclosure statement's required contents, all five items, and states it is reachable before a first publish.
13. Section 6 covers link shorteners and enterprise link rewriters, mandates the pre-launch Defender test, and states the three possible fragment outcomes.
14. **The error taxonomy names every field a publishing client must extract**, so `spec-publish-contract` can map onto it without matching prose, and states the code shape well enough for that sibling to define matching codes for the legs the app server is not in.
15. **The takedown-disclosure question is decided in this document, not routed.**

# Files touched

- `docs/spec/service.md`, `docs/spec/service.sources.txt` (create)

# Out of scope

- The URL, ID, and container format. Locked by `docs/spec/format.md`. **Its ID entropy decision is an input to section 1; do not re-decide it.**
- The MCP tool and publish contract. Sibling `spec-publish-contract`, which depends on this unit. **Failures on legs the app server is not in are its codes, not your statuses.**
- What the viewer *shows* for each state, rendering, routing, the sandbox. Sibling `spec-viewer`. You fix the states, their statuses, and the mint response; it fixes the screens. **Redirects Relic itself issues are its item, not yours.**
- Any numeric value, the stack, and all implementation.
- Abuse-report and disclosure-page UI design. State required content, not the interface.
