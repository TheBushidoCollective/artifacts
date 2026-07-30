---
topic: agent-mediated-key-delivery-leaks-to-the-transcript
created_at: 2026-07-30T04:24:41.324832+00:00
updated_at: 2026-07-30T04:24:41.324832+00:00
---
**Relic's zero-knowledge property holds against the Relic operator. It does not hold against the model provider or the session transcript store.** This is structural, not a defect, and it is not fixable inside the locked architecture.

## Why it is unavoidable

The `publish_relic` MCP tool must return the full URL **including the fragment**, because the whole point is that the agent hands the user a shareable link. The fragment is the decryption key. So on every publish, the key passes through the model's context window and is written to whatever transcript store that session uses.

There is no version of "the agent gives you a link" where the key does not transit the agent. Withholding the fragment from the tool result means the agent cannot produce a usable link, which is the product.

## What this does and does not compromise

- **Against the Relic operator: unchanged.** The server still never receives the key, still holds only ciphertext, and still cannot read a byte. Every claim in `docs/frame.md` about the operator remains true.
- **Against the model provider and transcript store: the claim does not apply at all.** Anyone with access to the session transcript has the key and the URL, which is complete access to the plaintext.
- **The publisher's own machine: unchanged.** The plaintext was there already.

## Why this is separate from the caveat the frame already carries

`docs/frame.md` concedes that the decrypting JavaScript is served by the same party the zero-knowledge claim is made against, so the claim is about operator intent rather than a property the recipient can verify. That is a real caveat and it is **a different one**. This one is not about intent or verifiability: the key is simply, definitely, in a third party's logs by design. A privacy statement carrying only the served-JavaScript caveat is materially incomplete.

## What follows

1. **It is a disclosure obligation.** It belongs in the same published statement as the telemetry trade recorded in [[relic-telemetry-trade-and-measurability]]. Publishers must be able to learn it before they publish something sensitive.
2. **It bounds the honest marketing claim.** "The service can't read your file" is true. "Nobody but the recipient can read your file" is false whenever an agent produced the link.
3. **It sharpens the input-schema decision.** A tool that accepts a file *path* keeps the plaintext out of the transcript, so only the key leaks. A tool that accepts inline *content* puts the plaintext in the transcript too, compounding the leak from "the key leaks upward" to "the key and the file leak upward." Prefer a path, and say so in the schema rather than accepting both and letting agents inline by default, because inlining is what a model already holds.
4. **It is worse for exactly the segment that most needs zero-knowledge.** [[prior-art-zero-knowledge-link-sharing]] notes cross-org handoff of secrets-adjacent content as the one place the property is genuinely felt. That is also the content whose key you least want in a third-party transcript.

## The general lesson

**Any privacy property mediated by an agent inherits the agent's trust boundary.** When a design routes a secret through a model to reach a human, the model provider joins the trust base whether or not the design acknowledges it. Check every cryptographic claim in an agent-native product against the question "what has to pass through the context window for this to work," because whatever does is not private from the provider.
