---
topic: mcp-client-architecture-local-binary-not-returned-script
created_at: 2026-07-30T00:26:15.700264+00:00
updated_at: 2026-07-30T00:26:15.700264+00:00
---
**A remote MCP server must never return an executable script body for the calling agent to run.** Ship a local stdio MCP client instead. This is an architectural rule with a CVE behind it.

**CVE-2025-6514, confirmed.** `mcp-remote` (the npm shim letting stdio-only MCP clients talk to remote HTTP servers), **CVSS 9.6**, OS command injection to RCE. Affected 0.0.5–0.1.15, fixed in **0.1.16**. Found by JFrog Security Research (https://jfrog.com/blog/2025-6514-critical-mcp-remote-rce-vulnerability/, GHSA-6xpm-ggf7-wc3p).

The mechanism is the point: `mcp-remote` fetches OAuth metadata from the remote server; the server returns an attacker-chosen `authorization_endpoint`; that string reaches the npm `open` package's `open()`; on Windows it becomes PowerShell execution. JFrog's payload was `a:$(cmd.exe /c [malicious-command])?response_type=code` — a non-existent URI scheme with no backslashes, slipping past URL-encoding restrictions. Windows gets full arbitrary command execution with complete parameter control; macOS and Linux get arbitrary executable execution with limited parameter control.

**Why this is dispositive.** A remote MCP server returned *a string in a metadata field* and got RCE on the client. No script-execution feature was involved; that was the bug. A design that deliberately returns executable script bodies **makes that outcome the intended, documented, working behavior.** CVE-2025-6514 is what the accident looks like. Anyone writing a detection rule for this threat class will match the deliberate version too. And the universal prescribed mitigation is "only connect to trusted MCP servers" — which a publicly hosted, unauthenticated server for arbitrary users cannot satisfy. A service compromise, DNS hijack, expired-domain takeover, or subverted deploy pipeline becomes RCE on every publishing user, landing with the developer's own privileges on a machine holding source code and cloud credentials.

**Client-side controls do not save it.** The `2026-07-28` spec has **no content type meaning "this is executable"** — a script returned as `text` is protocol-indistinguishable from a weather report, so there is no flag a client could gate on. **No MCP client, in any documentation, treats server-returned code differently from server-returned data.** In Claude Code the chain is: tool returns text → model decides to run it → `Bash` call → permission system. That system does fail closed, but it degrades in three ordinary ways: static `allowedTools`/`settings.json` rules match first and the prompt never fires; `bypassPermissions` / `--dangerously-skip-permissions` skips it entirely and is common in agent-heavy workflows; and **the prompt becomes a rubber stamp on long payloads** — nobody meaningfully reviews a two-hundred-line encryption script. The human-in-the-loop control is strongest for short commands and weakest for exactly this payload.

**A local stdio server achieves the identical zero-knowledge property, with no caveats.** Zero-knowledge requires exactly three things: the key is generated on the user's machine, the plaintext is encrypted on the user's machine, and only ciphertext crosses the network. A local stdio MCP server runs as a subprocess with full user privileges and does all three in-process, in native code, with no shell involved. The remote service sees ciphertext either way. **The dynamic-script route has no property the local-binary route lacks.**

| | Remote returns script | Local stdio client |
|---|---|---|
| Code executed | Fetched fresh per call from a network endpoint | Installed once from a package registry |
| Version pinning | Impossible | Standard (lockfile, version in config) |
| Reviewable | No, changes per call | Yes, published artifact |
| Provenance | None | npm provenance, Sigstore, checksums |
| Server compromise → | Immediate RCE on every user | Cannot inject code; server returns none |
| Supply-chain risk | Every call | Registry compromise: one-time, detectable |
| Detectability | None | `npm audit`, Socket, SBOM, lockfile diff |

The local route's supply-chain surface is real (`npx -y @some/mcp-server` executes arbitrary code, and the MCP spec itself warns "users have no insight into what commands are being executed"), but it is one-time, pinnable, auditable, and already covered by the npm/PyPI security ecosystem. The dynamic-script risk is per-call, unpinnable, unauditable, and covered by nothing.

**The rule:**
1. The local stdio MCP server generates the key, encrypts, uploads direct to GCS via signed URL, and returns the URL — all in-process, no shell, no dynamic code.
2. The remote service is a plain HTTPS API: mint signed upload URLs, store metadata, serve the PWA, handle abuse reports. **No MCP surface required at all.**
3. If a remote MCP server must exist for a zero-install story, it returns **only data**, at most naming a **pinned, versioned command** (`npx -y @scope/relic@1.4.2 publish "file.ext"`). Never a script body. That bounds a server compromise from "arbitrary RCE" to "can name a different pinned version" — still bad, but detectable, revocable at the registry, and visible in a permission prompt a human can actually read.
4. Validate the `Origin` header, HTTPS only, per both the MCP transport MUST and JFrog's mitigation guidance.

The zero-install pitch is the only thing the dynamic-script route buys, at the price of a CVSS 9.6-shaped hole that is on by design.
