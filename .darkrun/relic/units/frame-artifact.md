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
branch: darkrun/relic/units/frame/frame-artifact
reviews:
  feasibility:
    at: 2026-07-30T02:47:23.386041+00:00
  value:
    at: 2026-07-30T02:45:12.239582+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/frame.md
- name: substance-floor
  command: test "$(wc -w < docs/frame.md)" -ge 1300
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/frame.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/frame.sources.txt'
gate_results:
- name: artifact-exists
  status: pass
  at: 2026-07-30T02:57:20.603686+00:00
  attempts: 1
  detail: '`test -f docs/frame.md` exit=0 in the frame-artifact worktree.'
- name: substance-floor
  status: pass
  at: 2026-07-30T02:57:22.635060+00:00
  attempts: 1
  detail: '`test "$(wc -w < docs/frame.md)" -ge 1300` exit=0. Actual word count 2510, floor 1300.'
---

# Goal

Write `docs/frame.md`, the locked artifact of the `frame` station for the Relic run. Every later station inherits it and may not silently redefine it. It states the problem, the user, the value, the success metric, the standing assumption, the wedge boundary, and the non-goals. Tightly, in the user's terms, with every external claim carrying a real source.

Also write `docs/frame.sources.txt`, a citation manifest: one URL per line, no other text, listing every external source `docs/frame.md` relies on. End the file with a trailing newline.

**Read `darkrun_knowledge_list` first, in full.** The recorded topics are your evidence base. You have no other context. Do not restate the research; distill it into a frame.

**A warning about the citation manifest.** Some knowledge topics contain illustrative URL-shape examples rather than citations, such as `https://file.kiwi/abcdef12#secretKey` and `https://wormhole.app/{roomId}#{mainSecretKey}`. Those are templates, not sources. They 404. Do not put them in the manifest. Only real, resolvable sources go there.

# What Relic is

A zero-knowledge publishing service driven by an MCP tool. A user tells their coding agent to publish a file "as a relic" (named *relic*, not *artifact*, to avoid colliding with Claude's Artifacts feature). A local stdio MCP server generates a random secret on the user's machine, encrypts the file in-process, and uploads only ciphertext to a service backed by Google Cloud Storage. The user shares `https://<relic-domain>/{id}#{secret}`. Because URL fragments are never transmitted to a server, the operator never receives the key. A PWA fetches the ciphertext, decrypts it in-browser, and renders it by mimetype under a branded taskbar.

# The three decisions already locked

Settled. Record them as constraints; do not relitigate them.

1. **No server-returned executable script.** A local stdio MCP server encrypts in-process. See `mcp-client-architecture-local-binary-not-returned-script`.
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

## The success metric, and the telemetry that makes it measurable

**This section must state the metric, how it is computed, and where the computation is untrustworthy. A metric with no path to a number is not a metric. A number whose known failure direction is undocumented is worse.**

The primary metric: **a majority of published relics are opened by someone other than the publisher, and a majority of those opened relics are of a type Relic renders rather than download-only binaries.** If that second clause fails, Relic is a worse file.kiwi and the value case is false.

Neither half is measurable by default under the locked architecture. The server holds only ciphertext, never receives the key, and `archive-browsing-and-mimetype-detection` puts mimetype sniffing after decryption in the browser. The viewing origin carries no analytics, because any same-origin script can read `location.hash`. State the minimum telemetry that restores measurability:

1. **A coarse renderer class declared at publish time by the local client**, which holds the plaintext: one of `markdown`, `code`, `html`, `image`, `media`, `archive`, `binary`. Stored server-side against the relic ID.
2. **Open counts taken at signed-URL mint time.**
3. **Publishing client name**, so "does this serve the segments Artifacts cannot" is answerable at all.

Do not attach any qualifier to item 2 claiming a clean separation of publisher from recipient. That belongs below, with its limits attached, so the list never asserts a method the document then has to walk back.

The class is stored against the relic ID and every open event names that ID, so joining them gives the class distribution of the *opened* population. The class is immutable for the relic's life, because republish and versioning are non-goals, so one relic has exactly one true class. Note that the taxonomy cuts exactly on the wedge boundary: renderable is `{markdown, code, html, image}`, download-only is `{media, archive, binary}`, so the second clause is computable with no ambiguity.

### The confound the first clause carries, which must be documented rather than hidden

Separating a recipient's open from the publisher's own is **not fully solvable** under the locked non-goals. Accounts would solve it, and accounts are a non-goal, so the residual confound is permanent. The document must say so. State all four of these:

1. **The asymmetry, in both directions.** Excluding opens from the publishing IP fails asymmetrically. Same-NAT is the safe direction: a genuine recipient behind the publisher's NAT is excluded, which undercounts recipient opens and can only make you believe you lost when you won. The dangerous direction is the publisher opening their own relic from cellular, a VPN, a second machine, or elsewhere, which counts as a recipient and inflates the exact clause the metric rests on. This is not a corner case for this product: Relic ships a PWA whose point is mobile viewing, and checking your own link before sending it is the most likely thing a publisher does.
2. **At least one discriminator for the dominant false positive.** The self-check is overwhelmingly immediate, so a short post-publish exclusion window is the cheap one. Name a mechanism; the choice is yours, but it must be concrete, and it must be computable server-side (a time delta between publish and mint qualifies; anything needing a script on the viewing origin does not).
3. **What your chosen discriminator fails to catch.** Whatever you name in point 2, state its blind spot in the same breath. A short post-publish window misses a publisher who checks twice, or who checks from a phone after sending the link, and it eats a genuine first recipient open when the publisher never self-checks at all. This is the section's own governing principle applied one level down: an undocumented failure direction is worse than a known one. It also converts "concrete" from an adjective into something a reader can actually check.
4. **The trust condition.** Below what volume, or during what period, the number is not informative. Early low-volume operation with the collective as publisher is exactly when self-checks dominate the sample, which is exactly when the metric would otherwise read green in the world where Relic has zero recipients.

If the honest conclusion is that the first clause cannot be made fully trustworthy, say that. It is a legitimate outcome and it belongs in the document.

Two further limits worth stating. First, this measures the *type* of what was opened, not whether rendering succeeded. Render success would need a script on the viewing origin, which is forbidden. The metric claims type and the telemetry answers type, so it is self-consistent, but do not let anyone downstream read it as proof the renderer worked. Second, the confound above touches only the first clause. The second clause is substantially robust to publisher self-opens, because a publisher self-checks relics drawn from the same publishing population, so the failure it exists to detect (most relics are binaries) still shows through. Say so, because it means the sharpest half of the metric is the half the confound damages least.

### The cost of the telemetry

State it honestly in the document: this leaks a coarse content category, a client name, and IP-correlated open activity to the operator. It is metadata, not content, and the operator still cannot read a single byte of any relic. But it is a real reduction from "the operator knows nothing" to "the operator knows what kind of thing you published and roughly how often it was fetched." Record it as a deliberate trade, made because a wedge nobody can measure is a wedge nobody can defend. Publishers must be able to see this in a published privacy statement.

Then list at most four supporting conditions, each checkable. One of them must be that the service domain stays unflagged by Safe Browsing, VirusTotal consensus, and the major mail-gateway blocklists, because that condition failing means shut it down.

## The standing assumption that could invalidate this frame

Both user segments derive entirely from a capability gap in a product Anthropic controls. `claude-artifacts-capability-boundary` records that the window is not permanent.

State the assumption plainly, and state the trigger that falsifies it: Artifacts becoming available in Agent SDK and GitHub Action contexts, or accepted source file types widening beyond `.html`/`.htm`/`.md`. Say that hitting either trigger is a change to the problem, which routes back to this station as drift rather than being absorbed downstream. A frame that defines its users by a gap one vendor can close, without recording that it may close, has deferred wrong-thing risk instead of killing it.

## The wedge boundary (which types are first-class)

Rendering is the wedge, so the frame must bound it or the wedge is unbounded. This is a value decision, not a shape decision, and it is urgent: `archive-browsing-and-mimetype-detection` records that in-page archive browsing works only if the crypto framing supports range decryption, and that the choice is irreversible once content is encrypted. `shape` picks the wire format. It needs this signal before it does.

State two things:

1. **First release renders**: Markdown (rendered, with a source toggle), code and plain text (syntax highlighted), HTML (on the sandbox origin), and still images. Everything else is download-only in the first release. This set must match the `{markdown, code, html, image}` renderable side of the telemetry taxonomy exactly, so there is no gap between what the metric counts as renderable and what the first release actually renders.
2. **The value case requires range-decryptable framing regardless.** In-page archive browsing and seekable media are exactly the payloads Artifacts cannot carry, which is the whole reason this product exists. They are not in the first release, but they are in the value case, so `shape` must not choose a wire format that forecloses them. State this as a constraint `shape` inherits, and be explicit that it is a constraint on reversibility, not a request to build the feature now.

## The non-goals
Bound the work for every later station. At minimum: no accounts, no dashboard, no "my relics" list, no republish-to-same-URL or versioning (that is Artifacts' strength and needs identity to do safely), no custom domains, no team features, no expiry configuration. State that burn-after-reading is a non-goal for the first release specifically because a Slack unfurl or a Safe Links scanner would burn the relic before a human ever clicks.

# Style

Write as Jason Waldrip would: direct, dry, confident, contractions, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never use an em-dash or an en-dash.** Rewrite with a comma, a colon, parentheses, or two sentences. No emoji.

# Completion criteria

1. `docs/frame.md` exists → `test -f docs/frame.md` exits 0.
2. It is substantive and complete, not a subset → `test "$(wc -w < docs/frame.md)" -ge 1300` exits 0. This floor is calibrated to the natural length of a compliant document covering all seven sections, which lands near 1,400 words written tightly. It is set deliberately close to that so the gate carries a completeness signal rather than only catching a stub. Do not pad to reach it. If you are below it, you are missing required content, most likely part of the success metric section.
3. `docs/frame.sources.txt` lists at least six sources, one URL per line, nothing else, ending with a trailing newline → `bash -c 'set -eu; n=$(grep -c . docs/frame.sources.txt); test "$n" -ge 6'` exits 0.
4. Every listed source actually resolves over the network → `bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/frame.sources.txt'` exits 0.
   **Do not invent citations.** Every URL must come from the recorded knowledge topics or be one you verified yourself. A fabricated URL fails this gate, which is the point. Illustrative URL-shape templates are not citations and will fail it too.
5. The document contains all seven required sections: problem, user, value, success metric with its telemetry, standing assumption, wedge boundary, non-goals.
6. The success metric section names exactly one primary metric, states how each half is computed, and states the metadata cost of computing it.
7. The wedge boundary section names the first-release renderer set, matches it to the renderable side of the telemetry taxonomy, and states the range-decryptable framing constraint that `shape` inherits.
8. The standing assumption section names a falsifying trigger, not a vague risk.
9. The success metric section documents the publisher-versus-recipient confound with all four parts: the asymmetry named in both directions, a concrete server-side-computable discriminator for the immediate self-check, an explicit statement of what that discriminator fails to catch, and a stated trust condition below which the number is not informative. It must also state that the confound is permanent under the non-goals rather than implying it was engineered away, and must not attach a clean-separation claim to the telemetry list itself.

# Files touched

- `docs/frame.md` (create)
- `docs/frame.sources.txt` (create)

# Out of scope

- Choosing the server language, framework, or hosting topology. That is `shape`.
- Choosing the specific encryption wire format. That is `shape`. This unit states only the reversibility constraint `shape` must respect.
- Endpoint design, schemas, relic ID format.
- Visual design direction for the PWA.
- Designing the telemetry storage or the privacy statement's wording. State what must be collected, what it costs, and where it is untrustworthy, not how it is stored.
- Implementing the self-check discriminator. Name the mechanism and its blind spot, do not design it.
- The operating preconditions and the abuse-operations go/no-go. That is the sibling unit `frame-preconditions`, which depends on this one. Do not write it here.
- Any code, config, or infrastructure.
