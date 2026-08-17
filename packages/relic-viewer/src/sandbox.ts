/**
 * The usercontent origin's page.
 *
 * This runs on a **different registrable domain** from the service. That
 * separation is the control, not a detail: the service origin holds the
 * fragment, and untrusted HTML must never execute anywhere that can reach it.
 * Google's own pattern is separate isolated origins, and they treat XSS inside
 * a sandbox domain as an invalid bug report, which shows how completely the
 * origin boundary is doing the work.
 *
 * The parent frames this page with `sandbox` and without `allow-same-origin`,
 * so the document lands in an opaque origin. It cannot read `parent.location`,
 * it cannot touch this origin's storage, and it has no credentials to leak.
 *
 * It receives markup. It never receives the key, and there is deliberately no
 * code in this bundle that could do anything with one.
 */

export interface RenderMessage {
  readonly type: 'relic:render';
  readonly html: string;
}

export function isRenderMessage(data: unknown): data is RenderMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === 'relic:render' &&
    typeof (data as { html?: unknown }).html === 'string'
  );
}

/**
 * Build the message handler.
 *
 * `write` is injected so the guard logic is testable without a DOM, and so
 * the one call that actually renders untrusted markup sits in a single named
 * place rather than inline in an event listener.
 */
export function createSandboxHandler(
  write: (html: string) => void
): (data: unknown) => boolean {
  // Exactly one render, ever. Without this, anything that can post to this
  // frame could swap the content after the recipient has already decided to
  // trust what they are looking at.
  let rendered = false;

  return (data: unknown): boolean => {
    if (rendered) return false;
    if (!isRenderMessage(data)) return false;
    rendered = true;
    write(data.html);
    return true;
  };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const handle = createSandboxHandler((html) => {
    // document.write rather than innerHTML, because the point of this origin
    // is that the content runs as the page it claims to be. It is contained
    // by the origin boundary and the sandbox attribute, not by stripping it.
    document.open();
    document.write(html);
    document.close();
  });

  window.addEventListener('message', (event: MessageEvent) => {
    handle(event.data);
  });

  // Tell the parent the frame is listening, so a message posted before this
  // script ran is not simply lost.
  window.parent.postMessage({ type: 'relic:sandbox-ready' }, '*');
}
