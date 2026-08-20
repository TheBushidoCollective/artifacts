---
topic: legal-obligations-of-a-no-accounts-hosting-service
created_at: 2026-07-30T09:54:57.058439+00:00
updated_at: 2026-07-30T09:54:57.058439+00:00
---
What a no-accounts, zero-knowledge hosting service can and cannot claim under US and EU law, read from raw statutory and regulatory text rather than summaries. **This is research, not legal advice.** The distinction between what is *required by the text* and what is *prudent* or *untested* is marked throughout, and the items marked as lawyer questions are lawyer questions.

## DMCA 512: the shield is available, but two of its conditions assume users you do not have

Text pulled from https://www.law.cornell.edu/uscode/text/17/512.

**What works fine without accounts.** §512(c)(3)(A)(iii) asks a notice to contain **"Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit the service provider to locate the material."** A reporter holding a relic URL supplies exactly that, and delete-by-ID acts on it without decrypting. The notice-and-takedown half of 512 is fully compatible with zero knowledge.

**What does not work.** §512(i)(1)(A) conditions **every** limitation in the section on the provider having **"adopted and reasonably implemented, and informs subscribers and account holders of the service provider's system or network of, a policy that provides for the termination in appropriate circumstances of subscribers and account holders of the service provider's system or network who are repeat infringers"**. A service with no subscribers and no account holders has nobody to terminate and nobody to inform. Whether that means the condition is satisfied vacuously or the shield is unavailable is **not answerable from the text** and is a real lawyer question. The nearest available analogue of termination is an IP ban, which is what the spec set's per-IP quota already keys on, and which attributes almost nothing.

§512(i)(1)(B) additionally requires the provider **"accommodates and does not interfere with standard technical measures"**. Client-side encryption plainly interferes with content identification. The saving grace is the definition in §512(i)(2), which requires measures **"developed pursuant to a broad consensus of copyright owners and service providers in an open, fair, voluntary, multi-industry standards process"** and that **"do not impose substantial costs on service providers or substantial burdens on their systems or networks"** — a bar essentially nothing has been held to clear. Flag it; do not build on it.

**The designated agent is a concrete, personal, recurring cost.** §512(c)(2) requires designating an agent **"by making available through its service, including on its website in a location accessible to the public, and by providing to the Copyright Office"** the agent's details. 37 CFR 201.38 (https://www.ecfr.gov/current/title-37/section-201.38) adds two things people miss:
- **"A post office box may not be substituted for the street address for the service provider, except in exceptional circumstances"** (a demonstrable threat to personal safety), and only by written waiver request to the Register of Copyrights.
- **"A service provider's designation will expire and become invalid three years after it is registered with the Office, unless the service provider renews such designation."**

So for a one-person operation the DMCA agent is **a named human at a publicly listed street address, re-registered on a three-year clock**. That is the same expiry-nobody-is-watching class as Search Console verification and domain renewal in [[gcs-soft-delete-and-what-deletion-actually-means]].

## 18 USC 2258A: the reporting duty is knowledge-triggered and there is no duty to look

https://www.law.cornell.edu/uscode/text/18/2258A. §2258A(f) is explicit that nothing in the section requires a provider to **"monitor any user, subscriber, or customer of that provider"**, to monitor content, or to **"affirmatively search, screen, or scan for facts or circumstances described in sections (a) and (b)."** The duty attaches on actual knowledge, and reporting must happen **"as soon as reasonably possible after obtaining actual knowledge"**.

Penalties for a small provider are large: §2258A(e) sets **"not more than ... $600,000 in the case of a provider with less than 100,000,000 monthly active users"** for an initial knowing and willful failure, and **$850,000** for a second or subsequent one. Also note §2258A(h): submitting a CyberTipline report is **treated as a request to preserve the reported contents for 1 year** (raised from 90 days by Pub. L. 118-59). A zero-knowledge operator who reports must therefore retain ciphertext it cannot read for a year, which collides with any published "we delete everything in N days" statement.

## EU DSA: the favourable article is Article 8; the expensive one is Article 13

Text from https://publications.europa.eu/resource/celex/32022R2065 (EUR-Lex blocks scripted fetch; the Publications Office CELEX resource serves the same XHTML with `Accept-Language: eng`).

**Article 8 is the strongest text anywhere for this design.** Verbatim: **"No general obligation to monitor the information which providers of intermediary services transmit or store, nor actively to seek facts or circumstances indicating illegal activity shall be imposed on those providers."** Article 7 adds that voluntary own-initiative investigation does not forfeit the liability exemptions. Article 6 keeps the hosting shield conditional on no actual knowledge and expeditious action once knowledge arrives, which is exactly the delete-by-ID posture.

**Article 16 defines the notice mechanism and it fits a zero-knowledge service.** A notice must contain **"a clear indication of the exact electronic location of that information, such as the exact URL or URLs"**, and notices **"shall be considered to give rise to actual knowledge or awareness for the purposes of Article 6 in respect of the specific item of information concerned where they allow a diligent provider of hosting services to identify the illegality of the relevant activity or information without a detailed legal examination."** Note the asymmetry that matters: **a notice creates actual knowledge from the reporter's assertion, not from the operator's inspection.** An operator who cannot read the content cannot verify the claim and cannot safely ignore it either. The processing standard is Article 16(6): **"in a timely, diligent, non-arbitrary and objective manner"**, with no hour figure anywhere in the Regulation.

**Article 17 does not bite, and the reason is worth knowing.** Statements of reasons are owed to affected recipients, but Article 17(2) says **"Paragraph 1 shall only apply where the relevant electronic contact details are known to the provider."** No accounts means no contact details means no statement of reasons. This is one place where the no-accounts non-goal *reduces* the compliance surface.

**Article 13 is the real cost and it is easy to miss.** **"Providers of intermediary services which do not have an establishment in the Union but which offer services in the Union shall designate, in writing, a legal or natural person to act as their legal representative in one of the Member States where the provider offers its services."** The representative must be notified to that Member State's Digital Services Coordinator, made publicly available, and **"It shall be possible for the designated legal representative to be held liable for non-compliance"**. "Offer services in the Union" turns on a **"substantial connection to the Union"** (Article 3(d), (e)), which includes **"a significant number of recipients of the service in one or more Member States in relation to its or their population"**. A relic link is openable from anywhere; whether a US collective's link-sharing tool crosses that threshold is a fact question and a lawyer question, not a research one.

Articles 11 and 12 add two published points of contact (one for authorities, one for recipients), and Article 12(1) specifies communication **"which shall not solely rely on automated tools"** — a human, again. Article 14 requires content-moderation terms **"in an easily accessible and machine-readable format."**

**Micro and small enterprise relief is real but partial.** Article 15(2) exempts micro/small enterprises from the annual transparency report. Article 19 exempts them from all of Section 3 (the online-platform obligations: internal complaints, out-of-court dispute settlement, trusted flaggers, misuse suspension) **"with the exception of Article 24(3)"**. Articles 11, 12, 13, 14, 16, 17, and 18 are **not** in that relief and apply regardless of size.

**Article 18 is an affirmative duty that survives encryption.** Where a hosting provider **"becomes aware of any information giving rise to a suspicion that a criminal offence involving a threat to the life or safety of a person"** has or may occur, it must **"promptly inform"** law enforcement. Awareness will come from abuse reports, since the operator cannot inspect. That is a duty a solo operator must be able to discharge at 3am.

**Whether Relic is an "online platform" is genuinely open.** Recital 14 defines dissemination to the public as **"making the information easily accessible to recipients of the service in general without further action by the recipient of the service providing the information being required"**, and puts interpersonal communication services outside the definition. A link handed to one colleague and a link posted publicly are the same object in Relic. The micro-enterprise relief makes the answer mostly moot for a small operation, which is the practical reason not to spend a lawyer's hour on it first.

## The honest summary

Required by text and cheap: an abuse intake, delete-by-ID, published terms naming prohibited content, a DMCA agent registered with the Copyright Office and renewed every three years, and public points of contact. Required by text and expensive: an EU legal representative, if the service is offered in the Union. Untested and lawyer-only: whether §512(i)(1)(A) is satisfiable without account holders, whether encryption forfeits the shield under §512(i)(1)(B), and whether a shared-link service disseminates to the public. Prudent but not required: everything in [[abuse-liability-of-hosting-uninspectable-content]].

Nothing here contradicts the go/no-go in `docs/preconditions.md` section 1. It prices it.
