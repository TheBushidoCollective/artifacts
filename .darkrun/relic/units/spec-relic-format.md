---
name: Specify the URL, the relic ID, and the ciphertext container
unit_type: doc
status: completed
depends_on: []
worker: ''
model: opus
station: specify
inputs:
- frame.md
outputs:
- docs/spec/format.md
- docs/spec/format.sources.txt
branch: darkrun/relic/units/specify/spec-relic-format
started_at: 2026-07-30T05:50:06.587472+00:00
completed_at: 2026-07-30T06:24:27.778198+00:00
iterations:
- worker: spec_writer
  started_at: 2026-07-30T05:50:06.587472+00:00
  completed_at: 2026-07-30T05:50:06.587472+00:00
  result: advance
  note: |-
    `docs/spec/format.md` (4644 words) and `docs/spec/format.sources.txt` (12 sources) written and committed at `4d7df13` on the unit branch. Worktree clean.

    **Gates verified independently by the manager, not taken from the beat's report.** artifact-exists PASS; substance-floor PASS at 1600 and also at the stale 2000 value still sitting on the station branch; sources 12 against a floor of 5; every URL resolves, exit 0; manifest ends in a newline. Zero em-dashes or en-dashes in either file. One `should be` hit on a hedging grep is a verbatim quote from the MCP spec, not hedging.

    **Structure:** sections 0 through 4 map to the unit's mandated sections plus the Route list. Section 5, "What the sibling units inherit," was not requested. Keep it. It pins each downstream consumer to a section-numbered decision and is a stronger form of criterion 10 than the criterion asked for.

    ## The three forks the siblings consume

    - **ID entropy: position 1, full bearer-token entropy.** The ID is unguessable, not merely unique. `shape` picks the bit count, floored at the UUIDv4 reference the MCP spec itself names. **Consequence for `spec-service-surface`: an expired relic MAY be distinguished from one that never existed**, because only somebody already holding a valid ID can ask the question.
    - **Fragment: structured, `#<fixed-width version marker><key>`, no separator, marker in the fragment rather than RFC 8188's `keyid`.** The viewer refuses an unknown version before minting, before consuming a download cap, and before any egress.
    - **Fragment stripping: yes**, read once into a local at load then `history.replaceState`. **Both costs are mandatory on `spec-viewer`:** a copy-link affordance backed by the in-memory key, and a reloaded page that is dead and says so rather than showing a decrypt error.

    ## Where the adversary should push

    The beat surfaced five judgment calls rather than burying them. Attack these first:

    1. **The container carries no renderer class at all.** The unit permitted "carry but never route"; the beat excluded it outright, on the grounds that a second copy has one possible consumer and one possible use, and creates a disagreement case with no correct resolution. This is the single line to change if that reasoning is wrong.
    2. **`idlen` MUST be 0 and a container with `idlen != 0` MUST be refused.** The unit allowed "say what it is used for, or say it is unused." The beat made refusal a hard invariant, which forecloses using `keyid` later without a version bump.
    3. **Crockford base32 ID against a base64url key.** Looks inconsistent. The beat's answer is that IDs get transcribed in fragment-stripped workflows (abuse reports, tickets, logs) and whole-URL hand transcription is not optimized for. Test whether that holds.
    4. **The reserved path set is the beat's own**, not quoted from a locked artifact. Only `abuse`, the policy URL, and `robots.txt` come from upstream. Note the real control is the explicit table, not the alphabet: every reserved word except `assets` is unspellable in Crockford, and `assets` is spellable. Check the append-after-launch rule against issued IDs.
    5. **No canonicalizing redirect for ID case.** Case-insensitive lookup, no redirect, because a canonicalization redirect is exactly the RFC 9110 fragment-inheritance class. This constrains `spec-service-surface`'s routing.

    Two consequences the beat found that the unit did not ask for and that should survive into the final:

    - **Bucket padding and exact plaintext-size derivation are in tension.** Under discretionary padding the derived size is an upper bound, which is still the safe direction for refuse-before-allocating but cannot back an exact byte count shown before decryption. Routed item 5 carries this.
    - **The GFM terminal-character arithmetic independently rules out a 24-byte key**, since 24 is a multiple of three so the final character carries a full 6 bits and `_` becomes reachable. Second, unrelated reason to exclude AES-192. The named check `fragment-terminal-charset` has a static half and a dynamic round-trip half.

    ## Calibration note for later stations

    The document came in at 4644 words against a predicted band of 1620 to 2295, roughly 172 words per mandated item versus the 60 to 85 the frozen rule assumes. The rate model in `substance-floor-calibration-rule` is about 2x low for this station's density. Nothing broke, because a floor is a floor, but the remaining three floors (2800, 2600, 2200) are looser than they read.

    ## Open, not blocking this beat

    The station branch and the run branch both carry a unit generation several rounds stale: format 2000, viewer 2200, publish 1800, service 1800, viewer's route list still holding the mint-response clause, and publish still holding the pre-split `isError` bullet. The engine dispatched this beat from current state, so the contract the beat worked against was correct, and 4644 clears every floor variant. Verify at the land boundary that the `main -> darkrun/relic/main -> darkrun/relic/specify` sync carries the current definitions forward rather than the stale ones overwriting them.
- worker: adversary
  started_at: 2026-07-30T06:06:33.437487+00:00
  completed_at: 2026-07-30T06:06:33.437487+00:00
  result: advance
  note: |-
    Adversary returned **verdict: does not satisfy the contract as written.** Criterion 4 fails, criteria 5 and 10 carry defects, criteria 1, 2, 3, 6, 7, 8, 9 pass cleanly. Eleven findings. No files edited, no commits, findings only, as instructed.

    **Two of the three high findings were independently re-verified by the manager against live sources, because this run has now produced three confidently-stated wrong facts that only a second reader caught.** Both confirmed:
    - The MDN `SubtleCrypto/encrypt` page returns **zero** hits for `192` and zero for key length. It says nothing about AES key-size browser support.
    - The GCS metadata docs say verbatim: "After you have created a custom metadata key:value pair, you can delete the key or change the value."

    ## What the tightener must fix

    **F1, high, factual.** Section 2.3 cites MDN for "192-bit AES-GCM is untested across browsers." The page does not say that. This matters because 4.2 narrows a routed decision to "128 or 256 bits, **per the browser constraint**," so `shape`'s option set is being constrained by a source that does not support it. The conclusion survives on the terminal-character arithmetic alone, which was verified correct. Drop the clause or re-source it, and re-warrant 4.2.

    **F2, high, inverted reasoning, the most serious finding.** Section 1.1 justifies having no canonicalizing redirect by invoking RFC 9110 §10.2.2 fragment inheritance. The quoted mechanism is verbatim correct, but the rule is a **cross-origin** rule (§17.11, "disclosing one site's fragment to another site"), and an ID-case canonicalizing redirect is **same-origin**, where inheritance is the desired behavior. Worse, applied literally the rule deletes the key: the server never sees the fragment, so the only explicit fragment it can emit is an empty one, and an empty fragment blocks inheritance. A later station following 1.1 as written ships a viewer that loses the key on every redirected request. Third, the real cross-origin rule never reaches `spec-service-surface`, which owns routing. Keep the conclusion, rewrite the justification, and put the actual rule in section 5 in its cross-origin form with the service-to-sandbox case named.

    **F3, high, factual.** Section 4.6 claims the app server "can't set metadata on an object it never touches," therefore custom metadata is "client-declared, omissible, and forgeable." All three fail. The server holds bucket-mutating credentials already, since delete-by-ID is a v1 control, so it can patch metadata post-upload. And signed metadata headers in the grant's `SignedHeaders` cannot be altered without invalidating the signature, which the document's own next sentence concedes. The adversary traced the error's origin precisely: the knowledge topic states the true narrower fact, that the app server cannot set **response headers** on a GCS-served object, and the document generalized that into object metadata. Replace the impossibility claim with the real constraint so 4.6 becomes an open question rather than a closed one.

    **F4, medium-high, contract.** Key encoding is resolved in 2.3 (unpadded base64url) and re-routed as an open pick in 4.2. Both cannot be true. 2.3 wins; narrow 4.2 to key length only.

    **F5, medium-high, contract.** Section 5's `spec-publish-contract` bullet says "nothing content-descriptive crosses to the server," contradicting its own cited section 3.2 (renderer class goes in a server-side record) and the locked frame (the coarse class is the entire concession). Handed that summary, `spec-publish-contract` has grounds to omit the class from the publish body, which breaks the frame's primary metric at its root since the class is telemetry item 1. Section 5 also drops two obligations the body assigns: `Referrer-Policy: no-referrer` to `spec-viewer`, and the redirect rule to `spec-service-surface`. Every other section 5 claim was verified line by line against its cited section and holds.

    **F6, medium, gap.** Excluding the class from the container is correct, but it removes the precondition for the run's own disagreement rule, which needs a **declared** type at the viewer to close the polyglot class. With the class only in a server-side record, the viewer has no declared type unless the mint response carries it, and the document does not say whether it does. Pick: either the mint response returns the class (leaks nothing new, the operator already holds it) or the first release is sniff-only and the disagreement rule is explicitly deferred. This is a container question, so it belongs here.

    **F7, medium, padding.** 4644 words at 172 per mandated item against a calibrated 60 to 85. The adversary judged this document long rather than the estimate low, with measured per-section counts. Section 0 (152 words) relitigates the locked URL shape and its rebuttal does not work, answering what the server learns when the claimed property was about `Referer` and proxy logs, then paying that exact cost two sentences later. Section 1.2 (362) enumerates a position nobody proposed. Section 3.1 (376) re-derives the range-decryption chain already stated in `frame.md`. Six rules are stated twice or three times. Section 4 should reference its sections rather than re-explain them.

    **F8, medium, unresolved mandated detail.** Crockford ignores hyphens on decode. The document says lookup "applies Crockford's decode aliases," which leaves hyphen handling undecided, while 1.5's structural guard asserts IDs have "no `-`." If lookup implements Crockford faithfully, every ID gets unbounded spellings and the fixed-length guard breaks. Decide it. "Hyphens are rejected, not stripped" is cheaper and keeps the length guard exact.

    **F9, medium, reasoning.** 1.5 names the alphabet as the primary guard and length as the shaky one. Backwards, and the document's own 1.2 proves it: a 122-bit floor at 5 bits per character is 25 characters minimum, and the longest reserved word is 20. Length excludes every reserved word by at least 5 characters under the weakest permitted entropy. Also, "unspellable" is true of encoding and false of accepted input: under the document's own alias folding, `policy`, `api`, and `health` fold to valid Crockford strings. The append rule must compare **normalized** forms.

    **F10, low.** The `idlen != 0` refusal has no stated refusal point, unlike 3.7 which gives version refusals two. It is necessarily after-the-fetch; say so.

    **F11, low, voice.** Zero em-dashes and en-dashes, confirmed. One instance of the banned "isn't a tradeoff, it's a trap" construction in 2.1. Separately, the "X, not Y" appositive runs 24 times in 4644 words, roughly one per 195 words, which reads as a tic at that density. Thinning it by half costs no decisions.

    ## The five flagged calls: the beat was right on all five

    The adversary confirmed every judgment call and said so plainly rather than manufacturing objections. Excluding the class from the container is the recorded knowledge correction applied correctly. The `idlen` MUST-refuse is justified because RFC 8188 explicitly invites human-readable strings into `keyid`, which is exactly the quiet frame violation this spec names. Crockford for the ID is right, and the adversary found a **stronger** warrant the document did not use: the abuse policy already commits to asking for the relic ID alone, so ID-in-isolation is a designed workflow rather than a hypothesis. The reserved set is fine and its spellability claim verified character by character. No canonicalizing redirect is the right conclusion via wrong reasoning, per F2.

    ## Verified clean, do not spend tightener effort here

    Zero dashes. Manifest hygiene passes byte-level including trailing newline. Orphan check clean both directions. All 21 mandated items addressed and no seventh item routed. Criteria 6 through 9 pass on substance. **No silent frame violation on the filename**, checked specifically as the named likely one: 3.2 puts filename and mimetype in the encrypted envelope only, 2.4 rejects fragment placement with the correct audience argument, and the check is named. No relitigating of locked material except section 0. Scope leaks are three single clauses, all arguably required. No Relic parameter fixed to a value the Route list assigns to `shape`. The container chain (3.1, 3.3, 3.9, 3.11) is mutually consistent and is the strongest reasoning in the document.

    ## Fact-check ledger

    Sixteen of eighteen load-bearing claims verified correct, most verbatim: the RFC 8188 header layout, padding delimiter values, header-outside-AEAD, §4.7 and §4.3 quotes with correct section numbers, the `keyid` SHOULD-be-UTF-8 line, the exact GFM trailing-punctuation set, the Crockford exclusions and alphabet, and the wormhole-crypto API. The base64url arithmetic was independently re-derived over 300k samples: 16 bytes yields final indices exactly {0,16,32,48}, 32 bytes yields multiples of 4 capped at 60, and 24 bytes yields all 64 including 62 and 63, so the multiple-of-three claim is confirmed. Two failed, F1 and F3. One partial: the MCP entropy guidance is quoted loosely and its source section is labeled non-normative, while the document presents it as spec authority.
- worker: tightener
  started_at: 2026-07-30T06:23:21.478714+00:00
  completed_at: 2026-07-30T06:23:21.478714+00:00
  result: advance
  note: |-
    Resolve pass complete. Commit `2838a4d` on the unit branch, worktree clean. All eleven adversary findings addressed.

    **All four gates re-run independently by the manager, not taken from the beat's report:** artifact-exists PASS; substance-floor PASS at 5365 words against 1600; sources-manifest PASS at 12 against 5; every-cited-url-resolves PASS, exit 0. Zero em-dashes or en-dashes. Orphan check clean both directions, re-verified after F1 removed a citation. Spot-checked the specific fixes: the MDN `SubtleCrypto/encrypt` URL is gone from both the manifest and the body; the GCS canonical-requests page is present as the new source 12; the string "mint response" appears zero times, confirming F6 was resolved without it.

    ## F6: the tightener was right and my directive was wrong

    I directed it to put the declared renderer class on the mint response, reasoning that excluding the class from the container left the viewer with no declared type for the disagreement rule to compare against. **I conflated "declared type" with "renderer class."** The container already carries the declared type: 3.1's layer 2 and 3.2's table both place filename and declared mimetype in the encrypted envelope header. The recorded disagreement rule operates on exactly that, and its own worked example is "a file declared `.png` that sniffs as HTML," which is a filename and mimetype assertion rather than a seven-value class. The control was never disarmed.

    The envelope-header copy is also strictly better than what I proposed, on two axes the tightener named: it sits inside the AEAD so it is tamper-evident, where anything arriving alongside the signed URL is operator-mutable; and it is finer-grained, so `.png` against HTML magic bytes is a sharper disagreement than `image` against HTML.

    And my version would have been actively harmful. It puts a publisher-asserted value on the viewing origin, and `renderer-class-is-a-security-boundary-not-a-label` records this run already reaching the wrong conclusion once by reasoning "the class selects, the sniff can only downgrade." A value present in the viewer is a value some later implementer routes on.

    What landed instead: a paragraph in 3.6 stating that excluding the class does not disarm the disagreement rule, naming the envelope header as the declared input, and stating the class must not be sent to the viewer. Section 5 carries it to `spec-viewer`. **`spec-service-surface`'s mint-response field set is untouched**, so no new obligation was imposed on that sibling.

    ## F8, decided for the siblings

    **Hyphens are rejected, never stripped.** Crockford's "hyphens are ignored during decoding" is deliberately not implemented; alias folding is. A hyphen anywhere in the path segment is a 404. Implementing the hyphen rule faithfully would give every ID unbounded valid spellings and break 1.5's length guard, and Relic never emits one so a publisher pays nothing.

    ## Word count went up, and that is the right outcome

    **4644 to 5365, net +721**, which is the wrong direction against F7 and the tightener said so plainly rather than dressing it up. Accepted, because the arithmetic is sound: all four named padding sources were cut and all six duplications handled, roughly -200, but five findings mandated new content worth roughly +900. The corrected 4.6 alone needs the verbatim quote, the credentials argument, and the SignedHeaders mechanism, where the false version was one sentence. The corrected 1.5 needs the fold analysis. F2's real redirect rule is 140 words that did not exist before.

    Trading verified-correct reasoning for a lower count would be the wrong trade, and both reviewers already established the floor is a stub guard with completeness carried by the criteria. The tightener offered a deliberate reduction pass and correctly flagged that it would cost reasoning. Declined.

    ## Beat-initiated verification worth noting

    The tightener did not take my two confirmations on faith. It re-fetched both the MDN and GCS pages itself. On F1 it also checked Chromium's `components/webcrypto/README.md` as the obvious alternative source for the AES-192 browser claim, found no mention there either, and therefore dropped the claim entirely rather than re-sourcing it weakly. On F3 it verified the pinning half rather than asserting it, finding the canonical-requests rule that headers "prefixed with `x-goog-`" must appear in the canonical headers, which is the actual mechanism making signed `x-goog-meta-*` values unalterable. It also re-fetched the MCP spec because it had rewritten 1.2, and confirmed both quotes verbatim.

    ## Flagged for audit, deliberately not fixed

    Completion criterion 7 says the document "names the reserved path set and states it is excluded from the **ID alphabet**." After the F9 correction that mechanism description is literally false: the alphabet does not exclude `assets`, and `policy`, `api`, and `health` fold to valid Crockford strings under lookup normalization. The real control is two guards, length primary (25 characters minimum at the 122-bit floor against a 20-character longest reserved word) and alphabet as backstop.

    The tightener made the criterion land on a true statement by adding "**No reserved word is ever issuable as an ID**" at the head of 1.5's guard list, so the document satisfies both the letter and the intent.

    **I chose not to amend criterion 7's wording.** Editing a completion criterion after the deliverable exists, so that it matches the deliverable, is goalpost-moving even when the intent is honest. The criterion's intent was always "reserved paths can never be issued as IDs" and that is satisfied. Recording the imprecision here instead, so the audit phase reads criterion 7 as being about the ID space rather than the alphabet specifically.
reviews:
  completeness:
    at: 2026-07-30T05:31:07.501358+00:00
  testability:
    at: 2026-07-30T05:14:48.190501+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/spec/format.md
- name: substance-floor
  command: test "$(wc -w < docs/spec/format.md)" -ge 1600
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/spec/format.sources.txt); test "$n" -ge 5'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/format.sources.txt'
gate_results:
- name: artifact-exists
  status: pass
  at: 2026-07-30T06:23:45.483783+00:00
  attempts: 1
  detail: '`test -f docs/spec/format.md` exits 0. Run by the manager in the unit worktree at commit 2838a4d, not taken from a beat''s self-report.'
- name: substance-floor
  status: pass
  at: 2026-07-30T06:23:49.737455+00:00
  attempts: 1
  detail: '`test "$(wc -w < docs/spec/format.md)" -ge 1600` exits 0. Actual: 5365 words. Run by the manager at commit 2838a4d. Note the document sits well above the calibrated 1620 to 2295 band; the tightener''s net +721 came from five findings that mandated new content (the corrected GCS constraint, the corrected reserved-path guard analysis, and the real cross-origin redirect rule), while all four named padding sources were cut. A deliberate reduction pass was offered and declined, because trading verified-correct reasoning for a lower count is the wrong trade and the floor is a stub guard.'
- name: sources-manifest-populated
  status: pass
  at: 2026-07-30T06:23:53.728183+00:00
  attempts: 1
  detail: '12 non-empty lines against a floor of 5, one URL per line, trailing newline confirmed byte-level. Run by the manager at commit 2838a4d. The manifest changed during resolve: the MDN `SubtleCrypto/encrypt` URL was removed because it did not support the AES-192 claim attached to it, and the GCS canonical-requests page was added as the source for signed-header pinning.'
- name: every-cited-url-resolves
  status: pass
  at: 2026-07-30T06:23:56.710852+00:00
  attempts: 1
  detail: 'All 12 URLs fetched, exit 0, no DEAD lines. Run by the manager at commit 2838a4d. Orphan check re-run separately in both directions and clean: no manifest URL uncited in the body, no body citation missing from the manifest. Beyond resolution, the adversary beat verified that each citation actually says what the document claims, checking 18 load-bearing claims against raw source text and finding two false (both fixed during resolve) and one loosely quoted. The manager independently re-confirmed both failures against the live pages before they were handed to the tightener.'
---

# Goal

Write `docs/spec/format.md`: the URL and fragment format, the relic ID, and the ciphertext container. **This unit owns every irreversible decision in the station.** The container format cannot be changed after content is encrypted, and three cross-document couplings resolve through the ID. It runs alone, first, for that reason.

Also write `docs/spec/format.sources.txt`, a citation manifest: one URL per line, nothing else, trailing newline.

**Read first:** `darkrun_knowledge_list` in full.

Then, **in your own worktree** (both files are present there; do not use `git show`, and do not `cd` into a subdirectory since `git ls-tree` scopes to the prefix):

- `docs/frame.md` and `docs/preconditions.md`, the **locked** upstream artifacts. Inputs, not subjects.

# What you are producing

**Stated rules, not a description.** This station kills ambiguity, and the explorers proved what ambiguity costs here: four separate key-disclosure paths where every component behaves correctly and an unspecified boundary lets the decryption key walk out. Every item below gets a decision, or an explicit routing to `shape` naming exactly what `shape` must choose and what each choice costs.

**You do not choose values.** The size cap, TTL, signed-URL validity, key length, and entropy bit counts are all `shape`'s.

# Already decided. Do not relitigate.

- **The URL shape.** Frame: "You share `https://<relic-domain>/{id}#{secret}`." ID in the path, secret in the fragment. A Bitwarden-style ID-in-fragment scheme is a deviation, not an option. Note *why* the option exists (it keeps the ID out of `Referer` and intermediate proxy logs) and note it is unavailable here, because the frame's telemetry counts opens at signed-URL mint keyed by relic ID, so the ID reaches the server regardless.
- **The renderer class is declared by the local client, is one of seven values, and is immutable.**
- **The coarse class is the entire content-descriptive concession to the operator.** Anything finer is new leakage and routes back to `frame` as drift.
- **No republish-to-same-URL and no versioning.** A new relic is a new URL.
- **Ciphertext never transits the app server on either leg.**
- **The wire format must not foreclose range decryption.** Frame: "Ship without archive browsing. Don't make it impossible."

# What this document must decide

## 1. The relic ID

- **Alphabet.** base64url is 6 bits/char and case-sensitive in a path; base32 or Crockford is 5 bits/char, case-insensitive and transcription-resistant at 20 percent more length; hex is 4 bits/char and buys nothing. State the trade and what each costs a user transcribing a link by hand.
- **Entropy, the load-bearing one.** Two locked statements point opposite ways without noticing. Preconditions: "This works precisely because the relic ID is not secret. Only the key is." The MCP spec, on unauthenticated handles: an ID "is necessarily a bearer token, it should be generated with sufficient entropy (e.g., a UUIDv4)." Both are true at once, because the ID is a bearer token for fetching *ciphertext*, and ciphertext without the key is inert. **But a short ID hands the operator-conceded metadata set to any stranger who enumerates**, and an enumerator also consumes per-object download caps and egress at will. State the three coherent positions (full bearer-token entropy; short ID with all security in the fragment; short ID plus a separate fetch token in the fragment) with their costs, and say which the spec adopts. **`spec-service-surface` depends on this answer for whether an expired relic is distinguishable from one that never existed, so state it unambiguously.**
- **Who generates it, and when.** Client-generated before upload lets the client reconstruct the URL with no server round trip, which **eliminates the worst failure in the system**: an upload that succeeds while its confirmation is lost, leaving a relic that exists, is fetchable, and that the publisher has no URL for and cannot delete. If the server assigns it, **it must be returned in the grant, never in a post-upload confirmation**, for the same reason. Decide, and state the entropy either way.
- **Collision behavior.** The server refuses to mint a grant for an ID that already exists rather than overwriting, because an overwrite silently replaces someone else's relic and its owner cannot notice.
- **Reserved path segments.** IDs sit at the root, so `/abuse`, the policy URL, and `robots.txt` are reserved words. **Specify the reserved set and exclude it from the ID alphabet, or an issued ID can shadow the abuse page**, which the preconditions make a go/no-go obligation.

## 2. The fragment

- **Bare key or structured value.** The locked shape says `{secret}` and does not say which. A bare key leaves no room for a version marker and therefore **no migration path off the first framing choice**.
- **The version marker fork.** In the fragment: the viewer knows before fetching and can refuse early, and the marker is visible only to people who already hold the key. In the container's plaintext header (RFC 8188 provides a `keyid` field): the viewer must fetch first, and the marker becomes operator-visible metadata.
- **Key encoding, with a concrete acceptance test.** The GFM autolink extension truncates trailing punctuation: "`?`, `!`, `.`, `,`, `:`, `*`, `_`, and `~` will not be considered part of the autolink." `_` is in the base64url alphabet, so a relic URL pasted into any GFM surface loses its last character if the key ends in `_`, and the recipient gets a decrypt failure with no idea why. **Unpadded base64url of a fixed 16-byte or 32-byte key is immune by arithmetic**, because the final character encodes only 4 significant bits and is drawn from alphabet indices divisible by 4, excluding 62 (`-`) and 63 (`_`). Padded encodings end in `=`; version prefixes, trailing checksums, and non-multiple lengths may land anywhere. **State the rule: the chosen encoding's terminal character set must exclude GFM's trailing-punctuation set, and name the check.**
- **Whether filename or mimetype may live in the fragment.** The only placement keeping them from the operator without a decrypt round trip, at the cost of showing them to every chat channel the link crosses.
- **Fragment lifetime in the page.** Decide whether the viewer reads the fragment once and `history.replaceState`s it out of the address bar. Cheapest insurance against a sanitizer bypass finding `location.hash`, with visible costs: the recipient cannot re-share from the address bar and a reload loses the key, so stripping obliges an explicit copy-link affordance. **`spec-viewer` must carry that consequence, so state your decision plainly enough for it to honor.**

## 3. The ciphertext container

- **What it carries:** filename, declared mimetype, plaintext size, framing parameters, a version marker, and room that a future multi-file manifest is not foreclosed. That last is the frame's range-decryption reversibility argument applied to structure.
- **What is encrypted versus plaintext.** Four placements for filename, mimetype, and size: inside the encrypted body as a header record; in server-side metadata; in the URL fragment; in GCS custom object metadata. **The filename is content, not a category.** `Q3-layoffs-final.xlsx` is not a coarse class, so server-side placement exceeds the frame's conceded leakage and routes back to `frame` as drift. Note it is the most likely *quiet* frame violation in the build, because it is the obvious way to make the taskbar show a name before decryption completes.
- **Plaintext size is derivable and should not be declared.** RFC 8188 framing plus `wormhole-crypto`'s `plaintextSize()`/`encryptedSize()` converters make size computable from object length, so declaring it server-side is redundant and leaky. **Computing plaintext size from encrypted size before allocating is also what lets the viewer refuse an oversized payload before killing the tab**, so state that the framing must expose it.
- **What RFC 8188 fixes by construction.** The header `salt (16) | rs (4) | idlen (1) | keyid (idlen)` is unencrypted, and records carry a padding delimiter with the last using value 2. Salt and record size are necessarily operator-visible, which is benign. **`keyid` is a plaintext free-text field and is a hazard**, because it is the obvious place someone stuffs a filename precisely because a field exists. Say what it is used for, or say it is unused.
- **The header is not authenticated.** Per-record AEAD tags cover the body; the header sits outside them. An attacker who can write the object can alter `rs` and cause mis-framing, which fails on the tag. **That is denial of service, not forgery.** State it so nobody assumes tamper-evidence the format does not provide.
- **The class appears twice with two different jobs.** Server-side it is telemetry. Viewer-side it would be routing. **Read `renderer-class-is-a-security-boundary-not-a-label` before writing this.** The recorded rule, which corrected an earlier wrong version: the class is a *publisher assertion* and **must never route the viewer**, because attestation defeats operator forgery and does nothing about a publisher lying. Specify what the container carries and state plainly that routing does not come from it.
- **Unknown container version:** the viewer refuses, never best-effort.
- **Length leakage.** Ciphertext length reveals plaintext length to within the record size, so with the class the operator learns "an image of roughly 2.4 MB." Padding to buckets is the only mitigation and costs egress against a precondition that already names egress as a kill-switch condition. State the trade; accepting it is fine if stated.
- **Degenerate inputs.** A zero-byte file: does the container emit a header record, and **what class does a zero-byte relic carry?** `binary` is the honest answer, since it is not renderable. Leave no implementation-defined hole in the taxonomy.
- **Fresh keys, always.** Every relic gets a fresh random key, which makes the nonce budget per-file rather than global. Two consequences: an honest double-publish can never collide with the ciphertext-hash blocklist, and **convergent encryption is drift, not an optimization**. Deriving the key from the plaintext would make the blocklist work and would simultaneously let the operator confirm two users published the same file and test whether a given file is on the service. That trades zero-knowledge for an abuse control and routes back to `frame`.
- **The cap's referent.** State whether the hard size cap applies to plaintext or ciphertext bytes. Framing adds known overhead, so a plaintext exactly at a plaintext-stated cap yields a ciphertext over a ciphertext-enforced cap, and those files fail at upload for a reason the user cannot see or fix. **The number shown to a user must be one they can verify with `ls`.**

# Route to `shape`

Do not choose these. Name each, what `shape` must pick, and what becomes specifiable once it does: the wire format and framing; key length and encoding; ID generation location and entropy bit count; whether the cap is on plaintext or ciphertext and its value; whether the container pads to size buckets; whether object metadata is set at upload time at all, given GCS serves ciphertext and the app server is structurally outside the upload path.

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji.

A sibling unit's first draft had **zero** contractions across 2542 words, every apostrophe a possessive, and that was flagged as a high-severity voice defect.

# Completion criteria

1. `docs/spec/format.md` exists → `test -f docs/spec/format.md` exits 0.
2. `test "$(wc -w < docs/spec/format.md)" -ge 1600` exits 0. **Calibration:** this unit carries roughly 27 mandated items at an observed 60 to 85 words per item, so a compliant document lands between about 1620 and 2295 words. 1600 sits just below that band deliberately. **The floor is a stub guard, never a target**, and completeness here is carried by criteria 5 through 10, not by word count. If you find yourself near the floor, check for skipped items before assuming you are short, and never pad to clear it.
3. `docs/spec/format.sources.txt` lists at least five sources, one per line, trailing newline.
4. Every source resolves → the gate exits 0. **Do not invent citations.** Illustrative URL-shape templates in the knowledge base (`file.kiwi/abcdef12#secretKey`, `wormhole.app/{roomId}`) are not sources and 404. Orphan check both directions.
5. Every item in "What this document must decide" is resolved into a stated rule or routed to `shape`. **Routing is legitimate only for items named in this unit's own "Route to `shape`" section; routing anything else fails this criterion.**
6. The document states that the renderer class never routes the viewer, and why publisher-attestation does not make it safe.
7. The document names the reserved path set and states it is excluded from the ID alphabet.
8. The document states the key-encoding terminal-character rule and names its check.
9. The document states that convergent encryption is drift routing back to `frame`, not a permitted optimization.
10. **The ID entropy decision is stated unambiguously enough for `spec-service-surface` to build its expired-versus-never-existed status on, and the fragment-stripping decision is stated plainly enough for `spec-viewer` to honor.**

# Files touched

- `docs/spec/format.md`, `docs/spec/format.sources.txt` (create)

# Out of scope

- The MCP tool surface and publish contract. Sibling `spec-publish-contract`.
- Viewer routing, rendering, the sandbox boundary, recipient screens. Sibling `spec-viewer`. State what the container carries; do not specify what the viewer does with it.
- Status codes, expiry semantics, delete-by-ID, abuse intake, mint placement, counting rules, the published disclosure statement. Sibling `spec-service-surface`.
- Choosing any numeric value, the stack, and all implementation.
