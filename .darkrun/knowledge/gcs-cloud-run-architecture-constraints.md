---
topic: gcs-cloud-run-architecture-constraints
created_at: 2026-07-30T00:21:18.758304+00:00
updated_at: 2026-07-30T10:03:54.689723+00:00
---
Hosting-layer facts that dictate Relic's architecture. Verified against Google's docs.

**Cloud Run's 32 MiB wall forces the right design anyway.** Max HTTP/1 request size is **32 MiB**, with **no limit on HTTP/2** end to end; max HTTP/1 response is 32 MiB unless chunked or streaming; max request timeout 60 minutes; 1000 concurrent requests per instance (https://docs.cloud.google.com/run/quotas). The wall is escapable via HTTP/2, but the correct move is **signed URLs, direct to GCS, bypassing the app server entirely**. That is strictly better than raising the limit: ciphertext never transits the app server, so the server has no opportunity to observe anything, upgrading the zero-knowledge claim from "we promise" to "we structurally cannot."

**Direct-to-GCS upload.** Two signed-URL shapes: a simple signed PUT, or a server-initiated resumable session (server POSTs for a session URI, client PUTs to it).
- **CORS is required even with a signed URL** because the browser still preflights; every header in `Access-Control-Request-Headers` must appear in the bucket's `responseHeader` list or preflight fails (https://docs.cloud.google.com/storage/docs/cors-configurations). A working upload config covers `PUT, POST, OPTIONS` plus response headers `Content-Type`, `Content-Length`, `Content-Range`, `x-goog-resumable`.
- **Enforcing a max upload size is awkward:** `Content-Length` is ignored on a signed PUT. The two real options are **signed policy documents** (POST), which declare max file size, allowed content types, and key prefix as signed constraints, or **`X-Upload-Content-Length` on a resumable session**. Signing `content-length` also works, since a mismatch breaks the signature.
- **Relic's publish path runs on the user's machine, not in a browser, so the upload leg has no CORS requirement at all.** CORS only matters for the PWA's download leg.

**Lifecycle TTL.** Object Lifecycle Management's `age` condition is a real TTL: `{"rule":[{"action":{"type":"Delete"},"condition":{"age":7}}]}` (https://docs.cloud.google.com/storage/docs/lifecycle). Two gotchas: **config changes take up to 24 hours to take effect**, and Google may act on the old config during that window; and **granularity is days, rounded to the next UTC midnight**, so sub-day expiry is inexpressible. Anything shorter than a day must be enforced at the application layer (refuse to serve) with lifecycle reaping the bytes later.

**Range requests and progressive decryption.** GCS supports byte-range downloads and the XML API honors per-bucket CORS. For the browser to see them you must include **`Content-Range`** and `Content-Length` in the bucket's `responseHeader` list. Combined with `wormhole-crypto`'s `decryptStreamRange`, this is the working path to seekable decryption — the thing that makes in-page video playback and ZIP-entry browsing possible without downloading the whole object.

**Public read vs signed download.** A public object means anyone with the URL downloads it indefinitely, with no expiry and no audit trail. Signed URLs give time-bounded access to a private bucket, and there is **no per-URL revoke operation**, so a single bad URL cannot be pulled back on its own. But signed URLs are **not** irrevocable in bulk, and the difference is the whole design of a kill switch. Verbatim, from https://cloud.google.com/storage/docs/access-control/signed-urls:

> Anyone who knows the URL can access the resource until the expiration time for the URL is reached or the key used to sign the URL is rotated.

The same page also states **"After you generate a signed URL, anyone who possesses it can use the signed URL to perform specified actions, such as reading an object, within a specified period of time."**

For Relic, short-lived signed download URLs minted by the app server at view time beat public objects: they keep delete-by-ID effective as a control, preserve an audit trail, and let bucket-level Public Access Prevention stay on.

**The operational consequence, which is the reason the exception matters.** An egress kill switch that disables minting does nothing to URLs already minted. The residual drain is (live minted URLs) x (remaining validity) x (object size), bounded by nothing that acts on minting. **Rotating the signing key is the only second-stage stop**, and it is indiscriminate: every outstanding URL dies at once, including honest in-flight downloads. That is the correct trade in a spend emergency, and it needs to be a designed runbook step with the signing-identity mechanics settled before launch rather than improvised during an incident. Two things follow: the signed-URL validity window is a cost-control parameter (it is literally the blast time of the kill switch), and deleting the object remains the takedown primitive because it works per-relic where rotation does not.

**UNVERIFIED, do not assume immediacy:** whether key rotation invalidates outstanding signatures instantly or after a propagation delay. The page quoted above states that rotation ends access and gives **no timing whatsoever**. Nothing here establishes that the stop is immediate, and a runbook that assumes it is has assumed something no source states. Test it against a real bucket before relying on the number.

### Citation correction, and a false-negative mode in the grep-the-source check

An earlier version of this topic attributed "cannot be individually revoked" to https://docs.cloud.google.com/storage/docs/access-control. **The word "revoke" appears zero times on that page and zero times on the signed-URLs page.** The claim was true in effect and the citation did not carry it, which is defect mode 2 in [[citation-defects-and-the-three-checks-that-catch-them]]. Worse, the unsourced phrasing hid the key-rotation exception, which is the half that turns an unfixable structural gap into a designed control.

**How to reproduce the verification**, because a naive check reports the correct quote as absent:

```
curl -sL -A "Mozilla/5.0" https://cloud.google.com/storage/docs/access-control/signed-urls -o p.html
# strip <script>/<style>, strip tags, unescape entities, collapse runs of spaces
# THEN flatten newlines before grepping:
tr '\n' ' ' < p.txt | grep -F "until the expiration time for the URL is reached or the key used to sign the URL is rotated"
```

The source HTML **hard-wraps mid-sentence after "is reached or the key"**, so a single-line `grep -F` of the full sentence returns zero hits and reads exactly like a fabricated quotation. This was independently hit and misread as an absent quote during this run. **Generalize it: the grep-the-source check has a false-negative mode from source line wrapping, so flatten whitespace before matching any quote longer than a line.** A zero-hit result on a long quote means "re-check with newlines flattened" before it means "the quote is fake."

### Cost facts that belong beside these, recorded in full elsewhere

Two corrections that a future run doing GCS architecture will need and should not have to re-derive. Both are recorded with full quotes and citations in [[egress-cost-controls-and-what-a-kill-switch-cannot-stop]]:

- **Egress is $0.12/GiB up to 10 TiB, not "the first TB."** Primary source is https://cloud.google.com/storage/pricing ("General network usage"), whose tiers are `0 gibibyte to 10 tebibyte $0.12`, `10 tebibyte to 150 tebibyte $0.11`, `150 tebibyte and above $0.08` for Worldwide excluding Asia and Australia. **Australia is 58 percent higher at every tier** (`$0.19 / $0.18 / $0.15`). `docs/preconditions.md` and `docs/spec/service.md` both carry the wrong figure sourced to a third-party blog (`leanopstech.com`); both are locked, so the correction lives here and routes as artifact-side drift.
- **Cloud Storage cannot be spend-capped.** GCP spend cap budgets (Preview) enforce a real stop, and the eligible-service list is **"Gemini API, Agent Platform (formerly known as Vertex AI), Cloud Run, and Cloud Run functions"** (https://cloud.google.com/billing/docs/how-to/budgets-spend-caps). Cloud Storage is absent. Alerts-only budgets explicitly **"doesn't automatically cap Google Cloud or Google Maps Platform usage or spending."** So capping Cloud Run stops the app server and therefore stops minting; **nothing at the platform level stops GCS egress**, which is why the application-layer switch plus signing-key rotation above is the entire mechanism.
