---
topic: relic-frame-decisions-dark-mode-assumptions
created_at: 2026-07-30T02:22:06.005443+00:00
updated_at: 2026-07-30T02:22:06.005443+00:00
---
Three frame-station decisions made autonomously under dark mode, each contradicting or sharpening the operator's original brief. **The operator can override any of these via feedback.** Recorded here so the reasoning is inspectable rather than buried.

## Decision 1: The MCP server does NOT return an executable script. A local stdio MCP server encrypts in-process.

**Overrides step 3 of the original brief.**

Rationale: zero-knowledge requires exactly three things — key generated locally, plaintext encrypted locally, only ciphertext on the wire. A local stdio MCP server runs as a subprocess with full user privileges and does all three in-process with no shell. **The returned-script route has no property the local-binary route lacks**, and it costs a CVSS 9.6-shaped hole that is on by design (see [[mcp-client-architecture-local-binary-not-returned-script]]).

The ergonomic argument also favors local: the original brief's flow fires a Bash approval prompt on **every** invocation, whereas a local stdio server does the work inside the MCP tool call itself, with **zero** Bash prompts after a one-time install. The brief's stated goals (MCP never sees the secret or the file; the agent makes one call; the user gets a URL) are all better served by the local route.

The only thing sacrificed is zero-install. That is a weak loss specifically for this operator: the bushido collective builds `han`, a Claude Code plugin platform, so plugin and MCP distribution is core competency, not friction.

**Fallback if a zero-install path is later required:** a remote MCP server that returns **only data**, at most naming a pinned versioned command (`npx -y @thebushidocollective/relic@1.4.2 publish "file.ext"`). Never a script body. That bounds a server compromise from arbitrary RCE to naming a different pinned version — detectable, revocable at the registry, and short enough that a permission prompt is genuinely readable.

**Consequence for architecture:** the remote service becomes a plain HTTPS API (mint signed upload URLs, store metadata, serve the PWA, handle abuse reports). It needs no MCP surface at all.

## Decision 2: Relic does not run under `thebushido.co`. It requires two registrable domains distinct from it.

**Overrides the `relics.thebushido.co` domain in the original brief.**

Rationale: Google lists Safe Browsing entries at the **registrable domain** in response to abuse found only on subdomains. Immich (October 2025) had all of `*.immich.cloud` flagged — including internal-only Zitadel, Outline, Grafana, and Victoria Metrics — triggered by per-PR preview environments. It recurred after a successful appeal. Their fix was a **separate registrable domain**, and their marketing site survived only because `immich.app` was already a different registrable domain. Microsoft's Tenant Allow/Block List blocks a URL domain and all subdomains by default. See [[domain-strategy-and-safe-browsing-blast-radius]].

**The required structure:**
1. `thebushido.co` stays clean: marketing and email, nothing user-generated, ever.
2. A separate registrable domain for the Relic service (API + PWA).
3. A third registrable domain for the sandbox origin rendering untrusted HTML, cross-site from the service domain, so a flag on rendered content does not take out the service's own API, and so untrusted HTML cannot reach the fragment secret.

**External dependency, operator action required:** selecting and purchasing those two registrable domains. No downstream station can deploy without them. Every domain must also be verified in Google Search Console **before** launch, because the Security Issues report is the only place a listing's triggering URLs are visible — unverified means flagged and blind.

## Decision 3: The frame centers on rendering. Zero-knowledge is the permission slip, not the pitch.

**Sharpens, rather than contradicts, the brief.**

Rationale: file.kiwi already ships client-side AES-GCM, key-in-fragment, no account, no size limit, 96-hour expiry, **and an MCP server**, free. PrivateBin has shipped the identical crypto since 2012. Neither the crypto nor agent-native publishing is defensible ground (see [[prior-art-zero-knowledge-link-sharing]]). The one thing no competitor holds is opinionated, mimetype-aware rendering of agent output.

Zero-knowledge still matters, but as the property that lets a developer answer "am I allowed to send our internal report through a third party" without a security review. Users will not *choose* Relic for it; they will be *allowed* to choose Relic because of it.

Honesty constraint on the claim: the JavaScript performing decryption is served by the same server the zero-knowledge claim is made against, so it is a statement about operator intent, not a property a recipient can verify. PrivateBin and 0bin say this out loud. Relic must too — overclaiming is a reputational liability (see [[abuse-liability-of-hosting-uninspectable-content]]).

Target segments follow from [[claude-artifacts-capability-boundary]]: headless/CI agent runs (Artifacts are off in Agent SDK, GitHub Action, and MCP-server contexts, and API-key sessions cannot publish at all) and non-Claude agents (Cursor, Codex, Copilot, Cline, Windsurf, Aider, Amp), which have no publish path whatsoever.
