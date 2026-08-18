/**
 * Durable publish state: what a later republish needs.
 *
 * A republish has to encrypt under the SAME key as version 1, or the share
 * URL stops decrypting anything, and it has to present the publish token the
 * first grant handed out, or the service refuses it. Neither exists anywhere
 * but this machine: the service holds a hash of the token and nothing of the
 * key. So losing this file means those relics can never be updated from
 * here, which makes it state a human cannot repair by hand elsewhere. It is
 * written before a publish reports success and read at the point of use,
 * never cached in a process global.
 *
 * The file holds secrets. It is created 0600 inside a 0700 directory under
 * the user's config directory, and nothing in this module ever puts the key
 * or the token into a message, a log line, or an error.
 */

import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

/** What this machine remembers about one published relic. */
export interface PublishState {
  /** The version-1 content key, base64url, exactly as it rides the URL fragment. */
  readonly key: string;
  /**
   * The bearer secret authorizing a republish. The service stores only its
   * SHA-256, so this copy is the only usable one in existence.
   */
  readonly publish_token: string;
  /** How many versions this machine has published; 1 after the first. */
  readonly version: number;
}

interface StateFile {
  readonly relics: Record<string, PublishState>;
}

/**
 * Where the state lives.
 *
 * Behind one helper, redirected with `RELIC_PUBLISH_STATE`, so tests point it
 * at a scratch path and a user with an unusual setup can move it. The default
 * is the user's config directory rather than the repo or the cwd, because the
 * publisher's identity here is the machine and user who ran the publish, not
 * whatever directory the server happened to start in.
 */
export function publishStatePath(): string {
  const override = process.env['RELIC_PUBLISH_STATE'];
  if (override !== undefined && override.length > 0) return override;

  const configRoot =
    process.env['XDG_CONFIG_HOME'] !== undefined &&
    process.env['XDG_CONFIG_HOME'].length > 0
      ? process.env['XDG_CONFIG_HOME']
      : join(homedir(), '.config');
  return join(configRoot, 'relic-mcp', 'publish-state.json');
}

/**
 * Writers queue behind one chain, so two publishes finishing close together
 * cannot read-modify-write past each other and silently drop one relic's
 * entry. Losing an entry to a race would orphan that relic with no error
 * anywhere, which is the quietest possible way to lose republish rights.
 */
let writeChain: Promise<void> = Promise.resolve();

/** Load one relic's state, or undefined when this machine never published it. */
export async function loadPublishState(
  relicId: string
): Promise<PublishState | undefined> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(publishStatePath(), 'utf8'));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return undefined;
    if (error instanceof SyntaxError) {
      // The message names the file and stops. Echoing any of the bytes would
      // put secrets into an error path, and a truncated tail of JSON is where
      // a key or token is most likely to sit in one piece.
      throw new Error(
        `publish state at ${publishStatePath()} is not valid JSON. It cannot ` +
          'be read, so relics recorded in it cannot be republished from this ' +
          'machine until it is fixed or removed.'
      );
    }
    throw new Error(
      `could not read publish state at ${publishStatePath()}: ${code}`
    );
  }

  const entry = (parsed as StateFile | null)?.relics?.[relicId];
  if (entry === undefined) return undefined;
  if (
    typeof entry !== 'object' ||
    typeof entry.key !== 'string' ||
    typeof entry.publish_token !== 'string' ||
    typeof entry.version !== 'number' ||
    !Number.isSafeInteger(entry.version) ||
    entry.version < 1
  ) {
    throw new Error(
      `publish state at ${publishStatePath()} holds a malformed entry for ` +
        'this relic id.'
    );
  }
  return entry;
}

/**
 * Record or update one relic's state, preserving every other entry.
 *
 * Called only after the service has accepted the object, so the file never
 * promises a republish the service does not know about.
 */
export async function savePublishState(
  relicId: string,
  state: PublishState
): Promise<void> {
  const run = writeChain.then(() => writeEntry(relicId, state));
  // A failed write must not poison the chain for later ones; it is observed
  // here and rethrown for the caller, who has not yet reported success.
  writeChain = run.catch(() => undefined);
  await run;
}

async function writeEntry(relicId: string, state: PublishState): Promise<void> {
  const path = publishStatePath();
  const dir = dirname(path);

  // 0700 applies to the directories this creates, not to a config root that
  // already exists: chmod-ing ~/.config itself would break other tools.
  await mkdir(dir, { mode: 0o700, recursive: true });

  const existing = await readWholeFile(path);
  const relics = { ...existing?.relics, [relicId]: state };

  // Written to a sibling then renamed over, so a crash mid-write leaves the
  // previous intact file rather than half of the new one. A torn file would
  // take every relic's republish rights with it, not just the one in flight.
  const temp = `${path}.tmp`;
  await writeFile(temp, `${JSON.stringify({ relics }, null, 2)}\n`, {
    mode: 0o600,
  });
  await rename(temp, path);
}

async function readWholeFile(path: string): Promise<StateFile | undefined> {
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return undefined;
    throw new Error(`could not read publish state at ${path}: ${code}`);
  }

  try {
    const parsed = JSON.parse(raw) as StateFile | null;
    if (parsed === null || typeof parsed !== 'object') {
      throw new Error('not an object');
    }
    return parsed;
  } catch {
    throw new Error(
      `publish state at ${path} is not valid JSON. It cannot be updated, so ` +
        'this publish cannot be recorded and this relic cannot later be ' +
        'republished from this machine until the file is fixed or removed.'
    );
  }
}

/** Exposed for tests asserting the on-disk permissions, nothing else. */
export async function publishStateModes(): Promise<{
  file: number;
  directory: number;
}> {
  const path = publishStatePath();
  const [file, directory] = await Promise.all([
    stat(path),
    stat(dirname(path)),
  ]);
  return { file: file.mode & 0o777, directory: directory.mode & 0o777 };
}
