---
topic: firefox-send-shipped-and-unshipped-viewer-copy
created_at: 2026-07-30T09:55:25.847288+00:00
updated_at: 2026-07-30T09:55:25.847288+00:00
---
**Firefox Send's actual UI strings are recoverable and are the closest prior art to Relic's viewer.** The community fork preserves both the last shipped version and the last unshipped one, so the exact copy Mozilla wrote for a decrypt-in-browser page is readable rather than reconstructed from memory. Fetch the raw Fluent files:

- shipped: `https://gitlab.com/timvisee/send/-/raw/send-v3/public/locales/en-US/send.ftl`
- unshipped v4: `https://gitlab.com/timvisee/send/-/raw/send-v4/public/locales/en-US/send.ftl`

The fork's README states what separates them: the v4 branch holds "Mozilla's last experimental version which was still a work in progress (featuring file reporting, download tokens, trust warnings and FxA changes)" ([timvisee/send](https://gitlab.com/timvisee/send/)). **Mozilla's final unshipped work on Send was precisely the abuse-and-trust layer Relic's preconditions make a go/no-go**, and they shut it down before shipping it.

## Shipped copy worth reusing (v3)

- The one-line explanation, which notably does not overclaim: `downloadDescription = This file was shared via { -send-brand } with end-to-end encryption and a link that automatically expires.`
- Named phases, matching the three-phase progress rule: `encryptingFile = Encrypting…`, `decryptingFile = Decrypting…`, `fileSizeProgress = ({ $partialSize } of { $totalSize })`.
- Terminal state: `expiredTitle = This link has expired.`
- **The capability-refusal screen, with a concrete alternative:** `noStreamsWarning = This browser might not be able to decrypt a file this big.` offering `noStreamsOptionCopy = Copy the link to open in another browser`, `noStreamsOptionFirefox = Try our favorite browser`, `noStreamsOptionDownload = Continue with this browser`. Mozilla warned and let the user proceed rather than hard-refusing.
- **A no-JavaScript state, which Relic's viewer spec does not enumerate:** `javascriptRequired`, `whyJavascript = Why does { -send-brand } require JavaScript?`, `enableJavascript = Please enable JavaScript and try again.` Same shape for unsupported browsers, including a "why" link.
- Publisher-side expiry disclosure: `archiveExpiryInfo = Expires after { $downloadCount } or { $timespan }`.

## Unshipped copy (v4), the trust and report layer

- `trustWarningMessage = Make sure you trust your recipient when sharing sensitive data.` (publisher side)
- `downloadConfirmTitle = One more thing` / `downloadConfirmDescription = Make sure you trust the person who sent you this file because we can't verify that it will not harm your device.` / `downloadTrustCheckbox = I trust the person who sent this file`, a checkbox gating download.
- `downloadFlagged = This link has been disabled for violating the terms of service.`
- `reportFile = Report this file as suspicious`, with four reasons: `reportReasonMalware = These files contain malware or are part of a phishing attack.`, `reportReasonPii = These files contain personally identifiable information about me.`, `reportReasonAbuse = These files contain illegal or abusive content.`, `reportReasonCopyright`.
- `reportUnknownDescription = Please go to the url of the link you wish to report and click "{ reportFile }".` Mozilla's answer to a reporter with no ID was to send them to the page, which is why the report control belongs on every relic screen.

## What follows

1. **Mozilla's honesty register is the one to copy.** They never claimed the recipient was safe. They said what they could not verify. That is the same posture the frame's honesty constraint requires.
2. **Mozilla put the trust gate before *download*, not before *render*.** Relic renders inline, so whether an acknowledgement gate sits in front of rendering is an open design fork with a real cost to the wedge.
3. **The PII report reason has no home in Relic's category list** (`malware`, `phishing`, `csam`, `copyright`, `legal_process`, `other`). A subject reporting their own leaked data lands in `other`. Worth a deliberate decision rather than a default.
4. **The no-JavaScript state is a genuine completeness gap.** Relic's abuse form is already required to work without JavaScript; the viewer's state list has no equivalent, and the static shell is served to every no-JS reader.
