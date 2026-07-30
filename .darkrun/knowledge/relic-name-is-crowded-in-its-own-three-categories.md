---
topic: relic-name-is-crowded-in-its-own-three-categories
created_at: 2026-07-30T09:55:43.969400+00:00
updated_at: 2026-07-30T09:55:43.969400+00:00
---
**The name "Relic" is already occupied in all three namespaces this product lives in: developer tooling, cryptography, and client-side-encrypted secret sharing.** Checked directly against the registries on 2026-07-30. This is a positioning and distribution fact, not a preference, and it gets more expensive the later it is discovered.

## The collisions, worst first

1. **npm `relic` is taken, and by the nearest possible competitor.** Its published description is `The Relic CLI for managing and sharing secrets. Encrypted on your device, never exposed to anyone else. Not even us.` Latest `0.9.2`, published 2026-04-14, 22 versions, 36 downloads in the week ending 2026-07-28, repo [heycupola/relic](https://github.com/heycupola/relic) at ~195 stars. It also installs a binary literally named `relic` (`"bin": {"relic": "bin/relic"}`), so the CLI command name collides too. Verify with `https://registry.npmjs.org/relic`.
2. **New Relic** owns the word in developer tooling. npm `newrelic` is their agent. Any developer-facing tool called Relic is permanently one search result away from an observability vendor.
3. **RELIC is an established cryptographic toolkit**, [relic-toolkit/relic](https://github.com/relic-toolkit/relic), ~513 stars. A zero-knowledge encryption product named Relic sits on top of a crypto library named RELIC.
4. **sassoftware/relic** (~196 stars) is "a service and a tool for adding digital signatures to operating system packages" — signing and integrity, adjacent again.
5. Elsewhere: crates.io `relic` is an Arch Linux package manager; PyPI `relic` "Maintains version information for git projects"; Relic Entertainment is a well-known game studio.

## What is still free

`relic-mcp` and `mcp-relic` were both unregistered on npm at the time of checking. The product name and the package name do not have to match, and the MCP tool name is already fixed as `relic_publish` by `docs/spec/publish.md` 1.1, which is unaffected by any of this.

## What follows

- **Distribution names must be chosen deliberately, not assumed.** `npm i relic` is not available and will not become available.
- **The collision is with encrypted secret sharing specifically.** That is the one that could read as imitation rather than coincidence.
- **Renaming is cheap now and expensive after the domains are bought, the disclosure statement is published, and links are in the wild.** The domain purchase is already a stated external dependency blocking deployment, so the naming decision sits immediately upstream of it.
- Note also that `frame.md`'s locked constraint 2 forbids running Relic under `thebushido.co` at all, so any example URL of the form `relics.thebushido.co` is inconsistent with the frame and must not propagate into branding, docs, or briefs.
