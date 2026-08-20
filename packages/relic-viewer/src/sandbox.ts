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
 * Rendered content here cannot reach the network. The page's CSP names no
 * remote source, so nothing a relic's author writes can make a request
 * leave this frame. The JSX path carries its own dependencies for the same
 * reason: React and ReactDOM are bundled into this script, and the build
 * inlines that script into the page. An opaque origin cannot fetch even
 * its own origin's assets, so inlining is the only channel through which
 * the frame can receive code at all.
 */
// React and ReactDOM are bundled into this file rather than fetched: the
// frame is not allowed to reach the network, and an opaque origin cannot
// fetch same-origin assets even when they are offered. One bundled copy
// also settles the instance question hooks depend on: the `React` global
// the component resolves and the `createRoot` that mounts it are the same
// module by construction.
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  applyMarks,
  captureTree,
  HIGHLIGHT_CSS,
  isAnnotateMessage,
  type Mark,
} from './rendered-tree.ts';

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
 * lands once. `annotate` is injected for the same reason again, and carries a
 * default so every existing call site keeps working.
 */
export function createSandboxHandler(
  write: (html: string) => void,
  writeJsx: (code: string) => void,
  annotate: (marks: readonly Mark[]) => void = () => {}
): (data: unknown) => boolean {
  // Exactly one render, ever, across both message types. Without this,
  // anything that can post to this frame could swap the content after the
  // recipient has already decided to trust what they are looking at, and a
  // JSX render followed by an HTML render would be exactly that swap.
  //
  // A version comparison needs two renders of untrusted content and gets them
  // from two frames, each keeping this guarantee. Nothing about comparison
  // relaxes this line, and the next person who wants a second render here
  // should build a second frame instead.
  let rendered = false;
  // Annotation is a separate one-shot, for the same reason and no other.
  let annotated = false;

  return (data: unknown): boolean => {
    if (!rendered) {
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
      // Before a render there is nothing to annotate, so an annotate message
      // arriving first is refused rather than queued.
      return false;
    }

    // A mark carries a child-index path and a kind, and nothing else. That is
    // what makes a second message type safe here where a second render would
    // not be: this channel cannot carry content, so it cannot change what the
    // document says. It only outlines what already stands there.
    if (!annotated && isAnnotateMessage(data)) {
      annotated = true;
      annotate(data.marks);
      return true;
    }
    return false;
  };
}

async function mountComponent(code: string): Promise<void> {
  const root = document.createElement('div');
  root.id = 'relic-root';
  document.body.replaceChildren(root);

  try {
    // The posted code is a module body whose only ambient binding is
    // `React`, which the transpile emits calls to. Binding the bundled
    // React as a global means the module needs no import statement of its
    // own: there is no URL left that it could import from, since the frame
    // may not reach the network.
    // Sucrase's classic runtime resolves a bare `React` against the global
    // object; the cast exists only because no type declares that property.
    const sandboxGlobal = globalThis as { React?: typeof React };
    sandboxGlobal.React = React;
    // A blob module rather than `document.write`, because the component has
    // to be imported as a module for its default export to be readable. The
    // specifier is the blob URL built below, so no static import can name
    // it, and a same-origin fetch is the one thing an opaque origin cannot
    // do anyway. The blob never leaves this frame.
    const url = URL.createObjectURL(
      new Blob([code], { type: 'text/javascript' })
    );
    const module = await import(url);
    const component = module.default;
    if (typeof component !== 'function') {
      throw new Error('module has no default export to mount');
    }
    createRoot(root).render(React.createElement(component));
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

/**
 * Tell the parent what this frame ended up rendering.
 *
 * The message carries tag names, an attribute allowlist, and text, and no
 * markup at all. `'*'` is the only target available, exactly as it is for the
 * ready handshake: an opaque origin has no origin a parent could name. It is
 * safe for the same reason too, since the payload is the structure of the
 * content the parent already holds and is about to summarise, and the key was
 * never here to leak.
 */
function reportTree(): void {
  window.parent.postMessage(
    { type: 'relic:tree', tree: captureTree(document.body) },
    '*'
  );
}

/**
 * Report after the browser has actually laid the render down.
 *
 * The HTML path is done the moment `document.close()` returns, but a React
 * mount commits asynchronously, so capturing immediately would snapshot an
 * empty root. A frame is the natural beat to wait for, with a timeout for the
 * environments that have no frames to give.
 */
function scheduleReport(): void {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(reportTree));
    return;
  }
  window.setTimeout(reportTree, 0);
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
      // `document.open()` removes every event listener registered on the
      // document, on its nodes, and on its window, so the frame went deaf the
      // instant it rendered. Reporting still worked, because that is a
      // callback this closure already holds, which is exactly why the loss was
      // invisible: the parent got a tree, computed a diff, posted marks, and
      // nothing was listening. Re-register, or annotation can never arrive.
      listen();
      scheduleReport();
    },
    (code) => {
      void mountComponent(code).then(scheduleReport, scheduleReport);
    },
    (marks) => {
      // Relic's own constant stylesheet, and the only thing this path adds to
      // the document. It goes in through `textContent`, and the frame's
      // policy permits it because `style-src` allows inline styles.
      const style = document.createElement('style');
      style.textContent = HIGHLIGHT_CSS;
      document.head.appendChild(style);
      applyMarks(document.body, marks);
    }
  );

  const onMessage = (event: MessageEvent): void => {
    handle(event.data);
  };
  function listen(): void {
    window.addEventListener('message', onMessage);
  }
  listen();

  // Tell the parent the frame is listening, so a message posted before this
  // script ran is not simply lost.
  window.parent.postMessage({ type: 'relic:sandbox-ready' }, '*');
}
