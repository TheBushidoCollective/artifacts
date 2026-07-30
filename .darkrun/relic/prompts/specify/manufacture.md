
> **Run** `relic` · **Station** `specify` · **Phase** `manufacture`

> Eliminates: _ambiguity_


# Manufacture — `specify`

This is the build floor. You run the **Pass loop** — _Plan → Make → Challenge → Resolve_ — over the wave-ready Units. The current beat is **spec_writer**, on model **sonnet**.


**Contract**

- Do exactly the work this action describes — no more, no less. Don't skip ahead to a later phase.
- Treat the locked artifact (`spec.md`) as the source of truth. Read it before you act; never silently rewrite a locked decision.
- Every claim you make must be backed by something you actually ran, read, or wrote. No assumed results.
- Be specific and committed. **No placeholders** — a `TBD`, `similar to …`, `add error handling`, `etc.`, or `…` is a hole, not a decision; name the actual, checkable condition. **No hedging** — when you report work done, use a verb of completed action (`added`, `implemented`, `fixed`), never `should`, `seems`, `probably`, `might`, or `looks like`. Hedging is the tell of unfinished work.
- When the action is finished, record your output where the station expects it, then call `darkrun_tick` again for the next instruction. The manager — not you — decides what comes next.



**Explorers** (2): `contract`, `edge_case`


**Workers** (3): `spec_writer` → `adversary` → `tightener`


**Reviewers** (2): `testability`, `completeness`


## This wave


Dispatch the **spec_writer** beat in parallel across these wave-ready Units:

- `spec-service-surface`

- `spec-viewer`




## Each Unit's spec — the contract the beat works against

The subagent you dispatch for a Unit gets **no context beyond what you hand it**. Pass the Unit's spec below into its dispatch verbatim — the completion criteria with their verify commands, the declared paths, and the scope boundary are the contract the beat is judged against.

### `spec-service-surface` — Specify the status taxonomy, expiry semantics, mint rules, and the abuse surface

- **inputs:** `docs/spec/format.md`


- **outputs:** `docs/spec/service.md`, `docs/spec/service.sources.txt`


- **quality gates:** artifact-exists — `test -f docs/spec/service.md` · substance-floor — `test "$(wc -w < docs/spec/service.md)" -ge 2800` · sources-manifest-populated — `bash -c 'set -eu; n=$(grep -c . docs/spec/service.sources.txt); test "$n" -ge 5'` · every-cited-url-resolves — `bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/service.sources.txt'`


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

### `spec-viewer` — Specify viewer routing, rendering, the sandbox boundary, and every recipient screen

- **inputs:** `docs/spec/format.md`


- **outputs:** `docs/spec/viewer.md`, `docs/spec/viewer.sources.txt`


- **quality gates:** artifact-exists — `test -f docs/spec/viewer.md` · substance-floor — `test "$(wc -w < docs/spec/viewer.md)" -ge 2600` · sources-manifest-populated — `bash -c 'set -eu; n=$(grep -c . docs/spec/viewer.sources.txt); test "$n" -ge 6'` · every-cited-url-resolves — `bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/viewer.sources.txt'`


# Goal

Write `docs/spec/viewer.md`: how the viewer routes, renders, isolates, and what every recipient sees in every state. Plus `docs/spec/viewer.sources.txt`, one URL per line, trailing newline.

**This unit owns all four key-disclosure paths found in discovery.** Each is a case where every component behaves correctly and an unspecified boundary lets the decryption key walk out. Write rules, not descriptions.

**Read first:** `darkrun_knowledge_list` in full, especially `renderer-class-is-a-security-boundary-not-a-label`, `rendering-untrusted-content-origin-isolation`, `redirects-inherit-the-fragment-and-leak-the-key`, `sandbox-csp-decision-and-what-the-wedge-actually-is`, and `browser-crypto-and-large-file-constraints`.

Then read, from the repo root (**do not `cd` into a subdirectory**, `git ls-tree` scopes to the prefix):

- `docs/frame.md` and `docs/preconditions.md`, the **locked** upstream artifacts. Both are on this station's branch, so they are in your worktree. **Do not run `git show darkrun/relic/frame:...`**; that ref no longer exists locally and exits 128.
- `docs/spec/format.md`, your declared sibling input, which settles the container and fragment. **Do not redefine either.**

**If `docs/spec/format.md` is not in your worktree, stop and fetch it before writing anything that depends on it.** Worktree fork timing relative to a sibling's land is not guaranteed, and in the previous station a dependent unit's declared input was genuinely absent. Fall back in order:

```
git show darkrun/relic/specify:docs/spec/format.md
git show darkrun/relic/units/specify/spec-relic-format:docs/spec/format.md
```

**Never proceed by redefining what a sibling settles.** Report which path you used.

# Already decided. Do not relitigate.

- **Untrusted content renders on a separate registrable origin**, never the one holding the fragment.
- **Never both `allow-scripts` and `allow-same-origin`.**
- **The viewing origin carries no third-party scripts, no analytics, no error reporting.** Two traps: **a bundled first-party-served SDK satisfies `script-src 'self'` and presents no external host to scan for**, so neither a CSP fetch nor a third-party-host scan catches it (Sentry's browser SDK is exactly that shape); and **the run's telemetry decision is not license to add a viewer-side script**, since all three telemetry items are collected server-side at publish and at mint.
- **The sandbox CSP blocks outbound requests**, matching Artifacts. Decided at this station.
- **First release renders exactly `{markdown, code, html, image}`.** Everything else is download-only.

# What this document must decide

## 1. Routing, and the four disclosure paths

- **The class never routes.** The renderer class is a *publisher assertion*. If the viewer routes on it, a publisher declares `image` on an HTML payload and wins inline rendering on the origin holding the fragment. That is the fragment-stealing attack in one step. **Publisher-attestation inside the ciphertext does not fix it**: attestation defeats operator forgery and does nothing about a publisher lying. State the reasoning, because an earlier version of the recorded knowledge got this wrong and someone will re-derive it.
- **Routing comes from magic-byte sniffing after decryption, as a hint that can only reach a less privileged path.** Privilege order, least to most: download-only, sandbox origin, viewing origin.
- **The disagreement rule.** When declared and sniffed types disagree, route to the **least privileged path either type would allow**, and tell the recipient the contents do not match the name. One sentence, and it closes the polyglot class for the first release.
- **Sniffing cannot decide for half the wedge, and this is the hardest question in the unit.** Markdown, plain text, source code, CSV, and JSON have no magic numbers, so the sniff returns nothing for `{markdown, code}`. **State the rule that routes them given the class cannot be trusted and the sniff is silent.** Criterion 13 forbids deferring this to `shape`.
- **SVG is download-only in the first release.** No magic number, sniffs as XML or text, inert under `Content-Disposition: attachment` and inside `<img src>` while executing fully inline, as `<object>`, or on direct navigation. A spec saying "still images render inline" without carving out SVG ships the CVE.
- **Blob URLs inherit the creating origin.** Never navigate to or open a blob URL built from untrusted plaintext on the viewing origin. Download blobs are typed `application/octet-stream` regardless of the container's declaration, triggered via `a[download]`. Images render only via `<img src=blob:>`.
- **Every redirect Relic issues carries an explicit, possibly empty, fragment in `Location`.** RFC 9110 §10.2.2 makes fragment inheritance mandatory browser behavior and §17.11 names it as cross-site disclosure. **One fragment-less redirect to the sandbox origin hands it the key.** Enumerate where it bites: HTTP to HTTPS, apex to www, service origin to sandbox origin, legacy paths, trailing-slash normalization, and any CDN or load-balancer redirect the application does not author. That last is the one nobody audits. **Redirects and rewrites performed by third parties are `spec-service-surface`'s item, not yours.**
- **`Referrer-Policy: no-referrer` on the viewing origin**, and no code path writes the fragment to the console, to storage, or into an error object.

## 2. The sandbox origin's shape

**Nobody has decided whether the sandbox is one fixed origin or a per-relic subdomain, and several rules rest on the answer.** `rendering-untrusted-content-origin-isolation` prescribes a unique cross-site domain per piece of content under a Public-Suffix-List-registered parent, isolating relics from each other rather than only from the app. The preconditions fix two registrable domains, compatible with either answer.

Decide, and state the consequences:

- **A single fixed sandbox origin.** Simplest. Relic A's rendered content shares an origin with relic B's, so one malicious relic can reach another's rendered document if both are open. The parent's `targetOrigin` is a constant.
- **A per-relic subdomain.** Isolates relics from each other. The parent computes `targetOrigin` per render; the shim's expected parent origin remains a hardcodable constant. **Requires Public Suffix List registration of the sandbox parent.**
- Repeat the preconditions' honest limit: treat PSL as origin isolation with a possible listing-scope benefit, never as a guaranteed firewall.

## 3. Rendering each class

- **Markdown is a partial HTML class**, because Markdown permits raw inline HTML, so rendering it on the viewing origin puts sanitizer output next to the fragment. DOMPurify has been bypassed at **default configuration** as recently as CVE-2026-41238 (3.0.1 through 3.3.3). **Decide here, do not route:** strip raw HTML entirely in the first release, or render Markdown on the sandbox origin like HTML. **The second choice changes the sandbox origin's role from "HTML only" to "all rich text," which changes the `postMessage` surface and how much of the viewer lives on which domain.** Pin DOMPurify at or above 3.4.0 regardless, and state that sanitization is the second layer, never the only one.
- **Markdown link and image targets are attacker-controlled**: `javascript:`, `data:`, remote images. A remote image is both an exfiltration channel and a beacon revealing a specific relic was opened. Under the locked strict CSP they fail to load, so **the viewer explains why rather than showing silent broken-image icons that read as a corrupt file.**
- **Code and plain text, two traps.** Syntax highlighters take a language hint usually derived from the attacker-controlled extension, and some build HTML by string concatenation: build output as DOM text nodes or sanitize it like Markdown, and fall back to plain text on an unrecognized hint. Separately, a code file can be many megabytes on one line, which hangs the highlighter and freezes the tab: cap the highlighted region and render the remainder as plain text behind a stated cutoff.
- **Where security headers actually matter.** The object fetch goes client-to-GCS on a signed URL, so the app server cannot set headers on it, and what GCS serves is ciphertext, unsniffable into anything executable. **The controls that matter are the viewing origin's own responses and the blob URLs the viewer creates.**

## 4. The sandbox boundary

- **Direction is forced, not chosen.** The main origin fetches, decrypts, and posts plaintext to a static shim that never touches ciphertext or the network. The alternative would require the key to cross, which must never happen. State it as forced, because the other shape is what someone reaches for to avoid posting large payloads across a boundary.
- **What crosses.** Parent to shim: decrypted bytes, the routing type, a render nonce. Never the key, never the fragment, arguably never the relic ID. Shim to parent: a `ready` handshake, a rendered-or-failed ack, optionally a requested height. **A requested-height channel is a message type an attacker also gets to send**, so say what the parent does with untrusted numbers.
- **The handshake.** The shim posts a data-free `ready` to `parent` with `targetOrigin: '*'`; the parent replies with the payload and an **exact** `targetOrigin`; the shim pins `event.origin` from that reply. **The `'*'` is safe only because the ready message carries nothing. The payload message must never use `'*'`**, since that hands the whole plaintext to whatever occupies the frame.
- **Transfer, do not copy.** Post plaintext as a transferable `ArrayBuffer`; structured-cloning doubles memory on exactly the large payloads the wedge exists to carry.
- **Mandate the `Content-Security-Policy: sandbox` header on the shim's own response**, not merely the iframe attribute, because the header cannot be stripped by the framed document.
- **The main origin materializes the download Blob**, never the sandbox.
- **The taskbar and content are on different origins by construction**, so the content iframe is never full-viewport and a relic authored to fill the screen renders letterboxed. Product-visible; state it before someone finds it in review.
- **The recipient-visible consequence.** An HTML relic cannot navigate the top-level window, open popups, or load external resources. **Present the sandbox as deliberate**, or the recipient concludes the relic is corrupt and the publisher concludes the product is broken.

## 5. Platform ceilings and degradation

- **Secure context first.** `crypto.subtle` is `undefined` outside a secure context, so check `window.isSecureContext` and `crypto.subtle` before anything else and show a specific named error. Not only a dev concern: a recipient behind a TLS-terminating proxy serving plain HTTP hits it in production.
- **Refuse before allocating.** A single `subtle.decrypt` on a large buffer freezes the tab, with practical failure reported at 500 to 800 MB. **Plaintext size is computable from encrypted size without decrypting**, so compare against a platform ceiling before touching memory. The tab must never die.
- **Three tiers, and say which platform gets which**: streaming decrypt to disk via ServiceWorker; in-memory decrypt then Blob download, capped at a memory ceiling; refuse with a named reason and a concrete alternative. **iOS Safari and mobile lack the service-worker fetch support the streaming path needs**, which capped hat.sh at 1 GB, and Safari lacks `for await` on `ReadableStream`, so the Safari path is a distinct code path using `getReader()` loops.
- **Degraded render.** The four renderable classes may render a truncated prefix behind an explicit banner stating it is truncated and why; download-only classes refuse instead.
- **The hard size cap value determines whether this tiering is required at all.** It is named in this unit's Route-to-`shape` list, so routing it is legitimate.

## 6. Every screen the recipient sees

- **Five states the viewer must handle, of which three are distinguishable and two are not.** Missing or malformed fragment; server refused to mint with a stated reason; decrypt failed. **A wrong key and a corrupted download both throw `OperationError` and are genuinely indistinguishable at the API level**, which is why they collapse into the third screen. Name both plausible causes in the copy, offer a retry because the retry is itself the discriminator, and never blame the recipient.
- **Separating corruption from a wrong key is possible with a facility that already exists.** GCS records a CRC32C on every object. Rightly rejected as a blocklist hash, it is exactly right as a transport-integrity check. If the mint response carries object length and checksum, transport corruption becomes detectable and a wrong key becomes the clean residual. **State the need and the viewer behavior that follows from it; `spec-service-surface` owns whether those fields exist.** State it as an integrity check, not an authenticity one.
- **The unfurl card.** The fragment never reaches a server, so no unfurler can describe the content. **A blank card on an unfamiliar domain is the visual shape of a phishing link.** Serve deliberate Open Graph and Twitter Card metadata on `/{id}`, identical for every relic, saying what Relic is without pretending to describe the content. Serving it must not mint. Open Graph tags are not indexing and Slack documents that it ignores `robots.txt`, so there is no conflict with the noindex precondition; say so, or someone later removes the tags in the name of that rule.
- **Before decryption completes, everything except the content renders**: the branded taskbar, the service name, one line of plain-language explanation, the abuse-report link, and the privacy-statement link (`spec-service-surface` owns that statement's contents).
- **The honesty constraint applies hardest here.** "Nobody can read this but you" is an overclaim on the exact surface where a recipient is deciding whether to trust the domain.
- **Three named progress phases, never one indeterminate spinner**: fetching (network-bound, retryable, total known, so show bytes and total), decrypting (CPU-bound, not retryable, framing gives record boundaries so show real progress), rendering.
- **No key-entry field** on the viewing origin unless `shape` deliberately wants one, because it is a purpose-built phishing surface aimed at the system's only secret.
- **Every error screen is a relic page**, carrying the abuse-report and policy links.
- **Repeat opens.** Reuse a still-valid signed URL rather than minting per page load, and the mint response carries its own expiry so the viewer can tell whether reuse is valid. A PWA reopened from the home screen, a restored tab, a pull-to-refresh, and a back-forward navigation are each otherwise another mint and another counted open.
- **If `docs/spec/format.md` decided the viewer strips the fragment via `history.replaceState`, carry the consequence**: the recipient can no longer re-share from the address bar and a reload loses the key, so the viewer owes an explicit copy-link affordance backed by the in-memory key. Honor whichever way `format.md` decided.

# Route to `shape`

Name each with what `shape` must choose: platform memory ceilings and whether they are hardcoded or feature-detected (Apple publishes no per-tab ceiling, hat.sh's 1 GB is an empirical project decision, and the 500 to 800 MB band is a forum report, so say what the numbers rest on); **the hard size cap value**, which determines whether the section 5 tiering is required at all; the truncated-prefix size and the highlighted-region cap, both user-visible cutoffs the viewer states in its own copy; **PSL registration for the sandbox parent, with its lead time named**.

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji.

# Completion criteria

1. `test -f docs/spec/viewer.md` exits 0.
2. `test "$(wc -w < docs/spec/viewer.md)" -ge 2600` exits 0. **Calibration:** this unit carries roughly 43 mandated items at an observed 60 to 85 words per item, so a compliant document lands between about 2580 and 3655 words. 2600 sits at that band's bottom. **The floor is a stub guard, never a target**, and completeness here is carried by criteria 5 through 16, not by word count. If you are near the floor, check for skipped items before assuming you are short, and never pad to clear it.
3. Manifest has at least six sources, one per line, trailing newline.
4. Every source resolves. **Do not invent citations.** Orphan check both directions.
5. Every item in "What this document must decide" is resolved into a stated rule or routed to `shape`. **Routing is legitimate only for items named in this unit's own "Route to `shape`" section; routing anything else fails this criterion.**
6. The document states that the renderer class never routes, and why publisher-attestation does not make it safe.
7. The document states the least-privileged-path disagreement rule.
8. The document carves SVG out of inline image rendering explicitly.
9. The document states the blob-URL origin-inheritance rule and the `application/octet-stream` download rule.
10. The document states the fragment-in-`Location` rule for every redirect and enumerates where it bites.
11. The document states that `postMessage` carrying plaintext never uses `'*'`.
12. The document specifies three named progress phases and forbids a single indeterminate spinner.
13. **The document states a routing rule for `{markdown, code}`, which have no magic bytes. This may not be routed to `shape`.**
14. **The document decides whether the sandbox is one fixed origin or a per-relic subdomain, states the isolation consequence, and routes PSL registration to `shape` with its lead time named.**
15. **The document is consistent with `docs/spec/format.md` on whether the fragment is stripped from the address bar, and carries the copy-link consequence if it is.**
16. **The document decides the Markdown rendering origin (viewing origin with raw HTML stripped, or sandbox origin). This may not be routed to `shape`.**

# Files touched

- `docs/spec/viewer.md`, `docs/spec/viewer.sources.txt` (create)

# Out of scope

- The URL, ID, and container format. Locked by `docs/spec/format.md`.
- The MCP tool and publish contract. Sibling `spec-publish-contract`.
- Status codes, expiry semantics, delete-by-ID, abuse intake, mint placement, counting rules, the published disclosure statement, **the mint response's own field set**, and **third-party link shorteners and enterprise link rewriters**. Sibling `spec-service-surface`. You specify what the viewer *shows* for each state and the redirects Relic itself issues; where you need a field on the mint response, state the need and let that sibling define it.
- Any numeric value, the stack, and all implementation.
- Visual design. Specify what must be on screen and what it must say, never how it looks.




## Each Unit has its own worktree — work in it

Every wave Unit is isolated on its own branch + worktree, forked off the station branch. Run that Unit's beat **inside its worktree** so its diff never tangles with another Unit's in-flight work; the manager lands each Unit back onto the station branch when it locks. Do **not** commit a Unit's work to the station branch yourself.

- `spec-service-surface` → `/Users/jwaldrip/dev/src/github.com/thebushidocollective/artifacts/.darkrun/worktrees/relic/units/specify/spec-service-surface` (branch `darkrun/relic/units/specify/spec-service-surface`)

- `spec-viewer` → `/Users/jwaldrip/dev/src/github.com/thebushidocollective/artifacts/.darkrun/worktrees/relic/units/specify/spec-viewer` (branch `darkrun/relic/units/specify/spec-viewer`)





## The Pass loop — make → challenge → resolve

The Pass loop is adversarial on purpose: a single confident pass is exactly where LLM output is most often confidently wrong, so a second pass red-teams the first before anything locks.

- **make** — the worker produces the Unit's output against its completion criteria. Build the real thing, not a sketch.
- **challenge** — a second pass attacks what make produced: edge cases, missing handling, lazy assumptions. Assume the first pass was optimistic.
- **resolve** — reconcile make and challenge into a Unit that satisfies its completion criteria with the challenges answered.




**Quality-gate verifier nonce.** This dispatch carries a one-time verifier token: **`518580860040ff121ff6e2dc68aab8099f600f96a271d7cfcf05d405b499a951`**. When you record a quality gate with `darkrun_quality_gate_record`, pass it as `nonce`. The engine refuses a gate result without the matching token — so a gate is only ever recorded as part of a real verification dispatch, never self-certified. Run the gate's command for real, then record the actual outcome with this nonce.


Run **only the `spec_writer` beat** this tick. When the beat finishes, **record it** with `darkrun_unit_iterate` — pass the `worker`, the `result` (`advance` or `reject`), and a `note`: on advance, what you did and what the next worker needs to know; on reject, why you bounced it (a reject without a reason is refused). That note becomes the next beat's handoff above. Then call `darkrun_tick`; the manager advances the loop or releases the next wave. A Unit is locked only after Resolve and its completion criteria pass.

A Unit gets a **bounded pass budget** — the manager escalates a Unit that can't converge within it to the operator rather than grinding forever. Don't paper over a stuck Unit to dodge the escalation; a Unit that needs more passes than the budget allows is a signal the spec, the scope, or the approach is wrong, and that's the operator's call to make.



## Done when

The `spec_writer` beat is complete for every Unit in this wave and its output is recorded. Then call `darkrun_tick`.

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