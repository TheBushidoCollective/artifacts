---
topic: relic-telemetry-trade-and-measurability
created_at: 2026-07-30T02:38:18.659151+00:00
updated_at: 2026-07-30T02:38:18.659151+00:00
---
**A wedge nobody can measure is a wedge nobody can defend.** Relic's primary success metric is unmeasurable by default under its own architecture, and closing that gap costs a defined amount of metadata. This decision was forced by adversarial review (`fb-01`) at the frame station and is overridable by the operator.

## The problem the reviewer found

The primary metric is a conjunction: relics get opened by someone other than the publisher, **and** opened relics are predominantly types Relic *renders* rather than download-only binaries. The second clause is what distinguishes Relic from a worse file.kiwi.

Neither half has a path to a number by default:
- The server holds only ciphertext and never receives the key, and mimetype sniffing happens **after decryption, in the browser** (see [[archive-browsing-and-mimetype-detection]]).
- The viewing origin carries no analytics or error reporting, because any same-origin script can read `location.hash` (see [[rendering-untrusted-content-origin-isolation]]).
- The server cannot distinguish a recipient's open from the publisher's own confirmation open, so during dogfooding the metric reads green in exactly the world where Relic has zero recipients.

Left unfixed, "opens by rendered type" silently degrades to "opens," which is trivially observable from the signed-URL mint and is precisely the number that cannot detect the failure it exists to detect. The instrument becomes the thing that hides the problem.

## The decision

Collect the minimum telemetry that makes the metric computable, all of it **server-side**, none of it from a script on the viewing origin:

1. **A coarse renderer class declared at publish time by the local client**, which already holds the plaintext: one of `markdown`, `code`, `html`, `image`, `media`, `archive`, `binary`. Stored against the relic ID.
2. **Open counts taken at signed-URL mint time**, excluding opens originating from the publishing IP.
3. **Publishing client name**, so "does this serve the segments Artifacts cannot" is answerable at all.

## The cost, stated plainly

This leaks a coarse content category, a client name, and IP-correlated open activity to the operator. It is metadata, not content, and the operator still cannot read a single byte of any relic. But it is a real reduction from "the operator knows nothing" to "the operator knows what kind of thing you published and roughly how often it was fetched."

It must appear in a published privacy statement. Per [[abuse-liability-of-hosting-uninspectable-content]], upload IP and timestamp are already retained for abuse response, so the IP-correlation cost is largely pre-existing rather than new.

**This does not conflict with the no-analytics rule on the viewing origin.** Every item above is captured by the server at publish or at signed-URL mint. No script runs on the viewing origin to produce any of it. Do not read this decision as license to add one.

## The general principle for later stations

A success metric that cannot be computed under the architecture that produced it is not a metric, it is a wish. When a station locks an architectural constraint that makes a metric unmeasurable, the station that owns the metric must either state the telemetry that restores measurability and its cost, or change the metric. Silently keeping the unmeasurable metric is the failure mode.
