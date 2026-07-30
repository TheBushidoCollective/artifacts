# Relic: Preconditions

`docs/frame.md` says what Relic is for and what it must never become. This document says what has to be true before any of it gets built, and it states plainly when the answer is do not build.

Everything here is a precondition, not a feature. `harden` inherits it most directly, but no station is exempt. Nothing here reopens the frame: the problem, the user, the wedge, the success metric, and the telemetry decision are settled there and only referenced here.

One discipline runs through the whole document, section 3 especially. Where a condition is stated as checkable, it names the exact server-side event or record that produces its number, and where a quantity is only partly observable, it says which half is not, in the same breath. Relic's architecture forbids most of the obvious observation points: the server holds only ciphertext, there are no accounts, and the viewing origin runs no scripts. So a condition that sounds measurable and is not is the easiest defect to ship here, and a half-true one survives review in a way a fabricated one doesn't.

## 1. The abuse-operations commitment, which is the go/no-go

Google Cloud makes this contractual, not a matter of good hygiene. The Acceptable Use Policy prohibits distributing "viruses, worms, Trojan horses, corrupted files, hoaxes or other items of a destructive or deceptive nature" ([GCP AUP](https://cloud.google.com/terms/aup)). For organizations hosting third-party content, Google requires four specific things: publishing policies that define prohibited content, maintaining "a reporting intake process (for example, a webform or email alias) to receive notices of illegal or abusive content," promptly reviewing alerts and removing problematic content, and monitoring logs for suspicious activity ([respond to abuse and misuse](https://docs.cloud.google.com/docs/security/respond-to-abuse-misuse)). On notification you "must promptly address or remedy any violations," and "if you don't respond to the warning in a timely manner, your project might be suspended" ([Google Cloud support](https://support.google.com/cloud/answer/7002354)).

Read the blast radius carefully. It's **project**-level, not bucket-level. One unanswered notice takes down the API, the PWA, the storage, and the abuse tooling together, including the tooling you'd use to answer the notice.

### What that obligates, concretely

1. **A named human** who answers the abuse address, with a named backup. Not a rotation, not an alias forwarding into a shared inbox nobody owns.
2. **A published prohibited-content policy** at a stable URL.
3. **An intake path**: a stable `/abuse` URL and a published email alias, both reachable from every relic page.
4. **A stated SLA** in hours, from report received to object deleted.
5. **Log monitoring**, because the AUP asks for it by name.

### The checkable part, and the part that isn't checkable

The intake being live is checkable: a scheduled external HTTP fetch of `/abuse` and of the policy URL, asserting 200. That's fully observable, and it's the operator's own origin answering.

The SLA is checkable: median and maximum hours between the report's arrival timestamp and the deletion timestamp. Both are the operator's own records, one in the intake mailbox or ticket queue, one in the delete tooling's log. Fully observable.

**What the SLA number doesn't tell you is coverage.** It measures responsiveness on reports received. It says nothing about how much abuse is on the service, because the operator can't inspect content, so unreported abuse is invisible by construction and there's no denominator to divide by. A month of zero reports is either a clean service or a dead intake, and from the inside those two look identical. Anyone downstream who reads a good SLA as evidence Relic is not being abused has misread it.

The alias itself is worse than it looks. A synthetic probe proves the alias delivers from wherever the probe sends from. It doesn't prove a report from an arbitrary sender arrives, because the message may be silently spam-foldered, or the sender's own gateway may refuse to send to a domain that just got flagged. So "the intake works" is checkable from a probe and unverifiable in general, and the failure mode is silence.

### The precedents

Firefox Send had no Report Abuse mechanism at all, encrypted every upload so scanners could not inspect payloads, and was allowlisted in most corporate environments so its links sailed through mail filters ([SecurityWeek](https://www.securityweek.com/mozilla-discontinues-firefox-feature-abused-malware-phishing-attacks/)). Named abusers included REvil ransomware, FIN7, the Zloader and Ursnif banking trojans, and government surveillance operators targeting human rights defenders. Mozilla suspended it in July 2020 and killed it permanently that September after a cost and benefit analysis ([TechCrunch](https://techcrunch.com/2020/09/17/mozilla-shutters-firefox-send-and-notes/amp)).

Relic's design has all three of those properties. Mozilla had a legal team, a brand worth defending, and more engineers than this collective will have, and still chose to shut the thing down rather than staff moderation. AnonFiles shut down citing extreme volumes of abuse. file.io turns up in live malware-distribution sandbox reports ([Skyhigh Security](https://www.skyhighsecurity.com/about/resources/intelligence-digest/abuse-of-file-sharing-services-aids-phishing-campaigns.html)). That is the baseline expectation for this category, not a tail risk.

### The gate

**Go:** all five obligations above are committed to, with the human named, before the first deploy.

**No-go:** if any one of them is not committed to, the correct decision is not to build Relic. Not a smaller version, not a private beta, not "we'll add abuse tooling in v2." Do not build it.

This work is unglamorous, unfunded, and never ends, and it arrives at inconvenient hours. Deciding now that nobody will do it is a good outcome for this run. Deciding it after launch, with relics in the wild and a suspension notice running, is the bad one.

## 2. The domain preconditions

**Two registrable domains distinct from `thebushido.co`, acquired before anything deploys.** One for the service (the API and the PWA), one for the sandbox origin that renders untrusted HTML. `thebushido.co` carries marketing and email and never hosts user-generated content. Not on a subdomain, not "just for the beta," never.

The Immich precedent from October 2025 is the direct evidence. Google flagged every subdomain under `*.immich.cloud`, including internal-only services with no public exposure, and the trigger was auto-generated per-PR preview environments that Google crawled after their URLs were posted to GitHub. Immich's own words: "a single flagged subdomain would apparently invalidate the entire domain." The appeal was accepted in a day or two, and then it recurred, because new preview environments appeared and Google crawled again. Their actual fix was moving the risky content to a separate registrable domain ([Immich](https://immich.app/blog/google-flags-immich-as-dangerous)). Their marketing site survived only because it already sat on a different registrable domain.

The lookup mechanics permit sibling safety, and Google's listing behavior didn't deliver it. A client generates up to four hostnames per lookup, starting at the eTLD+1 and adding leading components ([Safe Browsing URLs and hashing](https://developers.google.com/safe-browsing/reference/URLs.and.Hashing)). So a listing on a subdomain doesn't mechanically match the parent, but a listing on the parent matches everything under it, because every subdomain lookup generates the parent as one of its host keys. Immich got the broader outcome anyway. Design for the behavior, not the mechanism.

Corporate mail gateways widen it further. Microsoft's Tenant Allow/Block List treats a left tilde as "a domain and all subdomains," and a TLD-level Safe Links entry blocks all related URLs across mail flow and at time of click in Teams and Office apps ([Microsoft](https://learn.microsoft.com/en-us/defender-office-365/tenant-allow-block-list-urls-configure)). An admin under time pressure blocks the registrable domain, not the specific host.

**Search Console verification is a precondition, not a follow-up.** Every domain gets verified before launch, because the Security Issues report is the only place a listing's triggering URLs are visible ([Google](https://support.google.com/webmasters/answer/6347750)). Unverified means flagged and blind: you learn you're listed from a user, and you can't see which URLs did it.

### What is checkable here

- **The domains exist and are separate.** Registrar and DNS records, checked once. Fully observable.
- **Every domain is verified in Search Console before launch.** The verification status in the Search Console property. Fully observable, and it's a one-time gate rather than a running metric.
- **Safe Browsing listing status.** The public lists answer a scheduled query, and Search Console shows the triggering URLs once verified. **The mail-gateway half is not observable.** A block inside a single company's Microsoft or Proofpoint tenant is invisible from outside and surfaces as a recipient saying the link is dead, never as a scheduled check going red. Any operational alarm built on this covers the public half only, and the private half arrives as a support ticket.

### External dependency

Acquiring the two registrable domains **requires operator action and blocks deployment**. It doesn't block design. `shape` and `build` proceed against placeholder names. Nothing ships until the domains are bought and verified, and no station should treat that as a task it can close on its own.

## 3. The v1 control set

These ship in the first release. Not one of them is deferrable, because each bounds a failure that gets expensive the moment a real abuser finds the service. Each is stated the same way: the condition, the mechanism that produces its number, and the limit on what that number actually covers.

**Mandatory, non-configurable TTL.** This is the single highest-leverage control, because it bounds how long any abuse can circulate. Malware campaigns need links that live for days. A hard ceiling makes Relic a poor distribution channel while staying fine for "publish this file to my colleague." Expiry configuration is already a locked non-goal. *Mechanism:* two distinct ones, and they're not equivalent. The app server records a publish timestamp and refuses to mint a signed URL past the ceiling, so the count of expiry refusals comes from the server's own mint log, exact to the second. GCS Object Lifecycle Management then reaps the bytes ([lifecycle](https://docs.cloud.google.com/storage/docs/lifecycle)). *Limit:* the lifecycle half is approximate. Its granularity is days rounded to the next UTC midnight, and a config change takes up to 24 hours to take effect, during which Google may still act on the old config. So the exact, observable, abuse-bounding control is the application-layer refusal. The lifecycle rule is storage hygiene, and anything shorter than a day is inexpressible in it. "Non-configurable" is a static check on the publish schema, not a runtime number.

**Hard size cap.** Bounds the blast radius of a single upload on both storage and egress. *Mechanism:* the constraint is signed into the upload grant, so an oversized object cannot come into existence, and compliance is checked by listing object sizes in the bucket. *Limit:* the *rejection rate* is not visible to the app server, because publish uploads go direct to GCS and the app server isn't in that path by design. It sees the mint and it sees whether an object materialized. Counting refused uploads needs GCS access logging turned on as a separate data source.

**Per-IP publish quota.** *Mechanism:* the app server mints every publish URL, so it sees the requesting IP and timestamp on every attempt, in its own request log. Exactly observable for what it enforces. *Limit:* the IP is not the actor. A CI runner's egress IP is shared across an entire org, corporate NAT collapses many humans into one address, and rotating IPs is cheap for anyone who cares. There are no accounts, so a per-user quota isn't available at all: every control here keys on IP, on proof of work, or on nothing. This quota measures mints per address and is only a weak proxy for publishes per person, in both directions.

**Per-object download cap.** *Mechanism:* the count increments at signed-URL mint, keyed by relic ID, in the same mint log the frame's telemetry reads. *Limit:* a mint is not a download. One mint can serve several fetches inside the signed URL's validity, and many mints are never fetched at all. Actual object reads would come from GCS access logs, a separate opt-in source. Worse for tuning: link scanners consume the cap. A Slack unfurl, a Safe Links scan, or an antivirus mail gateway mints just like a human does, and the server can't separate them without a script on the viewing origin, which is forbidden. User-Agent is visible at mint and is client-declared, so it's a hint and not a discriminator.

**Per-IP download rate limit.** *Mechanism:* the same mint log, keyed by requesting IP across all relics. *Limit:* the app server rate-limits mints, not bytes. Once a URL is minted, the ciphertext transfer runs client to GCS and the app server isn't in that path, so this control doesn't bound egress. The spend kill switch does.

**Global egress spend kill switch.** *Mechanism:* the billing export, which the frame already names as the source for its egress supporting condition. Crossing the ceiling disables minting. *Limit:* billing data is not real-time, so the switch trips after the spend rather than during it, and a sharp spike can overrun the ceiling before the number that would trip it exists. A faster, coarser signal the app server owns is available: stored object size (from GCS object metadata) multiplied by mint count. That estimate overcounts mints that were never fetched and undercounts single mints fetched repeatedly, so it's an early warning and not an accounting figure.

**Delete-by-ID that works without the decryption secret.** This works precisely because the relic ID is not secret. Only the key is, and the key lives in the fragment, which never reaches a server. An abuse reporter has the full URL, so the operator reads the ID out of the path and deletes without ever touching the fragment. Deleting the object also kills outstanding signed URLs as a side effect, because the object they point at is gone, which matters because signed URLs cannot be revoked individually ([access control](https://docs.cloud.google.com/storage/docs/access-control)). Deletion, not revocation, is the takedown primitive. *Mechanism:* report timestamp and delete timestamp, both operator records, produce the time-to-takedown figure. *Limit:* the same coverage problem as the SLA above. It measures what was reported, never what's there.

**Ciphertext-hash blocklist.** Stops the same payload being re-uploaded after a takedown. *Mechanism:* the checksum GCS records for the stored object, compared on publish, with refusals counted in the server's own log. *Limit:* this is a speed bump and should be budgeted as one. Re-encrypting the same plaintext under a fresh key produces entirely different ciphertext and sails straight through, so a zero hit count is not evidence that nothing was re-uploaded. There's also a shape constraint `shape` inherits: because the server never sees the upload stream, the comparison runs against the stored object rather than at the door, which makes this detect-and-delete rather than refuse-on-upload.

**Upload IP plus timestamp retention, with a published window.** PrivateBin's threat model concedes this retention is unavoidable anyway ([threat model](https://github.com/PrivateBin/PrivateBin/wiki/Threat-Model)), and it's what lets the operator answer law enforcement without retaining content. *Mechanism:* written by the app server when it mints the publish URL. Both directions are observable: a lookup by relic ID returns the pair, and the age of the oldest record proves the window is enforced. *Limit:* two of them. The IP identifies an egress point, not a person, so behind a VPN, Tor, a CI runner, or corporate NAT it attributes almost nothing. And the window is only honest per sink. Application records, load balancer logs, and GCS access logs are separate stores with their own retention settings, so "we keep this for N days" is true only after every sink has been enumerated and set. Checking one store and publishing the number is how that claim becomes false.

**Abuse reporting on day one.** Reachable from every relic page, at a stable `/abuse` URL, and via a published email alias, with the named human from section 1 behind it. *Mechanism:* the `/abuse` endpoint answers a scheduled HTTP check; the presence of the report link on every relic page is a static check on the PWA build, not a runtime number. *Limit:* the alias delivering to a human is only probe-verifiable, per section 1, and it fails silently.

**`robots.txt` disallow plus `X-Robots-Tag: noindex`.** *Mechanism:* both are checkable by a scheduled fetch of the live origin, asserting the file content and the response header. Fully observable. *Limit:* this stops indexing, not crawling and not classification. Immich's flagged preview environments were found because their URLs were posted to GitHub, so a noindex header offers no protection against a Safe Browsing listing. A `site:` query is a weak secondary check that speaks only to Google's index and says nothing about other engines or about crawlers that ignore `robots.txt` outright.

**The cost precondition.** GCS internet egress runs $0.12/GB for the first TB ([pricing](https://leanopstech.com/blog/google-cloud-storage-pricing-2026/)), and an unauthenticated endpoint has no identity to throttle against. That combination is why the spend kill switch is a v1 requirement rather than an operational nicety: without it, the only thing standing between a hostile download loop and the credit card is a rate limit keyed on an address the attacker can change.

## 4. The security preconditions that constrain design

Short, so `shape` and `build` inherit these rather than discovering them late.

**Untrusted content renders on a separate origin**, never the origin holding the fragment secret. That's the sandbox domain from section 2, and it's why there are two domains and not one. Google's own pattern is separate isolated origins, and they treat XSS inside a sandbox domain as an invalid bug report, which shows how completely the origin boundary is doing the work ([Google Security Blog](https://security.googleblog.com/2012/08/content-hosting-for-modern-web.html), [web.dev](https://web.dev/articles/securely-hosting-user-data)). Origin isolation is the first layer. Sanitization is the second, and it is never the only one.

**Never set both `allow-scripts` and `allow-same-origin`** on the render iframe. With both, the framed script can reach `window.parent`, or simply strip the `sandbox` attribute from its own iframe element and reload, dropping every restriction ([escaping sandboxed iframes](https://danieldusek.com/escaping-improperly-sandboxed-iframes.html)). Checkable statically against the built shim.

**The viewing origin carries no third-party scripts, no analytics, and no error reporting**, because any same-origin script can read `location.hash`, and `location.hash` is the decryption key. This is checkable in two places, not one: the CSP response header is fetchable, and the absence of a first-party-served third-party script is a build-time check on the bundle.

**The telemetry decision in `docs/frame.md` does not conflict with this rule, and nobody should read it as license to add a script here.** All three telemetry items are collected server-side: the renderer class is declared by the local publishing client at publish time, open counts are taken at signed-URL mint, and the publishing client name arrives with the publish request. Every one of them is captured by the server at publish or at mint. None of them requires anything to execute on the viewing origin. The two requirements are compatible, and they stay compatible only as long as no future station tries to satisfy a measurement question by adding a script to the viewer.

**Rate limiting returns `429`, never `401` or `403`.** Claude Code marks a server as needing auth when it sees a 401 or 403, which would prompt users to sign in against an authorization server that doesn't exist ([Claude Code MCP docs](https://code.claude.com/docs/en/mcp)). Checkable by driving the limiter in a test and asserting the status code.

## 5. What is honestly unresolved

These are open. Nobody downstream should mistake the silence for a decision.

- **Whether a Safe Browsing listing on a subdomain degrades the parent domain's Gmail sender reputation.** Deliverability practitioners say severe subdomain abuse bleeds up to the root. That is industry consensus, not Google policy, and Google publishes nothing on this specific interaction. It is part of why `thebushido.co` stays clean regardless.
- **How Proofpoint's URI blocklist treats host-to-parent relationships.** Unpublished. Microsoft's URL rules are explicit; Proofpoint's are not, and section 2 assumes the broader interpretation because assuming the narrower one has no upside.
- **Google's actual timeline between an abuse notification and project suspension.** Documented only as "timely." There's no published SLA, so the operator can't size the response window and has to treat every notice as same-day.
- **Whether Public Suffix List registration of the sandbox parent prevents a Safe Browsing listing at that parent.** PSL registration changes eTLD+1 computation so the parent stops being generated as a lookup key, but no documentation confirms Google won't list at the parent anyway, and the Immich outcome was broader than the mechanism required. Treat PSL as origin isolation with a possible listing-scope benefit, never as a guaranteed firewall.
- **The legal exposure of the plausible-deniability posture.** 18 USC 2258A obligates reporting only on "actual knowledge," which encryption means the operator never obtains ([18 USC 2258A](https://uscode.house.gov/view.xhtml?req=granuleid%3AUSC-prelim-title18-section2258A)), and DMCA safe harbor holds if you act on notice. But it's an untested theory for a service of this shape, Mozilla had lawyers and chose not to rely on it, and the GCP AUP obligations in section 1 are contractual and independent of it. This is a lawyer question, not a research question, and no amount of further reading will close it.

## The gate, restated

Sections 2 through 5 are engineering. Section 1 is not. If the collective will not commit to ongoing abuse operations, with a named human, a public intake, and a stated SLA, then Relic does not get built, and that is the correct outcome rather than a failure of the run.
