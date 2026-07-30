---
name: Specify viewer routing, rendering, the sandbox boundary, and every recipient screen
unit_type: doc
status: in_progress
depends_on:
- spec-relic-format
worker: ''
model: opus
station: specify
inputs:
- docs/spec/format.md
outputs:
- docs/spec/viewer.md
- docs/spec/viewer.sources.txt
branch: darkrun/relic/units/specify/spec-viewer
started_at: 2026-07-30T06:45:45.341264+00:00
iterations:
- worker: spec_writer
  started_at: 2026-07-30T06:45:45.341264+00:00
  completed_at: 2026-07-30T06:45:45.341264+00:00
  result: advance
  note: |-
    `docs/spec/viewer.md` (4752 words) and `docs/spec/viewer.sources.txt` (15 URLs) committed at `e5db812` on the unit branch. Worktree clean.

    **Gates reported by the beat:** exists 0; floor 0 at 4752 against 2600; 15 sources against a floor of 6; urls exit 0; zero em-dashes or en-dashes; trailing newline present. Orphan check clean both directions, 15 in doc and 15 in manifest. Only non-ASCII is `§`. Contractions 94 tokens. The "X, not Y" appositive is down to 5 total, one per 950 words, against the one-per-195 rate flagged on the sibling.

    **Sibling input read via `git show darkrun/relic/units/specify/spec-relic-format:docs/spec/format.md`**, the fallback rung the manager verified in advance. The station ref still does not resolve. Confirmed: the disagreement rule compares the **encrypted envelope header's declared mimetype and filename** against the magic-byte sniff, since no renderer class is available to this unit and it never asks for one.

    ## This beat fact-checked the brief and found three of its claims wrong

    **All three independently re-verified by the manager against MDN browser-compat-data. The beat is correct on every one, and `browser-crypto-and-large-file-constraints` has been corrected in place.**

    - **"iOS Safari and mobile lack the service-worker fetch support the streaming path needs" is false.** `FetchEvent` and `FetchEvent.respondWith` are both `safari: 11.1` with `safari_ios` mirroring. hat.sh does cap Safari and mobile at 1 GB and does state that rationale, but the rationale no longer matches the platform. **The beat's response is better than a corrected list:** tier by runtime feature detection and explicitly forbid a hardcoded browser list, on the grounds that a hardcoded list encodes exactly the kind of claim that just failed verification.
    - **The "500 to 800 MB band" is one forum thread**, not a measured range, and the 512 MB `ArrayBuffer` figure was wrong. Restated as a practitioner report with Apple publishing no per-tab ceiling.
    - **The Safari `for await` gap is narrower than stated.** `ReadableStream[@@asyncIterator]` is Chrome 124 and Safari 27, and Safari 27 has not shipped. So no shipping Safari has it, `getReader()` loops are the portable path, and the constraint has a known expiry.
    - **CVE-2026-41238 checks out** on range (3.0.1 to 3.3.3), fix (3.4.0), and CVSS (6.9), with one qualification the shorthand loses: the advisory requires a prototype pollution primitive in the same execution context, so DOMPurify at default config is not independently bypassable. What is true is that no special config is needed. The beat stated the sharper version.

    **Tooling caveat, now recorded as run knowledge.** WebFetch's summarizer returned text **flatly inverting** RFC 9110's meaning, claiming fragments are not forwarded across redirects when §10.2.2 mandates the opposite. The beat caught it by pulling the raw RFC and confirming the knowledge-base quotes are exact. Do not trust a fetched summary of a specification on this run.

    ## The four unroutable decisions

    - **`{markdown, code}` routing.** A silent sniff means untyped bytes, and untyped bytes get exactly one treatment: plain text, built as DOM text nodes on the viewing origin, after a valid-UTF-8 check (failure means binary means download-only). The declared mimetype or extension may select a **decoration** (highlighter grammar) or request a **downgrade** (`.md` to the sandbox), never an upgrade. A publisher lying about `.md` gets the sandbox, where HTML already goes, so the lie buys nothing.
    - **Markdown renders on the sandbox origin**, treated as forced rather than balanced: Markdown builds markup structure from attacker bytes regardless of raw-HTML handling, so rendering on the viewing origin makes sanitization the only layer, which the locked precondition forbids. Consequence stated, including the resulting split of viewer responsibilities across the two domains.
    - **Per-relic subdomain**, isolation consequence stated both ways.
    - **Stripped fragment honored** per `format.md` 2.5: explicit copy-link control present from load and backed by the in-memory key; dead-reload screen distinguished from "link missing its key" via `PerformanceNavigationTiming`. Presented as shrinking the window rather than closing it, naming history sync, extensions reading `window.location.href` at load, and the referring app.

    ## Fields needed on the mint response, stated as needs

    The signed URL; its absolute expiry (so repeat opens judge reuse instead of re-minting); object length in bytes (refuse-before-allocating, and a real total for the fetch progress phase); the object's CRC32C (the transport-corruption versus wrong-key discriminator, framed as integrity and never authenticity); and a machine-readable refusal reason on a refused mint. **`spec-service-surface` was writing its field set in parallel and independently landed a superset**, so these reconcile.

    ## Routed to `shape`

    Five, all from this unit's own Route section, nothing else. **PSL lead time, named as the finding it is:** there is none. The list's guidelines state "There are NO SERVICE LEVEL AGREEMENTS ON TIME nor any expectation of processing speed or urgency" and "Unfortunately, there is no way to expedite." Unbounded and unexpeditable, so it starts first in the domain workstream.

    ## Where the adversary should push

    Seven judgment calls, surfaced rather than buried:

    1. **The subdomain label is a one-way hash of the relic ID, not the ID.** Nothing prescribed it. Reasoning: a raw ID in a DNS query is a live bearer token for the ciphertext, visible along the resolution path, and a hashed label gives the shim a pseudonym it cannot invert, which partly answers the brief's "arguably never send the relic ID to the shim."
    2. **Deterministic derivation rather than a random per-render value**, chosen for repeat-open stability and shim cacheability, accepting that two viewers of the same relic share an origin.
    3. **Plain text and highlighted code stay on the viewing origin**, resting entirely on the stated principle that the viewing origin may place attacker bytes into text nodes but never parses them into markup. If that principle breaks, section 3 changes shape.
    4. **Markdown-on-sandbox treated as forced** rather than balanced.
    5. **The downgrade-only asymmetry** in the `{markdown, code}` rule.
    6. **The PWA relaunch claim is an inference, not a cited fact:** that an installed PWA opens its `start_url` and therefore holds no key.
    7. **`PerformanceNavigationTiming`** as the dead-reload discriminator, and whether its compat story is stated honestly.

    ## On word count

    4752 against a 2580 to 3655 band. Deliberate, per the calibration precedent set when `format.md` landed at 5365. The beat states the overage is concentrated in section 5, where two corrected claims needed their evidence stated. The adversary was asked to test that rather than accept it.
- worker: adversary
  started_at: 2026-07-30T07:02:23.313581+00:00
  completed_at: 2026-07-30T07:02:23.313581+00:00
  result: advance
  note: |-
    **Verdict: criteria 4, 7, 10, and 11 fail; the other twelve pass.** Seventeen findings, no edits, no commits. Every spec pulled as raw text and grepped; WebFetch used on nothing.

    ## F1, critical, the handshake is unimplementable as specified.

    §4 mandates both the `Content-Security-Policy: sandbox` header on the shim's own response **and** an exact `targetOrigin` for the payload message. **The manager verified the mechanism against MDN verbatim: "A sandboxed resource is otherwise treated as being from an opaque origin, which ensures that it will always fail same-origin policy checks... The Origin of sandboxed resources without the `allow-same-origin` keyword is `null`."**

    `postMessage` does not dispatch when `targetOrigin` is not `*` and the target's origin does not match, an opaque origin matches nothing, and `"null"` is not a parseable URL so it throws. **The only value that reaches an opaque-origin shim is `'*'`**, which the same section forbids for the payload and which criterion 11 exists to prevent. Following the document as written yields either a viewer that cannot render or one that broadcasts plaintext to whatever occupies the frame.

    It also collapses §2's "the parent computes `targetOrigin` per render," one of three stated reasons for per-relic subdomains. `MessageChannel` and `opaque` each appear zero times in the document.

    Two resolutions offered, both sound: **(a)** two layers, shim on a real addressable origin with untrusted content in a sandboxed inner iframe, which is what the cited web.dev page actually describes and which preserves §2's argument; or **(b)** transfer a `MessagePort` in the data-free handshake, point-to-point, no `targetOrigin` needed. The tightener was directed to (a) as preserving more of the document, with (b) explicitly permitted.

    ## F2, high, the sandbox-shape decision rests on a cost that does not exist.

    §2 justifies per-relic subdomains by claiming a fixed origin lets "one malicious relic reach another's rendered document." Under §4's own `CSP: sandbox` mandate every rendered document is already in its own opaque origin, so they are already cross-origin on one hostname. **The refuting sentence is on the MDN page §4 cites and on the web.dev page §2 cites.**

    The argument that survives is on §2's own cited page and omitted: "If SpectreJS and renderer compromise attacks are outside of your threat model, then using CSP sandbox is likely a sufficient solution." Per-relic subdomains buy process-level isolation against Spectre and renderer compromise. **The decision stands; the reasoning is wrong.** Also missing: per-relic subdomains mean unbounded auto-generated hostnames under a wildcard, the exact pattern `preconditions.md` names as the Immich trigger, and the answer the document already has material for (the sandbox hostname serves only a static shim that never touches ciphertext or the network).

    ## F3, high, the redirect rule is overbroad and destroys the key. Filed separately as fb-09.

    RFC 9110 §17.11's remedy is scoped to redirects "**to other sites**," and the RFC's own worked example of desired behavior is same-site fragment preservation. §1.7 drops the qualifier, mandates an explicit fragment on **every** redirect, and lists same-origin cases among the bite points. Since the server never receives the fragment, "explicit, possibly empty" means empty in practice, so a recipient hitting `/{id}/#key` is redirected to `/{id}` with inheritance blocked and lands on the missing-key screen.

    **`format.md` §5 carries the same undifferentiated list and that unit is locked**, so this was filed as `fb-09` with a recommendation not to reopen it. Both §1.7 quotes are verbatim and the cross-origin half is the correct non-inverted version; the defect is over-application, not inversion.

    ## F4 and F5, high, dropped obligations from locked artifacts.

    **F4:** `format.md` §3.1 assigns this unit two filename rules and the document carries neither. `filename` appears twice, both as a routing input, while the taskbar is specified six times and never told what to do with the name. §1.3's own mandated copy requires displaying it, so untrusted bytes are guaranteed to reach user-visible text on the origin holding the fragment. **This is the real hole in the "text nodes, never markup" principle: the one attacker-controlled stream the document forgot to route.**

    **F5:** `frame.md`'s locked wedge boundary says "Markdown (rendered, **with a source toggle**)." The string `toggle` appears zero times. With Markdown on the sandbox and plain text on the viewing origin, where each side of the toggle lives is a live question.

    ## F6, F7, F8, high, internal contradictions.

    **F6:** §3.3's "sanitize it like Markdown if a highlighter can't work that way" is a sanitize-then-parse path on the origin holding the fragment, making sanitization the only layer, which is exactly what §3.1 invoked the locked precondition to forbid. Also, §3.3's stated reason for keeping code on the viewing origin is wrong (a highlighter does build structure from attacker bytes); the real distinction is fixed grammar versus attacker-controlled attributes and raw-HTML passthrough.

    **F7:** §1.5 declares SVG download-only while removing every input that could route it there. Follow §1.4 and untyped SVG lands in plain text on the viewing origin instead. Two rules, one input, two answers. §1.4's downgrade mechanism is the fix and is never invoked.

    **F8, criterion 7:** "least privileged path either type would allow" admits two readings that route the same bytes to different origins, and the worked example asserts one of them using a requirement stated nowhere. Separately, when both types map to the same level the rule picks an origin and no renderer.

    ## F9, criterion 4, an unsupported citation.

    §4 attributes to MDN that the header "applies to the whole response and can't be stripped... which makes it strictly stronger." **The manager confirmed: that page has zero occurrences of "whole response," "strip," or "stronger," and makes no header-versus-attribute comparison.** The claim is true and derivable; the citation does not support it. **This is the third citation defect in three units.**

    ## F10 through F17

    The four key-disclosure paths are claimed twice and never enumerated, so the unit's own premise is unverifiable. The streaming tier and the pre-decrypt CRC32C check are incompatible. The ServiceWorker gets seven words despite being an origin-wide persistent first-party script on the origin holding the fragment. The privilege order is a total order on browser-side privilege but not on harm, since forcing download-only puts an attacker-named file on disk outside the sandbox. Three scope leaks (a DOMPurify version pin, a deferral to `shape` outside the permitted categories, and enumerating the mint response's value set). Three places narrate the review process instead of addressing the downstream station. The PWA claim states as absolute what W3C appmanifest calls "purely advisory," and misses that a warm relaunch resumes in-memory with the key still live. Four small ones including a `U+202E` gap in the UTF-8 gate.

    ## The seven flagged calls: five right, two with real holes

    **Right:** the hashed subdomain label (DNS and SNI expose the hostname where the path does not, so a raw ID there is a fetchable bearer token; residual to state is that the deterministic derivation lets a URL-holder confirm from resolver logs that a device opened a specific relic); deterministic derivation (right, but the safety comes from opaque origins, not from "same content, so harmless"); the text-nodes principle (unbreakable from outside; it breaks from inside at F6 and F4); Markdown to the sandbox (right answer, "forced" not established, and the stated reasoning proves too much since it would force the highlighter there too); `PerformanceNavigationTiming` (compat figures exact against compat data, one gap where the navigation entry is absent).

    **Holes:** the downgrade-only asymmetry (F13, an attacker gains something at the bottom of the order) and the PWA claim (F16).

    ## Verified clean

    Zero em-dashes. 94 contractions and 4 authored appositives at one per 1150 words, both matching the writer's report exactly. Manifest: 15 sources, all resolving, orphan-clean both directions, trailing newline at byte level. Not padded by volume, and the adversary measured that the padding the writer attributed to §5 is actually the F15 narration. **Nothing locked is relitigated**, checked one by one. Consistency with `format.md` correct on eight separate points. Third-party rewriters correctly disclaimed to the sibling. Criteria 6, 8, 9, 12, 13, 14, 16 satisfied.
- worker: tightener
  started_at: 2026-07-30T07:19:51.344312+00:00
  completed_at: 2026-07-30T07:19:51.344312+00:00
  result: advance
  note: |-
    Resolve complete at `7121fc2`, worktree clean. All seventeen findings plus three verdict items answered, and four new issues the beat found itself.

    **Gates re-run independently by the manager:** artifact-exists PASS; substance-floor PASS at 7883 against 2600; sources 17 against 6; every URL resolves; zero dashes. Spot-checked the fixes: `targetOrigin: '*'` appears **zero** times, `opaque` now appears six, F9's unsupported strings are gone, `toggle` is present, `filename` went from 2 to 8 mentions, the bidi gate is in, and the GHSA quote now reads `(latest)`.

    ## F1, the architectural contradiction, resolved as option (a) and better than either option offered

    **The shim keeps a real origin with no `sandbox` on its own response; the untrusted document goes in a sandboxed child iframe.** The opaque origin belongs at layer two where nothing needs to address it by origin. The shim's response instead carries `default-src 'none'`, its inline script by hash, `frame-ancestors` limited to the viewing origin, and `nosniff`.

    **The result is stronger than the rule it replaced. `'*'` now appears nowhere in the design at all**, including the data-free `ready`, because §2 already makes the shim's expected parent origin a hardcodable constant. The guarantee stopped being a carve-out.

    §4 states the header mandate as a rule that **moved** rather than one that was dropped, and cross-references §2, so "the parent computes `targetOrigin` per render" survives verbatim. Two consequences fell out and were stated: the layer-two `sandbox` attribute is sufficient **only because the locked never-both rule holds**, making the two load-bearing together; and a render-frame message arrives with `event.origin` of `"null"`, which the pinned parent origin can never equal, giving the shim a free authentication discriminator.

    ## F3, and the beat corrected the manager's framing

    I directed a split on cross-origin versus same-origin. **That axis is wrong and the beat said so.** Apex-to-`www` is cross-origin yet still inside Relic, so filing it under the mandatory-explicit-fragment half would have destroyed the key exactly the way the blanket rule did. **The correct axis is the destination's trust boundary**, which also absorbs HTTP-to-HTTPS instead of leaving it a special case. Leaving the service gets a mandatory explicit fragment; staying inside deliberately omits it so inheritance carries the key, said out loud. Preferred form is no inside-the-service redirect on the relic path at all, with HSTS preload moving the scheme upgrade into the user agent.

    ## F8, the disagreement rule, now unambiguous

    Three clauses operating on privilege levels rather than type names. Levels differ: download-only every time, explicitly not the lower of the two, justified without inventing a requirement (a disagreement proves one input is lying and the viewer cannot tell which, so anything above download-only trusts one of them). Levels match: the sniffed type picks the renderer, since it derives from bytes and the declaration is a publisher assertion. Either way the taskbar says the contents do not match the name.

    ## Quotation audit, and a second fabrication-class defect

    Every quoted string re-pulled as raw text and grepped, no WebFetch. All verbatim except two. F9's MDN claim confirmed falsified (zero occurrences of "whole response", "strip", "stronger"), citation dropped and the claim restated as derived reasoning. **And a defect nobody had flagged: the GHSA quote read "3.0.1 through 3.3.3 (current latest)" where the advisory says "(latest)".** One word inside quotation marks. Smaller blast radius than the service unit's fabrication, identical class, and it is the argument for running the audit past the flagged citation rather than only at it.

    ## Remaining findings

    F2's false cost replaced with the Spectre and renderer-compromise argument from the page §2 already cited, plus the Immich wildcard cost answered by the shim being the only thing on those hostnames. F4 added §1.9 with six filename rules, no numbers so nothing new is routed. F5 states the locked source toggle and both origins, and tears the shim frame down on switch. F6 deleted the sanitize-then-parse escape hatch and replaced the false "never builds structure" claim with the real fixed-grammar versus attacker-controlled-attributes distinction. F7 made `.svg` an explicit downgrade trigger, so no input reaches two answers. F10 enumerated the four paths and mapped every subsection. F11 gave per-tier integrity behavior. F12 gave the ServiceWorker five rules. F13 scoped the privilege claim to browser-side and renamed grammar selection an attacker-selected parser. F14 dropped all three scope leaks. F15 removed all review narration. F16 softened the PWA claim with the appmanifest quote and added the warm-resume case. F17 fixed four, including moving the blob rule onto the normative File API section and neutralizing the bidi range with a Trojan Source citation.

    ## Four new issues the beat found

    The GHSA discrepancy; the F3 axis correction; **the document's own opening framing was falsified by F6 and nobody flagged it** ("any path that turns attacker bytes into markup structure runs on the sandbox origin" is untrue of the highlighter, restated to "never lets attacker bytes choose what markup gets built"); and the free `"null"`-origin discriminator, stated so an implementer does not invent a weaker nonce scheme for the same job.

    ## Word count: 7883, accepted, not cut

    4752 to 7883 after a compression pass worth about 250 words. **The beat offered to cut and asked which rules to lose. Declined.** Its measured words-per-rule runs 51 to 97 across sections against the calibration's observed 60 to 85, so the density is in band; the document is long because resolving the findings added roughly 100 distinct rules where the calibration assumed 43. Cutting costs rules, and trading verified rules for a stub-guard number is the trade already declined twice this station. Precedent: format 5365, service 6551.

    ## Drift re-reported, already filed

    The beat independently re-identified `format.md` §5's undifferentiated redirect list and correctly did not touch the locked unit. Already filed as `fb-09` with a recommendation not to reopen. Its added observation is worth carrying: **`spec-service-surface` is the unit that would implement that list, so this propagates if the audit ignores it.**
reviews:
  completeness:
    at: 2026-07-30T05:31:07.501358+00:00
  testability:
    at: 2026-07-30T05:14:48.190501+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/spec/viewer.md
- name: substance-floor
  command: test "$(wc -w < docs/spec/viewer.md)" -ge 2600
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/spec/viewer.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/spec/viewer.sources.txt'
gate_results:
- name: artifact-exists
  status: pass
  at: 2026-07-30T07:20:07.134296+00:00
  attempts: 1
  detail: '`test -f docs/spec/viewer.md` exits 0. Run by the manager in the unit worktree at commit 7121fc2, not taken from a beat''s self-report.'
- name: substance-floor
  status: pass
  at: 2026-07-30T07:20:12.749482+00:00
  attempts: 1
  detail: |-
    `test "$(wc -w < docs/spec/viewer.md)" -ge 2600` exits 0. Actual: 7883 words, up from 4752 at the writer's commit, and the largest artifact in the station.

    The tightener offered a further cut and asked which rules to lose. **Declined by the manager.** Its measured density is 51 to 97 words per distinct rule across sections, straddling the calibration's observed 60 to 85, so the document is not diluted. It is long because resolving seventeen findings added roughly 100 distinct rules where the calibration assumed 43: the two-layer sandbox boundary, six filename rules, the three-way redirect split, three per-tier integrity behaviors, five ServiceWorker rules, the source toggle, the bidi gate, the SVG downgrade trigger, the disagreement tiebreak, and the PWA warm-resume case. Cutting costs rules, and trading verified rules for a stub-guard number is the trade already declined twice at this station. Precedent: format 5365, service 6551.
---

# Goal

Write `docs/spec/viewer.md`: how the viewer routes, renders, isolates, and what every recipient sees in every state. Plus `docs/spec/viewer.sources.txt`, one URL per line, trailing newline.

**This unit owns all four key-disclosure paths found in discovery.** Each is a case where every component behaves correctly and an unspecified boundary lets the decryption key walk out. Write rules, not descriptions.

**Read first:** `darkrun_knowledge_list` in full, especially `renderer-class-is-a-security-boundary-not-a-label`, `rendering-untrusted-content-origin-isolation`, `redirects-inherit-the-fragment-and-leak-the-key`, `sandbox-csp-decision-and-what-the-wedge-actually-is`, and `browser-crypto-and-large-file-constraints`.

Then read, from the repo root (**do not `cd` into a subdirectory**, `git ls-tree` scopes to the prefix):

- `docs/frame.md` and `docs/preconditions.md`, the **locked** upstream artifacts. Both are on this station's branch, so they are in your worktree. **Do not run `git show darkrun/relic/frame:...`**; that ref no longer exists locally and exits 128.
- `docs/spec/format.md`, your declared sibling input, which settles the container and fragment. **Do not redefine either.**

**If `docs/spec/format.md` is not in your worktree, stop and fetch it before writing anything that depends on it.** Worktree fork timing relative to a sibling's land is not guaranteed, and in the previous station a dependent unit's declared input was genuinely absent. Fall back in order:

```
git show darkrun/relic/specify:docs/spec/format.md
git show darkrun/relic/units/specify/spec-relic-format:docs/spec/format.md
```

**Never proceed by redefining what a sibling settles.** Report which path you used.

# Already decided. Do not relitigate.

- **Untrusted content renders on a separate registrable origin**, never the one holding the fragment.
- **Never both `allow-scripts` and `allow-same-origin`.**
- **The viewing origin carries no third-party scripts, no analytics, no error reporting.** Two traps: **a bundled first-party-served SDK satisfies `script-src 'self'` and presents no external host to scan for**, so neither a CSP fetch nor a third-party-host scan catches it (Sentry's browser SDK is exactly that shape); and **the run's telemetry decision is not license to add a viewer-side script**, since all three telemetry items are collected server-side at publish and at mint.
- **The sandbox CSP blocks outbound requests**, matching Artifacts. Decided at this station.
- **First release renders exactly `{markdown, code, html, image}`.** Everything else is download-only.

# What this document must decide

## 1. Routing, and the four disclosure paths

- **The class never routes.** The renderer class is a *publisher assertion*. If the viewer routes on it, a publisher declares `image` on an HTML payload and wins inline rendering on the origin holding the fragment. That is the fragment-stealing attack in one step. **Publisher-attestation inside the ciphertext does not fix it**: attestation defeats operator forgery and does nothing about a publisher lying. State the reasoning, because an earlier version of the recorded knowledge got this wrong and someone will re-derive it.
- **Routing comes from magic-byte sniffing after decryption, as a hint that can only reach a less privileged path.** Privilege order, least to most: download-only, sandbox origin, viewing origin.
- **The disagreement rule.** When declared and sniffed types disagree, route to the **least privileged path either type would allow**, and tell the recipient the contents do not match the name. One sentence, and it closes the polyglot class for the first release.
- **Sniffing cannot decide for half the wedge, and this is the hardest question in the unit.** Markdown, plain text, source code, CSV, and JSON have no magic numbers, so the sniff returns nothing for `{markdown, code}`. **State the rule that routes them given the class cannot be trusted and the sniff is silent.** Criterion 13 forbids deferring this to `shape`.
- **SVG is download-only in the first release.** No magic number, sniffs as XML or text, inert under `Content-Disposition: attachment` and inside `<img src>` while executing fully inline, as `<object>`, or on direct navigation. A spec saying "still images render inline" without carving out SVG ships the CVE.
- **Blob URLs inherit the creating origin.** Never navigate to or open a blob URL built from untrusted plaintext on the viewing origin. Download blobs are typed `application/octet-stream` regardless of the container's declaration, triggered via `a[download]`. Images render only via `<img src=blob:>`.
- **Every redirect Relic issues carries an explicit, possibly empty, fragment in `Location`.** RFC 9110 §10.2.2 makes fragment inheritance mandatory browser behavior and §17.11 names it as cross-site disclosure. **One fragment-less redirect to the sandbox origin hands it the key.** Enumerate where it bites: HTTP to HTTPS, apex to www, service origin to sandbox origin, legacy paths, trailing-slash normalization, and any CDN or load-balancer redirect the application does not author. That last is the one nobody audits. **Redirects and rewrites performed by third parties are `spec-service-surface`'s item, not yours.**
- **`Referrer-Policy: no-referrer` on the viewing origin**, and no code path writes the fragment to the console, to storage, or into an error object.

## 2. The sandbox origin's shape

**Nobody has decided whether the sandbox is one fixed origin or a per-relic subdomain, and several rules rest on the answer.** `rendering-untrusted-content-origin-isolation` prescribes a unique cross-site domain per piece of content under a Public-Suffix-List-registered parent, isolating relics from each other rather than only from the app. The preconditions fix two registrable domains, compatible with either answer.

Decide, and state the consequences:

- **A single fixed sandbox origin.** Simplest. Relic A's rendered content shares an origin with relic B's, so one malicious relic can reach another's rendered document if both are open. The parent's `targetOrigin` is a constant.
- **A per-relic subdomain.** Isolates relics from each other. The parent computes `targetOrigin` per render; the shim's expected parent origin remains a hardcodable constant. **Requires Public Suffix List registration of the sandbox parent.**
- Repeat the preconditions' honest limit: treat PSL as origin isolation with a possible listing-scope benefit, never as a guaranteed firewall.

## 3. Rendering each class

- **Markdown is a partial HTML class**, because Markdown permits raw inline HTML, so rendering it on the viewing origin puts sanitizer output next to the fragment. DOMPurify has been bypassed at **default configuration** as recently as CVE-2026-41238 (3.0.1 through 3.3.3). **Decide here, do not route:** strip raw HTML entirely in the first release, or render Markdown on the sandbox origin like HTML. **The second choice changes the sandbox origin's role from "HTML only" to "all rich text," which changes the `postMessage` surface and how much of the viewer lives on which domain.** Pin DOMPurify at or above 3.4.0 regardless, and state that sanitization is the second layer, never the only one.
- **Markdown link and image targets are attacker-controlled**: `javascript:`, `data:`, remote images. A remote image is both an exfiltration channel and a beacon revealing a specific relic was opened. Under the locked strict CSP they fail to load, so **the viewer explains why rather than showing silent broken-image icons that read as a corrupt file.**
- **Code and plain text, two traps.** Syntax highlighters take a language hint usually derived from the attacker-controlled extension, and some build HTML by string concatenation: build output as DOM text nodes or sanitize it like Markdown, and fall back to plain text on an unrecognized hint. Separately, a code file can be many megabytes on one line, which hangs the highlighter and freezes the tab: cap the highlighted region and render the remainder as plain text behind a stated cutoff.
- **Where security headers actually matter.** The object fetch goes client-to-GCS on a signed URL, so the app server cannot set headers on it, and what GCS serves is ciphertext, unsniffable into anything executable. **The controls that matter are the viewing origin's own responses and the blob URLs the viewer creates.**

## 4. The sandbox boundary

- **Direction is forced, not chosen.** The main origin fetches, decrypts, and posts plaintext to a static shim that never touches ciphertext or the network. The alternative would require the key to cross, which must never happen. State it as forced, because the other shape is what someone reaches for to avoid posting large payloads across a boundary.
- **What crosses.** Parent to shim: decrypted bytes, the routing type, a render nonce. Never the key, never the fragment, arguably never the relic ID. Shim to parent: a `ready` handshake, a rendered-or-failed ack, optionally a requested height. **A requested-height channel is a message type an attacker also gets to send**, so say what the parent does with untrusted numbers.
- **The handshake.** The shim posts a data-free `ready` to `parent` with `targetOrigin: '*'`; the parent replies with the payload and an **exact** `targetOrigin`; the shim pins `event.origin` from that reply. **The `'*'` is safe only because the ready message carries nothing. The payload message must never use `'*'`**, since that hands the whole plaintext to whatever occupies the frame.
- **Transfer, do not copy.** Post plaintext as a transferable `ArrayBuffer`; structured-cloning doubles memory on exactly the large payloads the wedge exists to carry.
- **Mandate the `Content-Security-Policy: sandbox` header on the shim's own response**, not merely the iframe attribute, because the header cannot be stripped by the framed document.
- **The main origin materializes the download Blob**, never the sandbox.
- **The taskbar and content are on different origins by construction**, so the content iframe is never full-viewport and a relic authored to fill the screen renders letterboxed. Product-visible; state it before someone finds it in review.
- **The recipient-visible consequence.** An HTML relic cannot navigate the top-level window, open popups, or load external resources. **Present the sandbox as deliberate**, or the recipient concludes the relic is corrupt and the publisher concludes the product is broken.

## 5. Platform ceilings and degradation

- **Secure context first.** `crypto.subtle` is `undefined` outside a secure context, so check `window.isSecureContext` and `crypto.subtle` before anything else and show a specific named error. Not only a dev concern: a recipient behind a TLS-terminating proxy serving plain HTTP hits it in production.
- **Refuse before allocating.** A single `subtle.decrypt` on a large buffer freezes the tab, with practical failure reported at 500 to 800 MB. **Plaintext size is computable from encrypted size without decrypting**, so compare against a platform ceiling before touching memory. The tab must never die.
- **Three tiers, and say which platform gets which**: streaming decrypt to disk via ServiceWorker; in-memory decrypt then Blob download, capped at a memory ceiling; refuse with a named reason and a concrete alternative. **iOS Safari and mobile lack the service-worker fetch support the streaming path needs**, which capped hat.sh at 1 GB, and Safari lacks `for await` on `ReadableStream`, so the Safari path is a distinct code path using `getReader()` loops.
- **Degraded render.** The four renderable classes may render a truncated prefix behind an explicit banner stating it is truncated and why; download-only classes refuse instead.
- **The hard size cap value determines whether this tiering is required at all.** It is named in this unit's Route-to-`shape` list, so routing it is legitimate.

## 6. Every screen the recipient sees

- **Five states the viewer must handle, of which three are distinguishable and two are not.** Missing or malformed fragment; server refused to mint with a stated reason; decrypt failed. **A wrong key and a corrupted download both throw `OperationError` and are genuinely indistinguishable at the API level**, which is why they collapse into the third screen. Name both plausible causes in the copy, offer a retry because the retry is itself the discriminator, and never blame the recipient.
- **Separating corruption from a wrong key is possible with a facility that already exists.** GCS records a CRC32C on every object. Rightly rejected as a blocklist hash, it is exactly right as a transport-integrity check. If the mint response carries object length and checksum, transport corruption becomes detectable and a wrong key becomes the clean residual. **State the need and the viewer behavior that follows from it; `spec-service-surface` owns whether those fields exist.** State it as an integrity check, not an authenticity one.
- **The unfurl card.** The fragment never reaches a server, so no unfurler can describe the content. **A blank card on an unfamiliar domain is the visual shape of a phishing link.** Serve deliberate Open Graph and Twitter Card metadata on `/{id}`, identical for every relic, saying what Relic is without pretending to describe the content. Serving it must not mint. Open Graph tags are not indexing and Slack documents that it ignores `robots.txt`, so there is no conflict with the noindex precondition; say so, or someone later removes the tags in the name of that rule.
- **Before decryption completes, everything except the content renders**: the branded taskbar, the service name, one line of plain-language explanation, the abuse-report link, and the privacy-statement link (`spec-service-surface` owns that statement's contents).
- **The honesty constraint applies hardest here.** "Nobody can read this but you" is an overclaim on the exact surface where a recipient is deciding whether to trust the domain.
- **Three named progress phases, never one indeterminate spinner**: fetching (network-bound, retryable, total known, so show bytes and total), decrypting (CPU-bound, not retryable, framing gives record boundaries so show real progress), rendering.
- **No key-entry field** on the viewing origin unless `shape` deliberately wants one, because it is a purpose-built phishing surface aimed at the system's only secret.
- **Every error screen is a relic page**, carrying the abuse-report and policy links.
- **Repeat opens.** Reuse a still-valid signed URL rather than minting per page load, and the mint response carries its own expiry so the viewer can tell whether reuse is valid. A PWA reopened from the home screen, a restored tab, a pull-to-refresh, and a back-forward navigation are each otherwise another mint and another counted open.
- **If `docs/spec/format.md` decided the viewer strips the fragment via `history.replaceState`, carry the consequence**: the recipient can no longer re-share from the address bar and a reload loses the key, so the viewer owes an explicit copy-link affordance backed by the in-memory key. Honor whichever way `format.md` decided.

# Route to `shape`

Name each with what `shape` must choose: platform memory ceilings and whether they are hardcoded or feature-detected (Apple publishes no per-tab ceiling, hat.sh's 1 GB is an empirical project decision, and the 500 to 800 MB band is a forum report, so say what the numbers rest on); **the hard size cap value**, which determines whether the section 5 tiering is required at all; the truncated-prefix size and the highlighted-region cap, both user-visible cutoffs the viewer states in its own copy; **PSL registration for the sandbox parent, with its lead time named**.

# Style

Direct, dry, confident, **contractions used naturally**, brevity, authority through specificity. No corporate-speak, no hedging, no stock AI phrasing. **Never an em-dash or en-dash.** Keep the flat form where a human would say "is not" for emphasis on a load-bearing rule. No emoji.

# Completion criteria

1. `test -f docs/spec/viewer.md` exits 0.
2. `test "$(wc -w < docs/spec/viewer.md)" -ge 2600` exits 0. **Calibration:** this unit carries roughly 43 mandated items at an observed 60 to 85 words per item, so a compliant document lands between about 2580 and 3655 words. 2600 sits at that band's bottom. **The floor is a stub guard, never a target**, and completeness here is carried by criteria 5 through 16, not by word count. If you are near the floor, check for skipped items before assuming you are short, and never pad to clear it.
3. Manifest has at least six sources, one per line, trailing newline.
4. Every source resolves. **Do not invent citations.** Orphan check both directions.
5. Every item in "What this document must decide" is resolved into a stated rule or routed to `shape`. **Routing is legitimate only for items named in this unit's own "Route to `shape`" section; routing anything else fails this criterion.**
6. The document states that the renderer class never routes, and why publisher-attestation does not make it safe.
7. The document states the least-privileged-path disagreement rule.
8. The document carves SVG out of inline image rendering explicitly.
9. The document states the blob-URL origin-inheritance rule and the `application/octet-stream` download rule.
10. The document states the fragment-in-`Location` rule for every redirect and enumerates where it bites.
11. The document states that `postMessage` carrying plaintext never uses `'*'`.
12. The document specifies three named progress phases and forbids a single indeterminate spinner.
13. **The document states a routing rule for `{markdown, code}`, which have no magic bytes. This may not be routed to `shape`.**
14. **The document decides whether the sandbox is one fixed origin or a per-relic subdomain, states the isolation consequence, and routes PSL registration to `shape` with its lead time named.**
15. **The document is consistent with `docs/spec/format.md` on whether the fragment is stripped from the address bar, and carries the copy-link consequence if it is.**
16. **The document decides the Markdown rendering origin (viewing origin with raw HTML stripped, or sandbox origin). This may not be routed to `shape`.**

# Files touched

- `docs/spec/viewer.md`, `docs/spec/viewer.sources.txt` (create)

# Out of scope

- The URL, ID, and container format. Locked by `docs/spec/format.md`.
- The MCP tool and publish contract. Sibling `spec-publish-contract`.
- Status codes, expiry semantics, delete-by-ID, abuse intake, mint placement, counting rules, the published disclosure statement, **the mint response's own field set**, and **third-party link shorteners and enterprise link rewriters**. Sibling `spec-service-surface`. You specify what the viewer *shows* for each state and the redirects Relic itself issues; where you need a field on the mint response, state the need and let that sibling define it.
- Any numeric value, the stack, and all implementation.
- Visual design. Specify what must be on screen and what it must say, never how it looks.
