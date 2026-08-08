/**
 * MCP protocol plumbing, shared by both transports.
 *
 * Revision `2026-07-28` is the pin, and it is the revision that made the
 * protocol core stateless: there is no `initialize` handshake, no session, and
 * no `Mcp-Session-Id`. Every request declares its own version in `_meta` and
 * the server accepts or rejects each one independently.
 *
 * That suits Relic exactly. The server holds nothing between calls, so it can
 * be restarted, load-balanced, or run one-shot without a client noticing.
 *
 * The legacy `initialize` handshake is still answered, which the spec calls a
 * dual-era server. A publishing client that only speaks the newest revision is
 * unusable in most of the agents this product exists to serve.
 */

/** The revision this server prefers. */
export const PROTOCOL_VERSION = '2026-07-28';

/**
 * Handshake-based revisions this server still answers.
 *
 * Legacy clients have no fall-forward mechanism, so dropping these would make
 * Relic unreachable from them with no diagnostic they could act on.
 */
export const LEGACY_PROTOCOL_VERSIONS = [
  '2025-11-25',
  '2025-06-18',
  '2025-03-26',
] as const;

export const SUPPORTED_PROTOCOL_VERSIONS = [
  PROTOCOL_VERSION,
  ...LEGACY_PROTOCOL_VERSIONS,
] as const;

/** The `_meta` key carrying the per-request protocol version. */
export const PROTOCOL_VERSION_META_KEY =
  'io.modelcontextprotocol/protocolVersion';

/** Protocol-defined error codes used here. */
export const ERROR_CODES = {
  /** Headers disagree with the body, or a required header is missing. */
  headerMismatch: -32020,
  /** The requested revision is one this server does not implement. */
  unsupportedProtocolVersion: -32022,
  methodNotFound: -32601,
  invalidParams: -32602,
  parseError: -32700,
} as const;

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export function errorResponse(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: data === undefined ? { code, message } : { code, message, data },
  };
}

/**
 * The version a request declares, or undefined when it declares none.
 *
 * A missing version is not an error here: a legacy client sending
 * `initialize` has no `_meta` to put one in, and that request is answered
 * under legacy semantics.
 */
export function requestedProtocolVersion(
  message: JsonRpcRequest
): string | undefined {
  const meta = message.params?.['_meta'];
  if (typeof meta !== 'object' || meta === null) return undefined;
  const version = (meta as Record<string, unknown>)[PROTOCOL_VERSION_META_KEY];
  return typeof version === 'string' ? version : undefined;
}

export function isSupportedVersion(version: string): boolean {
  return (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(version);
}

/**
 * `UnsupportedProtocolVersionError`, carrying what the server does support so
 * the client can retry rather than guess.
 */
export function unsupportedVersionError(
  id: string | number | null,
  requested: string
): JsonRpcResponse {
  return errorResponse(
    id,
    ERROR_CODES.unsupportedProtocolVersion,
    'Unsupported protocol version',
    { supported: [...SUPPORTED_PROTOCOL_VERSIONS], requested }
  );
}

/**
 * Decode the Base64 sentinel form the transport uses for header values that
 * cannot be represented as plain ASCII.
 *
 * `=?base64?{value}?=`, markers lowercase and case-sensitive. Servers MUST
 * decode before comparing a header to the body, or a tool with a non-ASCII
 * name would fail validation against its own request.
 */
export function decodeHeaderValue(raw: string): string {
  if (!raw.startsWith('=?base64?') || !raw.endsWith('?=')) return raw;
  const encoded = raw.slice('=?base64?'.length, -'?='.length);
  try {
    return new TextDecoder().decode(
      Uint8Array.from(atob(encoded), (ch) => ch.charCodeAt(0))
    );
  } catch {
    // An undecodable sentinel is returned as-is so the comparison fails and
    // the request is rejected, rather than throwing here.
    return raw;
  }
}

/** The value `Mcp-Name` must carry for a given message, if any. */
export function expectedMcpName(message: JsonRpcRequest): string | undefined {
  if (message.method === 'tools/call' || message.method === 'prompts/get') {
    const name = message.params?.['name'];
    return typeof name === 'string' ? name : undefined;
  }
  if (message.method === 'resources/read') {
    const uri = message.params?.['uri'];
    return typeof uri === 'string' ? uri : undefined;
  }
  return undefined;
}
