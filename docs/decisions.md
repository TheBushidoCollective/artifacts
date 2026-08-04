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

### 3. TTL ceiling

**7 days.** It lands inside the lifecycle regime, so the storage-side rule is
expressible as `{"action":{"type":"Delete"},"condition":{"age":7}}` and the
application-layer refusal stays exact to the second on top of it
(`service.md` 3.1).

7 days also matches the GCS signed-URL ceiling, so no clamp is ever driven by
the storage limit rather than by policy.

### 4. Signed-URL validity

**15 minutes, with a minimum viable validity of 60 seconds.** Long enough for
a 100 MiB download on a slow connection, short enough that the residual drain
after the kill switch engages is bounded by 15 minutes of already-minted
URLs.

A mint that would clamp below 60 seconds is refused with `relic_expired`
rather than issuing a URL that dies mid-transfer (`service.md` section 3).

### 5. Retention window

**30 days**, set deliberately longer than the 7-day TTL. `service.md` 7.5
names the failure a shorter window causes: the metric's publishing-IP filter
silently stops firing on older relics. It also bounds how long the tombstone
and the mint log's `code` survive, which the cap-exhaustion cost in 1.2
depends on.

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
