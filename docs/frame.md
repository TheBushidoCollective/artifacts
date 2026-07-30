# Relic: Frame

The locked frame for the Relic run. Every later station inherits it. If a station needs something here to be different, that is drift and it routes back to this station. Nobody redefines it quietly downstream.

## What Relic is

A zero-knowledge publishing service driven by an MCP tool. You tell your coding agent to publish a file as a relic. A local stdio MCP server generates a random secret on your machine, encrypts the file in-process, and uploads only ciphertext to a service backed by Google Cloud Storage. You share `https://<relic-domain>/{id}#{secret}`. URL fragments are never transmitted to a server, so the operator never receives the key. A PWA fetches the ciphertext, decrypts it in the browser, and renders it by mimetype under a branded taskbar.

It is called a relic and not an artifact because Claude already has Artifacts and the collision would be constant.

## Locked constraints

Three decisions were settled before this document. Recorded as constraints, not reopened.

1. **No server-returned executable script.** The local stdio MCP server holds the key and encrypts in-process. CVE-2025-6514 earned CVSS 9.6 because a remote MCP server returned one attacker-chosen string in a metadata field and got RCE on the client ([JFrog](https://jfrog.com/blog/2025-6514-critical-mcp-remote-rce-vulnerability/)). Returning script bodies on purpose makes that outcome the documented behavior instead of the bug.
2. **Relic does not run under `thebushido.co`.** It needs two registrable domains distinct from it: one for the service, one for the sandbox origin that renders untrusted HTML. Google flagged every subdomain of `immich.cloud` over per-PR preview environments, including internal-only services, then flagged it again after a successful appeal ([Immich](https://immich.app/blog/google-flags-immich-as-dangerous)). Safe Browsing generates the parent domain as a lookup key for every subdomain ([Google](https://developers.google.com/safe-browsing/reference/URLs.and.Hashing)), and Microsoft's Tenant Allow/Block List treats a URL domain entry as covering all subdomains by default ([Microsoft](https://learn.microsoft.com/en-us/defender-office-365/tenant-allow-block-list-urls-configure)).
3. **Rendering is the wedge. Zero-knowledge is the permission slip.**

## The problem

Your agent made something a person needs to look at, and there is no good way to hand it over.

The report, the diff summary, the generated chart, the scraped dataset. It exists on a machine the reader cannot reach, in a format a chat window flattens into garbage, and the reader is a colleague, a client, or your own phone. Today you paste it into Slack and it truncates, zip it and email it and the gateway strips it, push a gist and lose the rendering, or screenshot it and lose the text.

Claude's Artifacts solves this once, for one path. Source file types are restricted to `.html`, `.htm`, and `.md`, with a 16 MiB rendered cap and a strict CSP blocking external requests. It requires a claude.ai-authenticated session on Pro, Max, Team, or Enterprise. It is **off by default in Agent SDK, GitHub Action, and MCP-server contexts**, and sessions using an API key, gateway token, or cloud-provider credential cannot publish at all ([Claude Code docs](https://code.claude.com/docs/en/artifacts), [Anthropic support](https://support.claude.com/en/articles/9547008-publish-and-share-artifacts)). The gap is not a preference. For a large share of agent runs there is no publish button in the product at all.

## The user

Two segments survived scrutiny. Both are defined by the absence of a first-party path, not by dissatisfaction with one.

**Headless and CI agent runs producing a report a human must read.** The trigger is a nightly job, a PR check, or a scheduled audit finishing with output someone has to see. Artifacts are off by default in Agent SDK and GitHub Action contexts, and API-key sessions cannot publish at all, so there is no first-party path whatsoever. Today they dump it to the job log, commit it to a branch nobody opens, or upload a CI artifact behind a login the recipient does not have. The cleanest segment, because the alternative is not a worse tool, it is nothing.

**Developers on non-Claude agents.** Cursor, Codex, Copilot, Cline, Windsurf, Aider, Amp. Same trigger, an agent finishing something worth showing, and none of them has a publish button anywhere. Today they run the paste-and-truncate loop above.

One more is worth naming as a bonus rather than a bet: **consultant-to-client delivery**. Artifacts publish under the publisher's name with a link to their gallery, which is wrong for client work. That is a positioning advantage, not a capability gap, so nothing load-bearing rests on it.

Explicitly ruled out: **orgs that disabled Artifacts for compliance.** An org that blocked Artifacts on policy will not approve an unvetted third-party domain either. Not a segment, just a longer sales cycle ending in no.

## The value

The wedge is opinionated, mimetype-aware rendering of agent output, and it holds because it is the only ground no competitor occupies. file.kiwi ships client-side AES-GCM, key-in-fragment, no account, no size limit, 96-hour expiry, **and an MCP server**, free ([file.kiwi](https://file.kiwi/), [server](https://github.com/file-kiwi/filekiwi-mcp-server)). PrivateBin has shipped the identical construction since 2012 ([PrivateBin](https://github.com/PrivateBin/PrivateBin)). Neither the crypto nor agent-native publishing is defensible ground. What none of them do is render the thing well. Zero-knowledge is what *permits* adoption inside a company, letting a developer answer "am I allowed to send our internal report through a third party" without booking a security review. It is not what drives adoption. Nobody picks a tool for it, they are merely allowed to pick one.

**Honesty constraint, non-negotiable.** The JavaScript performing decryption is served by the same server the zero-knowledge claim is made against, and that server could ship different JavaScript tomorrow. So it is a claim about operator intent, not a property a recipient can verify. PrivateBin's threat model says this out loud ([threat model](https://github.com/PrivateBin/PrivateBin/wiki/Threat-Model)), 0bin says it, and Relic says it too. Overclaiming here is a reputational liability with no upside.

## The success metric

One primary metric, both halves required:

> **A majority of published relics are opened by someone other than the publisher, and a majority of those opened relics are of a type Relic renders rather than download-only binaries.**

If the second clause fails, Relic is a worse file.kiwi and the value case is false.

Neither half is measurable by default. The server holds only ciphertext and never receives the key. Mimetype sniffing happens after decryption, in the browser. The viewing origin carries no analytics, because any same-origin script can read `location.hash`. Left alone, "opens by rendered type" degrades into "opens," which is the one number that cannot detect the failure it exists to detect.

### The minimum telemetry that restores measurability

All server-side. None of it requires a script on the viewing origin.

1. **A coarse renderer class declared at publish time by the local client**, which holds the plaintext: one of `markdown`, `code`, `html`, `image`, `media`, `archive`, `binary`. Stored server-side against the relic ID.
2. **Open counts taken at signed-URL mint time.**
3. **Publishing client name**, so "does this serve the segments Artifacts cannot" is answerable at all.

The class is stored against the relic ID and every open event names that ID, so joining them yields the class distribution of the *opened* population, not just the published one. The class is immutable for a relic's life, because republish-to-same-URL and versioning are non-goals, so one relic has exactly one plaintext and exactly one true class. The taxonomy cuts on the wedge boundary: renderable is `{markdown, code, html, image}`, download-only is `{media, archive, binary}`. The second clause is computable with no ambiguity.

### The confound in the first clause, which is permanent

Separating a recipient's open from the publisher's own is **not fully solvable** under the locked non-goals. Accounts would solve it. Accounts are a non-goal. So this is documented, not engineered away.

**The asymmetry runs both directions, and only one is safe.** Excluding opens originating from the publishing IP undercounts in the harmless direction: a genuine recipient behind the publisher's NAT gets excluded, which can only make you believe you lost when you won. The dangerous direction is the publisher opening their own relic from cellular, a VPN, a second machine, or a coffee shop, which counts as a recipient and inflates the exact clause the metric rests on. Not a corner case here. Relic ships a PWA whose point is mobile viewing, and checking your own link before sending it is the most likely thing a publisher does.

**The discriminator for the dominant false positive: a post-publish exclusion window.** The self-check is overwhelmingly immediate, so opens minted within 120 seconds of publish are excluded from the recipient count. It is a time delta between the publish timestamp and the mint timestamp, computed entirely server-side, needing nothing from the viewing origin.

**What that discriminator fails to catch.** It misses a publisher who checks twice, and it misses the publisher who sends the link and then opens it on their phone five minutes later, which is precisely the mobile-PWA behavior the product encourages. It cuts the wrong way at the other end too: when a publisher never self-checks, the window eats a genuinely fast first recipient open and undercounts. So it shaves the largest, most predictable false positive and leaves residue in both directions. Tuning the number trades one direction for the other, it does not remove either.

**The trust condition.** There are no accounts, so the trust condition has to be stated in things the server can actually see: relic volume and distinct publishing IPs. Below roughly 100 relics per week, or while a single publishing IP accounts for most of them, the first clause is not informative and must not be reported as a result. That covers the whole dogfooding period, when the collective is the dominant publisher, and that is exactly when self-checks dominate the sample. It is also exactly when the first clause would otherwise read green in the world where Relic has zero recipients. Report it as instrumentation health, not evidence.

The honest conclusion: **the first clause cannot be made fully trustworthy under this architecture.** It is a directional indicator with a known inflation bias and gets read as one.

Two further limits. This measures the *type* of what was opened, never whether rendering succeeded; render success would need a script on the viewing origin, which is forbidden. The metric claims type and the telemetry answers type, so it is self-consistent, but nobody downstream reads it as proof the renderer worked. And the confound touches only the first clause. The second clause is substantially robust to publisher self-opens, because a publisher self-checks relics drawn from the same publishing population, so the failure it exists to detect (most relics are binaries) still shows through. The sharper half of the metric is the half the confound damages least.

### The cost of the telemetry

This leaks a coarse content category, a client name, and IP-correlated open activity to the operator. It is metadata, never content, and the operator still cannot read a byte of any relic. But it is a real reduction from "the operator knows nothing" to "the operator knows what kind of thing you published and roughly how often it was fetched." A deliberate trade, made because a wedge nobody can measure is a wedge nobody can defend. Publishers must be able to see all of it in a published privacy statement before they publish anything. Upload IP and timestamp are already retained for abuse response, so the IP-correlation cost is largely pre-existing.

### Supporting conditions

Four, each checkable, none primary.

1. **The service domain stays unflagged** by Safe Browsing, VirusTotal consensus, and the major mail-gateway blocklists. Checked on a schedule against every registrable domain, all verified in Search Console before launch ([Google](https://support.google.com/webmasters/answer/6347750)). This one differs from the others: failing it means shut it down, not tune it.
2. **The publishing client distribution includes headless, CI, and non-Claude clients**, not just interactive Claude Code. Computable from telemetry item 3. If it is all Claude Code, Relic is serving the audience that already has Artifacts.
3. **Every abuse report is actioned within the published window**, measured from report receipt to object delete. Read off the abuse queue.
4. **Egress spend stays under the kill-switch ceiling.** Read off the billing export.

## The standing assumption that could invalidate this frame

Both primary segments derive entirely from a capability gap in a product Anthropic controls. That window is not permanent, and pretending otherwise defers wrong-thing risk instead of killing it.

**The assumption:** Artifacts stay unavailable to headless and non-interactive agent contexts, and stay restricted to `.html`, `.htm`, and `.md`.

**The falsifying trigger:** Artifacts becoming available in Agent SDK or GitHub Action contexts, or accepted source file types widening beyond `.html`/`.htm`/`.md`. Either one alone is enough.

Hitting either trigger is a change to the problem, not a detail to absorb downstream. It routes back to this station as drift. Whoever notices it first says so rather than quietly rescoping around it.

## The wedge boundary

Rendering is the wedge, so the frame bounds it or the wedge is unbounded. This is a value decision and it is urgent, because in-page archive browsing works only if the crypto framing supports range decryption, and that choice is irreversible once content is encrypted. `shape` picks the wire format and needs this signal first.

**First release renders:** Markdown (rendered, with a source toggle), code and plain text (syntax highlighted), HTML (on the sandbox origin), and still images. Everything else is download-only in the first release.

That set is exactly `{markdown, code, html, image}`, exactly the renderable side of the telemetry taxonomy. No gap between what the metric counts as renderable and what the first release renders. If one slips, the taxonomy moves with it and the metric is restated. Same decision.

**The value case requires range-decryptable framing regardless.** In-page archive browsing and seekable media are precisely the payloads Artifacts cannot carry, which is the whole reason this product exists. They are not in the first release. They are in the value case. `unzipit` can avoid downloading a whole ZIP when the server supports HTTP range requests ([unzipit](https://github.com/greggman/unzipit)), and `wormhole-crypto` implements `decryptStreamRange` over RFC 8188 framing ([wormhole-crypto](https://github.com/SocketDev/wormhole-crypto)), so the capability exists off the shelf. The constraint `shape` inherits is about reversibility, not about building the feature now: **do not choose a wire format that forecloses range decryption.** Ship the first release without archive browsing. Do not make archive browsing impossible.

## Non-goals

These bound every later station. Anything here showing up in a downstream design is drift.

- **No accounts.** No sign-up, no sign-in, no identity anywhere in the product.
- **No dashboard and no "my relics" list.** There is no logged-in surface to hang one on.
- **No republish-to-same-URL and no versioning.** That is Artifacts' genuine strength and it needs identity to do safely. A new relic is a new URL.
- **No custom domains.** The domain strategy is a security control, not a branding surface.
- **No team features.** No sharing groups, no org accounts, no permissions.
- **No expiry configuration.** TTL is mandatory and fixed, set by the operator as an abuse control.
- **No burn-after-reading in the first release.** Not a taste call. A Slack unfurl, a Safe Links scanner, or an antivirus mail gateway would fetch the URL and burn the relic before a human ever clicks it, producing a stream of "the link is dead" reports that look exactly like a broken product.
- **No first-party rendering of media, archives, or arbitrary binaries.** Download-only in the first release, per the wedge boundary. The framing constraint stays.
