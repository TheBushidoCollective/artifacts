/**
 * Streamable HTTP transport, revision `2026-07-28`.
 *
 * Stateless by construction: a single POST endpoint, one HTTP request per
 * JSON-RPC message, no session, and no `Mcp-Session-Id`. Nothing is retained
 * between calls, so a load balancer can round-robin across processes with no
 * sticky routing and no shared session store.
 *
 * **This does not make Relic hostable.** The transport says how bytes reach
 * the server, not where the server runs. The publishing client must sit next
 * to the plaintext, because encrypting it anywhere else is the thing the
 * product exists to avoid. HTTP is here so one server can be shared between
 * local agents, run under a supervisor, or be probed by tooling that speaks
 * only HTTP. The default bind is loopback, and that is deliberate.
 */

import {
  decodeHeaderValue,
  ERROR_CODES,
  errorResponse,
  expectedMcpName,
  isSupportedVersion,
  type JsonRpcRequest,
  requestedProtocolVersion,
  unsupportedVersionError,
} from './protocol.ts';
import type { PublishDeps } from './publish.ts';
import { handleMessage } from './server.ts';

export interface HttpOptions {
  /**
   * Origins allowed to call the endpoint.
   *
   * The transport requires `Origin` validation to defeat DNS rebinding: a page
   * on any website can otherwise reach a server bound to loopback. An empty
   * list refuses every request that carries an `Origin` at all, which is the
   * right default for a local server driven by a non-browser client.
   */
  readonly allowedOrigins?: readonly string[];
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Build the fetch handler for the MCP endpoint.
 *
 * Every check below is a MUST in the transport spec, and each is a place a
 * lenient implementation becomes a security problem rather than a
 * compatibility one.
 */
export function createHttpHandler(
  deps: PublishDeps,
  options: HttpOptions = {}
): (request: Request) => Promise<Response> {
  const allowed = new Set(options.allowedOrigins ?? []);

  return async (request: Request): Promise<Response> => {
    // DNS rebinding defence. A browser page cannot suppress `Origin`, so a
    // present-and-unlisted origin is refused outright.
    const origin = request.headers.get('origin');
    if (origin !== null && !allowed.has(origin)) {
      return jsonResponse(
        errorResponse(null, ERROR_CODES.headerMismatch, 'origin not allowed'),
        403
      );
    }

    // Sessions and standalone SSE streams are gone in this revision. An older
    // client gets a clear refusal rather than a confusing 404.
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { allow: 'POST' },
      });
    }

    let message: JsonRpcRequest;
    try {
      message = (await request.json()) as JsonRpcRequest;
    } catch {
      return jsonResponse(
        errorResponse(null, ERROR_CODES.parseError, 'parse error'),
        400
      );
    }

    const id = message.id ?? null;

    // The version header and the `_meta` field must agree. They exist so an
    // intermediary can route without parsing the body, and a mismatch is
    // exactly the split-brain where a gateway and a server act on different
    // values.
    const headerVersion = request.headers.get('mcp-protocol-version');
    const bodyVersion = requestedProtocolVersion(message);

    if (headerVersion === null) {
      return jsonResponse(
        errorResponse(
          id,
          ERROR_CODES.headerMismatch,
          'MCP-Protocol-Version header is required'
        ),
        400
      );
    }
    if (bodyVersion !== undefined && headerVersion !== bodyVersion) {
      return jsonResponse(
        errorResponse(
          id,
          ERROR_CODES.headerMismatch,
          `Header mismatch: MCP-Protocol-Version header value ` +
            `'${headerVersion}' does not match body value '${bodyVersion}'`
        ),
        400
      );
    }
    if (!isSupportedVersion(headerVersion)) {
      return jsonResponse(unsupportedVersionError(id, headerVersion), 400);
    }

    // `Mcp-Method` mirrors `method`, and `Mcp-Name` mirrors `params.name` or
    // `params.uri`, so gateways can route and meter on headers alone.
    const headerMethod = request.headers.get('mcp-method');
    if (headerMethod === null) {
      return jsonResponse(
        errorResponse(
          id,
          ERROR_CODES.headerMismatch,
          'Mcp-Method header is required'
        ),
        400
      );
    }
    if (headerMethod !== message.method) {
      return jsonResponse(
        errorResponse(
          id,
          ERROR_CODES.headerMismatch,
          `Header mismatch: Mcp-Method header value '${headerMethod}' does ` +
            `not match body value '${message.method}'`
        ),
        400
      );
    }

    const wantsName = expectedMcpName(message);
    if (wantsName !== undefined) {
      const rawName = request.headers.get('mcp-name');
      if (rawName === null) {
        return jsonResponse(
          errorResponse(
            id,
            ERROR_CODES.headerMismatch,
            'Mcp-Name header is required for this method'
          ),
          400
        );
      }
      // Decoded before comparison, or a non-ASCII name fails against its own
      // request body.
      if (decodeHeaderValue(rawName) !== wantsName) {
        return jsonResponse(
          errorResponse(
            id,
            ERROR_CODES.headerMismatch,
            'Header mismatch: Mcp-Name header value does not match body value'
          ),
          400
        );
      }
    }

    const response = await handleMessage(message, deps);

    // A notification is accepted with no body.
    if (response === undefined) return new Response(null, { status: 202 });

    // An unknown method is a 404 carrying a JSON-RPC error, which is what
    // distinguishes a modern server from a legacy one that simply does not
    // host this path.
    if (response.error?.code === ERROR_CODES.methodNotFound) {
      return jsonResponse(response, 404);
    }

    return jsonResponse(response);
  };
}
