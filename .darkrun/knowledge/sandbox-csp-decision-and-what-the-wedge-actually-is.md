---
topic: sandbox-csp-decision-and-what-the-wedge-actually-is
created_at: 2026-07-30T04:27:53.683760+00:00
updated_at: 2026-07-30T04:27:53.683760+00:00
---
**Decision: the sandbox origin serves a strict CSP that blocks outbound requests. Relic matches Artifacts here rather than loosening.** Made at the `specify` station, overridable by the operator.

## The fork

Origin isolation stops sandboxed content reaching `location.hash`, structurally. It does **not** stop attacker HTML making outbound requests. A sandboxed iframe with `allow-scripts` on a cross-site origin can still `fetch()` to an arbitrary host and exfiltrate the relic's own plaintext, which the recipient was allowed to see and a third party was not.

- **Strict (`default-src 'none'` / `connect-src 'none'`):** rendered HTML cannot phone home. Every HTML relic with an external image, stylesheet, or font breaks. This is what Anthropic picked: Artifacts run in a sandboxed iframe on a `*.claudeusercontent.com` origin with a restrictive CSP blocking external requests (https://code.claude.com/docs/en/artifacts).
- **Permissive:** HTML relics render richly, and every HTML relic can exfiltrate its own plaintext to any host.

The apparent problem: **Relic's wedge is rendering, so if it matches Artifacts' CSP the HTML half renders exactly as well as Artifacts and no better.**

## Why strict is nonetheless correct

**The wedge was never "richer HTML." It is breadth of type.** Per [[claude-artifacts-capability-boundary]], Artifacts accepts only `.html`, `.htm`, and `.md`, caps at 16 MiB, is off by default in Agent SDK, GitHub Action, and MCP-server contexts, and cannot publish at all from an API-key session. Relic's uncontested ground is rendering the things Artifacts **refuses to accept**: code with syntax highlighting, images, and later archives and seekable media, from clients that have no publish path at all.

On HTML specifically, Relic ties with Artifacts under a strict CSP. That tie costs nothing the wedge depended on, because a developer reaching for Relic to publish HTML from a GitHub Action was never choosing it over Artifacts on render quality. They were choosing it because Artifacts was not available to them.

Loosening, by contrast, ships an exfiltration channel Artifacts does not have, in a product whose entire permission-slip story is that content stays private. **A privacy product that renders slightly nicer HTML by adding a data-exfiltration path has traded its actual differentiator for a cosmetic one.**

## What follows

- Self-contained HTML renders fully. HTML depending on external assets renders degraded, and **the viewer must say so** rather than silently showing a broken page. That is a required behavior, not a nicety.
- Inline everything is the guidance for publishers, the same constraint Artifacts users already work under.
- If this is ever revisited, revisit it as a **wedge** decision with the operator, not as a CSP tuning task, because the cost is measured in privacy posture rather than in rendering fidelity.

## The related boundary rules this sits with

- **Never both `allow-scripts` and `allow-same-origin`** (see [[rendering-untrusted-content-origin-isolation]]). Mandate the `Content-Security-Policy: sandbox` **header** on the shim's own response, not merely the iframe attribute: the header applies to the whole response and cannot be stripped by the framed document, which makes it strictly stronger.
- **Message direction is forced, not chosen.** The main origin fetches, decrypts, and posts plaintext to the shim. The shim is truly static and never touches ciphertext or the network. The alternative (sandbox fetches, parent posts it the key) would require the key to cross the boundary, which is the one thing that must never happen.
- **The handshake:** the shim posts a data-free `ready` to `parent` with `targetOrigin: '*'`, the parent replies with the payload and an **exact** `targetOrigin`, and the shim pins `event.origin` from that reply. The `'*'` is safe only because the ready message carries nothing. The payload message must never use `'*'`. With per-relic subdomains the shim's expected parent origin is fixed and hardcodable, while the parent's `targetOrigin` is computed per render.
- **Transfer, do not copy.** Post plaintext as a transferable `ArrayBuffer`. Structured-cloning a large payload doubles memory, and large payloads are the wedge's whole premise.
- **The download Blob is materialized by the main origin**, not the sandbox, so the download affordance never lives inside the untrusted frame.
