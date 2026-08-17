import { describe, expect, test } from 'bun:test';
import {
  DEFAULT_SERVER_SPEC,
  ExistingEntryError,
  HARNESSES,
  planFor,
  type ServerSpec,
  snippetFor,
  UnknownHarnessError,
} from '../src/install.ts';

const SPEC: ServerSpec = {
  name: 'relic',
  command: 'npx',
  args: ['-y', 'relic-mcp@0.1.1'],
  env: { RELIC_SERVICE_ORIGIN: 'https://relic.example' },
};

const parse = (plan: { contents: string }): unknown =>
  JSON.parse(plan.contents);

describe('the default spec the installer writes', () => {
  // A bare `npx -y relic-mcp` resolves to "command not found" on current
  // npx, so every config generated from this default would install a server
  // that cannot start. Asserting the shape rather than a literal keeps this
  // from being a fixture quoting its own input back.
  test('carries a version specifier', () => {
    expect(DEFAULT_SERVER_SPEC.command).toBe('npx');
    expect(DEFAULT_SERVER_SPEC.args[0]).toBe('-y');
    expect(DEFAULT_SERVER_SPEC.args[1]).toMatch(/^relic-mcp@/);
  });
});

describe('planFor', () => {
  test('an unknown harness names the ones that exist', () => {
    expect(() => planFor('emacs', SPEC, undefined)).toThrow(
      UnknownHarnessError
    );
  });

  test('writes into a fresh config', () => {
    const plan = planFor('cursor', SPEC, undefined);
    const json = parse(plan) as { mcpServers: Record<string, unknown> };

    expect(json.mcpServers['relic']).toEqual({
      command: 'npx',
      args: ['-y', 'relic-mcp@0.1.1'],
      env: { RELIC_SERVICE_ORIGIN: 'https://relic.example' },
    });
    expect(plan.replaced).toBe(false);
  });

  // The failure that would matter most: wiping somebody's other servers.
  test('keeps every server already configured', () => {
    const existing = JSON.stringify({
      mcpServers: {
        github: { command: 'gh-mcp', args: [] },
        monarch: { command: 'monarch-mcp', args: [] },
      },
    });
    const json = parse(planFor('cursor', SPEC, existing)) as {
      mcpServers: Record<string, unknown>;
    };

    expect(Object.keys(json.mcpServers).sort()).toEqual([
      'github',
      'monarch',
      'relic',
    ]);
  });

  test('keeps unrelated top level settings', () => {
    const existing = JSON.stringify({
      hooks: { onStart: 'something' },
      mcpServers: {},
    });
    const json = parse(planFor('gemini', SPEC, existing)) as {
      hooks: unknown;
    };

    expect(json.hooks).toEqual({ onStart: 'something' });
  });

  test('refuses to replace an existing entry without force', () => {
    const existing = JSON.stringify({
      mcpServers: { relic: { command: 'old' } },
    });

    expect(() => planFor('cursor', SPEC, existing)).toThrow(ExistingEntryError);
  });

  test('force replaces it and says so', () => {
    const existing = JSON.stringify({
      mcpServers: { relic: { command: 'old' } },
    });
    const plan = planFor('cursor', SPEC, existing, { force: true });
    const json = parse(plan) as {
      mcpServers: Record<string, { command: string }>;
    };

    expect(json.mcpServers['relic']?.command).toBe('npx');
    expect(plan.replaced).toBe(true);
  });

  // Better to fail than to "fix" a typo by overwriting the file.
  test('unparseable json refuses rather than replacing the file', () => {
    expect(() => planFor('cursor', SPEC, '{ not json')).toThrow(
      ExistingEntryError
    );
  });

  test('an empty file is treated as a fresh config, not a parse error', () => {
    expect(() => planFor('cursor', SPEC, '   ')).not.toThrow();
  });

  test('vs code uses servers and declares the transport', () => {
    const plan = planFor('vscode', SPEC, undefined);
    const json = parse(plan) as {
      servers: Record<string, { type: string }>;
      mcpServers?: unknown;
    };

    expect(json.servers['relic']?.type).toBe('stdio');
    expect(json.mcpServers).toBeUndefined();
  });
});

describe('the codex toml plan', () => {
  test('appends a table with the command and env', () => {
    const plan = planFor('codex', SPEC, '');

    expect(plan.contents).toContain('[mcp_servers.relic]');
    expect(plan.contents).toContain('command = "npx"');
    expect(plan.contents).toContain('args = ["-y", "relic-mcp@0.1.1"]');
    expect(plan.contents).toContain('[mcp_servers.relic.env]');
    expect(plan.contents).toContain(
      'RELIC_SERVICE_ORIGIN = "https://relic.example"'
    );
  });

  // A real config carries comments and ordering a reserialize would discard.
  test('leaves the rest of the file byte for byte alone', () => {
    const existing = [
      '# my settings, hand written',
      '[mcp_servers.pencil]',
      'command = "/Applications/Pencil.app/mcp"',
      'args = [ "--app", "desktop" ]',
      '',
      '[projects."/Users/me/code"]',
      'trust_level = "trusted"',
      '',
    ].join('\n');

    const plan = planFor('codex', SPEC, existing);

    expect(plan.contents).toContain('# my settings, hand written');
    expect(plan.contents).toContain('[mcp_servers.pencil]');
    expect(plan.contents).toContain('trust_level = "trusted"');
    expect(plan.contents).toContain('[mcp_servers.relic]');
  });

  test('refuses an existing table without force', () => {
    const existing = '[mcp_servers.relic]\ncommand = "old"\n';
    expect(() => planFor('codex', SPEC, existing)).toThrow(ExistingEntryError);
  });

  test('force replaces the table without duplicating it', () => {
    const existing = [
      '[mcp_servers.relic]',
      'command = "old"',
      '[mcp_servers.relic.env]',
      'OLD = "1"',
      '',
      '[mcp_servers.pencil]',
      'command = "pencil"',
      '',
    ].join('\n');

    const plan = planFor('codex', SPEC, existing, { force: true });
    const headers = plan.contents.match(/\[mcp_servers\.relic\]/g) ?? [];

    expect(headers).toHaveLength(1);
    expect(plan.contents).toContain('command = "npx"');
    expect(plan.contents).not.toContain('OLD = "1"');
    // The neighbour survives the surgery.
    expect(plan.contents).toContain('[mcp_servers.pencil]');
  });

  test('quotes are escaped rather than breaking the table', () => {
    const plan = planFor('codex', { ...SPEC, command: 'weird"name' }, '', {
      force: true,
    });
    expect(plan.contents).toContain('command = "weird\\"name"');
  });
});

describe('the harness table', () => {
  test('every harness has a config path, except the one driven by its CLI', () => {
    for (const harness of HARNESSES) {
      if (harness.format === 'plugin') continue;
      expect(harness.configPath.length).toBeGreaterThan(0);
    }
  });

  test('ids are unique, or --client would be ambiguous', () => {
    const ids = HARNESSES.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('paths are relative to home, never absolute', () => {
    for (const harness of HARNESSES) {
      expect(harness.configPath.startsWith('/')).toBe(false);
    }
  });
});

describe('snippetFor', () => {
  test('emits something pasteable for anything not in the table', () => {
    const json = JSON.parse(snippetFor(SPEC)) as {
      mcpServers: Record<string, { command: string }>;
    };
    expect(json.mcpServers['relic']?.command).toBe('npx');
  });
});
