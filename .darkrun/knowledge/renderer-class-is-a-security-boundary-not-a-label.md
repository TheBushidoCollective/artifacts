---
topic: renderer-class-is-a-security-boundary-not-a-label
created_at: 2026-07-30T04:25:59.364721+00:00
updated_at: 2026-07-30T04:25:59.364721+00:00
---
The frame's seven-value renderer taxonomy (`markdown`, `code`, `html`, `image`, `media`, `archive`, `binary`) was introduced as telemetry. **It is also the input to a security-sensitive routing decision, and nobody wrote down that it is doing two jobs.** Treat every gap in it as a potential key-disclosure path.

## The concrete exploit, with no bug in any component

**SVG has no assigned class.** SVG is active content: inert under `Content-Disposition: attachment` and inside `<img src>`, but "inline, as `<object>`, or via direct navigation to the URL" it **fully executes** (https://digi.ninja/blog/svg_xss.php).

So: a publishing client reasonably classes an `.svg` as `image`. The viewer reasonably routes `image` through the inactive-content pattern on the **main** origin, per https://web.dev/articles/securely-hosting-user-data. The SVG renders inline, executes, and reads `location.hash`, which is the decryption key.

Every component behaved correctly. The taxonomy boundary was simply never specified. **Either SVG is `html` in the taxonomy, or `image` routing is hardened to `<img>`-from-blob-only with SVG explicitly excluded.** Say which, in writing.

## The class exists twice, with different trust properties

- **Server-side copy: telemetry.** Feeds the metric's second clause.
- **Viewer-side copy: routing.** Decides which renderer, and therefore which origin and which protections.

If the class lives **only** server-side, the viewer takes the server's word for what to render, making a server-controlled value the input to a security decision. If it lives **inside the ciphertext**, it is publisher-attested and tamper-evident under the AEAD tag.

**Collapsing them into one value means either the telemetry becomes unverifiable or the routing becomes server-controlled.** Specify both copies, or specify explicitly which property is being surrendered.

## "The sniff decides" is unimplementable for the wedge

Magic-byte sniffing is documented as best-effort (https://github.com/sindresorhus/file-type). **Markdown has no magic number. Neither does plain text, source code, CSV, or JSON.** That is `{markdown, code}`, half the first-release renderer set and the flagship of the wedge. For those, the sniff returns nothing and the declared class or the filename extension is doing 100 percent of the work.

So any rule written as "sniffing selects the renderer" cannot be implemented for the renderers this product exists to ship. The workable rule is the inverse: **the class selects, the sniff is a safety check that can only downgrade to a less trusted path, never upgrade.** That is safe only if the class is publisher-attested inside the ciphertext, which ties this decision to the container-format decision. Those two will be made by different people unless a spec ties them together.

## The download path needs its own rule

On client-side decrypt the file is materialized from a Blob, so there are no response headers and `X-Content-Type-Options: nosniff` never applies. The effective declared type is the Blob's type. **A `text/html` Blob URL that is navigated to rather than downloaded executes on whichever origin created it.**

Rule: **the download path always types the Blob `application/octet-stream`**, regardless of what the container declares.

## The filename is content, not a category

Putting the filename or mimetype in server-side metadata exceeds what the frame conceded. The frame priced its leakage as "a coarse content category, a client name, and IP-correlated open activity." **`Q3-layoffs-final.xlsx` is not a coarse category, it is content.** Per [[shape-inherited-constraints-from-frame]], exceeding the frame's conceded leakage routes back to `frame` as drift rather than being settled downstream.

This is the most likely *quiet* frame violation in the build, because putting the filename in the grant response is the obvious way to make the branded taskbar show a name before decryption finishes. Placing it inside the encrypted container costs one round trip of latency and keeps the concession where the frame drew it.

## Related consequences worth carrying

- **Reserved path segments.** With `/{id}` at the root, `/abuse`, the policy URL, and `robots.txt` are reserved words. **The reserved set must be excluded from the id alphabet or an issued id can shadow the abuse page**, which is the one page the preconditions make a go/no-go obligation.
- **The taskbar and the content are on different origins by construction.** HTML renders on the sandbox origin; the taskbar is service-origin chrome. So the content iframe is never full-viewport, and a relic authored to fill the screen renders letterboxed. Product-visible and worth stating before someone discovers it in review.
- **Unknown class values must fail to download-only**, not best-effort, so a client newer than the viewer degrades safely.
