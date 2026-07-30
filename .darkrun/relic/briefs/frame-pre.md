---
station: frame
phase: pre
created_at: 2026-07-30T00:09:14.137355+00:00
---
## What this station will do

Kill **wrong-thing** risk for Relic before any spec or code exists.

Relic is a zero-knowledge, unauthenticated publishing service driven by an MCP server. The operator's brief, verbatim in substance:

1. A user asks their coding agent to publish a file "as a relic" (named *relic*, not *artifact*, to avoid colliding with Claude's Artifacts feature).
2. The agent calls `publish_relic(filename: "some file.ext")`.
3. The MCP server returns a **runnable script**. The agent executes it locally. The script generates a random secret on the user's machine, encrypts the file with it, POSTs only the ciphertext to the service, and returns the URL. **The MCP server never sees the secret or the plaintext.**
4. The user shares the URL: `https://relics.thebushido.co/{id}#{secret}`.
5. The recipient opens it. Because URL fragments are never transmitted to the server, the secret never reaches the operator.
6. A PWA shell downloads the ciphertext, decrypts it in-browser with the fragment secret, and renders by mimetype: HTML as HTML; Markdown as rendered HTML with a view-source toggle; code syntax-highlighted; images as images; video as video; ZIPs optionally extracted and browsable in-page; binaries shown as filename + type behind a download button. A branded taskbar sits on top.

Ciphertext is backed by Google Cloud Storage.

## Inputs inherited

None — this is the factory's opening station on an empty repository (`TheBushidoCollective/artifacts`, one commit containing only `.claude/settings.json`). There is no prior code, no prior run, and an empty project backlog.

## Decisions the operator already made (locked, not up for re-litigation here)

- Product name **relic**; viewer domain **relics.thebushido.co**.
- Zero-knowledge is a hard constraint, not a feature toggle: the server must be structurally incapable of decrypting what it stores.
- The secret travels in the URL fragment.
- Storage is Google Cloud Storage.
- Run mode is **dark**: pre-elaborate up front, then advance without stopping for local review.
- The server language and framework are **deliberately unchosen** — that is the `shape` station's decision.

## What this station must produce

`frame/frame.md`: the problem in the user's terms, the concrete user and their job-to-be-done, why it is worth building now, the single observable success metric, and the non-goals that bound every downstream station.

## Explicitly out of scope for `frame`

- Choosing a language, framework, or hosting topology (that is `shape`).
- Naming the crypto construction or key sizes (that is `specify`/`shape`).
- Any implementation, schema, or endpoint design.
- Deciding the visual design direction of the PWA.

## How this station runs

Elaboration and discovery run concurrently. Two explorers are dispatched in parallel: `context` (prior art, browser-crypto constraints, untrusted-content rendering isolation, abuse and takedown exposure, GCS/Cloud Run limits, MCP protocol specifics, in-browser ZIP and mimetype handling) and `value` (who this is for, the competitive landscape, the sharpest wedge, the strongest case against building it, the minimum lovable version, and success criteria). Their findings and this frame sharpen each other; decomposition into Units happens only after both land.

The named risk this station is pointed at: **that Relic is a technically elegant zero-knowledge system solving a problem the target user does not actually feel, or one whose abuse exposure makes it unsurvivable to operate** — the failure mode that killed Firefox Send.
