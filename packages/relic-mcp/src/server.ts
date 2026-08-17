/**
 * The MCP server: a local binary, never a remote surface.
 *
 * It holds the key and encrypts in process. It returns no script. That is
 * locked in `docs/frame.md` and it is the single most load-bearing structural
 * decision in the publish path.
 *
 * **Why this cannot be a hosted MCP server**, stated once because it is the
 * question everybody asks: a remote server would have to receive the file to
 * encrypt it, which destroys the product. Zero-knowledge is not a feature
 * layered on top; it is a consequence of the encryption happening on the
 * machine that already has the plaintext. The transport can be stdio or HTTP,
 * but the process runs next to the file either way.
 *
 * Protocol revision `2026-07-28`, which is stateless: no handshake, no
 * session, no `Mcp-Session-Id`. Nothing is retained between calls, so the
 * server can be restarted or run one-shot without a client noticing. The
 * legacy `initialize` handshake is answered too, which the spec calls a
 * dual-era server, because a client that only speaks the newest revision is
 * unusable in most of the agents this product exists to serve.
 */

import {
  ERROR_CODES,
  errorResponse,
  isSupportedVersion,
  type JsonRpcRequest,
  type JsonRpcResponse,
  LEGACY_PROTOCOL_VERSIONS,
  PROTOCOL_VERSION,
  requestedProtocolVersion,
  SUPPORTED_PROTOCOL_VERSIONS,
  unsupportedVersionError,
} from './protocol.ts';
import {
  type PublishDeps,
  PublishError,
  publish,
  ServerRefusal,
} from './publish.ts';

export {
  LEGACY_PROTOCOL_VERSIONS,
  PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS,
};
export type { JsonRpcRequest, JsonRpcResponse };

/**
 * `relic_publish`, prefixed with the product name.
 *
 * The MCP spec names the hazard and its own remedy: clients aggregating tools
 * from multiple servers may hit collisions and should prefix tool names with a
 * server identifier. A bare `publish` collides with incumbent publishing
 * servers, and the consequence is a security outcome produced by a naming
 * decision: the model asks for `publish`, the client disambiguates to whichever
 * server it prefers, and the file lands somewhere with different encryption or
 * none.
 */
export const TOOL_NAME = 'relic_publish';

/**
 * The inspection tool.
 *
 * A local client is opaque to the agent driving it, and "trust the binary" is
 * a real hand-wave. This closes that gap without reopening the one the frame
 * locked: the agent can read exactly what the encryption path does, on
 * demand, without any of it being code that arrives ready to execute.
 *
 * Inspection decoupled from execution beats inspect-then-run, because the
 * reviewer is not under time pressure and the reviewed text cannot also be
 * the attack.
 */
export const DESCRIBE_TOOL_NAME = 'relic_describe_client';

/**
 * The ceiling on a publisher-supplied lifetime, matching the grant
 * contract's `maxTtlDays`. Refusing here keeps a typo like 36500 from
 * encrypting the file and round-tripping a grant only to be turned down
 * after the work is done.
 */
const MAX_TTL_DAYS = 3650;

export const TOOL_DEFINITION = {
  name: TOOL_NAME,
  title: 'Publish a relic',
  description:
    'Encrypt a file on this machine and publish it as a relic, returning a ' +
    'shareable URL. The encryption key is generated locally and never sent ' +
    'to the service. Takes a filesystem path, never inline content.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Filesystem path to the file to publish.',
      },
      filename: {
        type: 'string',
        description:
          'Optional. Overrides the name written into the encrypted envelope ' +
          'header. Defaults to the basename of `path`.',
      },
      ttl_days: {
        type: 'integer',
        minimum: 1,
        maximum: MAX_TTL_DAYS,
        description:
          'Optional. Gives the relic a lifetime in days. Omit it and the ' +
          'relic is kept until it is deleted. Shorter is better for ' +
          'sensitive content.',
      },
    },
    required: ['path'],
    additionalProperties: false,
  },
  outputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      relic_id: { type: 'string' },
      relic_expires_at: { type: ['string', 'null'] },
      renderer_class: { type: 'string' },
      filename: { type: 'string' },
      resolved_path: { type: 'string' },
      report_url: { type: 'string' },
      disclosure_url: { type: 'string' },
    },
    required: [
      'url',
      'relic_id',
      'relic_expires_at',
      'renderer_class',
      'filename',
      'resolved_path',
      'report_url',
      'disclosure_url',
    ],
    additionalProperties: false,
  },
} as const;

export const DESCRIBE_TOOL_DEFINITION = {
  name: DESCRIBE_TOOL_NAME,
  title: 'Describe the Relic client',
  description:
    'Return exactly what this client does with your file: the encryption ' +
    'path, what leaves the machine, and what the service can see. Reads ' +
    'nothing and sends nothing.',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
} as const;

export const SERVER_INFO = {
  name: 'relic',
  title: 'Relic',
  version: '0.1.0',
} as const;

export const CAPABILITIES = { tools: {} } as const;

/**
 * Handle one JSON-RPC message.
 *
 * Returns undefined for notifications, which carry no id and take no
 * response. Nothing here reads or writes state that outlives the call.
 */
export async function handleMessage(
  message: JsonRpcRequest,
  deps: PublishDeps
): Promise<JsonRpcResponse | undefined> {
  if (message.id === undefined) return undefined; // notification
  const id = message.id ?? null;

  // `server/discover` and `initialize` are the two probes a client uses to
  // find out what this server speaks, so neither may be refused for declaring
  // a version the server does not have.
  const isProbe =
    message.method === 'server/discover' || message.method === 'initialize';

  const requested = requestedProtocolVersion(message);
  if (!isProbe && requested !== undefined && !isSupportedVersion(requested)) {
    return unsupportedVersionError(id, requested);
  }

  switch (message.method) {
    case 'server/discover':
      // Mandatory in this revision: supported versions, capabilities, and
      // identity in a single request, with no handshake to precede it.
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
          capabilities: CAPABILITIES,
          serverInfo: SERVER_INFO,
        },
      };

    case 'initialize': {
      // The legacy era. A modern client never sends this.
      const asked =
        (message.params?.['protocolVersion'] as string | undefined) ??
        PROTOCOL_VERSION;
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: isSupportedVersion(asked) ? asked : PROTOCOL_VERSION,
          capabilities: CAPABILITIES,
          serverInfo: SERVER_INFO,
        },
      };
    }

    case 'ping':
      return { jsonrpc: '2.0', id, result: {} };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: [TOOL_DEFINITION, DESCRIBE_TOOL_DEFINITION] },
      };

    case 'tools/call':
      return callTool(id, message.params ?? {}, deps);

    default:
      return errorResponse(
        id,
        ERROR_CODES.methodNotFound,
        `unknown method: ${message.method}`
      );
  }
}

async function callTool(
  id: string | number | null,
  params: Record<string, unknown>,
  deps: PublishDeps
): Promise<JsonRpcResponse> {
  if (params['name'] === DESCRIBE_TOOL_NAME) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [{ type: 'text', text: describeClient(deps) }],
        structuredContent: {
          encryption: 'AES-128-GCM, RFC 8188 aes128gcm framing',
          key_origin: 'crypto.getRandomValues on this machine',
          key_transmitted_to_service: false,
          plaintext_transmitted_to_service: false,
          ciphertext_destination: 'object storage, via a signed URL',
          service_origin: deps.serviceOrigin,
        },
        isError: false,
      },
    };
  }

  if (params['name'] !== TOOL_NAME) {
    return errorResponse(
      id,
      ERROR_CODES.invalidParams,
      `unknown tool: ${String(params['name'])}`
    );
  }

  const args = (params['arguments'] ?? {}) as Record<string, unknown>;
  const path = args['path'];
  if (typeof path !== 'string' || path.length === 0) {
    return errorResponse(
      id,
      ERROR_CODES.invalidParams,
      '`path` is required and must be a string'
    );
  }

  const filename =
    typeof args['filename'] === 'string' ? args['filename'] : undefined;

  // A lifetime is opt-in: absent or null means the relic is kept until it is
  // deleted. A value that fails the contract is refused rather than dropped,
  // because silently dropping it publishes the opposite of what was asked:
  // a relic meant to die in days lives forever.
  const rawTtlDays = args['ttl_days'];
  let ttlDays: number | undefined;
  if (rawTtlDays !== undefined && rawTtlDays !== null) {
    if (
      typeof rawTtlDays !== 'number' ||
      !Number.isSafeInteger(rawTtlDays) ||
      rawTtlDays < 1 ||
      rawTtlDays > MAX_TTL_DAYS
    ) {
      return errorResponse(
        id,
        ERROR_CODES.invalidParams,
        `\`ttl_days\` must be an integer between 1 and ${MAX_TTL_DAYS}, or ` +
          'omitted to keep the relic until it is deleted'
      );
    }
    ttlDays = rawTtlDays;
  }

  try {
    const result = await publish({ path, filename, ttl_days: ttlDays }, deps);
    return {
      jsonrpc: '2.0',
      id,
      result: {
        // The full URL including the fragment, because relaying a usable link
        // is the product. The consequence is disclosed rather than hidden:
        // the key enters the model's context and the session transcript on
        // every publish, and the disclosure statement says so.
        content: [
          {
            type: 'text',
            text:
              `Published ${result.filename} as a relic.\n\n${result.url}\n\n` +
              // No lifetime is the default, so the agent relaying this needs
              // a sentence that says so, not a date-shaped hole.
              (result.relic_expires_at === null
                ? 'It does not expire; it is kept until it is deleted. '
                : `Expires ${result.relic_expires_at}. `) +
              'Anyone with this link, ' +
              'including its fragment, can read the file. The key is in the ' +
              'fragment and it is now in this transcript.\n' +
              `What Relic knows: ${result.disclosure_url}`,
          },
        ],
        structuredContent: result,
        isError: false,
      },
    };
  } catch (error) {
    return { jsonrpc: '2.0', id, result: toolError(error) };
  }
}

/**
 * A failed publish is a tool error, not a protocol error.
 *
 * The distinction is the spec's: a protocol error means the call could not be
 * made, and a tool error means it was made and failed. Reporting a refused
 * publish as a protocol error would hide it from the model, which then cannot
 * tell the user what went wrong or act on it.
 */
function toolError(error: unknown): Record<string, unknown> {
  if (error instanceof PublishError) {
    return {
      content: [{ type: 'text', text: `${error.code}: ${error.message}` }],
      structuredContent: { code: error.code, ...error.details },
      isError: true,
    };
  }
  if (error instanceof ServerRefusal) {
    return {
      content: [{ type: 'text', text: `${error.code}: ${error.message}` }],
      structuredContent: { code: error.code, ...error.problem },
      isError: true,
    };
  }
  return {
    content: [{ type: 'text', text: `publish failed: ${String(error)}` }],
    structuredContent: { code: 'unknown' },
    isError: true,
  };
}

/**
 * What this client does with a file, in the order it does it.
 *
 * Written out rather than pointing at a URL, because a description the agent
 * has to go fetch is a description nobody reads.
 */
export function describeClient(deps: PublishDeps): string {
  return `Relic publishing client, running locally on this machine.

What happens when you publish a file:

1. The file is read from disk by this process. It is never sent anywhere in
   plaintext.
2. A 128-bit key and a 26-character relic id are drawn independently from this
   machine's CSPRNG (crypto.getRandomValues). Neither derives from the other.
3. The file is encrypted here, in this process, with AES-128-GCM under RFC 8188
   aes128gcm framing: an HKDF-derived content key, counter-derived per-record
   nonces, and a per-record authentication tag.
4. Only ciphertext is uploaded, straight to object storage under a signed URL.
   It does not pass through ${deps.serviceOrigin}.
5. The service is told three things and nothing more: a coarse renderer class
   from a seven-value list, the name of this client, and the exact byte length
   of the ciphertext. Not your filename, not the mimetype, not the contents.
6. You get back a URL whose fragment carries the key. Fragments are never sent
   to a server by a browser.

What the service operator can see: that a relic exists, roughly how big it is,
what coarse class it was declared as, the publishing IP, and when it was
fetched. Never the contents, and never the key.

What this does NOT protect against: the key is returned to your agent in the
URL, so it enters the model's context and your session transcript. That is
structural, not a defect. Anyone who can read this conversation can open the
relic.

The code doing all of this is on disk in this package and can be read. Nothing
is fetched from the network and executed.`;
}

/** Read newline-delimited JSON-RPC from a stream and write responses back. */
export async function serveStdio(
  deps: PublishDeps,
  input: ReadableStream<Uint8Array>,
  write: (line: string) => void
): Promise<void> {
  const decoder = new TextDecoder();
  const reader = input.getReader();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline = buffer.indexOf('\n');
    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      newline = buffer.indexOf('\n');
      if (line.length === 0) continue;

      let message: JsonRpcRequest;
      try {
        message = JSON.parse(line) as JsonRpcRequest;
      } catch {
        write(
          JSON.stringify(
            errorResponse(null, ERROR_CODES.parseError, 'parse error')
          )
        );
        continue;
      }

      const response = await handleMessage(message, deps);
      if (response !== undefined) write(JSON.stringify(response));
    }
  }
}
