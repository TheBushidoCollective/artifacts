---
topic: per-relic-subdomain-topology-wildcard-tls-psl-and-hsts
created_at: 2026-07-30T09:58:00.788314+00:00
updated_at: 2026-07-30T09:58:00.788314+00:00
---
`docs/spec/viewer.md` 2 decides per-relic subdomains on a separate registrable domain and routes PSL registration to `shape`. What that decision actually requires, verified against first-party sources 2026-07-30. Two of these are hard foreclosures and two are lead-time items that must start before anything that looks more urgent.

## Cloud Run cannot serve this. That is a foreclosure, not a preference

Google's own page, verbatim: "**You cannot use wildcard certificates with this feature.**" And, on the same page, Cloud Run domain mappings "are in the preview launch stage. Due to latency issues, they are not production-ready and are not supported at General Availability" (https://cloud.google.com/run/docs/mapping-custom-domains).

So per-relic subdomains rule out the cheapest GCP fronting. The remaining shapes are a **global external Application Load Balancer plus Certificate Manager**, which does support wildcards under DNS authorization, or a non-GCP edge. Certificate Manager: "If you're creating a DNS authorization for a wildcard certificate, such as `*.myorg.example.com`, configure the DNS authorization for the parent domain", and SANs are "limited to a maximum of 100 when using DNS authorization and to a maximum of five when using load balancer authorization" (https://cloud.google.com/certificate-manager/docs/deploy-google-managed-dns-auth, https://cloud.google.com/certificate-manager/docs/overview). A GLB carries a standing hourly forwarding-rule cost, which is a real monthly floor for a project whose cost precondition is a kill switch.

The alternative worth pricing: **Cloudflare Universal SSL is free on every plan and covers exactly the shape needed.** "On a full setup, Universal SSL certificates cover your root domain (for example, example.com) and first-level subdomains (for example, www.example.com)" (https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/). One DNS label is precisely what `viewer.md` 2 already constrains itself to. The cost is a third party in the render path.

## Let's Encrypt rate limits are not the constraint. Per-relic issuance is

Exact numbers (https://letsencrypt.org/docs/rate-limits/, last updated June 12, 2025): "Up to 50 certificates can be issued per registered domain (or IPv4 address, or IPv6 /64 range) every 7 days"; "Up to 5 certificates can be issued per exact same set of identifiers every 7 days"; "Up to 300 new orders can be created by a single account every 3 hours". ARI-coordinated renewals are "exempt from all rate limits".

**One wildcard cert renewed every 60 days sits nowhere near any of these.** The numbers only bite the design nobody should pick: issuing a certificate per relic hostname would exhaust the 50-per-registered-domain limit in an afternoon and there is no override that fixes it at relic volume. So the finding is the opposite of the usual worry: the wildcard is cheap, and the numbers exist to foreclose on-demand issuance.

The real Let's Encrypt constraint is the challenge type. HTTP-01: "This challenge cannot be used to issue wildcard certificates." DNS-01: "It also allows you to issue wildcard certificates" (https://letsencrypt.org/docs/challenge-types/). So wildcards mean DNS-01, which means DNS provider API credentials wherever issuance runs, and the docs name the cost: "Keeping API credentials on your web server is risky."

## PSL registration does not break the wildcard, and getting this backwards would be expensive

The trap looks real: CA/Browser Forum Baseline Requirements 3.2.2.6 says "If the FQDN portion of any Wildcard Domain Name is 'registry-controlled' or is a 'public suffix', CAs MUST refuse issuance unless the Applicant proves its rightful control of the entire Domain Namespace." Read literally, putting the sandbox parent on the PSL would place the wildcard immediately left of a public suffix.

**The same section defuses it**, verbatim: "If using the PSL, a CA SHOULD consult the 'ICANN DOMAINS' section only, not the 'PRIVATE DOMAINS' section" (https://github.com/cabforum/servercert, `docs/BR.md`). Private-domain PSL entries go in the PRIVATE section. Let's Encrypt confirmed its own behavior on the record: asked "Can you confirm that you only block issuance for the ICANN section of the PSL? (And not the PRIVATE one)", jsha replied "Yep, I confirm this" (https://community.letsencrypt.org/t/wildcard-certificates-and-public-suffix-list/100974). Note it is a SHOULD, so verify with whichever CA is actually used before committing. And in any case the applicant here does control the entire namespace, which is the BR's own escape hatch.

## Two unbounded lead times on the same domain, both hard to reverse

**PSL.** "There are NO SERVICE LEVEL AGREEMENTS ON TIME nor any expectation of processing speed or urgency", and on propagation, "TL;DR: Unfortunately, there is no way to expedite." Also two procedural gates worth knowing before filing: "We will not accept patches submitted by third party users of the service", so the domain owner submits; and authentication is preferably an RFC 8553 `_psl` TXT record pointing at the PR (https://github.com/publicsuffix/list/wiki/Guidelines). Removals are explicitly higher effort than additions.

**HSTS preload**, which both `format.md` 5 and `viewer.md` 1.7 name as the preferred way to remove HTTP-to-HTTPS redirects, is the same shape and is not currently costed anywhere. Verbatim from https://hstspreload.org/: "new entries are hardcoded into the Chrome source code and can take several months before they reach the stable version"; "Be aware that inclusion in the preload list cannot easily be undone"; "Domains can be removed, but it takes months for a change to reach users with a Chrome update and we cannot make guarantees about other browsers." The required header is `max-age=63072000; includeSubDomains; preload`, and `includeSubDomains` means every per-relic hostname must always have a valid certificate, which the wildcard supplies and which becomes a hard availability dependency the day it lapses.

Both start at the same moment as domain acquisition, and both are irreversible on a months-long clock, which puts them ahead of every piece of work that looks more urgent.

## Edge status codes, where a locked rule meets a default

`docs/preconditions.md` bans `401` and `403` on every public surface, and `service.md` 1.5 makes the deployed edge responsible for the statuses. Cloud Armor's `exceed_action` accepts `deny(status)` with "Valid values are 403 Forbidden, 404 Page Not Found, 429 Too Many Requests, and 502 Bad Gateway. We recommend using the 429 Too Many Requests status code" (https://cloud.google.com/armor/docs/rate-limiting-overview). So **403 is in the valid set and is a natural pick**, and choosing it violates a locked precondition by making Claude Code prompt users to sign in against an authorization server that does not exist. Also note `503` is not in that set, so the egress kill switch's `503 service_paused` can only come from the application, never from the edge.

Related: [[domain-strategy-and-safe-browsing-blast-radius]], [[rendering-untrusted-content-origin-isolation]], [[sandbox-csp-decision-and-what-the-wedge-actually-is]].
