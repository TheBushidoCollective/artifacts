---
station: shape
created_at: 2026-08-02T21:11:45.430228+00:00
---
# `shape` retrospective

Five documents, 51,479 words, 82 sources, twenty gates, twenty-six feedback items. Three reviewers, two of whom filed rather than stamped on the first audit pass. Both fixes landed and all three cleared on the second. What follows includes the parts where I was the defect, and there were more of them here than in `specify`.

## The station did not resume where it thought it had stopped

The run had been sitting since 07-30 returning `noop` on every tick. The tempting read was a wedged engine. It was not.

`wave_ready()` in `position.rs:552` returns only units whose status is `Pending`. `record_iteration` flips a unit to `InProgress` on its first beat and never flips it back. Two units had taken their `designer` beat at 15:34 and 15:42 and the session died before the rest of the Pass loop ran, so the engine correctly saw two in-flight units, derived no action, and said so. **The noop was a true statement about the world, not a fault.** I only trusted it after reading the source.

**Carry forward:** when the manager returns a noop and nothing is actually running, the outstanding work is the manager's, not the engine's. Check unit status against the worker sequence before concluding anything is broken. The three completed units all ran `designer` then `pressure_tester` then `resolver`; the two stalled ones had only the first.

## I was the defect three times, and the third one would have shipped a false PASS

**One.** I sent all three audit reviewers at per-unit worktrees. The engine had already removed them at station land, which this run's own knowledge store records as a station-completion operation. Two of the three found the right worktree themselves and verified before I sent the correction. Neither reported BLOCKED, which they would have been entitled to do.

**Two.** My first check-suite runner parsed zero gates from every unit, because the regex lookahead terminating the `quality_gates` block matched the YAML list dash.

**Three, and this is the one that matters.** The second runner printed `16 gates: 16 pass, 0 fail` and silently omitted `design-topology-and-origins` entirely. I had split frontmatter on the `---` substring rather than line-anchored, and one of that unit's beat notes contains `---` inline, truncating the parse before `quality_gates`. **A partial run wearing a green label, produced by the person running the audit, in the same phase whose contract says in as many words that "3 of 4 green" is FAIL.** It was caught only because 16 is not 20 and I checked the arithmetic.

The fix was an assertion that every unit parses exactly four gates. **Any harness that reports a pass count without asserting the expected count can report a false pass.** That belongs in every future check runner in this run.

## The real defect class was unreceived sibling input, not wrong structure

The station exists to kill expensive structural reversal. Neither decision-changing defect in the final wave was a structural error. Both were reception failures.

`surface.md` put the transfer size and expiry on the pre-gesture plate while **quoting, in the same sentence, the `topology.md` rule that fires the mint on first input and never on load**. It then got the identical reasoning right for `mints_remaining` 148 lines later. One document, two opposite answers, same field class, same source.

`operations.md` declared `storage.md` a consumed input and never read its section 6, which designs one GCP project against two and recommends two in a sentence written for this exact consumer. Operations asserted the one-project consequence as given fact.

**Both were produced by the rule that makes this station work.** Units are forbidden their siblings' output so they design against both branches in one pass instead of serializing. That same rule is what lets a declared input go unread, and **no criterion in either unit catches it**, which is the `cross-document-gaps-no-criterion-catches` topic arriving exactly as predicted.

**What I would change:** the manufacture prompt should make each unit name the sibling **sections** it consumed, not just the files. `operations.md` listed `storage.md` as an input and satisfied that by reading some of it.

## The station's most transferable finding: beat notes drift from artifacts

Two workers hit this independently within an hour.

The `fb-25` fix worker was told to add to the residual-risk list the feedback described. **That list is not in the artifact.** It exists only in the resolver's beat note. It read section 11's real four-item list and matched that instead of inventing one to fit the description.

The reversibility reviewer then owned the other half without being asked: it had cited those three items from the beat note without checking the file, went and read section 11, and reported that the real list is different. **Its finding survived anyway, because the memory ceiling was missing from the real list too.** Substance held, sourcing was wrong.

This is the citation-verification discipline turned on the run's own record rather than on external sources. **A beat note is a claim about an artifact and deserves the same verbatim check a quotation gets.** Every note in this station asserting what a document contains should have carried line numbers.

## Verification transferred to new domains, and the gate that proves least kept passing

The scope-resolution check, recorded against a pricing page as the fifth citation mode, transferred to statute and immediately paid: DSA Article 13 reads as a general obligation whose entire trigger lives two articles earlier under the heading "Definitions". Quoting 13 without 3 states an obligation whose applicability is unresolved as though settled.

Two new false-negative modes surfaced. **A possessive split by markup**, where 17 U.S.C. 512(i)(1)(A) rendered as `provider 's` and matched only the concatenated variant, the first time the second variant was load-bearing rather than merely correct. And **two-column PDF extraction**, where `pdftotext -layout` spliced a citation line from the right column into the middle of a sentence and faked a deviation.

**The `every-cited-url-resolves` gate remains the weakest check in the set and this station proved it again.** Three of `operations.md`'s twelve sources return a bot-block page, an RDF metadata stub, or a content-negotiation error under a naive request. The gate passes on all three, because it proves a URL answers and nothing about whether the quoted text is on the page or under the right heading. **Resolution is not verification.** What caught defects was the verbatim sweep plus heading resolution, every time.

## Did it eliminate expensive structural reversal

For four decisions, yes, and the fifth was the finding.

`container.md` reproduced RFC 8188 vectors byte-for-byte on Node across three separate beats. `topology.md` ran headless Chrome over CDP rather than asserting its trusted-input claim, and found that visible-and-focused is not a discriminator because a headless previewer with nobody present reports exactly what a human staring at the tab reports. `storage.md` specified five probes, stated plainly they were not run, and assigned them to `build` ahead of committing the branch.

`surface.md` hardcoded a 500,000,000 octet in-memory ceiling, collapsing three streaming tiers into one, on **one forum thread reporting an `OperationError` at 800 MB**, and assigned the measurement to nobody. Its own text calls this the largest structural consequence in the station after the container framing, and says raising the cap later means building tier 1 and its ServiceWorker rules rather than editing a value.

**The defect was never the number. It was the inconsistency**: three siblings either measured their unproven empirics or explicitly deferred them, and one did neither. `fb-25` fixed it by adding the deferral, naming `build` as owner, mobile Safari by name, and the consequence if the measurement comes in below the peak.

**No unit used the `spiker` beat.** The empirical work happened inline instead. For a station producing documents rather than code that is acceptable, and the reversibility reviewer ruled it so on the evidence. The absent beat was not the problem; the one unit that skipped the empirical discipline entirely was.

## What each unit taught

**`design-container-and-crypto`** wrote its enumeration conclusion anticipating its downstream consumer, saying that unit "can record it as settled and the record is true rather than circular." `operations.md` then quoted it verbatim. **Cross-unit reception worked by design rather than by luck, exactly once, and only because a unit deliberately wrote for its reader.**

**`design-topology-and-origins`** measured instead of asserting, and named the artifact in its own measurement: driving a page into an unfocused tab yields a false reading that discriminates on the harness rather than on the presence of a human. It published the trap alongside the result.

**`design-storage-grant-and-cost`** set the pattern the whole station should have followed: specify the probe, state it was not run, name the owner, and make every leaf of the decision tree decided regardless of outcome. It also found the four-copy break case at 524,729,136 octets that `surface.md` later closed.

**`design-product-surface`** is both the strongest cross-unit consumption in the station and its one unproven-empirical gap. It reproduced storage's 524,729,136 exactly as a check on its own arithmetic before building on it, then sized the truncated prefix specifically to close that break. Same unit, same pass, both the best and the worst instance.

**`design-operations-and-abuse`** taught the most about work orders. Its resolve pass found that my `fb-25`-style framing of defect 2 named the symptom rather than the extent: the one-project assumption was load-bearing in section 1's forced-answer argument, not just the one line the challenge cited. **Fixing only what was asked would have left the document describing a survivable suspension in one section and total loss in another.** It also drafted a phrasing that would have created a third unrelated "Branch A" in a document that already had two, judged the collision risk, and removed it before committing.

## The fix loop, and one place the reviewer was right for the wrong reason

`fb-26` argued the free-text matcher was unearned because the screen already backstopped it. The premise was half true. **The screen's specified question at `operations.md:108` covered items 2 through 5 plus counsel question 9, and the data-subject determination was none of those**, while line 143 relied on the screen as backstop for exactly that. Both could not stand.

Actioning the feedback as filed would have deleted the matcher and left branch B detected by a screen whose own specification did not cover it. The fix worker was given both routes, took the one that widens the screen first and removes the matcher second, and checked that section 6.3's SLA still holds because a third disjunct is one more thing noticed during a read that already happens rather than a second read.

**Carry forward: a finding can be real and its requested remedy still wrong.** Verify the premise before dispatching the fix.

## Residual risk `build` inherits

1. **The memory ceiling measurement**, now assigned to `build` by `fb-25`: the real crash threshold for the four-copy worst case against the 319,208,240 octet peak, on mobile Safari by name. If it lands at or below that peak, tier 1 stops being deferred.
2. **Screen attention dilution.** The simplicity reviewer named this and correctly declined to file it as out of its lane. One human read now covers more conditions, including the mandatory-report branch carrying $600,000 and $850,000 exposure. **My adjudication: a real residual risk and not a Shape defect**, because the remedy is a checklist or a second reader, which is a process change rather than a structural rewrite. Recorded here rather than filed. `build` should treat it as a live question when it implements the screen.
3. **Three items routed to `specify` that live only as prose.** `surface.md` section 10 asks the owner of `viewer.md` to restate a discharged reason without changing the rule; `topology.md` sections 1.7 and 8 route two more. `specify` is checkpointed and closed, the engine's drift counter is correctly 0 because no locked artifact was edited, and **nothing outside these documents obliges anyone to act on them.**
4. **Whether `operations.md` over-read a sibling's recommendation as binding.** `storage.md` criterion 15 requires only that both project-topology branches be designed and calls branch B a recommendation. `operations.md` now builds on it as a dependency. The simplicity reviewer named this, ruled it out of its own lane, and no reviewer has adjudicated it.
5. Icon-fetch timing needs real MCP clients; no spec text answers it. The taskbar at true phone widths needs a browser. The three IBM Plex Mono byte measurements carry no source URL and should gain one or be marked measured-here with a date.

## Process notes

**The base-rate warning worked.** Five self-nominated weaknesses were adjudicated across the station and four came back sound or real, but **both decision-changing defects in the final wave were found by sweep and neither was nominated**. The ranking is worth reading and worth not following.

**Resuming a reviewer beats respawning one.** The second audit pass reused all three reviewers with their context intact, scoped to the delta. `fit` needed only to confirm the criteria the fixes touched still held; it took the narrowest brief and returned the narrowest answer.

**Three independent readers landed on the same scoping of criterion 13**, that it governs recipient-facing copy and not design-system values. A criterion that survives three independent readings without divergence is written tightly enough.
