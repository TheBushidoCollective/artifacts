---
station: shape
phase: pre
created_at: 2026-07-30T11:43:04.028857+00:00
---
# `shape` station spec

**Revised twice after review.** Three lenses filed **eleven findings across two rounds** and none stamped until every one was closed. Four of the eleven were errors in this document or in fixes made to it, and they are marked. The ranking survives in outline and is corrected in substance.

## The risk this station kills

**expensive-structural-reversal.** A decision that is free today, invisible tomorrow, and a migration or a total loss afterward.

**The organizing test, which the first version of this spec missed: the mandatory TTL is the universal reversal bound.** Anything whose cost lives in stored objects ages out within one TTL. Only five things escape it: what is baked into a domain, what runs on an external clock, reputation accrued on a domain, data you did not retain or cannot unsee, and a published counter series.

### Tier 1, not TTL-bounded

1. **The name, and therefore the domains.** Unbounded, because no accounts means no channel to tell an installed client fleet the domain moved. Free today, closing at the domain purchase. **The first version de-ranked this in passing and gave it no owner.** Now owned by `design-topology-and-origins` with a forcing criterion that states the blocking relationship and explicitly does not pick.
2. **HSTS preload.** Months in, months out, unexpeditable, hardcoded into browser source. Absent from the first version entirely.
3. **The download-serving origin.** Right to rank high, wrong reason first time: the URL scheme and CSP are both cheap. The irreversible term is Safe Browsing download-category reputation accruing on the domain that cannot be replaced.
4. **The soft-delete posture and the retention window.** Setting it late "leaves a tail nobody can retroactively clear." Free now, permanently unfixable after. Absent from the first version.

### Tier 2, TTL-bounded

5. **The container framing.** First on per-object cost. At system level the version marker is pre-fetch, so migration costs dual decoders for one TTL. **That bound holds only if the TTL ceiling is decided**, which is storage's call and is now forced from both ends.
6. **The mint trigger.** Verified JavaScript-executing previewers make auto-mint-on-load a phantom open against the metric, the cap, and egress.
7. **The GCP project topology.** Moved down: no bucket name appears in any published link, so one TTL of dual-bucket operation drains the old one. **Kept high on a better argument than the first version made: the migration is cheap exactly when you do not need it and impossible at the moment you do, because you cannot migrate out of a suspended project.**
8. **The grant shape.** Not a reversal item. Its unpinnable-metadata tail is TTL-bounded, so it is a correctness problem.

## What discovery changed about the routed decisions

- **`format.md` 4.2 routes key length as cipher strength. Under `aes128gcm` that is a category error.** The fragment is input-keying material HKDF turns into a 16-octet CEK; **the cipher is AES-128 either way.**
- **`publish.md` 3.6's grant shape cannot be decided from documents, because all three candidates fail a requirement.** No documented candidate satisfies a signed size constraint, the generation precondition, and resume-from-offset together. Probes settle it and are specified rather than run, because they create buckets and objects and the only authenticated local credential belongs to an unrelated venture.
- **`format.md` 4.1 bundles an irreversible decision with a cheap one.** `rs` lives in each object's header. **`rs` demotion is the model: the condition that makes a decision cheap is enforced by a criterion, not left as prose.**

## Foreclosed, and both halves of the check were run

- **The Public Suffix List**, on eligibility, and **at this scale** rather than permanently, which makes process isolation recoverable later rather than dead.
- **The Safe Browsing appeal as a mitigation.** Canonicalization strips the fragment, so the sample URL handed to the operator is the one form that cannot open the content.
- **Any control keyed on User-Agent.**

**Correction, this document's own error: Cloud Run is NOT foreclosed.** The first version foreclosed it on a sentence scoped to custom domain mappings. Cloud Run behind a global external load balancer with a Certificate Manager wildcard is untouched. **"Cloud Run" appears zero times across all six locked documents**, so the foreclosure entered the run here and became binding on a unit. Left standing it would have pushed the design toward a third-party edge whose cost this station says belongs in the published disclosure statement, and a published disclosure is expensive to walk back.

**Both halves of the foreclosure check are now run on all four**, which matters because half two is what finds defects and is the half that gets skipped. Half one asks whether the foreclosure holds. **Half two asks what in the locked corpus rested on it.** Cloud Run: zero occurrences, nothing could rest on it. Safe Browsing appeal: the hits are a publisher's appeal against a takedown, a different mechanism. User-Agent: the rule that looked like it might key on UA is structural, with a fetcher's identity cited as evidence rather than used as a discriminator. **PSL: half two found a blocker.** See below.

## The blocker half two found

**Foreclosing the PSL discharges the stated basis for a locked decision.** `viewer.md` §2 names process-level isolation as what per-relic subdomains buy, and the PSL entry is what makes the labels cross-site. Process isolation keys on **site**; without the entry the labels are same-site and buy no process isolation, while the wildcard, the DNS-01 credentials, the standing edge cost, and the hostname sprawl all remain.

**Narrowed correctly on review, and the narrowing matters:** `viewer.md` §2 gives **two** reasons and calls the second "the durable one," defense in depth so a misconfigured sandbox flag costs one relic instead of all. That reason rests on distinct **origins** and survives untouched, because same-origin policy compares scheme, host, and port and never consults the PSL. Writing it as a total collapse would have made the branch look like pure cost and got it dropped for a false reason.

`design-topology-and-origins` names the collapse, establishes what survives per reason, designs both branches without picking, and routes drift to `specify`. **What made this dangerous: the criterion requiring the document to state that the PSL is foreclosed passes on a document with the hole in it.** The forcing criterion says so in its own text.

## Out of scope

- **Implementation.** No product code. The spikes are probes that eliminate branches.
- **Reopening the locked frame or the four spec documents.** Where a finding pressures a locked decision, name it as drift. Four identified: the PSL collapse; the pre-decryption byte count (below); the egress figure, where the primary source puts the tier boundary at **10 TiB** rather than "the first TB" and charges **$0.19/GiB to Australia**; and a signed-URL claim attributed to a page where "revoke" appears zero times, omitting the key-rotation exception that is the second-stage kill switch.

## Operator decisions

1. **The abuse-operations commitment, priced.** A named human at a publicly listed street address on a three-year clock; possibly an EU legal representative who can be held liable; a published SLA in hours with no external anchor; a second verified owner; availability for criminal-threat and mandatory-report branches with $600,000 statutory exposure for a knowing and willful failure; delete-on-report with no adjudication as published policy.
2. **Separate GCP projects.** Without it the two-domain split does not isolate the failure the preconditions call the go/no-go.
3. **EU exposure**, with geoblocking as a real alternative.
4. **The name**, now owned with a forcing criterion.
5. **Whether to run the GCS probes**, and against which project.

## Done when

Units complete, every routed decision **owned by exactly one unit** and either decided with its consequence stated or eliminated by a probe result, every foreclosure verified in **both** halves, and every operator decision stated with both branches designed where the answer changes the design.

---

# Review outcome

**Verdict: PASS.** All three lenses stamped all five units with none skipped, after two rounds and eleven findings.

## The decomposition manufacture inherits

Five units. **23 routed decisions, 20 distinct, exactly one owner each, zero duplicate affirmative claims.** Each sweep criterion enumerates its own items and names the neighbouring items it must not decide, so a unit can tell what it must not touch. Graph acyclic at four waves: container, topology, storage, then surface and operations in parallel. Every edge paid for by a named consumption.

## Round one: eleven findings, four of them mine

The three lenses found different things, which is the argument for keeping three.

- **`fit` and `simplicity` converged independently** on the root cause: sweep criteria written for two of the four routed lists and neither of the other two, leaving eleven decisions unowned and five absent from every unit body.
- **`fit` found two DAG errors I made:** storage needing a number topology produces in the same wave, and two units owning the same recipient screens.
- **`reversibility` found what neither other lens could**, because both correctly concluded the PSL routing was properly owned and neither asked what breaks when the foreclosed thing was load-bearing elsewhere.

## Round two: a fix introduced a defect, and the lens that did not propose it caught that too

`fb-23`: the fix closing the ownership gap told the container unit to encode the relic ID under the **key's** alphabet, which would have produced a 21-character ID against a locked floor of 25, cutting the margin over reserved paths from five characters to one against `/abuse`, a go/no-go obligation.

**The artifact was never wrong.** The designer beat had independently identified the same category error and routed around it, stating that Crockford's alphabet contains no punctuation so the terminal-character check is empty at every bit count. The fix made the instruction match what the output already did, which is a stronger close than a text fix: the spec and its output now agree instead of the output quietly compensating.

`fb-24`: a second instance of the basis-discharge class, and **my brief for the fix was wrong in a way that mattered.** I framed the pre-decryption byte count as "now a live decision." `viewer.md` §5 states the rule absolutely. What evaporated is the basis, not the rule, and writing it my way would have authorized a unit to silently undecide locked text. It is written in the same drift-routing form as the PSL item.

## What this station learned, recorded as knowledge

- **`basis-discharge-a-locked-rule-outliving-its-reason`**, a class distinct from a contradiction and from a rule with no home. A locked rule stays literally true while the reason under it is discharged elsewhere. No contradiction check, per-document audit, or ownership sweep finds it, because none ask what a decision rests on. Includes the two-half foreclosure sweep and both traps.
- **`cross-document-gaps-no-criterion-catches`**, extended with a third instance and the hole in the guard: the no-sibling-obligations rule catches a unit overreaching and is **structurally blind** to a unit correctly stating a need no sibling can receive. One sweep without the other reads as coverage. The reception sweep must re-run after each wave, because a decided unit can discharge a premise a not-yet-written unit relied on.
- **`citation-defects-and-the-three-checks-that-catch-them`**, extended with a third false-negative mode: a quote spanning an RFC page break fails even the fully corrected normalization, because page furniture is interposed mid-sentence. Two ordering constraints now, both learned by getting them wrong.

## The process lesson worth carrying

**A routed-decision inventory is a decomposition artifact, not a review artifact.** Building the coverage table while writing the units would have caught five of the eleven findings before any reviewer ran. The same shape produced the engine's own rejection of the first decomposition: upstream artifacts referenced in prose and never declared as inputs. **In both cases the work was described and never wired.**
