---
topic: gcs-cloud-run-architecture-constraints
created_at: 2026-07-30T00:21:18.758304+00:00
updated_at: 2026-07-30T00:21:18.758304+00:00
---
Hosting-layer facts that dictate Relic's architecture. Verified against Google's docs.

**Cloud Run's 32 MiB wall forces the right design anyway.** Max HTTP/1 request size is **32 MiB**, with **no limit on HTTP/2** end to end; max HTTP/1 response is 32 MiB unless chunked or streaming; max request timeout 60 minutes; 1000 concurrent requests per instance (https://docs.cloud.google.com/run/quotas). The wall is escapable via HTTP/2, but the correct move is **signed URLs, direct to GCS, bypassing the app server entirely**. That is strictly better than raising the limit: ciphertext never transits the app server, so the server has no opportunity to observe anything, upgrading the zero-knowledge claim from "we promise" to "we structurally cannot."

**Direct-to-GCS upload.** Two signed-URL shapes: a simple signed PUT, or a server-initiated resumable session (server POSTs for a session URI, client PUTs to it).
- **CORS is required even with a signed URL** because the browser still preflights; every header in `Access-Control-Request-Headers` must appear in the bucket's `responseHeader` list or preflight fails (https://docs.cloud.google.com/storage/docs/cors-configurations). A working upload config covers `PUT, POST, OPTIONS` plus response headers `Content-Type`, `Content-Length`, `Content-Range`, `x-goog-resumable`.
- **Enforcing a max upload size is awkward:** `Content-Length` is ignored on a signed PUT. The two real options are **signed policy documents** (POST), which declare max file size, allowed content types, and key prefix as signed constraints, or **`X-Upload-Content-Length` on a resumable session**. Signing `content-length` also works, since a mismatch breaks the signature.
- **Relic's publish path runs on the user's machine, not in a browser, so the upload leg has no CORS requirement at all.** CORS only matters for the PWA's download leg.

**Lifecycle TTL.** Object Lifecycle Management's `age` condition is a real TTL: `{"rule":[{"action":{"type":"Delete"},"condition":{"age":7}}]}` (https://docs.cloud.google.com/storage/docs/lifecycle). Two gotchas: **config changes take up to 24 hours to take effect**, and Google may act on the old config during that window; and **granularity is days, rounded to the next UTC midnight**, so sub-day expiry is inexpressible. Anything shorter than a day must be enforced at the application layer (refuse to serve) with lifecycle reaping the bytes later.

**Range requests and progressive decryption.** GCS supports byte-range downloads and the XML API honors per-bucket CORS. For the browser to see them you must include **`Content-Range`** and `Content-Length` in the bucket's `responseHeader` list. Combined with `wormhole-crypto`'s `decryptStreamRange`, this is the working path to seekable decryption — the thing that makes in-page video playback and ZIP-entry browsing possible without downloading the whole object.

**Public read vs signed download.** A public object means anyone with the URL downloads it indefinitely, with no expiry and no audit trail. Signed URLs give time-bounded access to a private bucket but **cannot be individually revoked** (https://docs.cloud.google.com/storage/docs/access-control). For Relic, short-lived signed download URLs minted by the app server at view time beat public objects: they keep delete-by-ID effective as a control, preserve an audit trail, and let bucket-level Public Access Prevention stay on.
