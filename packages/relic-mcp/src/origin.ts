/**
 * Reading the service origin out of the environment.
 *
 * Its own module because the entry point runs a server as a side effect of
 * being imported, and a rule this easy to get wrong deserves tests that do not
 * have to start one.
 */

/**
 * Require an origin, or explain what is missing.
 *
 * There is deliberately no default. A placeholder would turn "you did not
 * configure me" into a DNS failure on the first publish, which is a worse
 * message arriving later, and a real origin baked into a published tarball
 * would outlive whatever address the service actually has.
 *
 * Returns the origin only. A path, query, or fragment in the variable is
 * dropped rather than quietly concatenated into every request URL.
 */
export function requiredOrigin(name: string, raw: string | undefined): string {
  if (raw === undefined || raw.trim().length === 0) {
    throw new Error(
      `${name} is not set. It is the Relic service this client publishes to, ` +
        'for example https://relic.example.com. Installing the Relic plugin ' +
        'sets it for you; set it yourself when running this server directly.'
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new Error(`${name} is not a URL: ${raw}`);
  }

  // http is allowed only against a loopback host, where there is no network
  // path to sit on. Plaintext never leaves this machine either way, but the
  // grant authorizing an upload does, and over http anyone between here and
  // the service can take it and spend it.
  const loopback =
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1' ||
    parsed.hostname === '[::1]';

  if (parsed.protocol !== 'https:' && !loopback) {
    throw new Error(
      `${name} must be https, or a loopback host for development. Got ${raw}. ` +
        'Plaintext never leaves this machine, but the grant that authorizes ' +
        'an upload does, and over http anyone on the path can take it.'
    );
  }

  return parsed.origin;
}
