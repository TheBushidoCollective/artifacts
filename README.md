# Relic

Zero-knowledge publishing for agent output. Your coding agent encrypts a file
on your machine, uploads only ciphertext, and hands you a link. The service
never receives the key.

```
https://<relic-domain>/{id}#{secret}
```

The fragment is never sent to a server, so the operator holds ciphertext and
nothing that opens it. A recipient's browser fetches the ciphertext, decrypts
it locally, and renders it by type.

## What is honest about the claim

The JavaScript that performs the decryption is served by the same party the
zero-knowledge claim is made against, and that party could serve different
JavaScript tomorrow. This is a statement about operator intent, not a property
a recipient can verify. Anyone claiming otherwise for a service of this shape
is overclaiming.

The publish tool returns the full URL including the fragment, because handing
you a usable link is the product. **The key therefore enters your model's
context and your session transcript on every publish.** Zero-knowledge holds
against the Relic operator. It does not hold against your model provider or
whoever stores your transcripts, and that is structural rather than a defect
on a schedule.

`/policy` states the whole trade, and the frame conditions the telemetry on
that statement being readable before anybody publishes.

## The packages

| Package | What it is |
|---|---|
| `@relic/format` | The wire format. RFC 8188 `aes128gcm` framing around an envelope that lives inside the encrypted stream. Imported by both ends so the encryptor and the decryptor cannot drift apart. |
| `@relic/server` | The app server. Grants, mints, the abuse surface, delete-by-id, and the published disclosure. Never handles relic bytes on either leg. |
| `relic-mcp` | The local MCP server, published to npm. Holds the key, encrypts in process, returns no script. |
| `@relic/viewer` | The PWA. Decrypts in the browser and renders by type under a taskbar. |

## Running it

```bash
mise install          # bun, biome, node, pinned in mise.toml
bun install
bun run verify        # lint, typecheck, and the full suite
bun run --filter '@relic/server' dev
```

The server refuses to start on memory storage when `NODE_ENV=production`. In
development it warns and continues, because a service that silently serves
from memory looks healthy, accepts publishes, and loses every relic on
restart.

### Configuration

| Variable | Meaning |
|---|---|
| `RELIC_SERVICE_ORIGIN` | The API and the PWA shell. |
| `RELIC_SANDBOX_ORIGIN` | Where untrusted HTML renders. A **different registrable domain**, never a subdomain. |
| `RELIC_GCS_BUCKET`, `RELIC_GCS_CLIENT_EMAIL`, `RELIC_GCS_PRIVATE_KEY` | Service account for V4 signed URLs. |
| `RELIC_OPERATOR_TOKENS` | `name:secret` pairs. Per-operator, because every delete writes an audit record naming one. |
| `RELIC_KILL_SWITCH` | Refuses every mint and every publish. |

## Connecting the MCP server

Relic exposes `relic_publish`, which takes a filesystem path and never inline
content, and `relic_describe_client`, which explains what the client does with
your file without reading it or contacting anything.

```bash
npx -y relic-mcp   # nothing to clone, nothing to build
```

### Claude Code

```bash
claude mcp add relic \
  --env RELIC_SERVICE_ORIGIN=https://relic-wh2jw5fg2q-uc.a.run.app \
  -- npx -y relic-mcp
```

No clone and no build step. `npx` fetches on first use and caches.

Then ask your agent to publish something: *"publish ./report.md as a relic."*

### Any client that takes a JSON config

Claude Desktop, Cursor, Windsurf, Cline, and most others read a variant of
this. The key names differ; the shape does not.

```json
{
  "mcpServers": {
    "relic": {
      "command": "npx",
      "args": ["-y", "relic-mcp"],
      "env": {
        "RELIC_SERVICE_ORIGIN": "https://relic-wh2jw5fg2q-uc.a.run.app"
      }
    }
  }
}
```

### Over HTTP instead of stdio

```bash
RELIC_MCP_HTTP=1 RELIC_SERVICE_ORIGIN=https://... npx -y relic-mcp
# -> http://127.0.0.1:7333/mcp
```

Useful when several agents on one machine should share a single process, or
when it runs under a supervisor. Loopback by default: this process can read
any file its user can, so binding it to a network interface hands that reach
to the network. `RELIC_MCP_ALLOWED_ORIGINS` is a comma-separated allowlist for
browser callers, and an origin outside it is refused to defeat DNS rebinding.

### Environment

| Variable | Meaning |
|---|---|
| `RELIC_SERVICE_ORIGIN` | The Relic service to publish to. Required in practice. |
| `RELIC_ORIGIN` | Origin used to build the shareable URL. Defaults to the service origin. |
| `RELIC_CLIENT_NAME` | Reported to the service as the publishing client. |
| `RELIC_MCP_HTTP` | `1` to serve Streamable HTTP instead of stdio. |
| `RELIC_MCP_PORT`, `RELIC_MCP_HOST` | HTTP bind. Defaults to `127.0.0.1:7333`. |
| `RELIC_MCP_ALLOWED_ORIGINS` | Comma-separated `Origin` allowlist for HTTP. |

## Protocol

Pinned to revision **`2026-07-28`**, the revision that made the MCP core
stateless. There is no `initialize` handshake, no session, and no
`Mcp-Session-Id`: every request declares its own version in `_meta`, and the
server accepts or rejects each one independently.

Relic holds nothing between calls, so the server can be restarted,
round-robined behind a load balancer, or run one-shot without a client
noticing. `server/discover` is implemented, as the revision requires.

The handshake-based revisions (`2025-11-25` and earlier) are still answered,
which the spec calls a dual-era server. A client that only speaks the newest
revision is unusable in most of the agents this product exists to serve.

On HTTP the mirrored routing headers are enforced rather than merely accepted:
`MCP-Protocol-Version`, `Mcp-Method`, and `Mcp-Name` must agree with the body,
and a mismatch is refused with `-32020`. That check exists because a gateway
routing on the header while the server executes on the body is a split-brain
with security consequences, not a cosmetic inconsistency.

### It runs locally, and you can read it

Something has to run on your machine, because encryption has to happen where
the plaintext is. That is forced by the product, not chosen.

What is chosen is that it arrives as **readable source rather than a compiled
binary**. `dist/relic-mcp.js` is a single unminified file of about 1,100
lines, and it is exactly what executes. The TypeScript it was built from ships
in the same package. Releases carry [npm provenance][provenance], which is a
cryptographic attestation binding the published tarball to a specific commit
and workflow in this repository.

There is also a `relic_describe_client` tool. Call it and the client tells you
what it does with your file, what leaves the machine, and what the service can
see, without reading a byte or sending a request. Inspection decoupled from
execution, which is strictly better than inspecting code that is about to run.

[provenance]: https://docs.npmjs.com/generating-provenance-statements

### Why this is not a hosted MCP server

It is the question everybody asks, so: a remote server would have to receive
your file in order to encrypt it, which destroys the product. Zero-knowledge
is not a feature layered on top, it is a consequence of the encryption
happening on the machine that already holds the plaintext. The transport can
be stdio or HTTP; the process runs next to the file either way.

The tempting variant is a remote server that returns a script for the agent to
run, so the plaintext still never leaves. That trades a confidentiality
property for remote code execution: whoever controls the server, or one
response, runs arbitrary code on every user's machine on every publish.
CVE-2025-6514 scored 9.6 for the accidental version of that shape. The claim
would also degrade from "we never receive your bytes" to "trust the script we
sent this time", re-decided per call and unauditable in practice.

## Where the decisions live

`docs/` holds the design, and it is the source of truth rather than a summary
written afterwards.

- `docs/frame.md` and `docs/preconditions.md` are locked. Anything downstream
  contradicting them is drift and routes back rather than getting absorbed.
- `docs/spec/` fixes the format, the publish contract, the service surface,
  and the viewer.
- `docs/decisions.md` makes the thirteen picks those documents deliberately
  routed forward, each citing the rule that constrains it. No constant in the
  code is unaccounted for.

## Not done

These are launch obligations, and nothing here claims them:

- The two registrable domains, and Search Console verification on both. The
  build runs against placeholder names.
- The pre-launch empirical test of what enterprise mail security does to a URL
  fragment. Until it runs, the disclosure statement stays correct under all
  three possible outcomes rather than asserting one.
- The named abuse-response human and their named backup.
- A deploy pipeline. Deploys run in CI, never from a workstation.
