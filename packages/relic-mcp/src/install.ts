/**
 * Installing this server into whichever agent harness somebody actually uses.
 *
 * The server itself needs nothing per harness. MCP over stdio is already the
 * portable layer, and every target below launches the same command with the
 * same environment. What differs is only where the config lives and what the
 * wrapper key is called, which is a packaging problem wearing an integration
 * problem's clothes.
 *
 * So this file holds no protocol code. It computes an edit and hands it back.
 * The pure `planFor` is what the tests exercise; touching the filesystem is a
 * separate, small step, because a bug here corrupts somebody's editor config
 * rather than failing a request.
 */

export type Format = 'json-mcp-servers' | 'json-servers' | 'toml' | 'plugin';

export interface Harness {
  readonly id: string;
  readonly label: string;
  readonly format: Format;
  /** Relative to the user's home directory. */
  readonly configPath: string;
}

/**
 * The targets, with the config location each one actually reads.
 *
 * Deliberately a short list of things that were checked rather than a long
 * list of things that sound right. A wrong path here does not error: it
 * writes a file nobody reads, and the user concludes the tool is broken.
 */
export const HARNESSES: readonly Harness[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    format: 'plugin',
    configPath: '',
  },
  {
    id: 'claude-desktop',
    label: 'Claude Desktop',
    format: 'json-mcp-servers',
    configPath: 'Library/Application Support/Claude/claude_desktop_config.json',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    format: 'json-mcp-servers',
    configPath: '.cursor/mcp.json',
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    format: 'json-mcp-servers',
    configPath: '.codeium/windsurf/mcp_config.json',
  },
  {
    id: 'gemini',
    label: 'Gemini CLI',
    format: 'json-mcp-servers',
    configPath: '.gemini/settings.json',
  },
  {
    id: 'vscode',
    label: 'VS Code',
    format: 'json-servers',
    configPath: 'Library/Application Support/Code/User/mcp.json',
  },
  {
    id: 'codex',
    label: 'Codex',
    format: 'toml',
    configPath: '.codex/config.toml',
  },
];

export interface ServerSpec {
  readonly name: string;
  readonly command: string;
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string>>;
}

export interface Plan {
  readonly harness: Harness;
  /** The file to write, absent for harnesses driven by their own CLI. */
  readonly path: string | undefined;
  readonly contents: string;
  /** True when an entry of this name was already there and got replaced. */
  readonly replaced: boolean;
}

export class UnknownHarnessError extends Error {}
export class ExistingEntryError extends Error {}

/**
 * Merge the server into whatever the harness already has.
 *
 * Merging rather than writing, always. These files hold every other server the
 * user has configured, and clobbering them to add one entry would be a far
 * worse bug than failing to install.
 */
export function planFor(
  harnessId: string,
  spec: ServerSpec,
  existing: string | undefined,
  options: { readonly force?: boolean } = {}
): Plan {
  const harness = HARNESSES.find((h) => h.id === harnessId);
  if (harness === undefined) {
    throw new UnknownHarnessError(
      `Unknown harness ${harnessId}. Known: ${HARNESSES.map((h) => h.id).join(', ')}`
    );
  }

  if (harness.format === 'toml') {
    return tomlPlan(harness, spec, existing, options);
  }
  return jsonPlan(harness, spec, existing, options);
}

function jsonPlan(
  harness: Harness,
  spec: ServerSpec,
  existing: string | undefined,
  options: { readonly force?: boolean }
): Plan {
  const key = harness.format === 'json-servers' ? 'servers' : 'mcpServers';

  let root: Record<string, unknown> = {};
  if (existing !== undefined && existing.trim().length > 0) {
    try {
      root = JSON.parse(existing) as Record<string, unknown>;
    } catch (error) {
      // Refuse rather than replace. An unparseable config is somebody's
      // settings with a typo in it, not an empty slot.
      throw new ExistingEntryError(
        `${harness.configPath} is not valid JSON, so merging would destroy it: ` +
          `${(error as Error).message}`
      );
    }
  }

  const servers = (root[key] ?? {}) as Record<string, unknown>;
  const replaced = Object.hasOwn(servers, spec.name);
  if (replaced && options.force !== true) {
    throw new ExistingEntryError(
      `${harness.label} already has a server named "${spec.name}". ` +
        'Pass --force to replace it.'
    );
  }

  // VS Code names the launch mode explicitly; the others infer stdio.
  const entry =
    harness.format === 'json-servers'
      ? { type: 'stdio', command: spec.command, args: spec.args, env: spec.env }
      : { command: spec.command, args: spec.args, env: spec.env };

  const merged = { ...root, [key]: { ...servers, [spec.name]: entry } };
  return {
    harness,
    path: harness.configPath,
    contents: `${JSON.stringify(merged, null, 2)}\n`,
    replaced,
  };
}

/**
 * Codex keeps servers in TOML.
 *
 * Appending a table rather than reformatting the file, because a real config
 * carries comments and ordering that a parse-and-reserialize round trip would
 * quietly throw away. The only edit made is adding or replacing one table.
 */
function tomlPlan(
  harness: Harness,
  spec: ServerSpec,
  existing: string | undefined,
  options: { readonly force?: boolean }
): Plan {
  const body = existing ?? '';
  const header = `[mcp_servers.${spec.name}]`;
  const replaced = body.includes(header);

  if (replaced && options.force !== true) {
    throw new ExistingEntryError(
      `${harness.label} already has [mcp_servers.${spec.name}]. ` +
        'Pass --force to replace it.'
    );
  }

  const table = [
    header,
    `command = ${tomlString(spec.command)}`,
    `args = [${spec.args.map(tomlString).join(', ')}]`,
    ...(Object.keys(spec.env).length > 0
      ? [
          `[mcp_servers.${spec.name}.env]`,
          ...Object.entries(spec.env).map(
            ([k, v]) => `${k} = ${tomlString(v)}`
          ),
        ]
      : []),
  ].join('\n');

  const withoutOld = replaced ? dropTomlTable(body, spec.name) : body;
  const separator =
    withoutOld.length === 0 || withoutOld.endsWith('\n\n')
      ? ''
      : withoutOld.endsWith('\n')
        ? '\n'
        : '\n\n';

  return {
    harness,
    path: harness.configPath,
    contents: `${withoutOld}${separator}${table}\n`,
    replaced,
  };
}

/** Remove `[mcp_servers.<name>]` and its sub-tables, leaving the rest intact. */
function dropTomlTable(body: string, name: string): string {
  const lines = body.split('\n');
  const kept: string[] = [];
  let skipping = false;

  for (const line of lines) {
    const isHeader = /^\s*\[/.test(line);
    if (isHeader) {
      skipping =
        line.trim() === `[mcp_servers.${name}]` ||
        line.trim().startsWith(`[mcp_servers.${name}.`);
    }
    if (!skipping) kept.push(line);
  }

  return `${kept
    .join('\n')
    .replace(/\n{3,}$/, '\n\n')
    .trimEnd()}\n`;
}

function tomlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** The snippet to paste, for any harness not listed above. */
export function snippetFor(spec: ServerSpec): string {
  return `${JSON.stringify(
    {
      mcpServers: {
        [spec.name]: { command: spec.command, args: spec.args, env: spec.env },
      },
    },
    null,
    2
  )}\n`;
}
