---
topic: gcs-soft-delete-and-what-deletion-actually-means
created_at: 2026-07-30T03:52:14.294089+00:00
updated_at: 2026-07-30T04:00:26.765407+00:00
---
**GCS soft delete is enabled by default on all buckets, with a seven-day retention.** Deleting an object stops it being served immediately, and does not erase it. Any claim about takedown, retention windows, or lifecycle reaping has to be written against that, and it is the setting you get by not deciding.

Verified against Google's documentation twice during the `frame` station, the second time correcting an error in the first recording of this topic (see the correction note at the end).

## The facts, verified verbatim

- **Soft delete is enabled by default on all buckets and has a retention duration of seven days.**
- **Soft-deleted objects cannot be read or modified**, so serving genuinely stops at delete time.
- **Objects deleted by Object Lifecycle Management become soft-deleted.** Lifecycle expiry lands in the same state; it is not a separate, harder erase.
- **A soft delete policy can be set, deleted, or edited during a bucket creation OR UPDATE request.** It is editable at any time.

## What follows for anything abuse-facing

1. **Delete-by-ID answers an abuse notice correctly.** The half that matters to a reporter, a blocklist maintainer, or Google's abuse team is that the content stops being reachable, and delete does that instantly. Do not weaken the takedown story over this.
2. **Do not claim erasure.** "Deleted" and "gone" are different states for seven days by default. A published retention window claiming "we keep X for N days" is false if object bytes outlive it in soft-delete storage.
3. **It is still a precondition, but not because the policy is immutable.** The correct reason: **a policy change only reaches objects deleted after it takes effect.** Anything already soft-deleted keeps the duration that was in force when it was deleted, even if the policy is later removed. So setting it late leaves a tail nobody can retroactively clear, which is exactly why the decision belongs before the first deploy.
4. **Soft-deleted objects still cost storage.** Relevant to any egress or spend ceiling arithmetic.

## Two adjacent facts in the same class: expiries nobody is watching

- **Google Search Console verification is not permanent.** Verification "lasts as long as Search Console can confirm the presence and validity of your verification token," it is re-checked periodically, and "your permissions on that property will expire after a certain grace period" if confirmation fails. **"If all verified owners lose access to a property, all users will lose access to the Search Console property."** So verification is a standing observable, not a one-time gate, and it requires at least two verified owners. Losing it silently returns the operator to the flagged-and-blind state that verification exists to prevent (see [[domain-strategy-and-safe-browsing-blast-radius]]).
- **Domain registration has an expiry.** The standing observable is registrar expiry and auto-renew status, not a one-time "the domain exists" check. **A lapsed relic domain is worse than a flagged one**, because someone else can buy it and inherit every link ever shared.

## The general lesson, and a correction worth keeping visible

Every one of these was found by a pass that verified a **default or an expiry** rather than a decision. **The dangerous configuration is the one nobody chose, and the dangerous fact is the one that stops being true while nobody is looking.** When a document states what a platform does, check whether the claim describes the default, an intended setting, or a state with a clock on it, and say which.

**The correction:** the first version of this topic asserted soft delete is "a bucket-creation setting," and built the precondition argument on that immutability. That was wrong, caught by a distiller pass that fetched the page and grepped the raw text rather than trusting the summary it had been handed. The lesson generalizes past this fact: a claim that arrives already summarized, from a reader you trust, is still a claim. This entry now rests on the mechanism that actually carries it (post-effect-only application, per point 3) rather than on an immutability that does not exist. Related: [[unobservable-quantities-are-this-projects-failure-mode]], since "we deleted it" is a state the operator can assert but a reader cannot verify.
