---
name: relic
description: Publish a local file as an encrypted, shareable link when someone outside this session needs to see it. Use when the user says "share this", "send this to X", "publish this", "give me a link for this", "make this shareable", or has just been handed a generated report, HTML page, deck, image, or export and needs it somewhere a person can open. Also covers what the recipient sees, how long a link lives, and what the service can and cannot read.
---

# Relic

Turn a file on this machine into a URL you can hand to a person.

The file is encrypted here, before anything is uploaded. Only ciphertext
reaches the service. The key lives in the URL fragment, which browsers never
send to a server, so the operator holds bytes they cannot open.

## Publishing

Call `relic_publish` with a filesystem path:

```
relic_publish(path: "/Users/me/Downloads/report.html")
```

It takes a **path, not content**. That is deliberate: the plaintext never
enters the conversation, so it is never in the transcript, never in a model
context window, and never in whatever stores those. Do not read a file into
context and pass its text; pass where it lives.

Optional arguments worth knowing:

- `filename` overrides the display name shown to the recipient.
- `ttl_days` gives the link a lifetime in days, 1 to 3650. A relic is kept
  until it is deleted unless you set one. Shorter is better for anything
  sensitive: when the content should stop being available, say when.

## Say this when you hand over the link

**The key is in the URL, and the URL is now in the transcript.** Anyone with
this conversation can open the file. That is structural, not a bug being fixed
later: returning a usable link is the product, and a usable link contains the
key.

So the honest framing for the user is: zero-knowledge holds against whoever
runs Relic. It does not hold against their model provider, or anyone who can
read their session history. If the content should not be in a transcript at
all, it should not go through an agent.

Also worth one line, unprompted, the first time in a session:

- a relic is kept until it is deleted, unless it was published with a
  `ttl_days` lifetime, in which case the tool returns the exact date
- opens are capped, and the tool's mint response reports how many remain
- anyone with the link can read it; there are no per-recipient permissions

## What the recipient gets

A page that fetches the ciphertext, decrypts it in their browser, and renders
by type. Markdown, code, images, and plain text render inline. HTML renders in
a sandboxed frame on a separate origin, so a published page cannot reach the
key or the service. Anything else offers a download.

They need the whole URL including the `#...` part. A link truncated at the `#`
is a page that cannot decrypt anything, and that is the most common way sharing
fails: chat clients and ticket systems sometimes cut fragments.

## When not to use it

- **Something that belongs in the repo.** Commit it. A relic is a link you
  hand someone, not a place work lives; the repo is.
- **A client deliverable.** Those have a durable home, and a share link is
  not it, even one with no expiry. Publish a relic in addition if someone
  needs to look at it now, never instead.
- **Credentials, keys, or tokens.** Encrypted in transit and at rest still ends
  with a secret sitting in a URL in a transcript.

## Checking what the client does

`relic_describe_client` returns the client's own account of what it uploads and
what it withholds, plus the service it is pointed at. Use it when the user asks
what is actually being sent, rather than paraphrasing this file. The published
source is one file and is deliberately unminified, so "read it yourself" is a
real answer.
