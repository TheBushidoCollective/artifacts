---
name: Specify the status taxonomy, expiry semantics, mint rules, and the abuse surface
unit_type: doc
status: completed
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
completed_at: 2026-07-30T07:13:43.326472+00:00
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
- worker: adversary
  started_at: 2026-07-30T07:01:30.749938+00:00
  completed_at: 2026-07-30T07:01:30.749938+00:00
  result: advance
  note: |-
    **Verdict: criteria 4 and 14 fail; 5 passes on substance but is incoherent on presentation; the other twelve pass.** Eleven findings, no edits, no commits. The adversary pulled every RFC as raw `.txt` from rfc-editor.org and every page with `curl` plus a tag-stripper, and used WebFetch on nothing.

    ## F1, high, a FABRICATED QUOTATION. New defect class for this run.

    Section 1.2 attributed to RFC 9110 §15.5.11 that `410` means "no longer available at any location."

    **The manager verified this personally against the raw RFC: the string "any location" appears ZERO times in all 10,785 lines.** The actual text is "no longer available at **the origin server**." The second quote in that sentence ("the server owners desire that remote links to that resource be removed") is verbatim and stands.

    This is worse than every citation defect the run has produced so far, because the URL resolves, the section number is correct, and the quoted words were invented. **Neither the `every-cited-url-resolves` gate nor the does-the-source-support-the-claim check catches it.** It is only findable by grepping the source for the quoted string.

    It was also load-bearing backwards: the document's own preceding sentence concedes "the object still exists," which is exactly what "no longer available at any location" would contradict. The sentence that actually supports `410` is the permanence test the writer never reached for, since cap exhaustion is known-permanent and the server does know. The tightener was told to rebuild the argument on that and to **audit every other quoted string in the document**.

    ## F2, high, false dichotomy on the option set.

    Section 1.1 claimed the better-fitting alternative to `413` "is `403`, which the rule below forbids." **The manager verified RFC 9110 §15.5.21 defines 422 Unprocessable Content**, whose wording ("the syntax of the request content is correct, but it was unable to process the contained instructions") fits an over-cap grant request exactly, and which no rule bans. `413` may still win on legibility to humans, proxies, and dashboards, but the comparison must be honest and the loser's reason stated.

    ## F5, medium-high, the real completeness hole, criterion 14.

    Line 11 claims to own all app-server-originated failures, but `format.md` 1.3 and 1.4 mandate four grant-time refusals with no case and no code: bad alphabet, wrong length, reserved word, and **ID collision**. The collision is sharp because `format.md` 1.4 obliges the client to act ("The client draws a new ID and retries"), and **a client cannot key a redraw-and-retry on a code that does not exist**. Case 12 proves grant-time validation is in scope, so these cannot be deferred to the sibling. Also unspecified: a mint against an ID whose grant is live but whose object has not landed, which is a routine publisher race.

    ## Remaining findings

    **F3** two broken cross-references, both pointing at section 5 when they mean section 4, on the security carve-out and on the mechanism criterion 15 rests on. **F4** the operator surface asserts a root path prefix absent from `format.md`'s append-only reserved table. **F6** the Authelia citation is a relay of a relay (it quotes FusionAuth #629, and that quote is itself explicitly a belief), so "observed" overstates by two levels; nothing load-bearing rests on it. **F7** the IP dedup's real cost is NAT collapse undercounting the metric in exactly the 40-person-tenant scenario the document builds its cap arithmetic on, and it is unstated. **F8** the mint log carries the entire cap-exhaustion mitigation, the open counter, the cap, the limits, and the telemetry join, and its record shape is never defined while the tombstone gets ten fields. **F9, F10, F11** minor.

    ## The eight flagged calls: five right, one wrong premise, two with real holes

    - **Right:** widening the 401/403 ban (adds a stricter rule where the lock is silent, removes nothing, and the Claude Code trigger is verified not condition-scoped); case 6 taking `410` (the RFC's decision rule turns on permanence knowledge, which the server has); ten codes over twelve cases (a coverage bar, not an injectivity bar, and collapsing the three deletion cases **is** the criterion 15 decision); dedup on counter but not cap (the preconditions' egress term does become unbounded otherwise); blocklist conditional on reason class (the 3am hole is closed by making it a parameter of the one call).
    - **Flagged call 1 rests on a false premise.** There was never a conflict: criterion 5 says "resolved **or** routed," criterion 6 requires all twelve resolved, and they are complementary. Nothing outside the licensed seven is routed, so substance is fine, but route item 1 is **titled** "The exact status values" while its body says they are fixed. Section 7 is the list `shape` reads, and a worker scanning titles reopens the table. Retitle and delete the manufactured-conflict narrative.
    - **A hole under flagged call 8 nobody saw.** Section 4.1's reporter categories (`malware`, `phishing`, `csam`, `copyright`, `legal_process`, `other`) never map to section 4's reason classes (`abuse`, `blocklist_match`, `legal`, `operator_error`). **A CSAM report arriving as legal process plausibly maps to `legal`, which by the document's own rule skips the blocklist**, and that is the payload most worth blocklisting.

    ## Verified clean, and this matters given the run's history

    **Every GCS claim is clean on the recurring impossibility failure**, and in two places the document applies the recorded lesson correctly and by name, including stating the corrected soft-delete fact ("The policy is editable at any time"). The `robots.txt` interaction is right and if anything conservative against Google's own text. **The mint response field set meets all five of `spec-viewer`'s stated needs with two to spare**, verified by reading the sibling directly, and its four deliberate exclusions are each required by `format.md`. Zero em-dashes. Manifest clean, 19 URLs, orphan-clean both directions. All eight locked constraints honored, none relitigated. Not padded: roughly 60 words of filler found in 4808.

    **One scoping fix from the fact-check:** section 6's "**Neither** documents what it does with a fragment" is a claim about the vendors, and the adversary verified only that the two cited pages are silent (zero occurrences of "fragment" or "anchor" in both). Scope it to the cited documentation and it becomes true at a cost of four words.

    Findings handed to the tightener with the F1 and F2 verifications attached as confirmed rather than alleged.
- worker: tightener
  started_at: 2026-07-30T07:13:04.183300+00:00
  completed_at: 2026-07-30T07:13:04.183300+00:00
  result: advance
  note: |-
    Resolve complete at `ed51b43`, worktree clean. All eleven findings plus three verdict items answered, and five new issues the beat found itself.

    **Gates re-run independently by the manager:** artifact-exists PASS; substance-floor PASS at 6551 against 2800; sources 20 against 5; every URL resolves; zero dashes. Spot-checked the specific fixes: `"any location"` now appears **zero** times and the real origin-server text appears once; all four new codes present; route item 1 retitled; the `csam` carve-out lands in three places.

    ## F1, the fabricated quotation, fixed and independently re-verified twice

    The beat re-ran the grep itself before trusting my report. Deleted the invented string, quoted the origin-server text verbatim, and **rebuilt the argument on the permanence test**, which is what should have carried it all along: Relic knows the condition is permanent because it reads permanence off its own counter, so `410` is correct and `404` is not. The section no longer contradicts its own preceding concession that the object still exists.

    **The full quotation audit ran and is the most valuable artifact of this beat.** Roughly 30 quoted strings fetched, normalized, and substring-matched against source. **All verbatim except the one fabrication.** Two mechanical notes recorded: several quotes are lowercased from sentence-start into mid-sentence position, a pre-existing convention kept deliberately; and the RFC 9110 §17.11 quote had silently dropped "(Section 10.2.2)" from its middle, now marked with a visible elision.

    ## F2, the 413 versus 422 decision

    **`413` wins, on legibility rather than on the letter, and the document says so rather than pretending 413 fits.** The old ecosystem fallback is deleted outright, because 1.5 fixes publishing clients on `code` so the status is never what a client branches on. Two reasons stated: the status is what everything *without* the problem document reads, and 1.2 already establishes that load balancer access logs are often status-only, so `413` says "too big" to a proxy, an uptime check, and a dashboard where `422` says "something was wrong"; and `422` would equally be the natural status for case 12's malformed metadata, so taking it here would reintroduce the exact conflation 1.2 pays a real price to accept only once.

    ## F5, the criterion 14 hole, resolved by adding codes

    New **section 1.6**, deliberately separate so criterion 6's twelve-case bar is untouched, and 1.1's scope claim now points at it. Three cases added: `400 invalid_relic_id` for `format.md` 1.3's alphabet, length, and reserved-table checks, with a new `id_validation_failure` extension member naming which check failed; `409 relic_id_collision`; and `409 relic_not_yet_published` for a mint on a live grant whose object has not landed, carrying `retry_after_seconds`.

    **The code a client keys redraw-and-retry on is `relic_id_collision`, status `409`**, chosen because RFC 9110 defines `409` for "situations where the user might be able to resolve the conflict and resubmit the request," a literal description of drawing a fresh ID, and not `400` because the ID was well formed and the client did nothing wrong.

    ## Remaining findings

    F3 fixed and **swept**: 29 internal references plus 13 `format.md` references checked against the live heading list. F4 fixed in both places, operator surface under the already-reserved `api` prefix so no table append is needed. F6 now cites FusionAuth #629 as primary with Authelia as the relay, hedge intact, and states the rule rests on Slack alone. F7 names the NAT undercount beside the mechanism, quoting preconditions verbatim and tying it to the 40-person tenant. F8 gives the mint log the same treatment the tombstone got, nine fields. F9, F10, F11 fixed; a deduped mint returns the already-issued URL, with a stated exception below minimum viable validity. Route item 1 retitled "Edge fidelity for the statuses section 1 fixes" with the manufactured-conflict narrative deleted. The category mapping is now explicit, and `csam` blocklists regardless of arrival channel with the exception carried in **both** sections so they cannot drift.

    ## Five new issues the beat found, two of them the same defect class it was fixing

    1. `format.md` 2.2 versus this document's own 2.2, an ambiguous cross-reference on a load-bearing exclusion.
    2. The `problems/` URI prefix had the same reserved-table exposure as F4 and nobody had checked it. The beat ran the check rather than assuming, found no append needed since every problem URI carries a second path segment, and wrote the reasoning down instead of leaving it unexamined.
    3. **An unsupported vendor claim:** the document said Proofpoint "rewrites to `urldefense.com`" and the cited page contains zero occurrences of that string. Same failure mode as the ones it was sent to fix.
    4. **The beat caught itself introducing the defect class mid-draft.** Its first F6 fix said the HEAD behavior is something "Microsoft documents nowhere," which is a claim about a vendor that one page cannot establish. It rewrote it scoped to the cited documentation before shipping.
    5. The `csam` carve-out would have lived only in 4.1 while section 4 states the blocklist condition independently, so the two would have drifted.

    ## Word count

    4808 to 6551, floor 2800. Fourteen findings answered plus a new subsection, against roughly 100 words of tightening returned. Nothing padded, nothing decided was cut. Consistent with the precedent that the band is guidance and correctness wins over the count.
reviews:
  completeness:
    at: 2026-07-30T09:30:39.382518+00:00
  testability:
    at: 2026-07-30T09:30:18.432248+00:00
approvals:
  completeness:
    at: 2026-07-30T09:36:28.303444+00:00
  testability:
    at: 2026-07-30T09:36:02.428787+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/spec/service.md
- name: substance-floor
  command: test "$(wc -w < docs/spec/service.md)" -ge 2800
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/spec/service.sources.txt); test "$n" -ge 5'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/service.sources.txt'
gate_results:
- name: artifact-exists
  status: pass
  at: 2026-07-30T07:13:21.083628+00:00
  attempts: 1
  detail: '`test -f docs/spec/service.md` exits 0. Run by the manager in the unit worktree at commit ed51b43, not taken from a beat''s self-report.'
- name: substance-floor
  status: pass
  at: 2026-07-30T07:13:24.828395+00:00
  attempts: 1
  detail: '`test "$(wc -w < docs/spec/service.md)" -ge 2800` exits 0. Actual: 6551 words, up from 4808 at the writer''s commit. Run by the manager at ed51b43. The growth is fourteen adversary findings answered plus a new section 1.6 carrying three grant-time refusal codes that `format.md` mandates, against roughly 100 words of tightening returned. Consistent with the precedent set on `format.md`: the band is guidance, the floor is a stub guard, and correctness wins over the count.'
- name: sources-manifest-populated
  status: pass
  at: 2026-07-30T07:13:28.147636+00:00
  attempts: 1
  detail: 20 non-empty lines against a floor of 5, one URL per line, trailing newline present. Run by the manager at ed51b43. The manifest gained FusionAuth/fusionauth-issues#629 during resolve, added as the primary source for the Safe Links HEAD observation after the adversary showed the existing Authelia citation was relaying it and that the relayed claim carried its own hedge.
- name: every-cited-url-resolves
  status: pass
  at: 2026-07-30T07:13:34.399941+00:00
  attempts: 1
  detail: |-
    All 20 URLs fetched, exit 0, no DEAD lines. Run by the manager at ed51b43. Orphan check clean both directions after the manifest addition.

    Beyond resolution, this unit carried the run's first **fabricated quotation**: a string attributed to RFC 9110 §15.5.11 that appears zero times in all 10,785 lines of the RFC, sitting in a sentence whose other quote was verbatim. The manager confirmed it against the raw RFC before it reached the tightener, and the tightener re-ran the grep independently rather than trusting that. It then ran a **full quotation audit**, fetching every cited page and substring-matching roughly 30 quoted strings: all verbatim except the one fabrication. It also found and fixed a second unsupported claim nobody had flagged (Proofpoint cited for "urldefense.com", a string absent from the page), and caught itself introducing the same defect class mid-draft.

    Note for later stations: this gate cannot detect modes 2 and 3 of the defect, per `citation-defects-and-the-three-checks-that-catch-them`. A resolving URL proves only that the source exists.
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
