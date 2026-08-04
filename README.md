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
| `@relic/mcp` | The local stdio MCP server. Holds the key, encrypts in process, returns no script. |
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

### The publishing client

```bash
bun run --filter '@relic/mcp' build   # a single binary
```

Point an MCP client at it with `RELIC_SERVICE_ORIGIN` set. It exposes one
tool, `relic_publish`, which takes a filesystem path and never inline content.

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
