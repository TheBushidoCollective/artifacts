# Source versioning entry path

Run from the repository root:

```bash
bun packages/relic-mcp/test/source-versioning-path.ts
```

The command creates two worktrees of one temporary Git repository, publishes
from the first through `relic_publish`, then starts fresh MCP processes for
`relic_lookup_source` and the refused second `relic_publish` from the other
worktree. Success ends with:

```text
PUBLISHED relic_id=<id>
FRESH_LOOKUP relic_id=<same-id>
REFUSED code=source_already_published relic_id=<same-id>
SOURCE_VERSIONING_PATH_OK
```
