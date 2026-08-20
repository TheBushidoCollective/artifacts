---
topic: relic-stack-options-and-what-each-forecloses
created_at: 2026-07-30T09:58:34.591045+00:00
updated_at: 2026-07-30T09:58:34.591045+00:00
---
`docs/frame.md` left the stack entirely open. Three deployable pieces: the local stdio MCP binary, the app server, the browser viewer. What is actually constrained, checked 2026-07-30.

## MCP SDK availability constrains nothing

Every plausible language has an official, actively maintained SDK under `github.com/modelcontextprotocol`: typescript-sdk (13.0k stars), python-sdk (23.8k), go-sdk (4.9k), rust-sdk (3.7k), csharp-sdk (4.4k), java-sdk, kotlin-sdk, php-sdk, ruby-sdk, swift-sdk. All pushed within the last month, none archived. **Do not let anyone argue the language from MCP support.** The argument has to come from the crypto library and from distribution.

## The crypto library is the real axis, and it points at JS

See [[rfc8188-container-facts-and-implementation-landscape]] for the detail. The short form: the viewer must be JS, so a JS RFC 8188 reader exists no matter what. Rust's only crate is web-push shaped, unaudited by its own README, and cannot take a caller-supplied IKM or `rs`. Go has one 4-star library. So Rust or Go means a second, hand-rolled implementation of a format that by construction can never be changed after content is encrypted, and a writer bug ships permanently into every relic written under it. Node or Bun shares one implementation between writer and reader. That does not settle it, but it is the cost the other branches pay, and the mitigation if they are picked is a shared conformance suite built on the RFC's own 3.1 and 3.2 test vectors.

## Distribution is a separate decision with a much lower reversal cost

Every MCP client that matters configures a stdio server as a `command` plus `args`, so the choice is what that command is. `npx -y <package>` is zero-install where Node exists and nothing where it does not, which is the case in slim CI containers, and slim CI containers are one of the frame's two named segments. A single static binary has no runtime dependency and needs an install step. **Both can ship, and shipping the second later costs nothing structural**, because the tool name, the input schema, and the wire contract are what is sticky, not the delivery channel. Do not let this decision borrow urgency from the language decision above.

## The app server's real constraints

Ciphertext never transits it, so throughput and request-size limits are irrelevant and Cloud Run's 32 MiB HTTP/1 ceiling never binds. What does bind: it must mint V4 signed URLs (a service account key or IAM SignBlob), rate limit per IP with no accounts (so it needs the true client IP, which behind a load balancer means getting the `X-Forwarded-For` hop right or the limiter keys on the proxy), disable minting when the egress ceiling trips, and produce correct statuses **at the deployed edge** under load shedding. That last one is where a locked rule meets a vendor default: see [[per-relic-subdomain-topology-wildcard-tls-psl-and-hsts]] on Cloud Armor's `deny(403)` being a valid and natural pick that violates the preconditions.

The kill switch is only as fast as billing data. Google says so about its own recommended pattern: "There's a delay between incurring costs and receiving budget notifications, so you might incur additional costs for usage that hasn't arrived at the time that all services are stopped. Following the steps in this example doesn't guarantee that you won't spend more than your budget" (https://cloud.google.com/billing/docs/how-to/disable-billing-with-notifications). This confirms rather than extends what `preconditions.md` 3 already says, and it means the faster app-owned estimate (stored size times mint count) is the real trip wire and the billing export is the backstop.

## Viewer tiering, one addition to the corrected crypto topic

The File System Access API is **not** an alternative to the ServiceWorker streaming path. Per mdn/browser-compat-data, `Window.showSaveFilePicker` is Chrome 86 and Chrome Android 132, and **false in both Firefox and Safari**. `FileSystemWritableFileStream` exists more widely (Chrome 86, Firefox 111, Safari 26) but without a save picker it only reaches the origin private file system, which is not a user-visible download. So the streaming tier rests on `FetchEvent.respondWith` (Chrome 42, Firefox 44, Safari 11.1, iOS mirroring), exactly as [[browser-crypto-and-large-file-constraints]] records. Confirmed in the same pass: `ReadableStream.getReader` is Chrome 43 / Firefox 65 / Safari 10.1, while `ReadableStream[@@asyncIterator]` and `.values()` are Chrome 124 / Firefox 110 / **Safari 27**, which has not shipped.

The in-memory ceiling that `viewer.md` 7.1 routes has no vendor number behind it and will not get one. Treat it as a runtime probe rather than a constant: attempt escalating `ArrayBuffer` allocations once at load, catch `RangeError`, and tier on the result. That satisfies the same discipline the hardcoded-browser-list ban already established, for the same reason.
