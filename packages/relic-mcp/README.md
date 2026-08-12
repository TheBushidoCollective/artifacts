# relic-mcp

Publish a file as an encrypted relic and get back a shareable link. The
encryption key is generated on your machine and is never sent to the service.

```bash
claude mcp add relic \
  --env RELIC_SERVICE_ORIGIN=https://your-relic-service \
  -- npx -y relic-mcp
```

Then: *"publish ./report.md as a relic."*

For any client that takes a JSON config:

```json
{
  "mcpServers": {
    "relic": {
      "command": "npx",
      "args": ["-y", "relic-mcp"],
      "env": { "RELIC_SERVICE_ORIGIN": "https://your-relic-service" }
    }
  }
}
```

## What it does with your file

1. Reads it from disk, in this process. It is never sent anywhere in plaintext.
2. Draws a 128-bit key and a 26-character relic id independently from your
   machine's CSPRNG. Neither derives from the other.
3. Encrypts locally with AES-128-GCM under RFC 8188 `aes128gcm` framing.
4. Uploads **only ciphertext**, straight to object storage under a signed URL.
   It does not pass through the Relic service.
5. Tells the service three things: a coarse renderer class from a seven-value
   list, this client's name, and the ciphertext's byte length. Not your
   filename, not the mimetype, not the contents.

Call the `relic_describe_client` tool and it will tell you all of this itself,
without reading a file or making a request.

## What it does not protect against

The tool returns the full URL, and the key lives in that URL's fragment,
because handing you a usable link is the point. **So the key enters your
model's context and your session transcript on every publish.** Zero-knowledge
holds against the Relic operator. It does not hold against your model provider
or whoever stores your transcripts. That is structural, not a defect awaiting
a fix.

## Why it runs locally

Encryption has to happen where the plaintext is, so a hosted version of this
would have to receive your file, which defeats the point. Nothing here is
fetched from the network and executed.

Because a local client is otherwise opaque, it ships as **readable source
rather than a compiled binary**. `dist/relic-mcp.js` is a single unminified
file and it is exactly what runs; the TypeScript it was built from is in the
same package. Releases carry npm provenance, a cryptographic attestation
binding the tarball to a specific commit and workflow.

## Tools

| Tool | Input | Notes |
|---|---|---|
| `relic_publish` | `path`, optional `filename` | A filesystem path. Inline content is deliberately not accepted, so the plaintext never joins the key in your transcript. |
| `relic_describe_client` | none | Explains the encryption path. Reads nothing, sends nothing. |

## Environment

| Variable | Meaning |
|---|---|
| `RELIC_SERVICE_ORIGIN` | The Relic service to publish to. |
| `RELIC_ORIGIN` | Origin used to build the shareable URL. Defaults to the above. |
| `RELIC_CLIENT_NAME` | Reported to the service as the publishing client. |
| `RELIC_MCP_HTTP` | `1` to serve Streamable HTTP instead of stdio. |
| `RELIC_MCP_PORT`, `RELIC_MCP_HOST` | HTTP bind. Defaults to `127.0.0.1:7333`. |
| `RELIC_MCP_ALLOWED_ORIGINS` | Comma-separated `Origin` allowlist for HTTP. |

## Protocol

MCP revision `2026-07-28`, the stateless one: no handshake, no session, no
`Mcp-Session-Id`. Nothing is retained between calls. The handshake-based
revisions (`2025-11-25` and earlier) are still answered.

Requires Node 18 or newer.

MIT licensed. Source: https://github.com/TheBushidoCollective/relic
