---
topic: redirects-inherit-the-fragment-and-leak-the-key
created_at: 2026-07-30T04:29:01.672853+00:00
updated_at: 2026-07-30T04:29:01.672853+00:00
---
**A redirect whose `Location` carries no fragment inherits the original request's fragment. For Relic, that means a single fragment-less redirect hands the decryption key to the redirect target.** This is mandated browser behavior, not a bug in anything, and it defeats the two-domain isolation the whole architecture rests on.

## The mechanism, verbatim from the spec

RFC 9110 §10.2.2: "If the Location value provided in a 3xx (Redirection) response does not have a fragment component, a user agent MUST process the redirection as if the value inherits the fragment component of the URI reference used to generate the target URI (i.e., the redirection inherits the original reference's fragment, if any)."

RFC 9110 §17.11 names the exact risk: "when a redirect occurs and the original request's fragment identifier is inherited by the new reference in Location, this might have the effect of disclosing one site's fragment to another site. If the first site uses personal information in fragments, it ought to ensure that redirects to other sites include a (possibly empty) fragment component in order to block that inheritance." (https://www.rfc-editor.org/rfc/rfc9110.html)

## Why it is severe here specifically

The sandbox origin is precisely "another site" in §17.11's sense. The entire point of the separate registrable domain is that untrusted content cannot reach the fragment (see [[rendering-untrusted-content-origin-isolation]]). **One fragment-less redirect from the service origin to the sandbox origin defeats that, by spec-compliant browser behavior, with no bug in any component.**

This is the same shape as the SVG taxonomy gap in [[renderer-class-is-a-security-boundary-not-a-label]]: correct components, unspecified boundary, key walks out.

## The rule

**Every redirect Relic issues MUST carry an explicit, possibly empty, fragment in `Location`.** No exceptions, and the list of places this bites is longer than it first looks:

- HTTP to HTTPS upgrade
- apex to `www`, or `www` to apex
- service origin to sandbox origin (the dangerous one)
- any legacy or renamed path
- trailing-slash normalization
- any CDN or load-balancer redirect the application does not author

That last one matters: a redirect configured in infrastructure rather than application code is the one nobody audits.

## The related exposure the fragment guarantee does not cover

The fragment guarantee is a statement about what a **browser** puts in an HTTP request. It says nothing about a human pasting the string somewhere.

- **Link shorteners.** A user pasting the full URL including `#secret` into a shortener's form transmits the key in a request body and stores it on that service. Nothing technical prevents this. (Note the shortened link often still works, because the click-time redirect inherits the fragment per §10.2.2, which is the same mechanism above working in the user's favor.)
- **Abuse report forms.** A reporter pasting the full URL puts the key in the operator's own intake, converting "we structurally cannot read it" into "we chose not to." Strip everything after `#` client-side before submit, strip again server-side, and ask for the relic ID only in the published policy. **The email alias cannot be defended this way and is a stated residual, not a solved problem.**
- **Enterprise link rewriters.** Microsoft Safe Links wraps URLs with the original as a query parameter (https://learn.microsoft.com/en-us/defender-office-365/safe-links-about); Proofpoint URL Defense encodes the original into the wrapper's path. **Neither documents what it does with a fragment.** If either percent-encodes the `#` into its wrapper, the key is transmitted to and logged by that vendor. Undocumented, testable in one message by mailing a real relic through a Defender tenant and reading the delivered URL, and worth testing before launch rather than assuming.

## What this forces on the marketing claim

"The key never reaches a server" is wrong as an unqualified absolute. The honest form is **"your browser never sends the key to Relic's servers."** Everything above is a case where the key reaches *some* server without Relic's browser code doing anything wrong. Belongs in the same published statement as [[agent-mediated-key-delivery-leaks-to-the-transcript]] and the telemetry trade.
