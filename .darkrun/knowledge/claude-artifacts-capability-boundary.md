---
topic: claude-artifacts-capability-boundary
created_at: 2026-07-30T00:19:26.661328+00:00
updated_at: 2026-07-30T00:19:26.661328+00:00
---
Claude's first-party Artifacts publishing is the incumbent Relic is measured against. Knowing exactly where it stops defines the only defensible territory. Sources: https://code.claude.com/docs/en/artifacts and https://support.claude.com/en/articles/9547008-publish-and-share-artifacts.

**What Artifacts does well (do not try to beat these):** publishes an HTML or Markdown file to `claude.ai/code/artifact/{uuid}`, opens the browser, republishes to the same URL on update, versions every publish, needs no viewer sign-in for public links on Pro and Max, is free with the plan, applies a built-in design skill, and reads the project's design tokens.

**Where Artifacts stops — this is the entire opportunity:**
- Source file types are restricted to `.html`, `.htm`, and `.md`. No images, no video, no PDFs, no archives, no arbitrary binaries.
- 16 MiB rendered cap.
- Strict CSP blocks all external requests.
- Single page only; relative links do not resolve.
- Requires a claude.ai-authenticated session on Pro, Max, Team, or Enterprise.
- Unavailable on Bedrock, Vertex, and Foundry, and with ZDR / HIPAA / CMEK enabled or external sharing off.
- **Off by default in Agent SDK, GitHub Action, and MCP-server contexts**, and sessions using an API key, gateway token, or cloud-provider credential cannot publish at all.
- The artifact header names the publisher as author and links to their gallery, which matters for consultant-to-client deliverables.

**The strategic consequences:**
1. Headless and CI agent runs have no first-party publish path whatsoever. That is the cleanest unserved segment.
2. Non-Claude agents (Cursor, Codex, Copilot, Cline, Windsurf, Aider, Amp) have no publish button at all.
3. Arbitrary payload types are wide open, since Artifacts handles only HTML and Markdown.
4. Do NOT build for orgs that disabled Artifacts for compliance. An org that blocked Artifacts on policy grounds will not approve an unvetted third-party domain either.
5. **Standing risk:** Anthropic can erase this opportunity by enabling Artifacts in Agent SDK and GitHub Action contexts and widening accepted file types. Both are plausible roadmap items, so anything built here should assume the window is not permanent.

Note the audience trap for the bushido collective specifically: `han` is a Claude Code plugin platform, so its users are exactly the people who get Artifacts free and integrated. Work in this space serves the *adjacent* audience han does not have, and does not extend han's existing one.
