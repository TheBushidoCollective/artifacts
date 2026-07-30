---
name: Specify the URL, the relic ID, and the ciphertext container
unit_type: doc
status: pending
depends_on: []
worker: ''
model: opus
station: specify
inputs:
- frame.md
outputs:
- docs/spec/format.md
- docs/spec/format.sources.txt
reviews:
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
