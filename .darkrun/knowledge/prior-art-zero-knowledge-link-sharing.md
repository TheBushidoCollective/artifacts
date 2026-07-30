---
topic: prior-art-zero-knowledge-link-sharing
created_at: 2026-07-30T00:18:34.265813+00:00
updated_at: 2026-07-30T00:18:34.265813+00:00
---
The "encrypt client-side, put the key in the URL fragment, store only ciphertext" model is well-trodden prior art, not novel. Any future run touching Relic's crypto or positioning inherits this.

- **PrivateBin** (https://github.com/PrivateBin/PrivateBin) has shipped this exact construction since 2012. Its published threat model (https://github.com/PrivateBin/PrivateBin/wiki/Threat-Model) is candid that the operator gets "plausible deniability" and that "filing complaints about abusive content rarely helps." Text-only, no rich rendering, no agent integration.
- **file.kiwi** (https://file.kiwi/) is the closest competitor and ships three of Relic's four pillars for free: no signup, client-side 128-bit AES-GCM before upload, "the decryption key lives only inside the share link," URL shape `https://file.kiwi/abcdef12#secretKey`, no size limit, 96-hour auto-delete, resumable uploads with the download link issued as upload begins. It also ships an MCP server: `@file-kiwi/filekiwi-mcp-server` (https://github.com/file-kiwi/filekiwi-mcp-server), input a file path, output a download link.
- **Wormhole** (https://wormhole.app/security) uses 128-bit AES-GCM before the data leaves the browser, share URL literally `https://wormhole.app/{roomId}#{mainSecretKey}`, 24-hour deletion, 5 GB server-side then P2P.
- **Bitwarden Send** is encrypted and expiring but account-bound and aimed at secrets rather than documents.

Other MCP publishing servers already exist: **PreviewShip** (https://previewship.com/docs/mcp — `.html`/`.md`/`.pdf`/built folders, requires an API key, not zero-knowledge), **hypertext.live** (https://hypertext.live/guides/mcp — single `publish_html` tool, public by design), **EdgeOne Pages MCP** (https://pages.edgeone.ai/document/pages-mcp), and **temp-file-share-mcp / tfLink** (https://github.com/tflink-tmpfile/temp-file-share-mcp — 100 MB cap, no encryption, near-zero adoption).

**The durable conclusion:** neither the crypto nor agent-native publishing is defensible ground. The uncontested ground is opinionated, mimetype-aware rendering of agent output. Do not position Relic on zero-knowledge or on no-account publishing; both are matched by free incumbents.
