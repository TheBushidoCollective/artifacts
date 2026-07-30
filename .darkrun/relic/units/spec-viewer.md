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
quality_gates:
- name: artifact-exists
  command: test -f docs/spec/viewer.md
- name: substance-floor
  command: test "$(wc -w < docs/spec/viewer.md)" -ge 2200
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/spec/viewer.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/viewer.sources.txt'
---

# Goal

Write `docs/spec/viewer.md`: how the viewer routes, renders, isolates, and what every recipient sees in every state. Plus `docs/spec/viewer.sources.txt`, one URL per line, trailing newline.

**This unit owns all four key-disclosure paths found in discovery.** Every one of them is a case where each component behaves correctly and an unspecified boundary lets the decryption key walk out. Write rules, not descriptions.

**Read first:** `darkrun_knowledge_list` in full, paying particular attention to `renderer-class-is-a-security-boundary-not-a-label`, `rendering-untrusted-content-origin-isolation`, `redirects-inherit-the-fragment-and-leak-the-key`, `sandbox-csp-decision-and-what-the-wedge-actually-is`, and `browser-crypto-and-large-file-constraints`. Then `docs/spec/format.md` in your worktree, which is your declared input and settles the container and fragment (do not redefine either). Then the locked artifacts, read-only, from the repo root (**do not `cd` into a subdirectory**, `git ls-tree` scopes to the prefix):

```
git show darkrun/relic/frame:docs/frame.md
git show darkrun/relic/frame:docs/preconditions.md
```

# Already decided. Do not relitigate.

- **Untrusted content renders on a separate registrable origin**, never the one holding the fragment.
- **Never both `allow-scripts` and `allow-same-origin`.** With both, the framed script can reach `window.parent` or strip the `sandbox` attribute from its own iframe and reload.
- **The viewing origin carries no third-party scripts, no analytics, no error reporting.** Note the trap the frame station found late: **a bundled first-party-served SDK satisfies `script-src 'self'` and presents no external host to scan for**, so neither a CSP fetch nor a third-party-host scan catches it. Sentry's browser SDK is exactly that shape.
- **The sandbox CSP blocks outbound requests**, matching Artifacts. Decided at this station and recorded in `sandbox-csp-decision-and-what-the-wedge-actually-is`. The wedge was never richer HTML; it is the types Artifacts refuses and the contexts where Artifacts is unavailable.
- **First release renders exactly `{markdown, code, html, image}`.** Everything else is download-only.
- **The telemetry decision is not license to add a viewer-side script.**

# What this document must decide

## 1. Routing, and the four disclosure paths

- **The class never routes.** The renderer class is a *publisher assertion*. If the viewer routes on it, a publisher declares `image` on an HTML payload and wins inline rendering on the origin holding the fragment. That is the fragment-stealing attack in one step. **Publisher-attestation inside the ciphertext does not fix this**: it defeats operator forgery and does nothing about a publisher lying. State the reasoning, because an earlier version of the recorded knowledge got this wrong and someone will re-derive it.
- **Routing comes from magic-byte sniffing after decryption, treated as a hint that can only reach a less privileged path.** Privilege order, least to most: download-only, sandbox origin, viewing origin.
- **The disagreement rule.** When declared and sniffed types disagree, route to the **least privileged path either type would allow**, and tell the recipient the contents do not match the name. One sentence, and it closes the entire polyglot class for the first release.
- **Sniffing cannot decide for half the wedge.** Markdown, plain text, source code, CSV, and JSON have no magic numbers, so the sniff returns nothing for `{markdown, code}`. State how those route given the class cannot be trusted and the sniff is silent. This is the hardest single question in the unit and it must be answered, not deferred.
- **SVG is download-only in the first release.** It has no magic number, sniffs as XML or text, and is inert under `Content-Disposition: attachment` and inside `<img src>` while executing fully inline, as `<object>`, or on direct navigation. A spec saying "still images render inline" without carving out SVG ships the CVE.
- **Blob URLs inherit the creating origin.** Never navigate to or open a blob URL built from untrusted plaintext on the viewing origin. Download blobs are typed `application/octet-stream` regardless of what the container declares, triggered via `a[download]`. Images render only via `<img src=blob:>`.
- **Every redirect the viewer or service issues carries an explicit, possibly empty, fragment in `Location`.** RFC 9110 §10.2.2 makes fragment inheritance mandatory browser behavior and §17.11 names it as cross-site disclosure. **One fragment-less redirect to the sandbox origin hands it the key.** Enumerate where this bites: HTTP to HTTPS, apex to www, service origin to sandbox origin, legacy paths, trailing-slash normalization, and any CDN or load-balancer redirect the application does not author. That last one is the one nobody audits.
- **`Referrer-Policy: no-referrer` on the viewing origin**, and no code path writes the fragment to the console, to storage, or into an error object.

## 2. Rendering each class

- **Markdown is a partial HTML class**, because Markdown permits raw inline HTML. Rendering it on the viewing origin puts sanitizer output next to the fragment. DOMPurify has been bypassed at **default configuration** as recently as CVE-2026-41238 (3.0.1 through 3.3.3). Decide between stripping raw HTML entirely in the first release and rendering Markdown on the sandbox origin like HTML. **Note that the second choice changes the sandbox origin's role from "HTML only" to "all rich text," which changes the `postMessage` surface and how much of the viewer lives on which domain.** Pin DOMPurify at or above 3.4.0 regardless, and state that sanitization is the second layer and never the only one.
- **Markdown link and image targets are attacker-controlled**: `javascript:`, `data:`, and remote images. A remote image is both an exfiltration channel and a beacon revealing that a specific relic was opened. Under the locked strict CSP they fail to load, so **the viewer must explain why rather than showing silent broken-image icons that read as a corrupt file.**
- **Code and plain text, the safe class, two traps.** Syntax highlighters take a language hint usually derived from the attacker-controlled extension, and some build HTML by string concatenation: build output as DOM text nodes or sanitize it like Markdown, and fall back to plain text on an unrecognized hint. Separately, a code file can be many megabytes on one line, which hangs the highlighter and freezes the tab: cap the highlighted region and render the remainder as plain text behind a stated cutoff.
- **Where security headers actually matter.** The object fetch goes client-to-GCS on a signed URL, so the app server cannot set headers on it at all, and what GCS serves is ciphertext, unsniffable into anything executable. **The controls that matter are the viewing origin's own responses and the blob URLs the viewer creates.** State this so a later station neither spends effort on bucket headers that guard nothing nor skips the viewer-side ones that guard everything.

## 3. The sandbox boundary

- **Direction is forced, not chosen.** The main origin fetches, decrypts, and posts plaintext to a static shim. The shim never touches ciphertext or the network. The alternative (sandbox fetches, parent posts it the key) would require the key to cross, which is the one thing that must never happen. State it as forced, because the other shape is what someone reaches for to avoid posting large payloads across a boundary.
- **What crosses, exactly.** Parent to shim: decrypted bytes, the routing type, a render nonce. Never the key, never the fragment, arguably never the relic ID. Shim to parent: a `ready` handshake, a rendered-or-failed ack, optionally a requested height. Nothing else. **A requested-height channel is a message type an attacker also gets to send**, so say what the parent does with untrusted numbers.
- **The handshake ordering problem.** The parent cannot post until the shim loads; the shim cannot know the parent's origin until the parent posts. Resolution: the shim posts a data-free `ready` to `parent` with `targetOrigin: '*'`, the parent replies with the payload and an **exact** `targetOrigin`, and the shim pins `event.origin` from that reply. **The `'*'` is safe only because the ready message carries nothing. The payload message must never use `'*'`**, since a `postMessage` with target `'*'` carrying a decrypted relic hands the whole plaintext to whatever occupies that frame, which is worse than leaking one relic's key.
- **Transfer, do not copy.** Post plaintext as a transferable `ArrayBuffer`; structured-cloning a large payload doubles memory, and large payloads are the wedge's premise.
- **Mandate the `Content-Security-Policy: sandbox` header on the shim's own response**, not merely the iframe attribute, because the header applies to the whole response and cannot be stripped by the framed document.
- **The main origin materializes the download Blob**, never the sandbox, so the download affordance never lives inside the untrusted frame.
- **The taskbar and the content are on different origins by construction**, so the content iframe is never full-viewport and a relic authored to fill the screen renders letterboxed. Product-visible; state it before someone finds it in review.
- **The recipient-visible consequence of sandboxing.** An HTML relic cannot navigate the top-level window, open popups, or load external resources. **The viewer must present the sandbox as deliberate**, or the recipient concludes the relic is corrupt and the publisher concludes the product is broken.

## 4. Platform ceilings and degradation

- **Secure context first.** `crypto.subtle` is `undefined` outside a secure context, so the viewer checks `window.isSecureContext` and `crypto.subtle` before anything else and shows a specific named error. This is not only a dev concern: a recipient behind a TLS-terminating proxy serving plain HTTP hits it in production.
- **Refuse before allocating.** A single `subtle.decrypt` on a large buffer freezes the tab, with practical failure reported at 500 to 800 MB. **Plaintext size is computable from encrypted size without decrypting**, so compare against a platform ceiling before touching memory. The tab must never die.
- **Three tiers, and say which platform gets which**: streaming decrypt to disk via ServiceWorker; in-memory decrypt then Blob download, capped at a memory ceiling; refuse with a named reason and a concrete alternative. **iOS Safari and mobile lack the service-worker fetch support the streaming path needs**, which is what capped hat.sh at 1 GB, and Safari additionally lacks `for await` on `ReadableStream`, so the Safari path is a distinct code path using `getReader()` loops rather than the same code with a smaller number.
- **Degraded render.** The four renderable classes may render a truncated prefix behind an explicit banner stating it is truncated and why; download-only classes refuse instead.
- **Note that the hard size cap value determines whether any of this tiering is required**, and route the value to `shape`.

## 5. Every screen the recipient sees

- **Five failure states, three of which must be visibly distinct.** Missing or malformed fragment; server refused to mint with a stated reason; decrypt failed. **A wrong key and a corrupted download are genuinely indistinguishable at the API level** (both throw `OperationError`), so do not pretend otherwise: name both plausible causes in the copy, offer a retry because the retry is itself the discriminator, and never blame the recipient.
- **Separating corruption from a wrong key is possible using a facility that already exists.** GCS records a CRC32C on every object. It is rightly rejected as a blocklist hash (32 bits, trivially collided on purpose) and is exactly right as a transport-integrity check. If the mint response carries object length and checksum, transport corruption becomes detectable and a wrong key becomes the clean residual. State it as an integrity check, not an authenticity one, and route to `shape` whether the mint response carries them.
- **The unfurl card.** The fragment never reaches a server, so no unfurler can describe the content. **A blank card on an unfamiliar domain is the visual shape of a phishing link.** Serve deliberate Open Graph and Twitter Card metadata on `/{id}`, identical for every relic, saying what Relic is without pretending to describe the content. Serving it must not mint. Note that Open Graph tags are not indexing and that Slack documents that it does not honor `robots.txt`, so there is no conflict with the noindex precondition, and say so, or someone later removes the tags in the name of that rule.
- **Before decryption completes, everything except the content renders**: the branded taskbar, the service name, one line of plain-language explanation, the abuse-report link, and the privacy-statement link. A page blank until decryption finishes gives an unfamiliar recipient nothing to evaluate, on an unfamiliar domain, which is when people close the tab.
- **The honesty constraint applies hardest here.** "Nobody can read this but you" is an overclaim on the exact surface where a recipient is deciding whether to trust the domain. The frame calls overclaiming a reputational liability with no upside.
- **Three named progress phases, never one indeterminate spinner**: fetching (network-bound, retryable, total known, so show bytes and total), decrypting (CPU-bound, not retryable, framing gives record boundaries so show real progress), rendering. A single spinner over all three makes the distinct error states look identical and is what a recipient screenshots when they say "your link is broken."
- **No key-entry field** on the viewing origin unless `shape` deliberately wants one, because it is a purpose-built phishing surface aimed at the system's only secret, on a domain the recipient already does not recognize.
- **Every error screen is a relic page**: it carries the abuse-report link and the policy link, per the precondition that reporting be reachable from every relic page.
- **Repeat opens.** The viewer reuses a still-valid signed URL rather than minting per page load, and the mint response carries its own expiry so the viewer can tell whether reuse is valid. A PWA reopened from the home screen, a restored tab, a pull-to-refresh, and a back-forward navigation are each otherwise another mint and another counted open.

# Route to `shape`

Name each with what `shape` must choose: platform memory ceilings and whether they are hardcoded or feature-detected (Apple publishes no per-tab ceiling, hat.sh's 1 GB is an empirical project decision, and the 500 to 800 MB band is a forum report, so say what the numbers rest on); the truncated-prefix size and the highlighted-region cap, both user-visible cutoffs the viewer states in its own copy; whether the mint response carries object length and CRC32C; whether Markdown renders on the viewing origin with raw HTML stripped or on the sandbox origin.

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji.

# Completion criteria

1. `test -f docs/spec/viewer.md` exits 0.
2. `test "$(wc -w < docs/spec/viewer.md)" -ge 2200` exits 0. A floor against a stub, not a target. Do not pad.
3. Manifest has at least six sources, one per line, trailing newline.
4. Every source resolves. **Do not invent citations.** Orphan check both directions.
5. Every item in "What this document must decide" is resolved into a stated rule or routed to `shape`.
6. The document states that the renderer class never routes, and why publisher-attestation does not make it safe.
7. The document states the least-privileged-path disagreement rule.
8. The document carves SVG out of inline image rendering explicitly.
9. The document states the blob-URL origin-inheritance rule and the `application/octet-stream` download rule.
10. The document states the fragment-in-`Location` rule for every redirect and enumerates where it bites.
11. The document states that `postMessage` carrying plaintext never uses `'*'`.
12. The document specifies three named progress phases and forbids a single indeterminate spinner.

# Files touched

- `docs/spec/viewer.md`, `docs/spec/viewer.sources.txt` (create)

# Out of scope

- The URL, ID, and container format. Locked by `docs/spec/format.md`, your input.
- The MCP tool and publish contract. Sibling `spec-publish-contract`.
- Status codes, expiry semantics, delete-by-ID, abuse intake, mint placement, counting rules. Sibling `spec-service-surface`. You specify what the viewer *shows* for each state; that sibling fixes the status taxonomy and when a mint happens.
- Any numeric value, the stack, and all implementation.
- Visual design. Specify what must be on screen and what it must say, never how it looks.
