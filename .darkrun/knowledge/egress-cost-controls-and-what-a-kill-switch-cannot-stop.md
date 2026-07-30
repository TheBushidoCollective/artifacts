---
topic: egress-cost-controls-and-what-a-kill-switch-cannot-stop
created_at: 2026-07-30T09:54:07.209192+00:00
updated_at: 2026-07-30T09:54:07.209192+00:00
---
Verified pricing and cost-control mechanics for a GCS-backed unauthenticated service, from Google's own docs rather than a third-party blog. The prior spec set cited `leanopstech.com` for the egress rate; the primary source is below and says something slightly different.

## Egress pricing, from the primary source

https://cloud.google.com/storage/pricing, section "General network usage", verbatim rows:

- **"Data transfer to Worldwide Destinations (excluding Asia & Australia) (per GB)"**: `0 gibibyte to 10 tebibyte $0.12`, `10 tebibyte to 150 tebibyte $0.11`, `150 tebibyte and above $0.08`, each "/ 1 gibibyte, per 1 month / account".
- **Asia (excluding China, including Hong Kong)**: same three tiers, `$0.12 / $0.11 / $0.08`.
- **Australia**: `$0.19 / $0.18 / $0.15`. **China (excluding Hong Kong)**: `0 byte to 1 tebibyte $0.23`.
- Inbound data transfer: **Free**.

Two corrections to the commonly-repeated figure: the $0.12 band runs to **10 TiB, not 1 TB**, and **Australia is 58 percent more expensive** at every tier. Any worst-case arithmetic that assumes a single global rate is wrong on both ends, and a viral relic's audience geography is not something an operator without viewer analytics can predict.

Also on the same page: **"Generally, you are not charged for operations that return 307, 4xx, or 5xx responses."** So refusals at the storage layer are free; enumeration and probing cost the attacker's bandwidth, not the operator's, at that layer.

## The platform has a hard spend cap now, and it does not cover Cloud Storage

**Alerts-only budgets do nothing.** https://cloud.google.com/billing/docs/how-to/budgets, verbatim: **"Setting an alerts-only budget doesn't automatically cap Google Cloud or Google Maps Platform usage or spending."** And: **"there is a delay between your use of Google Cloud resources, and the usage costs reporting to Cloud Billing."**

**Spend cap budgets (Preview)** do enforce, and https://cloud.google.com/billing/docs/how-to/budgets-spend-caps states the eligibility list verbatim: **"In this release, the eligible services include Gemini API, Agent Platform (formerly known as Vertex AI), Cloud Run, and Cloud Run functions. Additional services will be included in subsequent releases."** **Cloud Storage is not on that list.** Also: **"Spend cap budgets can only be set on one project and one service at a time"**, and enforcement is on estimated gross cost, with **"the enforcement of spend caps aren't instant and any cost overages are billed as normal"** and actual costs **"typically available within a day, but can sometimes take more than 24 hours to process and appear on billing reports."**

Net: capping Cloud Run stops the app server (and therefore stops minting). Nothing at the platform level stops GCS egress. The application-layer kill switch is the only instrument, and it is a minting switch.

## What a minting kill switch cannot stop, and the one thing that can

A signed URL already issued is not affected by the app server refusing to issue more. https://cloud.google.com/storage/docs/access-control/signed-urls, verbatim: **"Anyone who knows the URL can access the resource until the expiration time for the URL is reached or the key used to sign the URL is rotated."** And: **"After you generate a signed URL, anyone who possesses it can use the signed URL to perform specified actions, such as reading an object, within a specified period of time."**

Two consequences:

1. **The residual after the switch trips is (live minted URLs) x (remaining validity) x (object size), and it is unbounded by any control that acts on minting.** This makes the signed-URL validity window a cost-control parameter, not a convenience setting: it is literally the blast time of the kill switch.
2. **Rotating the signing key is the second-stage stop and the spec set does not have it.** It is bulk, immediate, and indiscriminate: every outstanding URL dies, including honest in-flight downloads. That is the correct trade in a spend emergency, and it needs to exist as a runbook step with the key rotation mechanics settled before launch, not improvised during an incident.

**Citation correction worth propagating:** the claim "signed URLs cannot be individually revoked" is attributed in `docs/preconditions.md` and in [[gcs-cloud-run-architecture-constraints]] to https://cloud.google.com/storage/docs/access-control. The word "revoke" appears **zero times** on that page and zero times on the signed-URLs page. The supporting text is the sentence quoted above, on the `/signed-urls` page, and it carries the key-rotation exception the original claim omits. This is defect mode 2 from [[citation-defects-and-the-three-checks-that-catch-them]]: resolving URL, real and topical source, does not say the thing.

## The shape of the risk

Per-relic worst case is small and well-bounded by the size cap times the per-object download cap. The global worst case is not bounded at all, because nothing caps relic count except a per-IP publish quota, and the cost of defeating that is one address per quota unit. Any spend ceiling therefore protects against a slow leak and a single viral object; it does not protect against a distributed publish flood, which arrives faster than a billing signal and drains through URLs minted before anyone noticed.

Related: [[unobservable-quantities-are-this-projects-failure-mode]] (the app server cannot see bytes served, only mints).
