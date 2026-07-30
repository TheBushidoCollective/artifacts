---
name: Decide the grant shape, the storage topology, and the cost controls
unit_type: ''
status: completed
depends_on:
- design-container-and-crypto
- design-topology-and-origins
worker: ''
model: opus
station: shape
inputs:
- frame.md
- spec.md
- docs/design/container.md
- docs/design/topology.md
outputs:
- docs/design/storage.md
- docs/design/storage.sources.txt
branch: darkrun/relic/units/shape/design-storage-grant-and-cost
started_at: 2026-07-30T14:04:03.683989+00:00
completed_at: 2026-07-30T15:08:46.095471+00:00
iterations:
- worker: designer
  started_at: 2026-07-30T14:04:03.683989+00:00
  completed_at: 2026-07-30T14:04:03.683989+00:00
  result: advance
  note: |-
    `docs/design/storage.md` (8,527 words) and `storage.sources.txt` (17 URLs) committed at `95853da`. Worktree clean.

    **Gates re-run independently by the manager:** 8527 words against 2600; 17 sources against 6; all 17 URLs resolve; zero dashes.

    **Both sibling inputs came via the documented `git show` fallback**, as expected. Neither has landed on the station branch. This is now the third unit to hit it and the condition is stable, not degrading.

    ## The manager found the beat's number-one nominated risk, and it landed the other way

    **The beat's highest-value and highest-risk claim is false as stated. Fix this first.**

    It argued `publish.md` 4.4's restart-at-zero egress claim is wrong because upload traffic is inbound and **"the pricing page puts inbound at Free."** The live page reads: **`Data transfer in $0.0032 / 1 gibibyte`, charged for data written to the bucket.** Inbound is roughly 37 times cheaper than the $0.12 egress tier, so **the conclusion that retries cost far less than 4.4 implies probably survives, and the stated basis does not.**

    That matters because the beat used this to argue leaves 3 and 4 of the grant tree are cheaper than the locked document implies. **The challenge pass must re-derive the retry cost from the correct rate and check whether the leaf ranking still holds at $0.0032 per GiB rather than at zero.** The beat nominated exactly the right claim as its weakest; it just predicted the wrong failure direction, which is the same shape the topology unit hit.

    ## Decisions

    Download cap **64**, computed against **topology's actual branch**, which the beat read rather than guessed: the gesture gate with `wheel` excluded, and a 300-second dedup interval. The ceiling collapses toward the floor of 40, and the counterfactual is stated at 128 under auto-mint-on-load with worst-case per-relic egress doubling.

    Size cap **100 MiB on plaintext content octets**, `size_basis` plaintext, ciphertext bound derived through container's conversion at the shipping record size. **It collapses the viewer's three tiers into one under every candidate in-memory ceiling**, argued at peak memory rather than at the cap, which is the stronger form. Ceiling ownership correctly left to `design-product-surface`.

    Grant tree: five probes with request, assertion, and elimination, stated as not run and why. Four leaves, each naming its sacrificed requirement, the contradicted locked sentence, and a drift routing. Only one leaf is free.

    The three previously unowned items all decided as values: proof of work at difficulty zero at launch **with a specified turn-on trigger and target solve time**, retry cap at five retries with a time budget, and **no custom object metadata** with the scanner reading bytes only. Soft delete at the seven-day minimum, TTL 72 hours inside the expressible lifecycle regime, retention 90 days, with the TTL stated as what bounds container's v2 migration claim.

    ## A real substitution defect in a locked document, manager-confirmed

    The beat found `preconditions.md` §1 rendering the GCP suspension warning as **"if you don't respond... your project might be suspended"** where the source reads **"If you do not respond to the warning in a timely manner your project may be suspended."** Three words differ. **`service.md` §4 quotes the same page correctly**, which is what makes it a defect rather than a house style.

    It also found four sentence-initial case folds across `service.md` and **graded them honestly as lower severity rather than inflating them to mode 3.** Both routed as drift, neither edited.

    ## Quotation discipline

    35 double-quoted runs, all 35 source quotations, 35 verified, zero misses, zero unassigned. **It ran the sweep against two tag-stripping variants** so table-cell concatenation could not produce a false negative, which is the trap the brief warned about and the first beat to defend against it explicitly. Pricing figures stated in prose rather than quoted as cells.

    ## The rest of its ranked attack list

    2. **The in-flight expiry assumption**, asserted from reasoning rather than evidence: that a transfer already streaming completes after its signed URL expires. It flagged this and claims section 4.2 no longer depends on it. **Attack whether the dependency was removed or relabeled.**
    3. **Whether `publish.md` 3.1 already decided proof of work**, making its §4 decision thinner than presented. It gives the counter-reading itself: leaving the trigger unset would be exactly the close-by-omission the spec warns against.
    4. **Download cap 64 is a judgment value wearing arithmetic.** The floor of 40 is sourced; the 1.6x headroom is not derived. It says so, and the number still carries weight it may not have earned.
    5. **TTL 72 hours covers the Friday-to-Monday case by exactly zero margin**, and was chosen partly because it lands in the expressible lifecycle regime, which the beat calls a tidiness argument rather than a product one.

    It names the tier-collapse analysis and the residual-is-time-bounded framing as where it expects to be strongest, and asks for those to be attacked rather than accepted, citing both prior units having a nominated weakness turn out stronger than believed.
- worker: pressure_tester
  started_at: 2026-07-30T14:24:41.746468+00:00
  completed_at: 2026-07-30T14:24:41.746468+00:00
  result: advance
  note: |-
    **21 defects, ordered by severity. Four change a decision. Nonce returned verbatim. Nothing edited, nothing committed.**

    ## The challenge premise was mine, and it was wrong

    I directed this pass to fix the document's inbound-transfer claim first. **The pass refuted me, I verified the refutation independently, and the document is right.**

    The `Data transfer in $0.0032 / 1 gibibyte` row I quoted sits at offset 1973019 under the H3 `Rapid Bucket`, whose opening sentence is **"Rapid Bucket is only available in zonal buckets."** The applicable row under `General network usage` at offset 1890632 reads **"Inbound data transfer  Free."** Both rows are on the page. I read the wrong table.

    The pass's reductio is the part worth keeping: the companion row in that same table is `Data transfer out $0.0006 / 1 gibibyte`, **200x cheaper than the $0.12 the entire cost section rests on**. A neighboring row that contradicts an already-trusted number by two orders of magnitude means you are in the wrong table, and that check fires in one step without parsing anything.

    Recorded as `verbatim-but-wrong-table-the-fifth-citation-defect-mode`. **This is the first citation mode in the run that is a false positive rather than a false negative**, so it fails toward confident action, and all four existing citation checks pass on it cleanly. The fix is a scope-resolution step before normalization: resolve a match offset to its enclosing heading and read that section's first sentence.

    §5.2 stands unchanged. The leaf 3 and leaf 4 ranking survives. `publish.md` 4.4's doubling-or-tripling claim is an operator-cost claim and it is still wrong. **The only fix this generates is defect 21**, one sentence fixing Standard storage in a single region, which is the guard that would have stopped me.

    ## Four defects that change a decision

    **1. §7.2's `+900` double-counts a term already discharged.** `service.md` §3 locks the clamp to `min(url_validity, relic_expiry)` at mint, and §4.2 of this document restates it, so no signed URL outlives relic expiry. The v1 retirement bound is **259,200 seconds, not 259,200 plus 900.** The document contradicts itself between §4.2 and §7.2. **This is the station's third basis-discharge instance**, and the discharged basis is sitting in `preconditions.md` §3 and repeated in `container.md` §8, which asked for this number and would otherwise receive a wrong one.

    **2. §9 need 4 is routed to a sibling that cannot receive it.** The rotation propagation measurement goes to `design-operations-and-abuse`, whose brief names the grant construction as out of scope, whose fourteen criteria produce no signing-key measurement, and which is a `shape` design unit with no more GCP access than this one. §3.4 says the second stage is bounded by the validity window until that measurement exists, so an unreceivable routing leaves the kill switch's second stage permanently unproven. Belongs in `build` with needs 3 and 5. **The reception sweep worked exactly as designed**, and the pass confirmed need 1 to `design-product-surface` is receivable by reading that brief.

    **3. §5.2's five-minute retry budget is shorter than a single cap-sized upload.** §4.2 of the same document computes 419 seconds at 2 Mbit/s. `upload_retries_exhausted` fires with `attempts: 1` on exactly the slow-link population the retry machinery exists to serve, and it contradicts `publish.md` 3.4's sizing to a slow upload of a cap-sized object.

    **4. §4.4 drops the third factor from a three-factor product.** `preconditions.md` §3 defines worst-case egress as size times mint cap times **fetches per minted URL** times rate. §4.4 computes two factors and asserts a byte bound. **§3.3 of the same document gets it right** and concludes bounded in time and not in bytes. 6.25 GiB is the one-fetch-per-mint case. This is the residual-is-time-bounded framing the make pass nominated as a strength: §3.3 is sound, §4.4 contradicts it.

    ## Quotation audit

    **35 of 35 verified verbatim, zero deviations, matching the make pass's self-report exactly.** First self-report in this station to hold. The two-variant tag-stripping claim is corroborated. Manifest orphan check clean both directions, 17 and 17.

    **The one failure a verbatim sweep cannot catch is defect 11**: the salrashid demo's signed-PUT arm produces four results, not three, and the omitted line is a correctly sized body with a wrong hash also refused. Every wrong-size body carries a wrong MD5, so no run isolates `Content-Length`. The quotation is verbatim; the characterization of what the demo shows is not. `Content-Length` is still enforced by signature construction, so the conclusion holds and the evidence claim overstates.

    ## Two nominations came back sound, and the pass named them

    **Nomination 2, the in-flight expiry dependency: genuinely removed, not relabeled.** §4.2's argument runs on transfer duration, both figures re-derived. The only surviving reference is explicitly conditional and marked, and the observation is routed to `build` with a stated cost.

    **Nomination 3, whether `publish.md` 3.1 already decided proof of work: the nomination is unfounded and the document adjudicated correctly.** 3.1 locks difficulty zero at launch and calls turning it on a tuning change. §5.1 says exactly that and decides the genuinely open part. **That is now three units in a row where a self-nominated weakness turned out stronger than believed**, which is worth carrying into the remaining wave.

    Nominations 4 and 5 both land. 64 is a judgment value presented as computed, and one of its three headroom drivers is the floor of 40 restated. 72 hours fails on a Monday holiday, on a Friday-morning publish, and cross-timezone, where `service.md` §3 makes the app server's clock authoritative so local Friday afternoon is not a fixed point.

    ## Independent arithmetic

    The ciphertext bound **105,298,736 re-derived exactly to the octet** from RFC 8188 framing, including the 25,708-record count, confirming `container.md`'s conversion is applied correctly. Every grep-based negative claim verified true. Numbers found wrong: the `+900`, "thirteen" routed items against twelve, "five quotations" against six, a false overhead-match claim at 0.415 against 0.421, egress priced on plaintext rather than the ciphertext GCS actually bills, "lists three" candidates when two are named, and MB/GB read as binary in two factors.

    ## All seventeen criteria pass, and none of them catches any of the 21 defects

    Criterion 16's twelve routed decisions walked one at a time, including 7.4's compound requirement, both halves present. Locked-file check clean: the commit touches only the two new files. All four drift routings verified against their targets.
- worker: resolver
  started_at: 2026-07-30T15:07:38.284735+00:00
  completed_at: 2026-07-30T15:07:38.284735+00:00
  result: advance
  note: |-
    **All 21 defects applied, none disputed. Commit `a9cea77`, worktree clean.**

    Manager re-verification: `git diff --name-only HEAD~1 HEAD` returns exactly the two artifact files. **No locked file appears in the diff across the whole branch**, checked against the specify HEAD `3ad0283`, not just the last commit. 11,459 words against 2,600. 18 sources, all 18 resolve. Zero dashes.

    ## The worktree was dirty when the resolver entered, and it handled that correctly

    My first resolve dispatch was interrupted after it had already made edits. The second resolver found uncommitted work at `95853da`, **refused to trust it, and re-verified every fix against primary sources before committing.** That was the right call and it paid: it found three real defects inside the interrupted work.

    1. **§1.2's UTF-16 peak was internally inconsistent.** Prose said the decoded string sits on top of three copies, then computed a two-copies-plus-string figure. Fixed by naming the render path's actual copy set, and the observation that fixes it is a good one: **a rendered class is displayed, not downloaded, so no Blob.** The four-copy case then **breaches** 500 MB at 524,729,136 octets rather than approaching it, which is a stronger statement than the one it replaced. The conclusion and the truncated-prefix scoping survive.
    2. **"For buckets located in a single region" is a table lead-in, not a heading.** Caught by applying the fifth-mode rule to its own fix, which is the discipline working on itself.
    3. **419 seconds was priced on plaintext** after §1.1 had just committed to pricing wire figures on ciphertext. The 105,298,736 octets that actually cross are **421** seconds at 2 Mbit/s.

    ## D1's basis-discharge handling is the shape the knowledge topic asks for

    §7.2 now reads 259,200 seconds flat, names `service.md` §3's clamp as what discharges the term, and carries the tighter form. Drift item 5 does all four things: names the discharge, states **the rule stays exactly as locked** and only the reason for the extra term is gone, declines to act, and says why it routes rather than merely notes. **It has a consumer.** `container.md` §8 repeats the additive reasoning and names this document as the owner of the number, so §7.2 supplying 259,200 rather than 259,200 plus 900 puts the discrepancy on the record instead of leaving it looking like an arithmetic slip.

    ## D21 is the fix that outlives this unit

    I asked for one guarding sentence. The resolver wrote a paragraph that **encodes the reductio in the document**: the pricing page prices several bucket geometries on one URL, `$0.0006` of egress is 200 times below the `$0.12` the cost section rests on, and a neighbouring row two orders of magnitude off an established number means the wrong table rather than a discovery. Standard storage in a single region is now decided as a value with the Standard and single-region halves each argued from the access pattern.

    **That paragraph is the check that would have stopped my false challenge, written where the next reader will hit it.** §3.1 also now reports every pricing quotation against its own resolved heading rather than against the page.

    ## Quotation audit

    **40 double-quoted runs, 40 verified, zero deviations.** Five new since the make pass's 35, one of which is a quotation of a locked file and was matched against the file rather than a URL. Manifest orphan check clean both directions at 18 and 18. Heading resolution run on every pricing-page quotation.

    ## What grew

    8,527 words to 11,459, a third larger. The growth is the D21 guard, the copy-set enumeration in §1.2, drift item 5, and the leaf-4 preservation sentences. No criterion has a ceiling and none of it reads as padding, but it is worth the station audit knowing the resolve pass grew the artifact by a third.
reviews:
  fit:
    at: 2026-07-30T11:40:36.253906+00:00
  reversibility:
    at: 2026-07-30T11:39:37.092582+00:00
  simplicity:
    at: 2026-07-30T11:41:12.361511+00:00
quality_gates:
- name: artifact-exists
  command: test -f docs/design/storage.md
- name: substance-floor
  command: test "$(wc -w < docs/design/storage.md)" -ge 2600
- name: sources-manifest-populated
  command: bash -c 'set -eu; n=$(grep -c . docs/design/storage.sources.txt); test "$n" -ge 6'
- name: every-cited-url-resolves
  command: bash -c 'set -eu; while IFS= read -r u || [ -n "$u" ]; do [ -n "$u" ] || continue; curl -sfL --max-time 25 --retry 2 -A "Mozilla/5.0 (relic-link-check)" -o /dev/null "$u"; done < docs/design/storage.sources.txt'
gate_results:
- name: artifact-exists
  status: pass
  at: 2026-07-30T15:08:02.039513+00:00
  attempts: 1
  detail: '`test -f docs/design/storage.md` exits 0 at `a9cea77`. Companion manifest `docs/design/storage.sources.txt` present. Manager-run, not taken from the worker''s report.'
- name: substance-floor
  status: pass
  at: 2026-07-30T15:08:11.013615+00:00
  attempts: 1
  detail: '`wc -w` returns 11,459 against a floor of 2,600. Grew from 8,527 at the designer beat; the resolve pass added a third, all of it the D21 pricing-scope guard, the §1.2 copy-set enumeration, drift item 5, and the leaf-4 preservation sentences. No ceiling on this gate.'
- name: sources-manifest-populated
  status: pass
  at: 2026-07-30T15:08:21.144184+00:00
  attempts: 1
  detail: 18 non-empty lines against a floor of 6, one URL per line, trailing newline present. Up from 17 at the designer beat; the added source is the GCS request-preconditions page, cited by D15's leaf-4 preservation sentence for `x-goog-if-generation-match`.
- name: every-cited-url-resolves
  status: pass
  at: 2026-07-30T15:08:36.443285+00:00
  attempts: 1
  detail: 'All 18 URLs return 2xx under the gate''s own curl invocation, manager-run. Orphan check clean both directions, 18 cited and 18 listed. Worth recording that this gate is the weakest in the set: it passed on all five citation defects `specify` shipped, on the 21 found here, and on the manager''s own wrong-table misreading. What actually caught those was the verbatim sweep plus, new this unit, resolving each match offset to its enclosing heading.'
---

# Goal

Write `docs/design/storage.md`: the decided grant construction, storage topology, cost controls, and the hard size cap. Plus `docs/design/storage.sources.txt`, one URL per line, trailing newline.

**Read first:** `darkrun_knowledge_list`, especially `gcs-grant-shape-what-is-proven-and-the-open-experiment`, `egress-cost-controls-and-what-a-kill-switch-cannot-stop`, `gcs-soft-delete-and-what-deletion-actually-means`, `gcs-false-impossibility-claims`, `citation-defects-and-the-three-checks-that-catch-them`.

Then read from the repo root: `docs/frame.md`, `docs/preconditions.md`, locked; `docs/spec/publish.md` (§3 the grant hop, §4 completion and retry, §6 routed items, all five of which are yours); `docs/spec/service.md` (**§2.3 the cap arithmetic, which is the binding constraint on the size cap**, §3 lifecycle and soft delete, §7 routed items 2, 3, 4, 5); `docs/spec/format.md` (**§3.11 the referent constraint, §4.4 and §4.6**); `docs/spec/viewer.md` (**§5 the tiering consequence and §7.2**); and your sibling inputs `docs/design/container.md`, which fixes the overhead arithmetic your size math depends on, and `docs/design/topology.md`, which fixes the mint trigger your cap arithmetic depends on.

**If either sibling input is missing from your worktree, stop and fetch it before writing anything that depends on it.** Fall back to `git show darkrun/relic/units/shape/design-container-and-crypto:docs/design/container.md` and `git show darkrun/relic/units/shape/design-topology-and-origins:docs/design/topology.md`. Report which path you used. Never redefine what either settles.

# Source discipline

Five citation defects shipped in `specify`, and **not one would have failed the URL-resolution gate**, because every URL resolved. Pull raw source text and grep it. **Never WebFetch a specification.** Audit every quoted string before you finish; criterion 14 makes it checkable.

**Two corrections you must carry rather than repeat.** `preconditions.md` and `service.md` both cite a third-party blog for "$0.12/GB for the first TB". Google's own table puts the tier boundary at **10 TiB**, and charges **$0.19/GiB to Australia** and **$0.23/GiB to China**, so a ceiling computed at a flat $0.12 understates badly for a non-US audience. And `preconditions.md` attributes "signed URLs cannot be individually revoked" to a page where the word "revoke" appears **zero times**; the claim is true in effect and the correct source carries an exception the claim omits. Cite the primary pricing and signed-URL pages, and note both corrections as drift routing back to their owners rather than editing locked documents.

# The decisions

## 1. The grant shape, which cannot be decided from documents

`publish.md` 3.6 routes three candidates. **All three fail a requirement, and the spec set has not noticed that two of them do.**

- **Resumable session.** Its size enforcement is **unverified**. The one demo that appears to prove it actually proves the V4 signature pins `x-upload-content-length` at initiation, and never sends more bytes to the session URI than it declared. Separately, the data leg uses **no signed URL** and accepts `X-Goog-Meta-*` on the final request, which **breaks the metadata-pinning argument** `format.md` 4.6 and `publish.md` 6.5 both rely on. Its session URI also lives one week regardless of grant expiry, shortened only by cancellation, which needs possession of the URI.
- **POST policy document.** The only construction expressing a **cap** rather than an exact value, via `content-length-range`. But "generation" appears **zero times** in its documented field set, so it cannot carry the `ifGenerationMatch: 0` that `publish.md` 3.7 requires on **every** grant.
- **Signed PUT with a signed `Content-Length`.** Now demonstrated to enforce, by signature pinning plus HTTP framing. But a V4 signature pins a **value**, never a range, so the constraint is necessarily the client's declared size, which contradicts `publish.md` 3.6's "computed against the cap rather than the declared size." The cap still holds transitively through the grant-time refusal; that sentence is not implementable as written on this branch.

**No single documented candidate satisfies a signed size constraint, the generation precondition, and resume-from-offset together.**

**Your job:** specify the probes that eliminate branches, present them as a runnable procedure, then decide **conditionally on each outcome**. Write the decision as a decision tree whose leaves are branch choices, so whoever runs the probes reads the answer off the result rather than reopening the design.

**A leaf that names a candidate has not finished.** Each leaf must also name which of the four requirements that branch sacrifices and which locked sentence that contradicts. The four are `publish.md` 3.6's signed size constraint computed against the cap, 3.7's `ifGenerationMatch: 0` on every grant, 3.4's grant expiry the storage leg actually enforces, and 4.4's resume from a byte offset. Those sentences sit in a locked document, so **a leaf that drops one is a drift routing and not a decision this station can take alone.** Name the sacrifice, name the document and the sentence, and route it as drift to its owner. Leaving the sacrifice implicit is the part that gets reopened later, which is the whole reason the tree exists.

**The probes are specified, not run.** State that plainly and say why: they create buckets and objects, and the only authenticated local credential belongs to an unrelated venture. Each probe gets the request, the assertion, and **what the result eliminates**. At minimum: does the resumable data leg enforce the declared size, both with a known total and with `bytes 0-N/*` followed by a finalize; can client metadata be injected on the unsigned leg; does a POST policy accept a generation precondition at all, as a form field and as a policy condition; and is `ifGenerationMatch: 0` evaluated at initiation or at finalize on a resumable session, which decides whether the anti-substitution guarantee actually holds.

## 2. Cost controls, and what the kill switch cannot stop

- **Correct the egress arithmetic** against the primary source, including the destination dependence.
- **State plainly that Cloud Storage is not covered by platform spend caps.** Alerts-only budgets explicitly do not cap, and the enforcing spend-cap product's eligible-service list does not include Cloud Storage. Capping the app server stops **minting**; nothing at the platform level stops GCS egress.
- **Name the residual the kill switch cannot reach:** already-minted signed URLs do not care that minting stopped. The residual is live minted URLs times remaining validity times object size. **This makes the signed-URL validity window the blast time of the kill switch**, and that should dominate `service.md` 7.4's routed validity decision ahead of the mid-transfer ergonomics currently driving it. Decide the window on that basis, including the minimum viable validity below which a clamped mint is refused, and note the 604800 second upper bound.
- **Design signing-key rotation as an explicit second-stage kill switch.** It is the one instrument that invalidates outstanding URLs at once. It is indiscriminate and breaks honest in-flight downloads, which is the correct trade in a spend emergency. Specify the signing-identity mechanics so rotation does not lose the identity along with the money, and **mark the propagation timing as unverified** rather than assuming immediacy.
- **Decide the per-object download cap, computed against the mint-trigger branch `design-topology-and-origins` chose.** `service.md` 2.3 gives the arithmetic and the range: a floor of 40 legitimate mints for a 40-person distribution list, and a ceiling near 80 where scanners detonate with a browser. **Which end of that range binds is topology's decision and not yours to guess.** Gate the mint behind a signal a headless previewer does not produce and the ceiling collapses toward the floor of 40; leave it on load and the cap has to absorb up to 80 mints per relic before a human clicks, which roughly doubles the number and the worst-case egress it feeds. Read `docs/design/topology.md` first, state in your own document which branch it chose and which dedup interval it set, and compute the cap against that branch. Getting this wrong in either direction is a real failure: a cap sized for scanner detonation against a gated mint is slack in exactly the dimension `preconditions.md` calls the go/no-go, and a cap sized for 40 against auto-mint-on-load breaks ordinary email distribution on legitimate traffic alone, which `service.md` 2.3 already warns about.
- Decide the per-IP publish quota, showing the arithmetic. Note that GCS charges nothing for operations returning 4xx, so refusals at the storage layer are free.

## 3. The hard size cap, which three documents route and only you can decide

The same decision is routed three times: `format.md` 4.4 as whether the cap is on plaintext or ciphertext and its value, `publish.md` 6.3 as the size cap value and its referent, and `viewer.md` 7.2 as the hard size cap value. **One decision, one owner, and it is you.** `design-container-and-crypto` does not decide it and `design-topology-and-origins` does not decide it; both are told so explicitly. Do not read either sibling document as having settled it, and do not defer to a value one of them mentions in passing.

You hold it because the binding constraint is arithmetic you already own. `service.md` 2.3 is where it lives and it is in your read list. `format.md` 3.11 constrains the referent. `viewer.md` §5 carries the consequence that makes this structural rather than a number in a config file.

Decide, and state each consequence:

- **The referent, plaintext or ciphertext**, against `format.md` 3.11, and the value. `docs/design/container.md` fixes the per-record overhead, so the two referents are convertible only after you read it.
- **What it does to the viewer, which is the largest structural consequence in this station after the container framing.** `viewer.md` 7.2 states it plainly: the cap determines whether §5's tiering is required at all, because a cap below the in-memory ceiling collapses three tiers into one. A cap arrived at by omission either builds a three-tier streaming viewer that was never needed or forecloses one that was. Say which outcome your value produces. **The in-memory ceiling itself is `design-product-surface`'s decision under `viewer.md` 7.1 and it runs after you**, so state your value against each candidate ceiling and say where the collapse point sits. State the need and name the owner; do not pick the ceiling here.
- **What it fixes downstream.** From `publish.md` 6.3: `size_limit_bytes`, `size_basis`, the client pre-check in 1.2, and the signed constraint in 3.6, which is §1's decision tree. From `format.md` 4.4: the grant's signed size constraint and the worst-case egress arithmetic in the preconditions, which is §2's.

## 4. Three routed items that were assigned to nobody, and are now yours

None of these appeared in any unit's prose. Each is a value with a stated consequence in a locked document, so leaving one open ships a hole into `build` against a sentence nobody can edit.

- **Whether proof of work is in the flow, and at what difficulty.** `publish.md` 6.2. The wire shape is fixed in 3.1, so this is a value rather than a protocol change. It is the primary anti-abuse control available to a service with no accounts, and the per-IP publish quota you decide in §2 is the alternative instrument, so **decide this one on its merits rather than letting the quota close it by omission.** State the consequence `publish.md` 6.2 states: if difficulty is non-zero, `service.md` gains one grant-time refusal code for an invalid or expired solution. That code is `service.md`'s to define and never yours, so state the need and name the owner.
- **The retry cap and the backoff bounds.** `publish.md` 6.4, against 4.6. Once picked, this fixes when `upload_retries_exhausted` fires and how much egress a single failing publish can consume. `upload_retries_exhausted` is an error code already fixed in a locked document, so the value is what decides when it fires. The second half is your own arithmetic: without this number, the worst-case egress ceiling and the kill-switch residual in §2 are unbounded from the publish side.
- **Whether object metadata is set at upload at all.** `format.md` 4.6 and `publish.md` 6.5, the same decision routed twice. Both documents establish that nothing here is a capability question: the app server can set, patch, and delete custom metadata with credentials it already holds, and it can pin client-supplied values by signing `x-goog-meta-*` into the grant. `format.md` 3.2 already bars anything content-descriptive. **What is genuinely open is whether any metadata is needed at all.** Decide that, and state the two consequences both documents name: whether the grant must sign metadata constraints, and whether the blocklist scanner reads metadata or only object bytes. Your §1 holds the evidence nobody else has, since the resumable data leg accepts `X-Goog-Meta-*` on an unsigned request, so a yes here interacts with the grant branch.

## 5. The GCP project topology

The abuse blast radius is **project-level**, and `frame.md` requires two registrable domains. Nobody has connected these. **Two domains in one project is one failure domain, not two:** a suspension takes down the API, the viewer, both buckets, and the abuse tooling you would use to answer the notice.

Design both branches, since this is an operator decision with a real cost: single project, and separate projects with separate billing. State what each buys and what each costs, and state that moving buckets and signing identities afterward is a migration rather than a config change. State the sharper version too: the migration is cheap when you do not need it and impossible at the moment you do, because a suspended project cannot be migrated out of.

## 6. Lifecycle, retention, and the published byte lifetime

Decide the TTL ceiling and lifecycle regime, the retention window against the publishing-IP filter, and the soft-delete posture. **These are values, not considerations, and they are the run's permanently unfixable items.** `preconditions.md` states the property in its own words: setting the soft-delete policy late leaves a tail nobody can retroactively clear, and it has to match the retention window published below, which is what makes it a precondition rather than an operational detail.

- **Soft delete.** Read `gcs-soft-delete-and-what-deletion-actually-means`, which is the knowledge topic written for exactly this decision. Decide the posture and state what deletion actually means to a recipient, to an abuse reporter, and to a legal-preservation request.
- **The TTL ceiling and its lifecycle regime.** `service.md` 7.3 notes anything under a day is inexpressible in lifecycle and is enforced only at the application layer, per 3.1. Say which regime your ceiling lands in. **This number also bounds `design-container-and-crypto`'s v2 migration cost**, which is stated as bounded on the strength of a mandatory TTL. An undecided ceiling leaves that bound unproven, so the station's strongest reassurance about the container framing rests on this value.
- **The retention window, set together with the TTL.** `service.md` 7.5: a retention window shorter than the TTL silently stops the metric's publishing-IP filter firing on older relics, and neither locked document contains a number that would catch it. It also bounds how long the tombstone and the mint log's `code` survive, which the cap-exhaustion cost in `service.md` 1.2 depends on. State the two numbers against each other.
- Note that a legal-preservation obligation can require retaining ciphertext the operator cannot read for a year, which the published byte-lifetime number must count alongside TTL and lifecycle lag.

# Do not assign obligations to siblings

State needs and name the owner; never write that another document "must add" something. Siblings: `design-container-and-crypto`, `design-topology-and-origins`, `design-product-surface`, `design-operations-and-abuse`.

# Style

Direct, dry, confident, contractions natural, authority through specificity. **Never an em-dash or en-dash.** No emoji, no placeholders, no hedging verbs.

# Completion criteria

1. `test -f docs/design/storage.md` exits 0.
2. `test "$(wc -w < docs/design/storage.md)" -ge 2600` exits 0. Stub guard, no ceiling. Never pad; never cut a decided rule to hit a number.
3. Manifest has at least six sources, one per line, trailing newline.
4. Every source resolves. Orphan check both directions.
5. **The document names the defect in each of the three grant candidates** and states that no documented candidate satisfies all three requirements together.
6. **The probes are specified with request, assertion, and what each result eliminates**, and the document states they were not run and why.
7. **The grant decision is written as a decision tree keyed on probe outcomes**, so no leaf is left undecided, **and every leaf names which of the four requirements that branch sacrifices, which locked sentence that contradicts, and routes that sacrifice as drift to the document's owner.** The four are `publish.md` 3.6, 3.7, 3.4, and 4.4. A leaf that names a candidate and leaves the sacrifice implicit does not satisfy this criterion.
8. **The document states that Cloud Storage is not covered by platform spend caps**, and names the residual the kill switch cannot reach.
9. **Signing-key rotation is designed as a second-stage kill switch**, with propagation timing marked unverified.
10. **The hard size cap is decided as a referent plus a value**, cited to `service.md` 2.3's arithmetic and `format.md` 3.11's constraint, **and the document states whether that value collapses `viewer.md` §5's three tiers into one**, against each candidate in-memory ceiling, naming `design-product-surface` as the owner of the ceiling itself. The document also names the three routings it closes: `format.md` 4.4, `publish.md` 6.3, `viewer.md` 7.2.
11. **The per-object download cap is a number computed against the mint-trigger branch in `docs/design/topology.md`**, and the document states which branch that was, which dedup interval it set, and how the cap would differ under the other branch.
12. **The three previously unowned items are each decided as a value with the stated consequence: proof of work and its difficulty, the retry cap and the backoff bounds, and whether object metadata is set at upload.** Each names the locked consequence that follows: the grant-time refusal code, when `upload_retries_exhausted` fires and the per-publish egress bound, and whether the grant signs metadata constraints and what the blocklist scanner reads.
13. **The soft-delete posture, the TTL ceiling and its lifecycle regime, and the retention window are each decided as a value, not as a consideration.** The document states the retention window against the TTL and names the publishing-IP filter failure a shorter window causes, states which lifecycle regime the ceiling lands in, and states that the TTL ceiling is what bounds `design-container-and-crypto`'s v2 migration claim.
14. **Every quoted string is verified verbatim against raw source text, and the beat reports the audit as a list.**
15. **Both project-topology branches are designed**, with cost and blast radius stated for each.
16. **Every routed decision assigned to this document is decided with its consequence stated, or explicitly eliminated with the reason. The list, by name and with no others implied:** `publish.md` 6.1 the grant shape, 6.2 proof of work and difficulty, 6.3 the size cap value and referent, 6.4 the retry cap and backoff bounds, 6.5 object metadata at upload; `format.md` 4.4 the cap side and value, 4.6 object metadata at upload, which are the same two decisions routed twice; `viewer.md` 7.2 the hard size cap value, the third routing of the same decision; `service.md` 7.2 the per-object download cap, 7.3 the TTL ceiling and lifecycle regime, 7.4 the signed-URL validity window including the minimum viable validity below which a clamped mint is refused, 7.5 the retention window. **Nothing on this list closes by omission, and nothing on it belongs to a sibling.**
17. `test "$(grep -c '[—–]' docs/design/storage.md)" -eq 0` exits 0.

# Files touched

- `docs/design/storage.md`, `docs/design/storage.sources.txt` (create)

# Out of scope

- The container format and key material. Locked by `docs/design/container.md`.
- Origins, TLS, edge, which origin serves what, the mint trigger, the mint dedup interval, and the name. Locked by `docs/design/topology.md`.
- Viewer screens, art direction, platform memory ceilings, the truncated-prefix size, and the highlighted-region cap. Sibling `design-product-surface`.
- The abuse pipeline, legal posture, and the published SLA. Sibling `design-operations-and-abuse`.
- Product code.
