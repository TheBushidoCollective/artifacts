---
name: relic
description: Publish a local file as an encrypted, shareable link when someone outside this session needs to see it. Use when the user says "share this", "send this to X", "publish this", "give me a link for this", "make this shareable", or has just been handed a generated report, HTML page, deck, image, or export and needs it somewhere a person can open. Also covers republishing a new version of an existing relic, what the recipient sees, how long a link lives, and what the service can and cannot read.
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

When the task is to update the same source, call `relic_lookup_source` first:

```
relic_lookup_source(path: "/Users/me/Downloads/report.html")
```

It reads local machine state only. If the source was published before, it
returns the relic id and the exact `relic_republish` call. This works across
Git worktrees and clones of the same remote, so a fresh session does not need
to retain the id from the first publish.

Do not publish an update as a new relic. That costs a second URL that nobody
holding the first one will ever see. `relic_publish` enforces this: when local
state matches the source, it refuses and points to `relic_republish`.

Optional arguments worth knowing:

- `filename` overrides the display name shown to the recipient.
- `ttl_days` gives the link a lifetime in days, 1 to 3650. A relic is kept
  until it is deleted unless you set one. Shorter is better for anything
  sensitive: when the content should stop being available, say when.
- `force_new` deliberately creates a separate relic from a source this machine
  already published. Use it only when two independent URLs are the goal, never
  to get past the update refusal.

The result reports the relic as version 1 and its id. The client records that
id with the source locally, so a later session can recover it with
`relic_lookup_source`.

## Republishing

Call `relic_republish` with the relic id and a new file:

```
relic_republish(relic_id: "0a2c...", path: "/Users/me/Downloads/report-v2.html")
```

The new file becomes version 2, then 3, and so on, encrypted under the same
key as version 1. **The share URL does not change**: everyone holding the
existing link now sees the new content, and there is no new link to hand out.
`relic_id` is the 26-character id the original publish returned, not the URL.
Optional `filename` overrides the display name in the new version.

Two things to know before promising an update:

- **Republishing works only on the machine that published.** The key and the
  publish token are recorded locally when the first publish happens, in a
  0600 file under the user's config directory. On any other machine the tool
  refuses: the relic was published from another machine and cannot be
  republished here. Neither secret is ever printed or logged.
- **A takedown is terminal.** If the relic was removed, republishing cannot
  revive it, ever, whatever token is presented. The tool says so plainly;
  publish the content as a new relic instead.

A relic's lifetime is set at its first publish and carries across versions
unchanged.

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
by type. Markdown, code, images, and plain text render inline. HTML and JSX
render in a sandboxed frame on a separate origin, so a published page cannot
reach the key or the service. Anything else offers a download.

That frame has **no network access**: its policy permits no remote source at
all, so a page cannot fetch, beacon, or load an external image, font, or
script. Inline what a page needs when you generate it, because a CDN
reference renders as nothing. The upside is that a relic cannot phone home or
learn the recipient's IP address.

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
