---
topic: gcs-grant-shape-what-is-proven-and-the-open-experiment
created_at: 2026-07-30T09:57:24.202473+00:00
updated_at: 2026-07-30T09:57:24.202473+00:00
---
`docs/spec/publish.md` 3.6 routes three grant shapes to `shape` and says exactly one has documented size enforcement. That framing is right, and the evidence is sharper than the spec has. Pulled from raw Google docs plus one runnable practitioner demo, 2026-07-30.

## What each candidate actually proves

**POST policy document. Documented, and it fails a different requirement.** `["content-length-range", min_range, max_range]` is real: "Specifies a range of acceptable values that can be used in the Content-Length field" (https://cloud.google.com/storage/docs/authentication/signatures). It is the only shape that expresses a **cap** rather than an exact size. But the word "generation" appears **zero times** on the POST Object HTML forms page (https://cloud.google.com/storage/docs/xml-api/post-object-forms). The complete documented field set is `acl, bucket, Cache-Control, Content-Disposition, Content-Encoding, Content-Length, Content-Type, Expires, file, key, policy, success_action_redirect, success_action_status, x-goog-algorithm, x-goog-credential, x-goog-custom-time, x-goog-date, x-goog-signature, x-goog-meta-*`. **There is no documented way to carry `ifGenerationMatch: 0` on this branch**, and `publish.md` 3.7 requires it on every grant. So the branch with documented size enforcement is the branch that cannot document the anti-substitution precondition. Nobody has noticed this collision.

**Signed PUT with `Content-Length` signed. Demonstrated, and it can only pin an exact size.** A Google engineer's runnable demo signs `content-length;content-md5;content-type;host` and reports bodies of 5, 10 (wrong hash), and 20 bytes all getting `403 Forbidden` while the matching 10-byte body gets `200 OK` (https://blog.salrashid.dev/articles/2022/limit_gcs_signedurl/). This is stronger than the older claim it corrects. Enforcement is real and comes from two mechanisms together: the V4 signature pins the header value, and HTTP framing means the server reads exactly `Content-Length` bytes. **But a V4 signature pins a value, not a range.** So on this branch the signed constraint is necessarily the client's *declared* size, which contradicts `publish.md` 3.6's "The constraint is computed against the cap rather than the declared size." The cap still holds transitively, through the grant-time `413 size_over_cap` refusal, but the spec sentence is not implementable as written on this branch.

**Resumable session. Still unproven on size, and weaker than it looks in three more ways.**

1. The same demo also tests resumable with `x-upload-content-length` signed. Sizes 5 and 20 fail with 403 **at the initiation step** and both 10-byte files succeed. Read that precisely: it proves the **signature** pins the declared value. It never sends more bytes than declared to the session URI, so it says nothing about whether GCS enforces the declaration against the persisted bytes. The question `publish.md` flags is still open.
2. **The data leg is unsigned and can inject metadata.** "The JSON API also supports setting custom metadata in the final request if you include headers prefixed with `X-Goog-Meta-` in that request" (https://cloud.google.com/storage/docs/resumable-uploads). Since PUTs to a session URI use no signed URL, **the "pin client metadata by signing `x-goog-meta-*` into the grant" argument in `format.md` 4.6 and `publish.md` 6.5 does not hold on this branch.** It holds on POST policy and signed PUT. This is an interaction between two separately routed decisions.
3. **The storage-leg clock is one week, not the grant expiry.** "A session URI expires after one week but can be cancelled prior to expiring", and a stale session gets "A 410 Gone status code if it's been less than a week since the upload was initiated. A 404 Not Found status code if it's been more than a week". Only cancellation shortens it, and cancellation needs possession of the session URI, which is why `publish.md` 3.4 rules client-side initiation out without a fourth message.

What the resumable branch does prove outright, and it is the thing it is chosen for: 308 responses carry a `Range` header for persisted bytes and omit it when nothing persisted, and "Cloud Storage ignores any bytes you send at an offset that Cloud Storage has already persisted" (https://cloud.google.com/storage/docs/performing-resumable-uploads).

## The experiment that decides the branch

One bucket, one service account, under an hour. Run it before committing, because a negative result eliminates a branch.

1. Sign a resumable initiation with `X-Upload-Content-Length: 1048576` in `X-Goog-SignedHeaders`. Initiate honestly, get the session URI.
2. PUT 2 MiB to the session URI with `Content-Range: bytes 0-2097151/2097152`. Record the status. 200/201 means no byte enforcement and the branch cannot carry the cap. 400 means it can.
3. Repeat with the unknown-total form, `Content-Range: bytes 0-2097151/*` then finalize, which is the shape an attacker would actually use.
4. On the final data request add `x-goog-meta-injected: 1` and read the object's metadata back. Confirms or refutes point 2 above.
5. Separately: does a POST policy document accept `x-goog-if-generation-match` as a form field or policy condition at all? Undocumented, so this is a yes/no probe that decides whether the POST branch is even viable under `publish.md` 3.7.
6. Separately: on the resumable branch, is `ifGenerationMatch: 0` evaluated at initiation or at finalization? Initiate against an absent object, create the object out of band, then finalize. If the precondition is only checked at initiation, the anti-substitution guarantee is weaker than `publish.md` 3.7 assumes.

## Costs the arithmetic needs, first-party

`docs/preconditions.md` cites a third-party blog for "$0.12/GB for the first TB". Google's own table (https://cloud.google.com/storage/pricing) says the tier boundary is **10 TiB, not 1 TB**, and the rate is destination-dependent: $0.12/GiB to Worldwide (excluding Asia and Australia) and to Asia for 0 to 10 TiB, **$0.19/GiB to Australia**, **$0.23/GiB to China**. A worst-case ceiling computed at a flat $0.12 understates by up to 92 percent for an Australian or Chinese audience.

Related: [[gcs-false-impossibility-claims]], [[gcs-cloud-run-architecture-constraints]], [[gcs-soft-delete-and-what-deletion-actually-means]].
