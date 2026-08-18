# Relic: the build decisions

`docs/frame.md`, `docs/preconditions.md`, and everything under `docs/spec/`
are locked inputs. Each of those documents routes a short list of open picks
forward. This file makes those picks and records why, so no value in the code
is a number nobody can account for.

Nothing here reopens a locked decision. Where a pick is constrained by a
locked rule, the rule is cited rather than restated.

## From `spec/format.md` section 4

### 1. Wire format and framing

**RFC 8188 `aes128gcm`, unmodified.** It was presumptive in the spec and
nothing displaced it. It satisfies all four required properties: range
decryption, per-record AEAD, plaintext size derivable from encrypted length
before decryption, and a header readable before allocation.

**`rs` is 65536.** Record size bounds the envelope header, which must fit in
record 0 alone (`format.md` 3.1). The maximum header this build can emit is
1301 bytes, so 64 KiB leaves the caps room to grow through a version bump
without touching the framing. It is also a sane GCS byte-range unit: a range
request for one record costs one 64 KiB read.

**The envelope header field caps follow from `rs`:** filename at 1024 bytes,
declared mimetype at 255 bytes, both measured as UTF-8 bytes rather than
characters.

**Record 0 is padded to full `rs`.** RFC 8188 permits only the final record
to be short, and record 0 carries only the envelope header, so it is padded
with the framing's own delimiter-plus-zeros mechanism. This is the
"discretionary padding" case `format.md` 3.3 anticipates: the pre-decryption
size derivation is an upper bound, which is the safe direction for a
refuse-before-allocating check. The exact content length arrives in the
envelope header's per-entry `length` a moment later.

The consequence worth naming: record boundaries stay at fixed offsets, so
content plaintext byte `n` always lives in record `floor(n / (rs - 17)) + 1`.
Range decryption is arithmetic, not a search.

### 2. Key length

**128 bits.** RFC 8188 `aes128gcm` derives a 128-bit content-encryption key
through HKDF regardless, so a longer input keying material buys nothing the
framing can use. 16 bytes is 22 unpadded base64url characters.

The `fragment-terminal-charset` check `format.md` 2.3 requires holds by
arithmetic: 16 is not a multiple of three, the final character carries 2
significant bits, so its index is a multiple of 16 and can only be `A`, `Q`,
`g`, or `w`. Neither `-` (62) nor `_` (63) is reachable, and none of the four
is in GFM's trailing-punctuation set. The check is implemented both ways in
`packages/relic-format/test/fragment.test.ts`.

### 3. ID entropy

**128 bits, 26 Crockford base32 characters.** The floor is 122 bits
(`format.md` 1.2). One 16-byte CSPRNG draw encodes to 26 characters at 5 bits
each, giving 130 bits of capacity carrying 128 bits of entropy.

26 characters clears the reserved-word length guard by six: the longest
reserved word is `manifest.webmanifest` at 20 (`format.md` 1.5).

### 4. The cap, and which side it lands on

**100 MiB, enforced on plaintext.** `format.md` 3.11 requires the published
number be one a user can verify with `ls`, and enforcing on the side that is
published removes the conversion entirely. `size_basis` is therefore
`plaintext` in every `size_over_cap` problem document.

The grant signs a ciphertext constraint computed as
`encryptedSize(104857600)`, so a file exactly at the published cap always
fits, which is the failure 3.11 exists to prevent.

### 5. Bucket padding

**No.** `format.md` 3.8 frames the trade: padding is paid in egress on every
fetch by every recipient forever, against a precondition that names egress as
a kill-switch condition, and what it prevents is a size estimate the operator
gets a coarse version of regardless.

Declining it also keeps the plaintext-size derivation exact for the content
records, so the only slack in the derivation is record 0's padding, which is
a known constant rather than a variable.

The length leak appears in the published disclosure statement, as
`format.md` 3.8 requires under either branch.

### 6. Object metadata at upload

**None is set.** `format.md` 3.2 already bars anything content-descriptive
from object metadata, and section 4 item 6 asks only whether any is needed at
all. Nothing needs it: the renderer class and the client name go to the app
server in the grant request body and live on the relic row, and the CRC32C
the mint response returns is non-editable metadata GCS computes on its own.

So the grant signs no `x-goog-meta-*` header, and the blocklist scanner reads
object bytes only.

## From `spec/service.md` section 7

### 1. Edge fidelity

The app server emits every status and problem document in `service.md`
section 1 itself. The degradation contract for load shedding is implemented
as specified: a bare `429` reads as `mint_rate_limited` or
`publish_rate_limited` by endpoint, a bare `503` as `service_paused`.
Asserting this against a deployed edge under load is a launch check, not a
unit test, and it is not claimed as done here.

### 2. Per-object download cap

**200 mints.** The binding constraint is `service.md` 2.3: a 40-person
distribution list inside a Defender tenant draws a floor of 40 legitimate
mints and a ceiling near 80 where scanners detonate with a real browser. 200
clears the ceiling by 2.5x, which leaves room for the same relic to be
forwarded once without dying.

Worst-case egress per relic is 200 x 100 MiB, which is 20 GiB, or $2.40 at
$0.12/GB. That is the number the kill-switch ceiling is set against.

The pool is per relic id across every version: republishing adds an object,
never a second pool (`format.md` 3.12), so the 20 GiB ceiling per id survives
versioning. What versions multiply is storage, up to 100 MiB per version,
kept until deleted.

### 3. Expiry

**No operator TTL. A publisher may set a lifetime, capped at 3650 days;
absent one, the relic never expires.** This reverses the original 7-day pick
and the locked rule it rode in on, and the reversal is recorded rather than
absorbed. The storage-side Delete rule is gone because a bucket-wide rule
cannot express a per-relic lifetime and would have deleted ciphertext the
publisher asked to keep, so expiry is enforced only by the application, at
mint, exact to the second (`service.md` 3.1).

The cap is `config.maxTtlDays`, the accepted ceiling for a publisher-supplied
`ttl_days` in the grant request rather than a recommendation. A relic with no
lifetime has no expiry arithmetic at all: the mint path performs no expiry
refusal and the signed URL validity runs unclamped. The cost of the reversal
is the old rule's whole value: no storage-side reaping exists, an expired
relic's bytes outlive its refusal until explicitly deleted, and the abuse
controls that remain are delete-by-ID, the download cap, and the kill switch.

### 4. Signed-URL validity

**15 minutes, with a minimum viable validity of 60 seconds.** Long enough for
a 100 MiB download on a slow connection, short enough that the residual drain
after the kill switch engages is bounded by 15 minutes of already-minted
URLs.

A mint that would clamp below 60 seconds is refused with `relic_expired`
rather than issuing a URL that dies mid-transfer (`service.md` section 3).
Clamping only exists on a relic with a publisher-set lifetime; one without
never clamps and never returns `relic_expired`.

### 5. Retention window

**30 days.** `service.md` 7.5 names the failure a shorter window causes: the
metric's publishing-IP filter silently stops firing on older relics. It also
bounds how long the tombstone and the mint log's `code` survive, which the
cap-exhaustion cost in 1.2 depends on. It was originally set longer than a
7-day TTL; with no TTL, a relic that never expires can outlive the window,
and the accepted consequence is that the relic row keeps serving after its
mint-log history has aged out.

### 6. Published SLA

**24 hours from arrival, not from triage.** Google publishes no suspension
timeline beyond "timely", so the number has to be same-day-safe across the
named human's timezone and their named backup.

The coverage limit `service.md` 4.1 states travels with the number wherever
it is published: this measures responsiveness on reports received, and it is
never coverage.

### 7. Mint dedup interval

**10 minutes.** It has to exceed the frame's 120-second post-publish window
or the two rules interact, and it has to be short enough that a recipient
returning to a relic later in the day counts as the distinct open it is.

## From the owner, on the usercontent frame's egress

### 1. No network reach for rendered content

**2026-08-18: reversed. The usercontent frame has no network reach,
enforced by the frame's response policy rather than disclosed as a
capability.** The earlier decision, recorded in `spec/viewer.md` 3.5 and 4
and in the frame's second honesty constraint, was parity: rendered content
kept the network reach HTML has always had, a component could fetch
whatever its author wrote, and the recipient was told their IP address,
user agent, and open time could be learned that way. The owner reversed
it: bundle those assets and never fetch them from a CDN, and nothing
outside Relic's own host is allowed.

The mechanism is a CSP on the frame's served response that permits no
remote source of any kind, an iframe carrying `allow-scripts` and nothing
else, and React bundled into the frame's inlined bundle. Inlining is the
only option for that last part, and the reason is structural: the frame is
sandboxed without `allow-same-origin`, so it runs in an opaque origin, and
in an opaque origin `'self'` matches nothing. The frame cannot fetch even
its own assets, so "bundled from our host" can only mean inlined into the
`sandbox.html` response Relic already serves. There is no fetchable middle
ground.

What was traded away, named: a published page that references a CDN
stylesheet, a CDN script, an external font, or a remote image renders
without it, and publishers must inline what their page needs. A component
that reads from an API at render time is no longer expressible. That is a
real reduction in what a relic can be, and it was chosen anyway.

The enforcement is measured, not argued. With the policy in place, `fetch`,
`<img>`, `sendBeacon`, `WebSocket`, and `EventSource` all produced zero
arrivals at a collector server. `sendBeacon` returned `true` while
delivering nothing, so its return value is not evidence. A form with
`target=_blank` submitted and never arrived, blocked by `form-action
'none'`. `window.open` was blocked in the probe, but no user gesture was
present, so the policy is not what stopped it; popups are removed by
dropping the `allow-popups` sandbox flag instead.

## What is not decided here

These are launch obligations, not build decisions, and the build does not
claim them:

- The two registrable domains, and Search Console verification on both
  (`preconditions.md` section 2). The build runs against placeholder names.
- The pre-launch Safe Links fragment test (`service.md` section 6). Until it
  runs, the disclosure statement's wording stays correct under all three
  possible outcomes.
- The named abuse-response human and their backup
  (`preconditions.md` section 1).
