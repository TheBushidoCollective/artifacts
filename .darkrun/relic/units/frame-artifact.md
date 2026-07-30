---
name: Write frame.md — problem, user, value, success metric, non-goals
unit_type: doc
status: completed
depends_on: []
worker: distiller
model: opus
station: frame
outputs:
- docs/frame.md
- docs/frame.sources.txt
branch: darkrun/relic/units/frame/frame-artifact
started_at: 2026-07-30T03:00:30.528869+00:00
completed_at: 2026-07-30T03:23:42.278612+00:00
iterations:
- worker: framer
  started_at: 2026-07-30T03:00:30.528869+00:00
  completed_at: 2026-07-30T03:00:30.528869+00:00
  result: advance
  note: |-
    Framer beat complete. `docs/frame.md` and `docs/frame.sources.txt` written and committed at `5e19438` on `darkrun/relic/units/frame/frame-artifact`. Worktree clean.

    **All four gates run for real and recorded with the nonce, all exit 0:** `artifact-exists`; `substance-floor` at 2542 words against a floor of 1300; `sources-manifest-populated` at 13 non-empty lines, all `^https://`, trailing newline confirmed (last byte 0x0a); `every-cited-url-resolves` with all 13 fetched. The framer pre-screened 22 candidate URLs with the exact gate command before writing and cited only those returning 0. Both URL-shape templates were deliberately excluded. Gates were re-run green after two post-commit edits, with `substance-floor` re-recorded against the final count.

    **The discriminator it chose:** a 120-second post-publish exclusion window. Opens whose signed-URL mint timestamp falls within 120 seconds of the publish timestamp are excluded from the recipient count. Pure server-side time delta, nothing from the viewing origin, so it satisfies the server-side-computable requirement in criterion 9.

    **The blind spot it stated:** the window misses a publisher who checks twice, and misses the publisher who sends the link then opens it on their phone minutes later, which is exactly the mobile-PWA behavior the product encourages. It also cuts the wrong way at the other end, eating a genuinely fast first recipient open when the publisher never self-checks. Tuning the number trades one direction for the other rather than removing either. The document states outright that the first clause cannot be made fully trustworthy under this architecture.

    ---

    # CHALLENGER: attack these five first, ranked by how likely they are to stick

    The framer named its own weak points rather than defending its work. Treat that as a map, not as absolution. Verify each rather than accepting its self-assessment, and hunt for what it did not name.

    **1. Length. The strongest available criticism.** 2542 words against a floor calibrated to roughly 1,400 written tightly. The framer wrote a first draft at 2642, ran a tightening pass, and recovered only 132 words, which indicates a shallow pass rather than irreducible content. It estimates 300 to 500 words of genuine slack, concentrated in "What Relic is," "The problem," and the second half of the confound subsection. It said it would not fight hard for the current count. Cut hard. The floor is a completeness signal, not a target, and the spec explicitly says do not pad.

    **2. Two invented numbers with nothing behind them.** The 120-second window and a "roughly 100 relics per week" trust threshold. The knowledge base supplies neither figure; it says "a short post-publish exclusion window" and "below what volume." The spec demanded concrete, so the framer picked. Neither is evidence-backed. It rates the 100/week threshold as the softer of the two. Decide whether each should be stated as an explicit provisional value a later station can move, rather than reading as a derived number.

    **3. A third user segment on thin evidence.** It added consultant-to-client delivery, resting on a single knowledge-topic sentence about the Artifacts header naming the publisher and linking their gallery. The spec permits at most one further segment "only if the recorded evidence supports it." The framer hedged it as "a bonus rather than a bet" and kept anything load-bearing off it, and says it would not defend it hard. Judge whether one sentence clears the evidence bar. If it does not, cut it, which also helps point 1.

    **4. Possible scope bleed into `frame-preconditions`.** Supporting condition 3 is an abuse-report response-time condition, and abuse operations belong to the sibling unit. The framer's reasoning: condition 1 (domain unflagged, failing means shut it down) is mandated by the spec and equally operational, so the list tolerates operational conditions. That is defensible but the boundary is fuzzy. Conditions 2 and 4 (client distribution, egress spend) are clean.

    **5. One error class that already got past it once. Look for more of the same.** The first draft stated the trust condition as "100 relics per week from more than one publishing account." Accounts are an explicit non-goal, so that named a thing the product does not have. It was rewritten in server-observable terms (relic volume plus distinct publishing IPs) and the fix is noted in the document. **Sweep the entire metric section for any other quantity the server cannot actually observe.** That class of error demonstrably slipped through once, and the whole point of this station's metric section is that unobservable quantities are the failure mode.

    # Assumptions it made that the spec did not cover, worth a second opinion

    - Document order: "What Relic is" and "Locked constraints" as a preamble before the seven required sections. The spec said record the three decisions as constraints but not where.
    - Read "at most four supporting conditions" as exactly four, making condition 1 the mandated domain-reputation one and calling out its shut-it-down consequence as different in kind from the other three.
    - Interpreted "no expiry configuration" as a non-goal about user-facing configurability, then stated TTL is mandatory and fixed as an operator-set abuse control. That leans on `abuse-liability-of-hosting-uninspectable-content`. Confirm it will not conflict with what `frame-preconditions` lands on, since that unit owns the v1 control set.

    # Non-negotiable while you work

    Re-run all four gates after any edit and re-record them with the nonce; the word count in particular will move if you cut. Verify criteria 5 through 9 by reading, since no gate covers them. No em-dashes or en-dashes anywhere. Commit in the unit worktree, never to the station branch.
- worker: challenger
  started_at: 2026-07-30T03:13:05.340698+00:00
  completed_at: 2026-07-30T03:13:05.340698+00:00
  result: advance
  note: |-
    Challenger beat complete. Committed at `8221c77`. Worktree clean. 2411 words (from 2542), 11 sources (from 13). All four gates re-run for real and re-recorded with the nonce, all exit 0, including each of the 11 URLs fetched individually. It also ran a check the gates do not cover: every manifest URL is still cited in the body, zero orphans. The framer's manifest had two.

    # Three HIGH findings the framer did not name

    **1. Zero contractions in the entire document.** Verified by grep, not eyeball: every apostrophe in the 2542-word original was a possessive. The spec names contractions as a required voice trait, and their total absence is one of the strongest AI tells there is. Fixed, 38 contractions now.

    **2. The document described a mechanism it never adopted.** The confound subsection explained publishing-IP exclusion's failure modes in detail, then named a different discriminator (the 120-second window) as "the discriminator," and never said whether IP exclusion is actually in the design. A downstream station could not tell whether one filter exists or two, and the same-NAT undercount direction only exists if IP exclusion is applied. Fixed with a "Two filters, both partial" paragraph stating both plainly, with the asymmetry attached to the filter it actually describes. It confirmed the mint happens at the app server, so the requesting IP is available.

    **3. Another unobservable quantity, same error class as the publishing-account slip.** Supporting condition 2 claimed the headless/CI/non-Claude client distribution is computable from telemetry item 3 (publishing client name). A Claude Code run inside a GitHub Action and an interactive Claude Code run report the same client name, so the non-Claude half is computable and the headless/CI half is not, unless the client distinguishes itself. Fixed by stating the limit in the same breath as the claim. It swept every remaining quantity in the metric section (renderer class, open counts at mint, client name, publishing IP, distinct publishing IPs, relic volume, egress spend) and found no other instance.

    # Verdict on the framer's five

    All five stuck. Numbers 2 and 5 fixed as described. Number 1 (length) fixed partially, but its guesses at *where* the slack was were wrong: "What Relic is" was already 96 words and "The problem" 171. Real slack was in the preamble and locked constraints. Number 3 (third segment) cut, on format grounds as much as evidence: the spec requires each segment to carry a trigger moment and what they do today instead, and it had neither. Number 4 (scope bleed) cut, and the framer's defense was self-defeating on inspection: condition 1 is operational precisely because the spec mandates it by name, which is exactly why no other operational condition gets in on that reasoning.

    Also trimmed: locked constraint 2 was relitigation rather than recording (~90 words with three external citations against a ~25-word target form), and one uncited 0bin claim already covered by PrivateBin's cited threat model. Two manifest sources came out only because the claims they supported came out.

    # Clean results it verified (evidence, not silence)

    Every number traced to the knowledge base and none overstated: 16 MiB, `.html`/`.htm`/`.md`, the 96-hour file.kiwi expiry, CVSS 9.6, the Immich flag-and-reflag, and both taxonomy sides. Criterion 9's four parts genuinely present with the permanence statement and no clean-separation qualifier on telemetry item 2; it tried and could not break this. Criterion 7's renderer set matches the taxonomy exactly on both sides, with the non-goals closing the loop. Criterion 8's trigger is specific. The honesty constraint is bolded in its own paragraph inside "The value," not buried. No contradictions with the architecture or non-goals: it swept for anything requiring accounts, identity, a viewing-origin script, or republish and found nothing. Zero em-dashes and en-dashes by grep. The TTL assumption is safe and states no value, so it cannot contradict what `frame-preconditions` picks.

    ---

    # DISTILLER: three open calls, plus my read on each

    The challenger deliberately did not decide these unilaterally. Reconcile make and challenge into a unit that satisfies its completion criteria with the challenges answered.

    **1. Whether 2411 words is acceptable. This is the real call.**

    Its per-section measurement: What Relic is 96, Locked constraints 101, The problem 171, The user 182, The value 172, **The success metric 1096**, Standing assumption 106, Wedge boundary 231, Non-goals 183. The metric section is 45 percent of the document and carries 13 spec-mandated beats, which at 60 to 80 words each is 800 to 1000 words before any prose. Everything else totals about 1240 across seven sections plus preamble.

    Its position, which I think is correct: the spec's "lands near 1,400 words written tightly" is not achievable alongside criterion 9 as written, and cutting further starts removing criterion-mandated content. **That estimate came from a calibration made before criterion 9 grew to four parts, so the guidance is stale, not the document.** The gate floor is 1300 and it passes. "Near 1,400" was orientation, never a ceiling. Accept 2411 unless you find prose slack the challenger missed, and if you do cut, cut prose, never a mandated beat.

    **2. Whether the consultant-to-client segment comes back.** It was cut for failing the section's own trigger-plus-today format, not only the evidence bar, and the document itself had demoted it to "a bonus rather than a bet" with nothing load-bearing on it. My read: the cut is right. A segment that fails the format and carries no weight is dead weight, and the spec's "only if the recorded evidence supports it" is a permission, not an obligation. Restore it only if you can give it a real trigger moment and a real what-they-do-today, sourced.

    **3. Whether pruning 13 sources to 11 reads as a regression.** My read: it is correct discipline. The manifest is defined as what the document relies on, the two removed sources supported claims that were themselves removed, and zero orphans is a stronger state than breadth. The floor is 6.

    # Your job beyond those three

    Verify the challenger's fixes rather than assuming them, especially the two-filters paragraph, since it introduces a mechanism statement that did not exist before and is now load-bearing for criterion 9. Confirm the 38 contractions read as natural voice and not as find-and-replace. Re-run all four gates and re-record with the nonce after any edit. Verify criteria 5 through 9 by reading. No em-dashes or en-dashes, verified by grep. Commit in the unit worktree, never the station branch.
- worker: distiller
  started_at: 2026-07-30T03:20:16.476010+00:00
  completed_at: 2026-07-30T03:20:16.476010+00:00
  result: advance
  note: |-
    Distiller beat complete. Committed at `fbd966d`. Worktree clean, branch correct, nothing touched outside it. **Final state: 2449 words, 11 sources, all four gates green, re-run against the final post-edit state and re-recorded with the nonce.** Verdict: ready to lock.

    # The three open calls, decided

    **1. Length: accept 2449.** The distiller measured independently and reproduced the challenger's per-section numbers exactly, then disagreed with the challenger's beat count *against* the challenger's own interest: the metric section carries roughly 18 spec-mandated beats, not 13, which at 1096 words is about 61 words per beat. It went through the 506-word confound subsection paragraph by paragraph hunting for prose to cut and found none that was not a mandated beat. Criterion 2's "lands near 1,400 words written tightly" would require deleting roughly 1,000 words of contract-demanded content. **The calibration is stale, not the document**, because it predates criterion 9 growing to four parts plus the permanence statement plus the no-clean-separation rule.

    **2. Consultant-to-client segment stays cut**, on a stronger ground than the challenger had. The section's topic sentence is "Two segments, both defined by the absence of a first-party path rather than by dissatisfaction with one." A consultant on Claude Code Pro *has* Artifacts and objects to the byline, which is dissatisfaction with an existing path, the exact category that sentence excludes. Restoring it would make the section's own framing false. It also checked whether the segment could be sourced properly and could not: the knowledge base has one sentence about the artifact header and nothing about what consultants do today.

    **3. Sources 13 to 11: correct discipline.** It ran the orphan check in **both** directions, which neither prior beat did. Every manifest URL is cited in the body and every body URL is in the manifest, with the sole exception of the `https://<relic-domain>/{id}#{secret}` shape template, correctly excluded per the contract's warning.

    # The fourth instance of the unobservable-quantity error class

    The third sweep found it, and it was in the worst possible place. **Supporting condition 1** claims the service domain stays unflagged by "Safe Browsing, VirusTotal consensus, and the major mail-gateway blocklists" and calls itself checkable on a schedule. Only the first two answer a scheduled query. A block inside a single company's mail tenant is invisible from outside, so that half surfaces as a recipient reporting a dead link rather than as a check going red. This matters more than the previous three instances because **this condition's consequence is "shut it down,"** making a false sense of detection the most expensive blind spot in the document. Fixed in the same shape used for condition 2, with the limit stated in the same breath as the claim, and no new citation, so the manifest stays at 11 with zero orphans.

    **This error class has now been caught four times, by four different readers.** It is the specific failure mode of this material. Whoever executes `frame-preconditions` must sweep for it deliberately rather than incidentally.

    # Verified independently rather than taken on trust

    - **The "Two filters, both partial" paragraph holds.** `gcs-cloud-run-architecture-constraints` records "short-lived signed download URLs minted by the app server at view time," so the app server does see the viewer's requesting IP at mint. `abuse-liability-of-hosting-uninspectable-content` records "Record upload IP plus timestamp," so the publishing IP is already retained. The publish leg runs on the user's machine, not a browser, so neither filter touches the viewing origin. Both are genuinely server-observable and the claim is sound.
    - **Zero em-dashes, zero en-dashes, and in fact zero non-ASCII characters at all** in both files.
    - **All 11 URLs fetched individually with status codes captured**, all returning HTTP 200, not merely a green loop exit.
    - **Criteria 5 through 9 by reading.** All met. Criterion 9's four parts are present, permanence is stated twice (topic sentence plus a bolded "The first clause can't be made fully trustworthy under this architecture"), and telemetry item 2 is bare with no clean-separation qualifier.
    - **Dangling-reference sweep after the cuts.** Zero hits for 0bin, consultant, gallery, "four supporting", Microsoft, or Tenant. The forward reference "the publisher filters below" correctly resolves.
    - **Contractions read in context, not counted.** Two of the challenger's 38 read as mechanical and were reverted: "isn't fully solvable" back to "is not fully solvable" because that is the load-bearing permanence claim and the flat form carries the emphasis, and "That's no corner case here" back to "Not a corner case here" because the contraction cost doubled deixis and the crisp fragment matched the surrounding staccato. Net 37, all natural.
    - Also fixed "a relic (a relic, not an artifact", a compression artifact putting "relic" twice in six words in the first paragraph every downstream station reads.

    The only thing the challenger's report got wrong was its own beat count, understating its case.

    # Carry forward to the checkpoint

    1. **Criterion 2's word guidance is off by roughly 1,000 words against its own criterion 9** and should be corrected for whoever writes the next frame-shaped unit. Recorded here rather than silently left.
    2. **The IP filter is a no-op for the headless/CI segment**, since a CI runner's egress IP will never match a human viewer's. Harmless, because it can only fail in the safe direction or not fire at all, and the confound barely applies there anyway with no publisher at a phone to self-check. Deliberately not written into the document, because that would add a requirement the spec does not ask for. Worth knowing when a later station tunes the 120-second window. Being recorded as durable knowledge separately.
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
  at: 2026-07-30T03:18:27.793212+00:00
  attempts: 3
  detail: Distiller beat, final state. `test -f docs/frame.md` exit=0 in the frame-artifact worktree after four reconciliation edits.
- name: substance-floor
  status: pass
  at: 2026-07-30T03:18:32.493951+00:00
  attempts: 4
  detail: 'Distiller beat, final state. `test "$(wc -w < docs/frame.md)" -ge 1300` exit=0. Final count 2449 (challenger left 2411; +38 for the mail-gateway observability limit added to supporting condition 1). Floor 1300. Length accepted deliberately: independently measured the metric section at 1096 words carrying ~18 spec-mandated beats, everything else 1315 across preamble plus eight sections. The spec''s "near 1,400 words" guidance predates criterion 9 growing to four parts and is stale; no prose slack found.'
- name: sources-manifest-populated
  status: pass
  at: 2026-07-30T03:18:35.788924+00:00
  attempts: 3
  detail: 'Distiller beat, final state. exit=0. 11 non-empty lines against a floor of 6; 0 lines failing ^https://; trailing newline confirmed (last byte 0x0a). Ran the orphan check in BOTH directions: every manifest URL is cited in the body, and every body URL appears in the manifest. The only body URL absent from the manifest is the `https://<relic-domain>/{id}#{secret}` shape template, correctly excluded per the unit contract.'
- name: every-cited-url-resolves
  status: pass
  at: 2026-07-30T03:18:38.192917+00:00
  attempts: 3
  detail: 'Distiller beat, final state. Gate loop exit=0. Also fetched each of the 11 URLs individually and captured the status code: all 11 returned HTTP 200. No URL-shape templates in the manifest.'
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
