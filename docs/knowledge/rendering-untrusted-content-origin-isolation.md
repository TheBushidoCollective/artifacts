---
topic: rendering-untrusted-content-origin-isolation
created_at: 2026-07-30T00:20:52.152986+00:00
updated_at: 2026-07-30T00:20:52.152986+00:00
---
Rendering attacker-controlled content is the part of Relic most likely to become a CVE. These constraints are non-negotiable for any run that touches the viewer.

**The precise threat.** If attacker HTML executes on the viewing origin, it can read `window.location.hash` (the decryption secret), read `localStorage`/`IndexedDB`, register or hijack a ServiceWorker for the whole origin, and render a pixel-perfect Relic-branded phishing page on a domain the recipient was told to trust. Each is worse than ordinary XSS.

**Origin isolation is the first layer; sanitization is the second.** Google's pattern is separate isolated origins (`*.googleusercontent.com`) — they treat XSS *inside* a sandbox domain as an invalid bug report, which shows how completely they rely on the origin boundary (https://security.googleblog.com/2012/08/content-hosting-for-modern-web.html, https://bughunters.google.com/learn/invalid-reports/web-platform/xss/6619189462433792/xss-in-sandbox-domains). The authoritative current guidance is https://web.dev/articles/securely-hosting-user-data.

- **Inactive content** (images, downloads, binaries): serve from the main domain with `X-Content-Type-Options: nosniff`, `Content-Disposition: attachment`, `Content-Security-Policy: sandbox`, `Content-Security-Policy: default-src 'none'`, `Cross-Origin-Resource-Policy: same-site`.
- **Active content** (HTML, SVG): use a **unique cross-site domain per piece of content** (`$RANDOM.exampleusercontent.com`), with the parent registered on the **Public Suffix List**, then `postMessage` the content to a static shim that renders it in a sandboxed iframe as a Blob. This isolates individual relics from each other, not just relics from the app. PSL registration is a real, slow external dependency — start it early.

Anthropic's Artifacts do exactly this: each artifact runs in a sandboxed iframe on a `*.claudeusercontent.com` origin, walled off from `claude.ai`, plus a restrictive CSP (https://code.claude.com/docs/en/artifacts).

**The `sandbox` attribute trap.** Never set both `allow-scripts` and `allow-same-origin` on untrusted content. With both, the framed script can reach `window.parent`, or simply **remove the `sandbox` attribute from its own iframe element and reload**, dropping all restrictions (https://danieldusek.com/escaping-improperly-sandboxed-iframes.html). The `Content-Security-Policy: sandbox` **header** applies to the whole response and cannot be stripped by the framed document, which makes the header strictly stronger than the attribute.

**Markdown sanitization.** `marked`'s `sanitize` option is deprecated and removed; the documented pattern is `DOMPurify.sanitize(marked.parse(input))` (https://marked.js.org/). `rehype-sanitize` is the choice inside a unified/rehype pipeline. But DOMPurify has been bypassed repeatedly and recently: **CVE-2025-26791** (mXSS via template-literal regex with `SAFE_FOR_TEMPLATES`, fixed 3.2.4) and **CVE-2026-41238** (config-parser fallback inheriting from `Object.prototype`, turning any prototype-pollution bug into full XSS bypass — affects **3.0.1 through 3.3.3 at default configuration**, https://labs.trace37.com/blog/dompurify-pp-ceh-bypass/). 3.4.0 fixes prototype pollution, mXSS, and a filter bypass. Config traps: over-permissive `ALLOWED_URI_REGEXP` re-enables `javascript:`; `ADD_URI_SAFE_ATTR` whitelists attributes out of sanitization. The recurring bypass shape is mXSS plus comments inside attribute values (https://portswigger.net/research/bypassing-dompurify-again-with-mutation-xss).
**Conclusion: pin DOMPurify ≥ 3.4.0, and never let sanitization be the only thing standing between an attacker and the secret.**

**SVG-as-image.** The rendering context decides execution. `Content-Disposition: attachment` → inert. Inside `<img src>` → parsed, no script or event-handler execution. Inline, as `<object>`, or via **direct navigation to the URL** → **fully executes** (https://digi.ninja/blog/svg_xss.php). Real advisories from exactly this: Traccar GHSA-mc2g-mjqh-8x78, 2FAuth GHSA-q5p4-6q4v-gqg3, FileRise GHSA-35pp-ggh6-c59c, Plane GHSA-rcg8-g69v-x23j.
**Rule: render SVG only inside `<img>` from a blob URL, or rasterize it, or treat it as active content on the sandbox origin. Never navigate to it.**
