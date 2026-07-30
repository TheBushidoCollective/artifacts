---
name: Write frame.md — problem, user, value, success metric, non-goals
unit_type: doc
status: pending
depends_on: []
worker: ''
model: opus
station: frame
outputs:
- docs/frame.md
- docs/frame.sources.txt
quality_gates:
- name: artifact-exists
  command: test -f docs/frame.md
- name: substance-floor
  command: test "$(wc -w < docs/frame.md)" -ge 900
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/frame.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/frame.sources.txt'
---

# Goal

Write `docs/frame.md`, the locked artifact of the `frame` station for the Relic run. Every later station inherits it and may not silently redefine it. It states the problem, the user, the value, the success metric, and the non-goals, tightly, in the user's terms, with every external claim carrying a real source.

Also write `docs/frame.sources.txt`, a citation manifest: one URL per line, no other text, listing every external source `docs/frame.md` relies on. This is what makes the citations checkable.

**Read `darkrun_knowledge_list` first, in full.** Ten topics were recorded during discovery and they are your evidence base. You have no other context. Do not restate the research; distill it into a frame.

# What Relic is

A zero-knowledge publishing service driven by an MCP tool. A user tells their coding agent to publish a file "as a relic" (named *relic*, not *artifact*, to avoid colliding with Claude's Artifacts feature). A local stdio MCP server generates a random secret on the user's machine, encrypts the file in-process, and uploads only ciphertext to a service backed by Google Cloud Storage. The user shares `https://<relic-domain>/{id}#{secret}`. Because URL fragments are never transmitted to a server, the operator never receives the key. A PWA fetches the ciphertext, decrypts it in-browser, and renders it by mimetype under a branded taskbar.

# The three decisions already locked

Settled. Record them as constraints; do not relitigate them.

1. **No server-returned executable script.** A local stdio MCP server encrypts in-process. This overrode the original brief. See `mcp-client-architecture-local-binary-not-returned-script`.
2. **Relic does not run under `thebushido.co`.** Two registrable domains distinct from it are required: one for the service, one for the sandbox origin that renders untrusted HTML. See `domain-strategy-and-safe-browsing-blast-radius`.
3. **Rendering is the wedge; zero-knowledge is the permission slip.** See `prior-art-zero-knowledge-link-sharing` and `claude-artifacts-capability-boundary`.

# Required content

## The problem
State it in the user's terms, not the builder's. The shape: an agent produced something a human needs to look at, and there is no good way to hand it over. Ground the claim that the gap is real using `claude-artifacts-capability-boundary`. Artifacts are restricted to `.html`/`.htm`/`.md`, capped at 16 MiB, and **off by default in Agent SDK, GitHub Action, and MCP-server contexts**, with API-key sessions unable to publish at all.

## The user
Name concrete segments, each with a trigger moment and what they do today instead. The two that survived scrutiny:
- **Headless and CI agent runs** producing a report a human must read. No first-party publish path exists for them at all. The cleanest segment.
- **Developers on non-Claude agents** (Cursor, Codex, Copilot, Cline, Windsurf, Aider, Amp), which have no publish button anywhere.

Add at most one further segment, and only if the recorded evidence supports it. Explicitly rule out orgs that disabled Artifacts for compliance: an org that blocked Artifacts on policy will not approve an unvetted third-party domain either.

## The value
One paragraph naming the wedge and why it holds. Rendering is primary because it is the only ground no competitor holds. file.kiwi already ships client-side AES-GCM, key-in-fragment, no account, no size limit, 96-hour expiry, and an MCP server, free. Say plainly that zero-knowledge is what *permits* adoption inside a company rather than what *drives* it.

Include the honesty constraint: the JavaScript performing decryption is served by the same server the zero-knowledge claim is made against, so it is a claim about operator intent, not a property a recipient can verify. PrivateBin and 0bin say this out loud; Relic must too.

## The success metric
**Exactly one** observable that tells us we won, stated as a checkable condition, not a vanity count. Choose the one that most directly tests the wedge: that recipients open relics, and that opened relics are predominantly types Relic *renders* rather than download-only binaries. If most relics are binaries, Relic is a worse file.kiwi, and the metric must be capable of revealing that.

Then list at most four supporting conditions, each checkable. One of them must be the service domain staying unflagged by Safe Browsing, VirusTotal consensus, and the major mail-gateway blocklists, because that condition failing means shut it down.

## The non-goals
Bound the work for every later station. At minimum: no accounts, no dashboard, no "my relics" list, no republish-to-same-URL or versioning (that is Artifacts' strength and needs identity to do safely), no custom domains, no team features, no expiry configuration. State that burn-after-reading is a non-goal for the first release specifically because a Slack unfurl or a Safe Links scanner would burn the relic before a human ever clicks.

# Style

Write as Jason Waldrip would: direct, dry, confident, contractions, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never use an em-dash or an en-dash.** Rewrite with a comma, a colon, parentheses, or two sentences. No emoji.

# Completion criteria

1. `docs/frame.md` exists → `test -f docs/frame.md` exits 0.
2. It is substantive, not a sketch → `test "$(wc -w < docs/frame.md)" -ge 900` exits 0.
3. `docs/frame.sources.txt` lists at least six sources, one URL per line, nothing else → `bash -c 'set -eu; n=$(grep -c . docs/frame.sources.txt); test "$n" -ge 6'` exits 0.
4. Every listed source actually resolves over the network → `bash -c 'set -eu; while IFS= read -r u; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/frame.sources.txt'` exits 0.
   **Do not invent citations.** Every URL must come from the recorded knowledge topics or be one you verified yourself. A fabricated URL fails this gate, which is the point.
5. The document contains all five required sections: problem, user, value, success metric, non-goals.
6. The success metric section names exactly one primary metric.

# Files touched

- `docs/frame.md` (create)
- `docs/frame.sources.txt` (create)

# Out of scope

- Choosing the server language, framework, or hosting topology. That is `shape`.
- Choosing the encryption wire format. That is `shape`.
- Endpoint design, schemas, relic ID format.
- Visual design direction for the PWA.
- The operating preconditions and the abuse-operations go/no-go. That is the sibling unit `frame-preconditions`, which depends on this one. Do not write it here.
- Any code, config, or infrastructure.
