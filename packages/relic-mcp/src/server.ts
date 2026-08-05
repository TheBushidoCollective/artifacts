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
    },
    required: ['path'],
    additionalProperties: false,
  },
  outputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      relic_id: { type: 'string' },
      relic_expires_at: { type: 'string' },
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
      return { jsonrpc: '2.0', id, result: { tools: [TOOL_DEFINITION] } };

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

  try {
    const result = await publish({ path, filename }, deps);
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
              `Expires ${result.relic_expires_at}. Anyone with this link, ` +
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
