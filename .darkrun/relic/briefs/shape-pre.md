---
station: shape
phase: pre
created_at: 2026-07-30T10:04:54.164897+00:00
---
# `shape` station spec

## The risk this station kills

**expensive-structural-reversal.** Not "we might pick a suboptimal library," but the specific failure discovery demonstrated: **a decision that is free today, invisible tomorrow, and a migration or a total loss after the first relic exists.**

Discovery found four of them that were about to be made by omission rather than by choice:

1. **The container framing.** `format.md` states it cannot change after content is encrypted. Discovery sharpened this in both directions: the fragment marker being pre-fetch means a v2 viewer refuses or routes a v1 relic without minting, so v2 does **not** orphan v1 relics; it obliges the viewer to carry both decoders while any v1 relic lives, which a mandatory TTL bounds. The unbounded cost would only appear if the writer kept writing v1. Meanwhile the routed option set is not decidable as written (see below).
2. **Which origin serves which response.** Baked into the URL scheme and the CSP. The two Safe Browsing categories Relic will actually sit in, "Harmful downloads" and "Uncommon downloads", attach to whichever origin serves bytes to disk. Choosing by default puts them on the one domain that cannot be replaced.
3. **The GCP project topology.** The abuse blast radius is project-level. Two registrable domains in one project is one failure domain, not two, and moving buckets and signing identities later is a migration.
4. **Whether the mint fires on load or behind a gesture.** JavaScript-executing link previewers are verified for at least two major clients, with 20 seconds of execution time. Auto-on-load is the default nobody chose, and it gets much harder to add a gate once the open counter has a baseline and the cap has a published value.

## What this station inherits

Four locked spec documents on `darkrun/relic/shape` totalling 32,259 words, plus locked `docs/frame.md` and `docs/preconditions.md`, plus **34 knowledge topics**, eleven of them recorded by this station's own explorers. The spec set routes **23 decisions** here, every one authorized and every one naming a decidable choice with stated consequences. That routing is the input; this station's job is to decide.

**Two items arrive from `specify` as watch items, recorded in `cross-document-gaps-no-criterion-catches`:** the viewer has no screen state for a post-mint object-fetch failure that `service.md` mandates copy for, and `mints_remaining` ships with a stated purpose and no specified consumer. Both are this station's to close.

## What discovery changed about the routed decisions

Three routed items cannot be decided in the form they were routed, and that is the most valuable thing discovery produced:

- **`format.md` 4.2 routes "key length, 128 or 256 bits" as cipher strength. Under RFC 8188 aes128gcm that is a category error.** The coding uses one fixed primitive set and cipher agility means defining a new content coding. The fragment is input-keying material that HKDF turns into a 16-octet CEK, so **the cipher is AES-128 either way** and a 32-byte fragment buys IKM entropy, not cipher strength. The decision must be restated as IKM length before it can be made, and AES-128 must be said out loud so nobody later reads "256-bit key" as AES-256. A 32-byte IKM also bypasses `wormhole-crypto`'s `Keychain`, which hard-rejects non-16-byte input and is the only implementation anywhere with progressive range decryption.
- **`publish.md` 3.6's grant shape cannot be decided from documents, because all three candidates fail a requirement.** The resumable session's size enforcement is unverified, and its data leg is unsigned and accepts `X-Goog-Meta-*`, which breaks the metadata-pinning argument two documents rely on. The POST policy is the only construction expressing a cap rather than an exact value, and "generation" appears **zero times** in its documented field set, so it cannot carry the `ifGenerationMatch: 0` that `publish.md` 3.7 requires on every grant. The signed PUT is now demonstrated to enforce, but a V4 signature pins a value and never a range, so it can only pin the declared size. **No single documented candidate satisfies all three of a signed size constraint, the generation precondition, and resume-from-offset.**
- **`format.md` 4.1 bundles an irreversible decision with a cheap one.** `rs` lives in each object's plaintext header, so a decryptor that reads it keeps every old relic working when the default moves. Unbundling `rs` from the framing makes it a Tier 3 decision. The condition is that the viewer must read `rs` from the header rather than passing a compiled-in default, because `wormhole-crypto` throws when the caller's value disagrees with the stream.

## What is foreclosed, so nothing designs against it

- **The Public Suffix List.** Not merely unproven as a defence: a pre-launch project sits inside two published decline criteria, an honest rationale states the declined objective in the maintainers' own words, and even a granted entry propagates on browser-release timescales. Origin isolation comes from separate registrable domains alone. Good news verified in the same pass: a PSL entry would **not** break the wildcard certificate, because the CA/Browser Forum rule directs CAs to the ICANN section only and Let's Encrypt confirmed that behaviour on the record.
- **Cloud Run for the per-relic subdomain origin.** "You cannot use wildcard certificates with this feature," and domain mappings remain preview and not production-ready. Whatever fronts the sandbox origin is now a decision with a standing monthly cost attached.
- **The Safe Browsing appeal as a mitigation.** Canonicalization strips the fragment before anything else, so the sample URL Google hands the operator is the one form of the link that cannot open the content. The reconsideration request's entire content is the abuse process and the takedown log, which must exist before the first listing.
- **Any control keyed on User-Agent.** Signal's own source impersonates `WhatsApp/2`.

## Out of scope for this station

- **Implementation.** No product code. The spike work is probes that eliminate branches, not features.
- **Reopening the locked frame or the four spec documents.** Where a finding pressures a locked decision, name it as drift routing back to its owner. Two are already identified: the egress figure in `preconditions.md` and `service.md` cites a third-party blog for "$0.12/GB for the first TB" where Google's own table puts the boundary at **10 TiB** and charges **$0.19/GiB to Australia**; and `preconditions.md` attributes "signed URLs cannot be individually revoked" to a page where "revoke" appears zero times, omitting the signing-key-rotation exception that is the second-stage kill switch.
- **Operator decisions.** Enumerated below. This station names them precisely and designs both branches where the answer changes the design.

## Decisions that are the operator's, not this station's

1. **The abuse-operations commitment, now priced.** Saying yes commits a one-person operation to a named human at a publicly listed street address on a three-year renewal clock, possibly an EU legal representative who can be held personally liable, a published SLA in hours with no external anchor, a second Search Console verified owner, availability for criminal-threat and CyberTipline filings with $600,000 statutory exposure for a knowing and willful failure, and delete-on-report with no adjudication as published policy.
2. **Separate GCP projects** for service and sandbox. Costs money and admin; without it the two-domain split does not isolate the failure the preconditions call the go/no-go.
3. **EU exposure.** Whether to offer the service in the Union at all. Geoblocking is a real alternative.
4. **The name.** npm `relic` is a client-side-encrypted secrets CLI whose own description is nearly Relic's positioning sentence, and it installs a binary of the same name. Renaming is free now and brutal after domains are bought and links are in the wild, and the domain purchase is already the stated deployment blocker.
5. **Whether to run the GCS probes**, and against which project. They create buckets and objects. The authenticated local credential belongs to an unrelated venture and will not be used.

## Done when

Units complete, each producing its document with every assigned routed decision either **decided with its consequence stated** or **eliminated by a probe result**, every foreclosed option named as foreclosed, and every operator decision stated with both branches designed where the answer changes the design. Then the checkpoint decides whether expensive structural reversal is genuinely bounded.

## The process carry-forward from `specify`, applied here

`specify`'s two audit blockers had one root cause: a unit finished before the documents that assign it obligations. **So no unit in this station assigns an obligation to a sibling.** A unit that needs something from a sibling states the need and the behaviour that follows from it, and names the sibling that owns the decision. Before this station closes, every document is grepped for assignment phrasing and every assignment is reconciled. The container unit runs first and alone, and is therefore the most exposed to this failure.
