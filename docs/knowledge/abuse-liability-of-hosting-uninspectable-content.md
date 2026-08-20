---
topic: abuse-liability-of-hosting-uninspectable-content
created_at: 2026-07-30T00:19:06.249266+00:00
updated_at: 2026-07-30T00:21:59.411801+00:00
---
Hosting a public, unauthenticated upload endpoint whose contents the operator is structurally unable to inspect is the failure mode that kills services in this category. This constraint outlives any single run.

## The precedents are specific, not hypothetical

Mozilla killed Firefox Send because it had **no Report Abuse mechanism at all**, all uploads were encrypted (so malware scanners could not inspect payloads), and **the domain was allowlisted in most corporate environments** (so links sailed through email filters). Named abusers: REvil/Sodinokibi ransomware, FIN7, the Zloader and Ursnif banking trojans, and government surveillance operators targeting human rights defenders. Mozilla suspended it July 2020 and killed it permanently in September 2020 after a cost/benefit analysis (https://www.securityweek.com/mozilla-discontinues-firefox-feature-abused-malware-phishing-attacks/, https://techcrunch.com/2020/09/17/mozilla-shutters-firefox-send-and-notes/amp). **Relic's design has all three properties.** Mozilla had a legal team and a brand to defend and still chose to shut down rather than build moderation. That is the baseline expectation, not a tail risk.

AnonFiles shut down citing "extreme volumes of people abusing the service." file.io carries a 33/100 Gridinsoft trust score and appears in live malware-distribution sandbox reports (https://www.skyhighsecurity.com/about/resources/intelligence-digest/abuse-of-file-sharing-services-aids-phishing-campaigns.html). transfer.sh is intermittently dead.

## Google Cloud imposes this as a contractual condition, not just good hygiene

GCP's AUP (https://cloud.google.com/terms/aup) prohibits distributing "viruses, worms, Trojan horses, corrupted files, hoaxes or other items of a destructive or deceptive nature," and Google monitors for malware and phishing. **For organizations hosting third-party content, Google requires** publishing policies defining prohibited content, maintaining "a reporting intake process (for example, a webform or email alias) to receive notices of illegal or abusive content," promptly reviewing alerts and removing problematic content, and monitoring logs for suspicious activity (https://docs.cloud.google.com/docs/security/respond-to-abuse-misuse).

On notification you "must promptly address or remedy any violations," and **"if you don't respond to the warning in a timely manner, your project might be suspended"** (https://support.google.com/cloud/answer/7002354). Note **project**-level, not bucket-level, blast radius. Appeals are typically answered within two business days. No documented SLA exists for how long you get before suspension.

## Safe Browsing, and why it is structurally worse for a zero-knowledge service

Safe Browsing flags at the URL level and sometimes the domain level. One flag propagates to Chrome, Google Search, Gmail, Android, and Google Ads (https://support.google.com/webmasters/answer/6347750). Chrome refreshes its local list roughly every 30 minutes. Delisting requires cleaning the site then requesting review in Search Console, and "a review can take from a few days to a few weeks."

**The structural problem: you cannot "clean the site" because you cannot see what is on it.** If the relic domain gets flagged, every relic ever shared breaks at once, Gmail strips the links, and remediation takes days to weeks with nothing concrete to point at as fixed.

## Legally you survive; reputationally you may not

18 USC 2258A obligates reporting only on "actual knowledge," which encryption means you never obtain, and providers are exempt from liability for good-faith reporting (https://uscode.house.gov/view.xhtml?req=granuleid%3AUSC-prelim-title18-section2258A). DMCA safe harbor holds if you act on notice. 0bin states this posture explicitly: "you cannot require somebody to moderate something they cannot read." **But it is an untested theory** — Mozilla had lawyers and chose not to rely on it, and GCP's AUP obligations are contractual and independent of it.

## No prior art solved moderation

PrivateBin: `robots.txt` disallows all spiders, auto-expiry, delete tokens; publicly states it has no other non-privacy-breaking mitigations and is "open to ideas" — its real strategy is decentralization. Cryptgeon: in-memory only, view-count and time limits, 512 MiB ceiling, no documented rate limiting. Wormhole: no documented abuse controls at all. 0bin: plausible deniability in place of moderation. Firefox Send: none, and it died. The pattern is that services either died, stayed tiny and self-hosted, or are commercially backed and quiet about it.

## Takedown by ID without decrypting works, and it is the key move

**The ID is not secret; only the key is.** An abuse reporter has the full URL, and the operator deletes by ID from the URL path without ever touching the fragment. The whole takedown pipeline is available to a zero-knowledge operator:
- Delete by relic ID.
- Blocklist a hash of the ciphertext so the same payload cannot be re-uploaded (defeated by re-encryption under a new key, so it is a speed bump).
- Record upload IP plus timestamp — which PrivateBin's threat model concedes is unavoidable anyway — and rate-limit or ban on it.
- Retain enough log to answer law enforcement without retaining content.

**Mandatory short TTL is the single highest-leverage control.** It bounds how long any abuse can circulate and composes cleanly with GCS lifecycle rules. Malware campaigns need links that live for days; a 24-hour to 7-day hard ceiling makes the service a poor distribution channel while staying fine for "publish this file to my colleague."

**Proof of work is a real deployed option.** Anubis uses hashcash-style PoW as a rate limiter precisely because PoW is "hard to solve and trivial to verify," making mass abuse expensive while individual use goes unnoticed (https://opensourcesecurity.io/2026/2026-01-anubis-xe/). Apply it to **publish**, never to view — Anubis drew real user hostility when applied to ordinary browsing.

## Non-negotiable design constraints

- Runs on a domain the company can afford to burn. **Never** a subdomain of a domain carrying company email, the marketing site, or client-facing infrastructure.
- Abuse reporting on day one: on every relic page, at a stable `/abuse` URL, and via a published email alias, with a named human answering it.
- Delete-by-ID tooling that works without the decryption secret.
- Mandatory (not configurable) TTL, hard size cap, per-IP publish quota, per-object download cap, per-IP download rate limit, and a global egress spend kill switch. All v1, not v2. GCS internet egress runs $0.12/GB for the first TB (https://leanopstech.com/blog/google-cloud-storage-pricing-2026/) and an unauthenticated endpoint has no identity to throttle against.
- Ciphertext-hash blocklist; IP + timestamp retention with a published retention window.
- `robots.txt` disallow plus `X-Robots-Tag: noindex`.
- Archives and executables are the highest-risk payload wrappers; supporting them is an abuse decision, not a rendering decision.

**The go/no-go test:** if the team will not commit to ongoing abuse operations (reports, takedowns, blocklist appeals, law enforcement requests), the correct answer is do not build. That work is unglamorous, unfunded, and never ends.
