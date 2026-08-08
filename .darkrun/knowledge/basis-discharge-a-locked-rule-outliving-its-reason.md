---
topic: basis-discharge-a-locked-rule-outliving-its-reason
created_at: 2026-07-30T11:41:51.369706+00:00
updated_at: 2026-07-30T11:41:51.369706+00:00
---
A locked document states a rule **and** states the basis the rule rests on. A later decision, made legitimately in another document, **discharges that basis**. The rule stays literally true and enforceable. Every document remains internally complete. Nothing contradicts anything. And the rule is now unjustified.

## Why every existing check misses it

- **Contradiction hunting** misses it: there is only one answer and it is still the answer.
- **Per-document criteria audits** miss it: each document satisfies its own criteria.
- **Per-unit ownership sweeps** miss it: the rule has an owner and the owner stated it correctly.
- **[[cross-document-gaps-no-criterion-catches]]** is a different class: there a rule is stated in A, consumed by B, and implemented nowhere, so the rule has no home. Here the rule has a home and keeps working.

**None of those checks ask what a locked decision rests on.** That question is the only thing that finds this.

## The two instances, which point in opposite directions

**Instance A, a cost you keep paying for a benefit that is gone.** `viewer.md` §2 decided per-relic subdomains and named the benefit: process-level isolation, which requires a Public Suffix List entry because process allocation keys on **site** while same-origin policy keys on **origin**. The `shape` station foreclosed the PSL on eligibility. The decision stands and still bills a wildcard certificate, DNS-01 credentials wherever issuance runs, a standing edge cost, and unbounded auto-generated hostnames.

**Instance B, a restriction you keep honoring for a reason that is gone.** `viewer.md` §5 states absolutely that "the viewer never shows a plaintext byte count before decryption starts," resting on `format.md` 3.3's minimal-padding qualifier. `shape`'s container unit refused bucket padding, so the size derivation became exact and the qualifier discharged. The prohibition stands with nothing under it.

**Same handling, different urgency.** An ongoing cost bleeds; a foregone feature just sits there. Both were caught late and neither was caught by a gate.

## The handling, and the trap inside it

State the discharge, establish what survives, design both branches without picking, and **route as drift to the station that owns the locked text, quoting the sentence whose basis is gone.**

**The trap: a discharged basis does not convert a locked rule into a free choice.** The obvious next move is to write "so now decide whether to do the thing the rule forbids," and that instructs a downstream unit to silently undecide locked text, which is the failure the whole no-sibling-obligations discipline exists to prevent. Instance B nearly shipped that way. **The rule holds until its owner revisits it. Downstream names the discharge; it does not act on it.**

**Second trap, learned on instance A: do not overstate the collapse.** `viewer.md` §2 gave **two** reasons for per-relic subdomains, and the locked text calls the second one "the durable one": a per-relic hostname is defense in depth, so a misconfigured sandbox flag costs one relic instead of every relic a recipient has open. That reason rests on distinct **origins** and survives the foreclosure untouched, because same-origin policy compares scheme, host, and port and never consults the PSL. Only the site-keyed reason was lost. Writing it as a total collapse would have made the branch look like pure cost and got it dropped for a false reason. **Establish which boundary each reason depends on, per reason, rather than asserting either extreme.**

Related trap worth knowing on that specific mechanism: `document.domain` is the one origin-side mechanism a PSL entry genuinely touches, and it does **not** make the defense-in-depth reason PSL-dependent. It takes effect only where both documents opt in, the victim document is never attacker-controlled, and it is deprecated and inert by default in current Chrome. An investigator who finds it and stops could wrongly conclude both reasons collapse.

## The sweep that finds this class, and it is enumerable

This class has a finite generator whenever a spec set is written before a discovery pass runs: **discovery's job is to foreclose things, and every foreclosure is a candidate basis-discharge.**

**For each foreclosure, run both halves:**

1. **Does the foreclosure hold?** Verify it against primary sources. This half is usually the one that gets run.
2. **What in the locked corpus rested on it?** Grep the locked documents for rules whose stated reason invokes the foreclosed thing. **This half is the one that finds the defect, and it is the one that gets skipped.**

On this run, four foreclosures were declared. Half one ran on all four. Half two initially ran on one. Running it on the remaining three took a few greps and closed the question: Cloud Run appears zero times in the locked corpus so nothing could rest on it; the Safe Browsing appeal hits are a publisher's appeal against a takedown, a different mechanism; and no locked control keys on User-Agent, since the rule that looked like it might is structural ("the mint is never a side effect of serving `/{id}`") with a fetcher's identity cited as evidence rather than used as a discriminator.

**Record which half you ran.** A verified foreclosure reported without half two reads as coverage and is not.

## The adjacent generator

Foreclosures are the common source but not the only one. **Any decision that discharges a premise can do this**, including a decision that makes something newly possible rather than impossible. Instance B came from refusing an option, which made a derivation exact and removed a reason for withholding information. So the sweep also runs after each manufacturing wave, not only after discovery: a unit that has just decided something can discharge a premise a not-yet-written unit was relying on, and no criterion written beforehand can anticipate it.
