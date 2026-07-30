---
topic: domain-strategy-and-safe-browsing-blast-radius
created_at: 2026-07-30T00:25:48.134884+00:00
updated_at: 2026-07-30T00:25:48.134884+00:00
---
**Never host user-generated or user-uploaded content on a subdomain of a domain that carries company email or the marketing site.** This is evidence-backed, not caution.

**How Safe Browsing lookups mechanically work.** The client canonicalizes a URL and generates up to 30 host-suffix/path-prefix combinations: at most 5 host strings × 6 path variants. The host rule, quoted: "up to four hostnames formed by starting with the eTLD+1 domain and adding successive leading components," where **eTLD+1 is determined by the Public Suffix List** (https://developers.google.com/safe-browsing/reference/URLs.and.Hashing). So for `a.b.example.com` the generated hosts are `example.com`, `b.example.com`, `a.b.example.com`. Mechanically, a listing for a subdomain does *not* match the parent — but a listing for the parent matches **everything** beneath it, since every subdomain lookup generates the parent as one of its host keys.

**The mechanism permits sibling safety. Google's listing behavior does not.**

**The Immich precedent (October 2025) is the direct answer.** Google flagged **all subdomains under `*.immich.cloud`**, including internal-only services with no public exposure (Zitadel, Outline, Grafana, Victoria Metrics). The actual trigger was auto-generated per-PR **preview environments**, crawled after their URLs were posted to GitHub and classified as deceptive. Immich's own words: *"a single flagged subdomain would apparently invalidate the entire domain."* The URLs listed in Search Console were only the preview environments; the blast radius was not. Appeal via Search Console → Request Review was accepted in "a day or two" — **and then it recurred**, because new preview environments appeared, Google crawled GitHub again, and `immich.cloud` was flagged a second time. Their actual fix was moving preview environments to a **separate registrable domain, `immich.build`** — not a subdomain. Jellyfin, NextCloud, and n8n have reported the same pattern. (https://immich.app/blog/google-flags-immich-as-dangerous)

The detail that matters most: Immich's marketing site is `immich.app`, a **different registrable domain** from `immich.cloud`. That separation is the only reason their public site survived, and their remedy was to add a *third* registrable domain for the risky content.

**Corporate mail gateways make it worse, by default.** Microsoft's Tenant Allow/Block List: "a left tilde implies a domain and all subdomains. For example, `~contoso.com` includes `contoso.com` and `*.contoso.com`," and a TLD-level Safe Links entry blocks "all URLs that are related to `*.TLD/` (subdomains, domains, or sub paths) both during mail flow and at time of click across Microsoft Teams and Office apps" (https://learn.microsoft.com/en-us/defender-office-365/tenant-allow-block-list-urls-configure). An admin under time pressure blocks the registrable domain, not the specific host. Note Microsoft's *email*-domain docs are internally inconsistent on subdomain coverage; plan for the broader interpretation, since the URL rules are unambiguous.

**Honestly undetermined:** whether a Safe Browsing listing on a subdomain degrades the parent's **Gmail sender reputation**. Deliverability practitioners say severe subdomain abuse bleeds up to the root, but that is industry consensus, not Google policy, and Google publishes nothing on this specific interaction. Proofpoint's URI-blocklist treatment of host-to-parent relationships is also unpublished.

**The structure to ship:**
1. The company apex stays clean: marketing, email, nothing user-generated, ever.
2. **A separate registrable domain for the service.** A listing here costs the service, not the collective's email and marketing presence.
3. **A third registrable domain for the sandbox origin** rendering untrusted HTML — cross-site from the service domain, so a flag on rendered content does not take out the service's own API and PWA, and so untrusted HTML cannot reach the fragment secret.
4. If using per-relic random subdomains, register the sandbox parent on the **Public Suffix List**. Caveat stated honestly: PSL registration changes eTLD+1 computation so the parent stops being generated as a lookup key, but **no documentation confirms PSL registration prevents Safe Browsing from listing at the parent anyway**, and Google's Immich behavior was broader than the mechanism required. Treat PSL as origin isolation with a possible listing-scope benefit, never as a guaranteed firewall.
5. **Verify every domain in Search Console before launch, not after the flag.** The Security Issues report is the only place you can see which URLs triggered a listing. Unverified means flagged and blind.

**Design goal: assume you will be flagged. Make the flag cost one domain you can afford to lose.**
