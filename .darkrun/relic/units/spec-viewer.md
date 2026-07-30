---
name: Specify viewer routing, rendering, the sandbox boundary, and every recipient screen
unit_type: doc
status: pending
depends_on:
- spec-relic-format
worker: ''
model: opus
station: specify
inputs:
- docs/spec/format.md
outputs:
- docs/spec/viewer.md
- docs/spec/viewer.sources.txt
reviews:
  testability:
    at: 2026-07-30T05:14:48.190501+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/spec/viewer.md
- name: substance-floor
  command: test "$(wc -w < docs/spec/viewer.md)" -ge 2600
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/spec/viewer.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/viewer.sources.txt'
---

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
- **Separating corruption from a wrong key is possible with a facility that already exists.** GCS records a CRC32C on every object. Rightly rejected as a blocklist hash, it is exactly right as a transport-integrity check. If the mint response carries object length and checksum, transport corruption becomes detectable and a wrong key becomes the clean residual. State it as an integrity check, not an authenticity one.
- **The unfurl card.** The fragment never reaches a server, so no unfurler can describe the content. **A blank card on an unfamiliar domain is the visual shape of a phishing link.** Serve deliberate Open Graph and Twitter Card metadata on `/{id}`, identical for every relic, saying what Relic is without pretending to describe the content. Serving it must not mint. Open Graph tags are not indexing and Slack documents that it ignores `robots.txt`, so there is no conflict with the noindex precondition; say so, or someone later removes the tags in the name of that rule.
- **Before decryption completes, everything except the content renders**: the branded taskbar, the service name, one line of plain-language explanation, the abuse-report link, and the privacy-statement link (`spec-service-surface` owns that statement's contents).
- **The honesty constraint applies hardest here.** "Nobody can read this but you" is an overclaim on the exact surface where a recipient is deciding whether to trust the domain.
- **Three named progress phases, never one indeterminate spinner**: fetching (network-bound, retryable, total known, so show bytes and total), decrypting (CPU-bound, not retryable, framing gives record boundaries so show real progress), rendering.
- **No key-entry field** on the viewing origin unless `shape` deliberately wants one, because it is a purpose-built phishing surface aimed at the system's only secret.
- **Every error screen is a relic page**, carrying the abuse-report and policy links.
- **Repeat opens.** Reuse a still-valid signed URL rather than minting per page load, and the mint response carries its own expiry so the viewer can tell whether reuse is valid. A PWA reopened from the home screen, a restored tab, a pull-to-refresh, and a back-forward navigation are each otherwise another mint and another counted open.
- **If `docs/spec/format.md` decided the viewer strips the fragment via `history.replaceState`, carry the consequence**: the recipient can no longer re-share from the address bar and a reload loses the key, so the viewer owes an explicit copy-link affordance backed by the in-memory key. Honor whichever way `format.md` decided.

# Route to `shape`

Name each with what `shape` must choose: platform memory ceilings and whether they are hardcoded or feature-detected (Apple publishes no per-tab ceiling, hat.sh's 1 GB is an empirical project decision, and the 500 to 800 MB band is a forum report, so say what the numbers rest on); **the hard size cap value**, which determines whether the section 5 tiering is required at all; the truncated-prefix size and the highlighted-region cap, both user-visible cutoffs the viewer states in its own copy; whether the mint response carries object length and CRC32C; **PSL registration for the sandbox parent, with its lead time named**.

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji.

# Completion criteria

1. `test -f docs/spec/viewer.md` exits 0.
2. `test "$(wc -w < docs/spec/viewer.md)" -ge 2600` exits 0. **Calibration:** this unit carries roughly 38 mandated items at an observed 60 to 85 words per item, so a compliant document lands between about 2280 and 3230 words. 2600 sits inside that band, so if you are near the floor, check for skipped items before assuming you are short.
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
