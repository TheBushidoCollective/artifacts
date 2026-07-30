---
topic: gcs-soft-delete-and-what-deletion-actually-means
created_at: 2026-07-30T03:52:14.294089+00:00
updated_at: 2026-07-30T03:52:14.294089+00:00
---
**GCS soft delete is enabled by default on all buckets, with a seven-day retention.** Deleting an object stops it being served immediately, and does not erase it. Any claim about takedown, retention windows, or lifecycle reaping has to be written against that, and it is the setting you get by not deciding.

Verified against Google's documentation during the `frame` station. Three separate claims in `docs/preconditions.md` were overstated before this was caught.

## The facts

- **Soft delete is on by default**, retention duration seven days, on all buckets.
- **Soft-deleted objects cannot be read or modified**, so serving genuinely stops at delete time.
- **Object Lifecycle Management is compatible with soft delete but does not affect soft-deleted objects.** Lifecycle reaps live objects; it does not shorten the soft-delete window.

## What follows for anything abuse-facing

1. **Delete-by-ID answers an abuse notice correctly.** The half that matters to a reporter, a blocklist maintainer, or Google's abuse team is that the content stops being reachable, and delete does that instantly. Do not weaken the takedown story over this.
2. **Do not claim erasure.** "Deleted" and "gone" are different states for seven days by default. A published retention window that says "we keep upload IP and timestamp for N days" is false if object bytes outlive it in soft-delete storage.
3. **It is a bucket-creation precondition, not a runtime control.** Changing it later does not retroactively purge what is already soft-deleted, so the decision belongs before the first deploy.
4. **Soft-deleted objects still cost storage.** Relevant to any egress or spend ceiling arithmetic.

## The general lesson

This was found by a challenger pass verifying a default rather than a decision. **The dangerous configuration is the one nobody chose.** When a document states what a platform does, check whether the claim describes the default or an intended setting, and say which. Related: [[unobservable-quantities-are-this-projects-failure-mode]], since "we deleted it" is a claim about a state the operator can assert but a reader cannot verify.

Two adjacent facts recorded in the same pass, both in the same class of "a default or an expiry nobody is watching":

- **Google Search Console verification is not permanent.** It "lasts as long as Search Console can confirm the presence and validity of your verification token," it is re-checked periodically, and permissions expire after a grace period if confirmation fails. **If all verified owners lose access, everyone does.** So Search Console verification is a standing observable, not a one-time gate, and it needs at least two verified owners. Losing it silently returns the operator to the flagged-and-blind state that verification exists to prevent (see [[domain-strategy-and-safe-browsing-blast-radius]]).
- **Domain registration has an expiry.** The standing observable is registrar expiry and auto-renew status, not a one-time "the domain exists" check. **A lapsed relic domain is worse than a flagged one**, because someone else can buy it and inherit every link ever shared.
