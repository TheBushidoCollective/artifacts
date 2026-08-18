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
 * It receives markup, or transpiled component code. It never receives the
 * key, and there is deliberately no code in this bundle that could do
 * anything with one.
 *
 * Rendered content here may reach the network. The JSX path depends on it:
 * React and ReactDOM are imported from a CDN because the frame, being an
 * opaque origin, cannot fetch same-origin assets, and a permissive CDN is the
 * one kind of source that answers `Origin: null` with
 * `Access-Control-Allow-Origin: *`. Whatever a component or page fetches in
 * return is the cost the service-origin notice states plainly: the relic's
 * author can learn the recipient's IP address, user agent, and when the relic
 * was opened.
 */

export interface RenderMessage {
  readonly type: 'relic:render';
  readonly html: string;
}

export function isRenderMessage(data: unknown): data is RenderMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'html' in data &&
    data.type === 'relic:render' &&
    typeof data.html === 'string'
  );
}

export interface RenderJsxMessage {
  readonly type: 'relic:render-jsx';
  readonly code: string;
}

export function isRenderJsxMessage(data: unknown): data is RenderJsxMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'code' in data &&
    data.type === 'relic:render-jsx' &&
    typeof data.code === 'string'
  );
}

/**
 * Build the message handler.
 *
 * `write` is injected so the guard logic is testable without a DOM, and so
 * the one call that actually renders untrusted markup sits in a single named
 * place rather than inline in an event listener. `writeJsx` is injected for
 * the same reason: the guard does not care how a render lands, only that it
 * lands once.
 */
export function createSandboxHandler(
  write: (html: string) => void,
  writeJsx: (code: string) => void
): (data: unknown) => boolean {
  // Exactly one render, ever, across both message types. Without this,
  // anything that can post to this frame could swap the content after the
  // recipient has already decided to trust what they are looking at, and a
  // JSX render followed by an HTML render would be exactly that swap.
  let rendered = false;

  return (data: unknown): boolean => {
    if (rendered) return false;
    if (isRenderMessage(data)) {
      rendered = true;
      write(data.html);
      return true;
    }
    if (isRenderJsxMessage(data)) {
      rendered = true;
      writeJsx(data.code);
      return true;
    }
    return false;
  };
}

/**
 * React and ReactDOM come from esm.sh, pinned to one exact version so the
 * frame's React and the component's React are the same module instance, which
 * hooks require. The `deps` parameter makes react-dom resolve its internal
 * `react` to that same build rather than whatever it would pick on its own.
 */
const REACT_URL = 'https://esm.sh/react@19.2.0';
const REACT_DOM_CLIENT_URL =
  'https://esm.sh/react-dom@19.2.0/client?deps=react@19.2.0';

async function mountComponent(code: string): Promise<void> {
  const root = document.createElement('div');
  root.id = 'relic-root';
  document.body.replaceChildren(root);

  try {
    // The posted code is a module body whose only ambient binding is
    // `React`, which the transpile emits calls to. Prepending the import
    // here, rather than transpiling it in on the service origin, keeps the
    // service origin's output free of URLs and keeps the React instance a
    // decision of the frame that executes it.
    const source = `import * as React from '${REACT_URL}';\n${code}`;
    // A blob module rather than `document.write`, because the component has
    // to be imported as a module for its default export to be readable, and a
    // same-origin fetch is the one thing an opaque origin cannot do. The blob
    // never leaves this frame.
    const url = URL.createObjectURL(
      new Blob([source], { type: 'text/javascript' })
    );
    const [module, react, client] = await Promise.all([
      import(url),
      import(REACT_URL),
      import(REACT_DOM_CLIENT_URL),
    ]);
    const component = module.default;
    if (typeof component !== 'function') {
      throw new Error('module has no default export to mount');
    }
    client.createRoot(root).render(react.createElement(component));
  } catch {
    // Compilation was checked on the service origin, so landing here means
    // the module threw while running, or exported nothing mountable. Either
    // way the honest display is a short failure, not a silent blank frame.
    const failure = document.createElement('div');
    failure.style.cssText =
      'font: 14px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;' +
      'padding: 2rem; color: #333;';
    failure.textContent = 'This component could not be rendered.';
    root.replaceChildren(failure);
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const handle = createSandboxHandler(
    (html) => {
      // document.write rather than innerHTML, because the point of this origin
      // is that the content runs as the page it claims to be. It is contained
      // by the origin boundary and the sandbox attribute, not by stripping it.
      document.open();
      document.write(html);
      document.close();
    },
    (code) => {
      void mountComponent(code);
    }
  );

  window.addEventListener('message', (event: MessageEvent) => {
    handle(event.data);
  });

  // Tell the parent the frame is listening, so a message posted before this
  // script ran is not simply lost.
  window.parent.postMessage({ type: 'relic:sandbox-ready' }, '*');
}
