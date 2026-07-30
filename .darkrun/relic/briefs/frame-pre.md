---
station: frame
phase: pre
created_at: 2026-07-30T02:25:02.719353+00:00
---
# Frame station spec — `relic`

## The risk this station kills

**wrong-thing.** Relic risks being a technically elegant zero-knowledge system that either solves a problem the target user does not feel, or whose abuse exposure makes it unsurvivable to operate. Both failure modes have named precedents. Both are cheapest to catch here.

Discovery confirmed the risk is real, not theoretical:

- **The privacy angle is already commoditized.** file.kiwi ships client-side AES-GCM, key-in-fragment, no account, no size limit, 96-hour expiry, **and an MCP server**, free. PrivateBin has shipped the identical construction since 2012.
- **The obvious audience is already served.** Claude Artifacts is first-party, free with the plan, and better integrated for Claude Code users, who are exactly the bushido collective's existing audience.
- **The operating risk killed a better-resourced product.** Firefox Send died of encrypted-so-unscannable content on a trusted allowlisted domain with no abuse-report mechanism. The original brief reproduced all three properties.

## The operator's brief

1. A user asks their coding agent to publish a file "as a relic" (named *relic*, not *artifact*, to avoid colliding with Claude's Artifacts).
2. The agent calls `publish_relic(filename)`.
3. A random secret is generated on the user's machine, the file is encrypted with it, and only ciphertext is uploaded. **The service never sees the secret or the plaintext.**
4. The user shares `https://<relic-domain>/{id}#{secret}`. Fragments are never transmitted to a server.
5. A PWA downloads the ciphertext and decrypts it in-browser.
6. The PWA renders by mimetype: HTML as HTML; Markdown as rendered HTML with a view-source toggle; code syntax-highlighted; images; video; ZIPs browsable in-page; binaries behind a download button. A branded taskbar sits on top.

Ciphertext is backed by Google Cloud Storage.

## What discovery established

Ten knowledge topics were recorded at this station and are the priors every downstream station inherits. Read them with `darkrun_knowledge_list` before acting on anything below.

| Topic | What it constrains |
|---|---|
| `prior-art-zero-knowledge-link-sharing` | Positioning. The crypto is not defensible ground. |
| `claude-artifacts-capability-boundary` | Which segments are actually unserved. |
| `abuse-liability-of-hosting-uninspectable-content` | The v1 control set, and the go/no-go. |
| `domain-strategy-and-safe-browsing-blast-radius` | Domain topology. Operator purchase required. |
| `mcp-client-architecture-local-binary-not-returned-script` | The publish path. Kills the returned script. |
| `mcp-protocol-2026-07-28-constraints` | Transport, error codes, timeouts. |
| `browser-crypto-and-large-file-constraints` | Wire format, streaming, the fragment's real leak paths. |
| `rendering-untrusted-content-origin-isolation` | Viewer architecture. Origin isolation over sanitization. |
| `archive-browsing-and-mimetype-detection` | Whether ZIP browsing is possible at all. |
| `relic-frame-decisions-dark-mode-assumptions` | The three decisions taken under dark mode. |

## Decisions taken at this station

Made autonomously under dark mode (the engine refuses blocking operator questions in a lights-out run), then endorsed by the operator. Overridable via feedback. Full reasoning in `relic-frame-decisions-dark-mode-assumptions`.

1. **No server-returned executable script.** A local stdio MCP server generates the key and encrypts in-process. Zero-knowledge is structurally identical; the CVSS 9.6 shape of CVE-2025-6514 is eliminated; Bash approval prompts drop from every-invocation to zero. The remote service becomes a plain HTTPS API with no MCP surface. **This overrides step 3 of the brief.**
2. **Relic does not run under `thebushido.co`.** It needs two registrable domains distinct from it: one for the service, one for the sandbox origin rendering untrusted HTML. `thebushido.co` carries marketing and email and never hosts user-generated content. **This overrides the domain in the brief.**
3. **Rendering is the wedge.** Zero-knowledge is the permission slip that makes Relic usable inside a company, not the pitch. Target the segments Anthropic explicitly closed: headless/CI agent runs and non-Claude agents.

## Out of scope for this station

Named so later stations do not read frame's silence as license:

- Choosing the server language, framework, or hosting topology. That is `shape`.
- Choosing the encryption wire format (RFC 8188 vs libsodium `secretstream` vs chunked AES-GCM). `shape` decides, informed by whether range decryption is required.
- Endpoint design, schemas, and the relic ID format.
- The visual design direction of the PWA.
- Renderer ordering beyond the frame-level claim that rendering is the product.
- Buying the domains. Operator action, tracked as an external dependency.

## Units

Two, sized to the station's single locked artifact rather than split for the sake of splitting.

- **`frame-artifact`** → `docs/frame.md`: the problem, the user, the value, the success metric, the non-goals.
- **`frame-preconditions`** → `docs/preconditions.md`: the conditions that must hold for Relic to be buildable and operable at all, including the go/no-go on abuse operations.

`frame-preconditions` depends on `frame-artifact` so the preconditions are written against a settled frame rather than in parallel with one.

## Done when

Both units are complete, `docs/frame.md` states problem, user, value, success metric, and non-goals with every external claim carrying a resolvable source, and `docs/preconditions.md` states the operating conditions and the go/no-go. The checkpoint then decides whether the problem is worth specifying.
