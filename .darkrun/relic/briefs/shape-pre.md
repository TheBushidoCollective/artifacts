---
station: shape
phase: pre
created_at: 2026-07-30T10:28:01.463924+00:00
---
# `shape` station spec

**Revised after review.** Three reviewers filed nine findings against the first version of this spec and none stamped. Two of the corrections below are to errors in this document itself, and they are marked. The original ranking survives in outline and is corrected in substance.

## The risk this station kills

**expensive-structural-reversal.** A decision that is free today, invisible tomorrow, and a migration or a total loss afterward.

**The organizing fact, which the first version of this spec missed: the mandatory TTL is the universal reversal bound.** Anything whose cost lives in stored objects ages out within one TTL. Only five things escape it: what is baked into a domain, what runs on an external clock, reputation accrued on a domain, data you did not retain or cannot unsee, and a published counter series. That test reranks everything below and it is the reason two items moved.

### Tier 1, not TTL-bounded

1. **The name, and therefore the domains.** Unbounded, because no accounts means no channel to tell an installed client fleet that the domain moved. Free today, closing at the domain purchase, which is the stated deployment blocker. **The first version of this spec de-ranked this in passing and gave it no owner.**
2. **HSTS preload.** Months in, months out, unexpeditable, and hardcoded into browser source. Absent from the first version's list entirely.
3. **The download-serving origin.** Correct to rank high, wrong reason in the first version: the URL scheme and CSP are both cheap. The irreversible term is Safe Browsing download-category reputation accruing on the domain that cannot be replaced.
4. **The soft-delete posture and the retention window.** `preconditions.md` states that setting it late "leaves a tail nobody can retroactively clear." Free now, permanently unfixable afterward, which is this station's risk definition exactly. Absent from the first version's list.

### Tier 2, TTL-bounded

5. **The container framing.** Still first on per-object cost and irreversible for a given relic. At system level the version marker is pre-fetch, so a v2 viewer refuses or routes a v1 relic without minting; the migration cost is dual decoders for one TTL. **That bound holds only if the TTL ceiling is actually decided.**
6. **The mint trigger.** Verified JavaScript-executing previewers make auto-mint-on-load a phantom open against the metric, the cap, and egress. Hard to change once the counter has a baseline and the cap has a published value.
7. **The GCP project topology.** Moved down. No bucket name appears in any published link, since URLs are minted at view time, so one TTL of dual-bucket operation drains the old one. **It stays high on a different argument than the first version made: the migration is cheap exactly when you do not need it and impossible at the moment you do, because you cannot migrate out of a suspended project.**
8. **The grant shape.** Correctly not a reversal item. Its unpinnable-metadata tail is TTL-bounded, so it is a correctness problem rather than a reversal one.

## What this station inherits

Four locked spec documents totalling 32,259 words, plus locked `docs/frame.md` and `docs/preconditions.md`, plus **36 knowledge topics**. The spec set routes **23 decisions** here. Two watch items arrive from `specify` in `cross-document-gaps-no-criterion-catches`.

## What discovery changed about the routed decisions

- **`format.md` 4.2 routes "key length, 128 or 256 bits" as cipher strength. Under `aes128gcm` that is a category error.** The fragment is input-keying material HKDF turns into a 16-octet CEK; **the cipher is AES-128 either way.** Restate as IKM length before deciding.
- **`publish.md` 3.6's grant shape cannot be decided from documents, because all three candidates fail a requirement.** The resumable session's size enforcement is unverified and its data leg is unsigned and accepts metadata; the POST policy is the only construction expressing a cap and cannot carry the generation precondition; the signed PUT enforces but pins a value rather than a range. **No documented candidate satisfies all three requirements together.** Probes settle it and are specified rather than run.
- **`format.md` 4.1 bundles an irreversible decision with a cheap one.** `rs` lives in each object's header, so reading it there keeps old relics working when the default moves. `rs` demotion is the model this station should follow: **the condition that makes a decision cheap is enforced by a criterion, not left as prose.**

## Foreclosed, so nothing designs against it

- **The Public Suffix List**, on eligibility. A pre-launch project sits inside two published decline criteria and an honest rationale states the declined objective in the maintainers' own words.
- **The Safe Browsing appeal as a mitigation.** Canonicalization strips the fragment, so the sample URL handed to the operator is the one form that cannot open the content.
- **Any control keyed on User-Agent.** A major privacy-first client impersonates another client's UA in its own source.

**Correction, and it was this document's error: Cloud Run is NOT foreclosed.** The first version foreclosed it on "You cannot use wildcard certificates with this feature," which is from the custom-domain-mappings page and scopes to domain mappings. Cloud Run behind a global external load balancer with a Certificate Manager wildcard is untouched, and that is the shape the run's own knowledge recommends. **"Cloud Run" appears zero times across all six locked documents**, so the foreclosure entered the run in this document and became binding on a unit. The cost of leaving it would have been real: it pushes the design toward a third-party edge whose price this station says belongs in the disclosure statement, and a published disclosure is expensive to walk back. This is the same class as `gcs-false-impossibility-claims`, one layer up.

**One qualifier the first version dropped:** a PSL entry would not break the wildcard, and that check is correct, but the CA/Browser Forum direction to consult the ICANN section only is a **SHOULD**, so it is CA-dependent.

## The blocker the foreclosure created, which nobody carried back

**Foreclosing the PSL removes the stated rationale for per-relic subdomains, and the first version of this spec did not notice.**

`viewer.md` §2 is locked. It concedes the obvious objection is not real, since opaque origins already make two relics mutually cross-origin, and then names the actual benefit: **what per-relic subdomains buy is process-level isolation**, with the PSL entry being what makes the labels cross-site. It also states that PSL registration is required and routes here.

Process isolation keys on **site**, not origin. Without the entry, per-relic labels are same-site and buy no process isolation, while every cost stays: the wildcard, DNS-01 and therefore DNS API credentials wherever issuance runs, the standing edge cost, and unbounded auto-generated hostnames under a wildcard, which `viewer.md` §2 itself names as the trigger for the reputation pattern.

**`design-topology-and-origins` names the collapse, designs both branches, and routes it as drift to `specify`. It does not silently undecide a locked decision.** Note what made this dangerous: the unit's criterion requiring the document to state that the PSL is foreclosed passes on a document with the hole in it.

## Out of scope

- **Implementation.** No product code. The spikes are probes that eliminate branches.
- **Reopening the locked frame or the four spec documents.** Where a finding pressures a locked decision, name it as drift. Three are identified: the PSL collapse above; the egress figure, where the primary source puts the tier boundary at **10 TiB** rather than "the first TB" and charges **$0.19/GiB to Australia**; and the signed-URL claim attributed to a page where "revoke" appears zero times, omitting the key-rotation exception that is the second-stage kill switch.

## Operator decisions, not this station's

1. **The abuse-operations commitment, priced.** A named human at a publicly listed street address on a three-year clock; possibly an EU legal representative who can be held liable; a published SLA in hours with no external anchor; a second verified owner; availability for criminal-threat and mandatory-report branches with $600,000 statutory exposure for a knowing and willful failure; and delete-on-report with no adjudication as published policy.
2. **Separate GCP projects.** Without it the two-domain split does not isolate the failure the preconditions call the go/no-go.
3. **EU exposure**, with geoblocking as a real alternative.
4. **The name.** Now owned by `design-topology-and-origins` with a forcing criterion, which the first version omitted. The station states the decision and its blocking relationship to the domain purchase; it does not pick.
5. **Whether to run the GCS probes**, and against which project. They create buckets and objects, and the only authenticated local credential belongs to an unrelated venture.

## Done when

Units complete, every routed decision **owned by exactly one unit** and either decided with its consequence stated or eliminated by a probe result, every foreclosure verified rather than assumed, and every operator decision stated with both branches designed where the answer changes the design.

## Process carry-forwards, and what review caught

`specify`'s two audit blockers came from a unit finishing before the documents that assign it obligations, so **no unit assigns an obligation to a sibling**; each states the need and names the owner, and every document is grepped for assignment phrasing before the station closes.

**What review then caught in this document's own first version, recorded so the next decomposition does not repeat it:** sweep criteria were written per-unit as "everything routed by document X" for two of the four routed lists and neither of the other two, leaving eleven decisions unowned and five absent from every unit body. Two units were placed in the same wave while one needed a number the other produces. Two units were given overlapping ownership of recipient screens. **The lesson is that a routed-decision inventory is a decomposition artifact, not a review artifact.** Build the coverage table while writing the units, not after.
