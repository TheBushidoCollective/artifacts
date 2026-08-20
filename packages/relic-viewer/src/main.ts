/**
 * The DOM layer.
 *
 * Everything that decides anything lives in `viewer.ts`, which has no DOM in
 * it and is tested directly. This file only draws what that decided, so the
 * rules cannot quietly diverge from their tests.
 *
 * Two things here are security, not presentation:
 *
 * 1. **Content reaches the DOM through `textContent` or through the escaping
 *    renderer, never through `innerHTML` on raw bytes.**
 * 2. **HTML content is never rendered on this origin.** It goes to the
 *    usercontent origin through an iframe that gets the markup and never the
 *    key.
 */

import {
  bytesEqual,
  comparisonAvailability,
  createImageDiff,
  createTextDiff,
  diffModeForRoutes,
  type TextDiffPart,
  versionHistoryCopy,
} from './diff.ts';
import { diffTrees, type RenderedChange, type TreeDiff } from './domdiff.ts';
import { transpileJsx } from './jsx.ts';
import { highlightCode, renderMarkdown } from './markdown.ts';
import {
  applyMarks,
  captureTree,
  isTreeMessage,
  type Mark,
  type TreeNode,
} from './rendered-tree.ts';
import {
  type DeadView,
  formatBytes,
  type KeyVault,
  load,
  loadHistoricalVersion,
  type ReadyView,
  type ViewerDeps,
} from './viewer.ts';

const SERVICE_ORIGIN =
  typeof window === 'undefined' ? '' : window.location.origin;

/**
 * The wordmark in the accession band.
 *
 * The recipient is deciding whether to trust an unfamiliar domain, so the
 * wordmark is the domain itself rather than a product name they have no way to
 * connect to the address bar. It is a brand fact and belongs in code: deriving
 * it from the serving origin would print whatever host the deployment happens
 * to answer on.
 */
const WORDMARK = 'relik.link';

/**
 * The marker beside the actions, in one place.
 *
 * It is the visible label, the accessible name, and the stem of the tooltip,
 * and it was three separate strings until two of them disagreed.
 */
const MARKER_LABEL = 'Runs author code, isolated';

const ICONS = {
  copy: 'M5 2h7a1 1 0 0 1 1 1v8h-1V3H5V2zM3 4h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm0 1v8h7V5H3z',
  compare:
    'M2 4h9L9 2l.7-.7L13 4.5 9.7 8 9 7.3l2-2H2V4zm12 8H5l2 2-.7.7L3 11.5 6.3 8l.7.7-2 2h9V12z',
  download:
    'M7.5 1h1v7.3l2.6-2.6.7.7L8 10.2 4.2 6.4l.7-.7 2.6 2.6V1zM2 12h12v1H2v-1z',
  source:
    'M5.7 3.3 2 7l3.7 3.7.7-.7L3.4 7l3-3-.7-.7zm4.6 0-.7.7 3 3-3 3 .7.7L14 7l-3.7-3.7z',
  rendered: 'M2 3h12v1H2V3zm0 3h12v1H2V6zm0 3h8v1H2V9zm0 3h10v1H2v-1z',
  flag: 'M3 1h1v14H3V1zm2 1h8l-2 3 2 3H5V2z',
  chevron: 'M3.4 5.7 8 10.3l4.6-4.6-.7-.7L8 8.9 4.1 5l-.7.7z',
  swipe: 'M7.5 1h1v14h-1V1zM2 7.5h3.5v1H2v-1zm8.5 0H14v1h-3.5v-1z',
  columns: 'M2 2h5v12H2V2zm1 1v10h3V3H3zm6-1h5v12H9V2zm1 1v10h3V3h-3z',
} as const;

function icon(path: string): SVGSVGElement {
  // Inline SVG rather than an emoji or a webfont: the CSP blocks external
  // anything, and an emoji is not an icon system.
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('icon');
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  node.setAttribute('d', path);
  svg.appendChild(node);
  return svg;
}

function button(
  label: string,
  iconPath: string,
  onClick: () => void
): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = 'action';
  element.appendChild(icon(iconPath));
  const text = document.createElement('span');
  text.textContent = label;
  element.appendChild(text);
  element.addEventListener('click', onClick);
  return element;
}

/**
 * The filename is untrusted and is used here as a lookup key, which is the
 * same defect class as archive entry names. Path separators and leading dots
 * are stripped rather than trusted.
 */
export function safeDownloadName(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? '';
  const cleaned = base.replace(/^\.+/, '').trim();
  return cleaned.length > 0 ? cleaned.slice(0, 200) : 'relic';
}

/**
 * The mimetype handed to a Blob is derived from magic bytes, never from the
 * declared type. A declared `image/svg+xml` would otherwise be a route into
 * script execution, which is why SVG is classified as a web page instead.
 */
export function sniffImageType(content: Uint8Array): string {
  const starts = (...bytes: number[]): boolean =>
    bytes.every((byte, index) => content[index] === byte);

  if (starts(0x89, 0x50, 0x4e, 0x47)) return 'image/png';
  if (starts(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (starts(0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  if (starts(0x42, 0x4d)) return 'image/bmp';
  if (
    starts(0x52, 0x49, 0x46, 0x46) &&
    content[8] === 0x57 &&
    content[9] === 0x45
  ) {
    return 'image/webp';
  }
  return 'application/octet-stream';
}

function decodeText(content: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(content);
}

function toast(message: string): void {
  document.querySelector('.toast')?.remove();
  const element = document.createElement('div');
  element.className = 'toast';
  element.setAttribute('role', 'status');
  element.textContent = message;
  document.body.appendChild(element);
  window.setTimeout(() => element.remove(), 4000);
}

/**
 * A one-off statement above the content.
 *
 * The pre-render statement that used to greet every sandboxed relic is gone,
 * demoted to a marker in the bar, because the risk it described was removed.
 * This remains for the cases that are genuinely about this file: a downgrade,
 * or a component that would not compile. Those are conditions of the content
 * in front of the reader, not a standing warning.
 */
function notice(text: string): HTMLElement {
  const element = document.createElement('div');
  element.className = 'notice';
  element.appendChild(icon(ICONS.flag));
  const span = document.createElement('span');
  span.textContent = text;
  element.appendChild(span);
  return element;
}

function downloadContent(view: ReadyView): void {
  const blob = new Blob([view.content as unknown as BlobPart], {
    type: 'application/octet-stream',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeDownloadName(view.filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export interface BarOptions {
  readonly onCompare?: () => void;
  readonly comparisonOpen?: boolean;
  /**
   * Which version the reader is looking at, when that is not the current
   * one. Set while a comparison is open so the taskbar names the version
   * being compared rather than the one behind it.
   */
  readonly selectedVersion?: number;
  /** Offered only when there is more than one historical version to pick. */
  readonly onSelectVersion?: (version: number) => void;
}

/**
 * The version, as the taskbar shows it.
 *
 * Two strings rather than one, because the row has already overflowed once at
 * narrow width and the long form does not fit at 320 CSS pixels. The
 * stylesheet swaps them, so neither form is built by measuring anything.
 */
function versionLabels(
  shown: number,
  current: number
): { readonly long: string; readonly short: string } {
  return {
    long: `Version ${shown} of ${current}`,
    short: `v${shown}/${current}`,
  };
}

/**
 * The version chip in the identity zone, which is a control only when there
 * is a choice to make.
 *
 * A relic on its second version has exactly one historical version, so a
 * picker there would be a menu with one item: it looks like a decision and
 * offers none. That case renders a label, and Compare versions in the actions
 * zone is the only control. From the third version on there is a real choice,
 * so the chip becomes an owned listbox.
 *
 * Owned rather than a native `select`, and that is a platform limit rather
 * than a styling preference: a native popup cannot be positioned or sized by
 * the page, and on macOS it rendered as a large panel detached from its
 * control, floating in empty space. No stylesheet reaches it.
 */
function buildVersionControl(
  view: ReadyView,
  options: BarOptions
): HTMLElement | undefined {
  // A single-version relic says nothing about versions at all. A number with
  // no history behind it invites a question that has no answer.
  if (!Number.isInteger(view.currentVersion) || view.currentVersion <= 1) {
    return undefined;
  }

  const shown = options.selectedVersion ?? view.version;
  const labels = versionLabels(shown, view.currentVersion);
  const wrap = document.createElement('div');
  wrap.className = 'version';

  const text = (parent: HTMLElement): void => {
    const long = document.createElement('span');
    long.className = 'version-long';
    long.textContent = labels.long;
    const short = document.createElement('span');
    short.className = 'version-short';
    short.setAttribute('aria-hidden', 'true');
    short.textContent = labels.short;
    parent.append(long, short);
  };

  const onSelect = options.onSelectVersion;
  if (onSelect === undefined || view.currentVersion < 3) {
    const label = document.createElement('div');
    label.className = 'version-label';
    text(label);
    wrap.appendChild(label);
    return wrap;
  }

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'version-label version-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute(
    'aria-label',
    `${labels.long}. Choose an earlier version to compare`
  );
  text(trigger);
  trigger.appendChild(icon(ICONS.chevron));

  const list = document.createElement('div');
  list.className = 'version-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Earlier version to compare');
  list.hidden = true;

  const optionElements: HTMLElement[] = [];
  for (let version = view.currentVersion - 1; version >= 1; version--) {
    const option = document.createElement('div');
    option.className = 'version-option';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', version === shown ? 'true' : 'false');
    // Roving focus rather than a tab stop each: a listbox is one stop, and
    // arrow keys move within it.
    option.tabIndex = -1;
    option.textContent = `Version ${version}`;
    option.addEventListener('click', () => {
      close();
      onSelect(version);
    });
    list.appendChild(option);
    optionElements.push(option);
  }

  let open = false;
  function close(focusTrigger = false): void {
    if (!open) return;
    open = false;
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (focusTrigger) trigger.focus();
  }

  const move = (from: number, delta: number): void => {
    const last = optionElements.length - 1;
    const next = Math.min(last, Math.max(0, from + delta));
    optionElements[next]?.focus();
  };

  function show(index: number): void {
    open = true;
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    optionElements[index]?.focus();
  }

  trigger.addEventListener('click', () => {
    if (open) close();
    else show(0);
  });

  trigger.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')
      show(0);
    else if (event.key === 'ArrowUp') show(optionElements.length - 1);
    else return;
    event.preventDefault();
  });

  list.addEventListener('keydown', (event: KeyboardEvent) => {
    const index = optionElements.indexOf(event.target as HTMLElement);
    if (index < 0) return;
    if (event.key === 'ArrowDown') move(index, 1);
    else if (event.key === 'ArrowUp') move(index, -1);
    else if (event.key === 'Home') move(index, -optionElements.length);
    else if (event.key === 'End') move(index, optionElements.length);
    else if (event.key === 'Escape' || event.key === 'Tab') close(true);
    else if (event.key === 'Enter' || event.key === ' ')
      optionElements[index]?.click();
    else return;
    event.preventDefault();
  });

  // A click anywhere else dismisses it. Bound on the document rather than on
  // a blur, because focus moves inside the list on every arrow key and a
  // blur handler would close it mid-navigation.
  document.addEventListener('click', (event: Event) => {
    if (!wrap.contains(event.target as Node)) close();
  });

  wrap.append(trigger, list);
  return wrap;
}

/**
 * The taskbar, built as an accession label rather than app chrome.
 *
 * The relic ID is a catalog number and reads as one: monospace, letterspaced,
 * selectable. The filename is untrusted display text and goes in through
 * `textContent`.
 */
export function buildBar(
  view: ReadyView,
  relicId: string,
  options: BarOptions = {}
): HTMLElement {
  const bar = document.createElement('header');
  bar.className = 'bar';

  const mark = document.createElement('div');
  mark.className = 'mark';
  mark.textContent = WORDMARK;
  bar.appendChild(mark);

  const identity = document.createElement('div');
  identity.className = 'identity';

  const name = document.createElement('div');
  name.className = 'filename';
  name.textContent = view.filename.length > 0 ? view.filename : 'Untitled';
  name.title = view.filename;

  // The relic id and the version sit on one metadata line, because a version
  // number is artifact metadata of exactly the same kind as a catalog number.
  // They share the identity zone rather than joining the actions, and that is
  // load bearing: identity is the only flexible column on the row, so the
  // pressure a new element adds lands on an ellipsis that already exists
  // instead of pushing a control off the end.
  const meta = document.createElement('div');
  meta.className = 'identity-meta';

  const accession = document.createElement('div');
  accession.className = 'accession';
  accession.textContent = relicId;
  meta.appendChild(accession);

  const version = buildVersionControl(view, options);
  if (version !== undefined) meta.appendChild(version);

  identity.append(name, meta);
  bar.appendChild(identity);

  const actions = document.createElement('div');
  actions.className = 'actions';

  // A statement of fact, sitting with the actions rather than above the
  // content. It used to be a banner, and the risk it warned about, content
  // reaching the network, no longer exists.
  //
  // It collapses to its icon at narrow widths exactly like the buttons beside
  // it. Keeping this label while hiding theirs put a fact ahead of the
  // actions and pushed Report off the row, so the accessible name carries the
  // meaning once the text is gone.
  const marker = document.createElement('a');
  marker.className = 'action marker';
  marker.href = `${SERVICE_ORIGIN}/policy`;
  marker.rel = 'noopener noreferrer';
  // One string for the label and the accessible name, because WCAG 2.5.3
  // wants the name to contain the visible text and these had drifted: the
  // label read "Runs author code" while the name read "the author's code",
  // which is exactly the mismatch that breaks speech control.
  marker.setAttribute('aria-label', MARKER_LABEL);
  marker.title = `${MARKER_LABEL}. What Relic knows.`;
  marker.appendChild(icon(ICONS.source));
  const markerText = document.createElement('span');
  markerText.textContent = MARKER_LABEL;
  marker.appendChild(markerText);
  actions.appendChild(marker);

  const availability = comparisonAvailability(view);
  if (availability.kind === 'available' && options.onCompare !== undefined) {
    const label =
      options.comparisonOpen === true ? 'View current' : 'Compare versions';
    const compare = button(label, ICONS.compare, options.onCompare);
    compare.setAttribute(
      'aria-pressed',
      options.comparisonOpen === true ? 'true' : 'false'
    );
    compare.title =
      options.comparisonOpen === true
        ? `Return to version ${view.currentVersion}`
        : `Compare version ${view.currentVersion} with its history`;
    actions.appendChild(compare);
  }

  // The fragment was stripped from the address bar, so re-sharing has to come
  // from somewhere. This is that affordance, backed by the in-memory key.
  actions.appendChild(
    button('Copy link', ICONS.copy, () => {
      void navigator.clipboard.writeText(view.shareUrl).then(
        () => toast('Link copied. It contains the decryption key.'),
        () => toast('Could not copy. Copy the link from where you opened it.')
      );
    })
  );

  actions.appendChild(
    button('Download', ICONS.download, () => downloadContent(view))
  );

  const report = document.createElement('a');
  report.className = 'action';
  report.href = `${SERVICE_ORIGIN}/abuse`;
  report.rel = 'noopener noreferrer';
  report.appendChild(icon(ICONS.flag));
  const reportText = document.createElement('span');
  reportText.textContent = 'Report';
  report.appendChild(reportText);
  actions.appendChild(report);

  bar.appendChild(actions);
  return bar;
}

function renderMarkdownView(view: ReadyView): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'doc';

  const source = decodeText(view.content);

  const prose = document.createElement('article');
  prose.className = 'prose';
  // renderMarkdown escapes before it adds markup, and nothing in the source
  // can become an element. That property is asserted directly in
  // test/markdown.test.ts against fifteen attack payloads.
  prose.innerHTML = renderMarkdown(source);

  const raw = document.createElement('pre');
  raw.className = 'raw';
  raw.hidden = true;
  raw.textContent = source;

  let showingSource = false;
  const toggle = button('View source', ICONS.source, () => {
    showingSource = !showingSource;
    prose.hidden = showingSource;
    raw.hidden = !showingSource;
    toggle.replaceChildren();
    toggle.appendChild(icon(showingSource ? ICONS.rendered : ICONS.source));
    const label = document.createElement('span');
    label.textContent = showingSource ? 'View rendered' : 'View source';
    toggle.appendChild(label);
  });

  const toggleRow = document.createElement('div');
  toggleRow.className = 'toggle-row';
  toggleRow.appendChild(toggle);

  wrapper.append(toggleRow, prose, raw);
  return wrapper;
}

function renderCodeView(view: ReadyView): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'doc';

  const source = decodeText(view.content);
  const lines = source.split('\n');

  const table = document.createElement('div');
  table.className = 'code';

  const gutter = document.createElement('pre');
  gutter.className = 'gutter';
  gutter.setAttribute('aria-hidden', 'true');
  gutter.textContent = lines.map((_line, index) => index + 1).join('\n');

  const body = document.createElement('pre');
  body.className = 'code-body';
  // highlightCode escapes before it marks up.
  body.innerHTML = highlightCode(source);

  table.append(gutter, body);
  wrapper.appendChild(table);
  return wrapper;
}

function renderImageView(view: ReadyView): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'doc doc-image';

  const blob = new Blob([view.content as unknown as BlobPart], {
    type: sniffImageType(view.content),
  });
  const url = URL.createObjectURL(blob);

  const image = document.createElement('img');
  image.src = url;
  image.alt = view.filename;
  image.addEventListener('load', () => URL.revokeObjectURL(url));
  image.addEventListener('error', () => {
    URL.revokeObjectURL(url);
    wrapper.replaceChildren(
      notice('This image could not be decoded by the browser.')
    );
  });

  wrapper.appendChild(image);
  return wrapper;
}

/**
 * What a render frame is told to render. HTML crosses as markup, a component
 * crosses as JavaScript this origin transpiled without running.
 */
type RenderPayload =
  | { readonly type: 'relic:render'; readonly html: string }
  | { readonly type: 'relic:render-jsx'; readonly code: string };

interface FrameHandle {
  readonly frame: HTMLIFrameElement;
  /**
   * Mark this frame's own rendered nodes, once the parent holds a diff.
   *
   * The marks carry a child-index path and a kind, and nothing else. That is
   * what makes a second message safe where a second render would not be: this
   * channel is structurally incapable of changing what the document says.
   */
  annotate(marks: readonly Mark[]): void;
}

/**
 * One render frame on the usercontent origin.
 *
 * The iframe carries `sandbox` without `allow-same-origin`, so the document
 * lands in an opaque origin: it cannot reach this origin, it cannot reach the
 * usercontent origin's storage, and it cannot read `parent.location`. The
 * payload is posted in; the key never is.
 *
 * Scripts and nothing else. Popups are removed by dropping the flag, not by
 * CSP: a popup opens a new top-level context this frame's policy does not
 * govern.
 *
 * A comparison needs two renders of untrusted content, and it gets them from
 * two of these rather than by relaxing the frame's one-render guard. The
 * guard exists so nothing that can post here can swap the content after the
 * recipient has decided to trust what they are looking at, and a second
 * render is exactly that swap.
 */
function sandboxFrame(
  view: ReadyView,
  usercontentOrigin: string,
  payload: RenderPayload,
  onTree?: (tree: TreeNode) => void
): FrameHandle {
  const frame = document.createElement('iframe');
  frame.className = 'usercontent-frame';
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.setAttribute('referrerpolicy', 'no-referrer');
  frame.src = `${usercontentOrigin}/sandbox.html`;
  frame.title = view.filename;

  // An opaque-origin frame has no origin to target, so '*' is the only option
  // the platform offers. It is safe here because the payload is the content
  // that frame is about to display anyway. The key is never in it.
  const post = (message: object): void => {
    frame.contentWindow?.postMessage(message, '*');
  };

  // Both paths, because the race runs in either direction: `load` can fire
  // before the frame's own script attaches its listener, and the frame's
  // ready message can arrive before `load`. The frame renders at most once,
  // so posting twice is harmless and losing the message is not.
  const onMessage = (event: MessageEvent): void => {
    if (event.source !== frame.contentWindow) return;
    const type = (event.data as { type?: unknown } | null)?.type;
    if (type === 'relic:sandbox-ready') {
      post(payload);
      return;
    }
    // The captured tree is tag names, a fixed attribute allowlist, and text.
    // No markup crosses back to this origin, so nothing here has to be
    // sanitized before it is read: there is nothing to sanitize.
    if (onTree !== undefined && isTreeMessage(event.data)) {
      onTree(event.data.tree);
    }
  };
  window.addEventListener('message', onMessage);
  frame.addEventListener('load', () => post(payload));

  return {
    frame,
    annotate: (marks) => post({ type: 'relic:annotate', marks }),
  };
}

/**
 * A component's payload, or nothing when it will not compile.
 *
 * The service origin must never execute relic content, and the transform
 * never does: it is a text-to-text rewrite whose output is posted as a
 * string. The frame turns that string back into running code by importing it
 * as a module. React is bundled into the inlined frame script because the
 * opaque origin cannot fetch same-origin assets or any remote dependency.
 */
function jsxPayload(view: ReadyView): RenderPayload | undefined {
  try {
    return {
      type: 'relic:render-jsx',
      code: transpileJsx(decodeText(view.content), view.filename),
    };
  } catch {
    return undefined;
  }
}

function payloadFor(view: ReadyView): RenderPayload | undefined {
  return view.route === 'sandboxed-jsx'
    ? jsxPayload(view)
    : { type: 'relic:render', html: decodeText(view.content) };
}

/** HTML renders on the usercontent origin and nowhere else. */
export function renderSandboxedHtml(
  view: ReadyView,
  usercontentOrigin: string
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'doc doc-html';
  wrapper.appendChild(
    sandboxFrame(view, usercontentOrigin, {
      type: 'relic:render',
      html: decodeText(view.content),
    }).frame
  );
  return wrapper;
}

/**
 * A component renders on the usercontent origin and nowhere else, exactly
 * like HTML, but what crosses the frame boundary is different: the source is
 * transpiled here, on the service origin, into plain JavaScript first.
 */
export function renderSandboxedJsx(
  view: ReadyView,
  usercontentOrigin: string
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'doc doc-jsx';

  const payload = jsxPayload(view);
  if (payload === undefined) {
    // Routing already established the bytes parse, so landing here means a
    // path the route decision could not see. Source view is the honest
    // fallback: it shows exactly what was published without running it.
    wrapper.appendChild(
      notice(
        'This file is named like a React component, but its contents do not ' +
          'compile as one. It is shown as source.'
      )
    );
    wrapper.appendChild(renderCodeView(view));
    return wrapper;
  }

  wrapper.appendChild(sandboxFrame(view, usercontentOrigin, payload).frame);
  return wrapper;
}

function renderDownloadView(view: ReadyView): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'doc doc-download';

  const card = document.createElement('div');
  card.className = 'card';

  const name = document.createElement('div');
  name.className = 'card-title';
  name.textContent = view.filename.length > 0 ? view.filename : 'Untitled';

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  meta.textContent = `${view.declaredMimetype} · ${formatBytes(view.content.length)}`;

  const action = button('Download', ICONS.download, () =>
    downloadContent(view)
  );
  action.classList.add('primary');

  const note = document.createElement('p');
  note.className = 'card-note';
  note.textContent =
    'This kind of file is not displayed in the browser. It has already been ' +
    'decrypted here, so downloading it does not contact the service again.';

  card.append(name, meta, action, note);
  wrapper.appendChild(card);
  return wrapper;
}

export function buildCurrentStage(
  view: ReadyView,
  usercontentOrigin: string
): HTMLElement {
  const main = document.createElement('main');
  main.className = `stage stage-${view.route}`;

  const availability = comparisonAvailability(view);
  if (availability.kind === 'unavailable') {
    main.appendChild(notice(availability.detail));
  }

  if (view.downgradeNotice !== undefined) {
    main.appendChild(notice(view.downgradeNotice));
  }

  switch (view.route) {
    case 'markdown':
      main.appendChild(renderMarkdownView(view));
      break;
    case 'code':
      main.appendChild(renderCodeView(view));
      break;
    case 'image':
      main.appendChild(renderImageView(view));
      break;
    case 'sandboxed-html':
      main.appendChild(renderSandboxedHtml(view, usercontentOrigin));
      break;
    case 'sandboxed-jsx':
      main.appendChild(renderSandboxedJsx(view, usercontentOrigin));
      break;
    default:
      main.appendChild(renderDownloadView(view));
      break;
  }

  return main;
}

function lineNumbers(
  start: number | undefined,
  count: number,
  displayedLines: number
): string {
  let value = '';
  for (let index = 0; index < displayedLines; index++) {
    if (index > 0) value += '\n';
    if (start !== undefined && index < count) value += String(start + index);
  }
  return value;
}

function appendDiffText(body: HTMLElement, part: TextDiffPart): void {
  if (part.segments === undefined) {
    body.textContent = part.value;
    return;
  }

  for (const segment of part.segments) {
    const span = document.createElement('span');
    span.className =
      segment.kind === 'unchanged' ? '' : `diff-inline-${segment.kind}`;
    span.textContent = segment.text;
    body.appendChild(span);
  }
}

function noChanges(summary: string): HTMLElement {
  const empty = document.createElement('div');
  empty.className = 'diff-empty';
  empty.setAttribute('role', 'status');
  const headline = document.createElement('strong');
  headline.textContent = 'No changes';
  const detail = document.createElement('span');
  detail.textContent = summary;
  empty.append(headline, detail);
  return empty;
}

/**
 * The line comparison, now scoped to code.
 *
 * Markdown, HTML and JSX all used to arrive here and be compared as source
 * text. That is a text diff of markup, which is not a visual diff of anything
 * a reader looks at, so each of them now compares as it renders. Code stays,
 * because for code the source is what a reader sees.
 */
export function renderCodeComparison(
  current: ReadyView,
  historical: ReadyView
): HTMLElement {
  const wrapper = document.createElement('section');
  wrapper.className = 'diff-view diff-view-code';

  const result = createTextDiff(
    decodeText(historical.content),
    decodeText(current.content)
  );
  const summary = document.createElement('div');
  summary.className = 'diff-summary';
  const label = document.createElement('strong');
  label.textContent = 'Code comparison';
  const counts = document.createElement('span');
  counts.textContent = result.summary;
  summary.append(label, counts);
  wrapper.appendChild(summary);

  if (!result.changed) {
    wrapper.appendChild(noChanges(result.summary));
    return wrapper;
  }

  const changes = document.createElement('div');
  changes.className = 'diff-changes';
  changes.setAttribute(
    'aria-label',
    `Changes from version ${historical.version} to version ${current.version}`
  );

  for (const part of result.parts) {
    const row = document.createElement('div');
    row.className = `diff-part diff-part-${part.kind}`;
    row.setAttribute(
      'aria-label',
      part.kind === 'unchanged'
        ? 'Unchanged lines'
        : `${part.kind === 'added' ? 'Added' : 'Removed'} lines`
    );

    const displayedLines = Math.max(part.beforeLines, part.currentLines);
    const beforeNumbers = document.createElement('pre');
    beforeNumbers.className = 'diff-gutter diff-gutter-before';
    beforeNumbers.setAttribute('aria-hidden', 'true');
    beforeNumbers.textContent = lineNumbers(
      part.beforeStart,
      part.beforeLines,
      displayedLines
    );

    const currentNumbers = document.createElement('pre');
    currentNumbers.className = 'diff-gutter diff-gutter-current';
    currentNumbers.setAttribute('aria-hidden', 'true');
    currentNumbers.textContent = lineNumbers(
      part.currentStart,
      part.currentLines,
      displayedLines
    );

    const body = document.createElement('pre');
    body.className = 'diff-body';
    appendDiffText(body, part);

    row.append(beforeNumbers, currentNumbers, body);
    changes.appendChild(row);
  }

  wrapper.appendChild(changes);
  return wrapper;
}

/** What a reader sees changed, in rendered terms rather than source terms. */
function renderChangeList(changes: readonly RenderedChange[]): HTMLElement {
  const list = document.createElement('ul');
  list.className = 'diff-change-list';

  for (const change of changes) {
    const item = document.createElement('li');
    item.className = `diff-change diff-change-${change.kind}`;

    const kind = document.createElement('span');
    kind.className = 'diff-change-kind';
    kind.textContent = change.kind;

    const what = document.createElement('span');
    what.className = 'diff-change-what';
    what.textContent = change.label;

    // Rendered text from the compared versions, and it reaches the DOM as a
    // text node. Nothing parses it, so content that is secretly markup shows
    // as its own source and does nothing, which is the correct outcome on the
    // origin that holds the key.
    const detail = document.createElement('span');
    detail.className = 'diff-change-detail';
    if (change.kind === 'changed') {
      const before = document.createElement('del');
      before.textContent = change.before;
      const after = document.createElement('ins');
      after.textContent = change.after;
      detail.append(before, after);
    } else {
      detail.textContent =
        change.kind === 'added' ? change.after : change.before;
    }

    item.append(kind, what, detail);
    list.appendChild(item);
  }

  return list;
}

/** One side of a rendered comparison, and how to mark it once a diff exists. */
interface ComparisonPane {
  readonly element: HTMLElement;
  /** Resolves with the pane's captured tree, or never when it cannot render. */
  readonly tree: Promise<TreeNode>;
  annotate(marks: readonly Mark[]): void;
}

/** How long to wait for a frame that renders nothing at all. */
const TREE_TIMEOUT_MS = 6000;

/**
 * A markdown pane, rendered here rather than in a frame.
 *
 * Markdown renders on the service origin because `renderMarkdown` escapes
 * before it emits markup and its element and attribute set is fixed by the
 * viewer, so nothing in the source can become an element. That means both
 * versions are ordinary DOM on this origin, and the comparison needs no frame
 * and no protocol.
 */
function markdownPane(view: ReadyView): ComparisonPane {
  const prose = document.createElement('article');
  prose.className = 'prose';
  prose.innerHTML = renderMarkdown(decodeText(view.content));
  return {
    element: prose,
    tree: Promise.resolve(captureTree(prose)),
    annotate: (marks) => {
      applyMarks(prose, marks);
    },
  };
}

/**
 * A pane whose content is a page or a component, so it renders in its own
 * network-denied frame.
 *
 * Two frames rather than two renders in one: each keeps the single-render
 * guarantee it already had. The parent cannot read a frame's DOM, because the
 * render frame is an opaque origin, so the frame reports its own rendered
 * structure and the parent posts back marks that carry no content.
 */
function framePane(view: ReadyView, usercontentOrigin: string): ComparisonPane {
  const payload = payloadFor(view);
  if (payload === undefined) {
    return {
      element: notice(
        `Version ${view.version} is named like a React component and does ` +
          'not compile as one, so it cannot be rendered for comparison.'
      ),
      tree: new Promise<TreeNode>(() => {}),
      annotate: () => {},
    };
  }

  let settle: ((tree: TreeNode) => void) | undefined;
  const tree = new Promise<TreeNode>((resolve) => {
    settle = resolve;
  });
  const handle = sandboxFrame(view, usercontentOrigin, payload, (reported) =>
    settle?.(reported)
  );
  return { element: handle.frame, tree, annotate: handle.annotate };
}

/**
 * The visual comparison for every class that has a rendered form.
 *
 * Two panes, each showing one version as it actually renders, stacked under a
 * swipe control so the reader can wipe between them, or laid side by side.
 * On top of that, each pane's own changed nodes are outlined where they sit,
 * so a change is visible without hunting for it. Markdown defaults to side by
 * side because prose is read, and a page or a component defaults to the swipe
 * because what matters there is whether the pixels moved.
 */
export function renderRenderedComparison(
  current: ReadyView,
  historical: ReadyView,
  mode: 'markdown' | 'rendered',
  usercontentOrigin: string
): HTMLElement {
  const wrapper = document.createElement('section');
  wrapper.className = `diff-view diff-view-${mode}`;

  const summary = document.createElement('div');
  summary.className = 'diff-summary';
  const label = document.createElement('strong');
  label.textContent = 'Rendered comparison';
  const counts = document.createElement('span');
  counts.textContent = 'Rendering both versions.';
  summary.append(label, counts);
  wrapper.appendChild(summary);

  const before =
    mode === 'markdown'
      ? markdownPane(historical)
      : framePane(historical, usercontentOrigin);
  const after =
    mode === 'markdown'
      ? markdownPane(current)
      : framePane(current, usercontentOrigin);

  const stage = document.createElement('div');
  stage.className = 'compare-stage';
  stage.dataset['layout'] = mode === 'markdown' ? 'split' : 'swipe';
  stage.style.setProperty('--split', '50%');

  const beforePane = document.createElement('div');
  beforePane.className = 'compare-pane compare-pane-before';
  beforePane.appendChild(before.element);

  const afterPane = document.createElement('div');
  afterPane.className = 'compare-pane compare-pane-current';
  afterPane.appendChild(after.element);

  const beforeLabel = document.createElement('span');
  beforeLabel.className = 'compare-label compare-label-before';
  beforeLabel.textContent = `Version ${historical.version}`;
  const afterLabel = document.createElement('span');
  afterLabel.className = 'compare-label compare-label-current';
  afterLabel.textContent = `Version ${current.version}, current`;
  const divider = document.createElement('span');
  divider.className = 'compare-divider';
  divider.setAttribute('aria-hidden', 'true');

  stage.append(beforePane, afterPane, beforeLabel, afterLabel, divider);

  const controls = document.createElement('div');
  controls.className = 'compare-controls';

  const swipeControl = document.createElement('label');
  swipeControl.className = 'compare-swipe';
  const swipeText = document.createElement('span');
  const swipeLabel = `Reveal version ${current.version} over version ${historical.version}`;
  swipeText.textContent = swipeLabel;
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '50';
  slider.setAttribute('aria-label', swipeLabel);
  slider.addEventListener('input', () => {
    stage.style.setProperty('--split', `${slider.value}%`);
  });
  swipeControl.append(swipeText, slider);

  const layout = document.createElement('div');
  layout.className = 'compare-layout';
  const buttons: HTMLButtonElement[] = [];
  const setLayout = (next: 'swipe' | 'split'): void => {
    stage.dataset['layout'] = next;
    for (const candidate of buttons) {
      const active = candidate.dataset['layout'] === next;
      candidate.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    swipeControl.hidden = next !== 'swipe';
  };
  for (const [value, text, path] of [
    ['swipe', 'Swipe', ICONS.swipe],
    ['split', 'Side by side', ICONS.columns],
  ] as const) {
    const control = button(text, path, () => setLayout(value));
    control.dataset['layout'] = value;
    buttons.push(control);
    layout.appendChild(control);
  }
  setLayout(stage.dataset['layout'] === 'split' ? 'split' : 'swipe');

  controls.append(layout, swipeControl);

  const result = document.createElement('div');
  result.className = 'diff-rendered-result';

  wrapper.append(stage, controls, result);

  // The structural comparison is the annotation, and the two live renders are
  // the evidence. So a frame that never reports a tree costs the outlines and
  // the change list, and leaves the reader everything a swipe can show.
  const timeout = new Promise<undefined>((resolve) => {
    setTimeout(() => resolve(undefined), TREE_TIMEOUT_MS);
  });
  void Promise.race([Promise.all([before.tree, after.tree]), timeout]).then(
    (trees) => {
      if (trees === undefined) {
        counts.textContent =
          'Both versions are shown. Relik could not read their rendered ' +
          'structure, so changes are not outlined.';
        return;
      }
      const [beforeTree, afterTree] = trees;
      const diff: TreeDiff = diffTrees(beforeTree, afterTree);
      counts.textContent = diff.summary;
      before.annotate(diff.removedMarks);
      after.annotate(diff.addedMarks);
      if (!diff.changed) {
        result.replaceChildren(noChanges(diff.summary));
        return;
      }
      if (diff.changes.length > 0) {
        result.replaceChildren(renderChangeList(diff.changes));
      }
    }
  );

  return wrapper;
}

async function loadImage(
  image: HTMLImageElement,
  url: string
): Promise<HTMLImageElement> {
  image.src = url;
  try {
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function renderImageComparison(
  current: ReadyView,
  historical: ReadyView
): HTMLElement {
  const wrapper = document.createElement('section');
  wrapper.className = 'diff-view diff-view-image';

  const heading = document.createElement('div');
  heading.className = 'diff-summary';
  const label = document.createElement('strong');
  label.textContent = 'Image comparison';
  const status = document.createElement('span');
  status.textContent = 'Loading image dimensions.';
  heading.append(label, status);
  wrapper.appendChild(heading);

  if (bytesEqual(historical.content, current.content)) {
    status.textContent = 'No changed pixels or metadata bytes.';
    wrapper.appendChild(
      noChanges('No changes. These versions have identical content.')
    );
    return wrapper;
  }

  const canvas = document.createElement('div');
  canvas.className = 'image-diff-canvas';
  canvas.style.setProperty('--split', '50%');

  const before = document.createElement('img');
  before.className = 'image-diff-before';
  before.alt = `Version ${historical.version}`;

  const after = document.createElement('img');
  after.className = 'image-diff-current';
  after.alt = `Version ${current.version}`;

  const historicalUrl = URL.createObjectURL(
    new Blob([historical.content as unknown as BlobPart], {
      type: sniffImageType(historical.content),
    })
  );
  const currentUrl = URL.createObjectURL(
    new Blob([current.content as unknown as BlobPart], {
      type: sniffImageType(current.content),
    })
  );

  const beforeLabel = document.createElement('span');
  beforeLabel.className = 'image-diff-label image-diff-label-before';
  beforeLabel.textContent = `Version ${historical.version}`;
  const currentLabel = document.createElement('span');
  currentLabel.className = 'image-diff-label image-diff-label-current';
  currentLabel.textContent = `Version ${current.version}, current`;
  const divider = document.createElement('span');
  divider.className = 'image-diff-divider';
  divider.setAttribute('aria-hidden', 'true');
  canvas.append(before, after, beforeLabel, currentLabel, divider);

  const control = document.createElement('label');
  control.className = 'image-diff-control';
  const controlText = document.createElement('span');
  controlText.textContent = `Reveal version ${current.version} over version ${historical.version}`;
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '50';
  slider.setAttribute(
    'aria-label',
    `Reveal version ${current.version} over version ${historical.version}`
  );
  slider.addEventListener('input', () => {
    canvas.style.setProperty('--split', `${slider.value}%`);
  });
  control.append(controlText, slider);

  wrapper.append(canvas, control);

  void Promise.all([
    loadImage(before, historicalUrl),
    loadImage(after, currentUrl),
  ]).then(
    ([loadedBefore, loadedCurrent]) => {
      const result = createImageDiff(
        historical.content,
        current.content,
        {
          width: loadedBefore.naturalWidth,
          height: loadedBefore.naturalHeight,
        },
        {
          width: loadedCurrent.naturalWidth,
          height: loadedCurrent.naturalHeight,
        }
      );
      status.textContent = result.summary;
    },
    () => {
      wrapper.replaceChildren(
        notice(
          'One of these image versions could not be decoded by the browser.'
        )
      );
    }
  );

  return wrapper;
}

interface ComparisonScaffold {
  readonly main: HTMLElement;
  readonly result: HTMLElement;
  readonly headline: HTMLElement;
  readonly historyNote: HTMLElement;
}

/**
 * The comparison shell, and it carries no version picker of its own.
 *
 * The taskbar spans both views and now holds the version, so a second
 * selector down here would be the same choice offered twice. What is left is
 * the heading, which names both version numbers, and the result area.
 */
function buildComparisonScaffold(): ComparisonScaffold {
  const main = document.createElement('main');
  main.className = 'stage stage-diff';

  const shell = document.createElement('div');
  shell.className = 'diff-shell';

  const toolbar = document.createElement('header');
  toolbar.className = 'diff-toolbar';

  const copy = document.createElement('div');
  copy.className = 'diff-heading';
  const eyebrow = document.createElement('div');
  eyebrow.className = 'diff-eyebrow';
  eyebrow.textContent = 'Version history';
  const headline = document.createElement('h1');
  headline.tabIndex = -1;
  const historyNote = document.createElement('p');
  historyNote.className = 'diff-history-note';
  copy.append(eyebrow, headline, historyNote);
  toolbar.appendChild(copy);

  const result = document.createElement('div');
  result.className = 'diff-result';
  result.setAttribute('aria-live', 'polite');
  shell.append(toolbar, result);
  main.appendChild(shell);
  return { main, result, headline, historyNote };
}

function renderComparison(
  current: ReadyView,
  relicId: string,
  usercontentOrigin: string,
  deps: ViewerDeps,
  onClose: () => void,
  initialVersion?: number
): void {
  const scaffold = buildComparisonScaffold();
  let request = 0;

  const loadSelected = async (selectedVersion: number): Promise<void> => {
    const thisRequest = ++request;
    const copy = versionHistoryCopy(current.version, selectedVersion);
    scaffold.headline.textContent = copy.headline;
    scaffold.historyNote.textContent = copy.detail;
    scaffold.result.setAttribute('aria-busy', 'true');
    const loading = document.createElement('p');
    loading.className = 'diff-loading';
    loading.setAttribute('role', 'status');
    loading.textContent = `Loading version ${selectedVersion} for comparison.`;
    scaffold.result.replaceChildren(loading);

    const historical = await loadHistoricalVersion(
      relicId,
      selectedVersion,
      current,
      deps
    );
    if (thisRequest !== request) return;
    scaffold.result.setAttribute('aria-busy', 'false');

    if (historical.kind === 'unavailable') {
      scaffold.result.replaceChildren(notice(historical.detail));
      return;
    }

    const historicalView = historical.view;
    const mode = diffModeForRoutes(current.route, historicalView.route);
    if (mode === undefined) {
      scaffold.result.replaceChildren(
        notice(
          `Version ${selectedVersion} and version ${current.version} use ` +
            'different display modes, so Relik cannot compare them here.'
        )
      );
      return;
    }

    if (mode === 'image') {
      scaffold.result.replaceChildren(
        renderImageComparison(current, historicalView)
      );
    } else if (mode === 'code') {
      scaffold.result.replaceChildren(
        renderCodeComparison(current, historicalView)
      );
    } else {
      scaffold.result.replaceChildren(
        renderRenderedComparison(
          current,
          historicalView,
          mode,
          usercontentOrigin
        )
      );
    }
  };

  const show = (selectedVersion: number): void => {
    document.body.replaceChildren(
      buildBar(current, relicId, {
        onCompare: onClose,
        comparisonOpen: true,
        selectedVersion,
        onSelectVersion: show,
      }),
      scaffold.main
    );
    scaffold.headline.focus();
    void loadSelected(selectedVersion);
  };

  show(initialVersion ?? current.currentVersion - 1);
}

function renderReady(
  view: ReadyView,
  relicId: string,
  usercontentOrigin: string,
  deps: ViewerDeps
): void {
  const showCurrent = (): void => {
    document.body.replaceChildren(
      buildBar(view, relicId, {
        onCompare: () => showComparison(),
        // Picking a version from the taskbar while the current version is
        // open opens the comparison on that version directly, so the reader
        // does not have to press Compare and then choose again.
        onSelectVersion: showComparison,
      }),
      buildCurrentStage(view, usercontentOrigin)
    );
  };
  const showComparison = (selectedVersion?: number): void => {
    renderComparison(
      view,
      relicId,
      usercontentOrigin,
      deps,
      showCurrent,
      selectedVersion
    );
  };
  showCurrent();
}

function renderDead(dead: DeadView): void {
  const bar = document.createElement('header');
  bar.className = 'bar';
  const mark = document.createElement('div');
  mark.className = 'mark';
  mark.textContent = WORDMARK;
  bar.appendChild(mark);
  document.body.replaceChildren(bar);

  const main = document.createElement('main');
  main.className = 'stage stage-dead';

  const card = document.createElement('div');
  card.className = 'card';

  const headline = document.createElement('h1');
  headline.className = 'card-title';
  headline.textContent = dead.headline;

  const detail = document.createElement('p');
  detail.className = 'card-note';
  detail.textContent = dead.detail;

  card.append(headline, detail);

  if (dead.action === 'retry') {
    const retry = button('Try again', ICONS.rendered, () =>
      window.location.reload()
    );
    retry.classList.add('primary');
    card.appendChild(retry);
  }
  if (dead.action === 'report') {
    const link = document.createElement('a');
    link.className = 'action primary';
    link.href = `${SERVICE_ORIGIN}/abuse`;
    link.textContent = 'Contact us';
    card.appendChild(link);
  }

  const code = document.createElement('div');
  code.className = 'accession';
  code.textContent = dead.code;
  card.appendChild(code);

  main.appendChild(card);
  document.body.appendChild(main);
}

const VAULT_PREFIX = 'relic:key:';

/**
 * Keys remembered in this browser's storage for the service origin.
 *
 * Storage can be absent or refuse to write: private browsing, a quota, an
 * embedded webview, or a user who has blocked site data. None of that should
 * cost somebody the relic they are currently looking at, so every operation
 * degrades to doing nothing. The worst case is the behaviour that existed
 * before this: a reload asks for the original link.
 *
 * Entries carry their relic's expiry and are swept on every read, so storage
 * does not accumulate keys to relics that stopped existing days ago.
 */
export function localStorageKeyVault(
  storage: Storage | undefined = globalThis.localStorage,
  now: () => number = Date.now
): KeyVault {
  const read = (): Storage | undefined => {
    try {
      // Touching localStorage throws outright in some embedded contexts,
      // rather than being absent, so the guard has to be a try and not a null
      // check.
      return storage ?? undefined;
    } catch {
      return undefined;
    }
  };

  const sweep = (store: Storage): void => {
    const stale: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const name = store.key(i);
      if (name === null || !name.startsWith(VAULT_PREFIX)) continue;
      try {
        const entry = JSON.parse(store.getItem(name) ?? '') as {
          expiresAt?: number | null;
        };
        // null is how a never-expires entry is persisted; JSON has no
        // Infinity. Any other non-number is corruption, and swept.
        if (
          (entry.expiresAt !== null && typeof entry.expiresAt !== 'number') ||
          (typeof entry.expiresAt === 'number' && entry.expiresAt <= now())
        ) {
          stale.push(name);
        }
      } catch {
        // Unreadable entry. Not ours to interpret, and not worth keeping.
        stale.push(name);
      }
    }
    for (const name of stale) store.removeItem(name);
  };

  return {
    remember(relicId, fragment, expiresAt) {
      const store = read();
      if (store === undefined) return;
      // NaN stays refused: an unparsable date is corruption, not forever.
      // Infinity passes, because a relic with no lifetime is worth keeping
      // the key for until it is deleted.
      if (Number.isNaN(expiresAt) || expiresAt <= now()) return;
      try {
        store.setItem(
          `${VAULT_PREFIX}${relicId}`,
          JSON.stringify({
            fragment,
            expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
          })
        );
      } catch {
        // Quota, or storage disabled mid-session. A remembered key is a
        // convenience; failing to store one is not worth an error page.
      }
    },

    recall(relicId) {
      const store = read();
      if (store === undefined) return undefined;
      try {
        sweep(store);
        const raw = store.getItem(`${VAULT_PREFIX}${relicId}`);
        if (raw === null) return undefined;
        const entry = JSON.parse(raw) as {
          fragment?: unknown;
          expiresAt?: unknown;
        };
        if (typeof entry.fragment !== 'string') return undefined;
        if (typeof entry.expiresAt === 'number' && entry.expiresAt <= now()) {
          return undefined;
        }
        // null means never expires. Anything else that is not a number is
        // corruption, and recalls nothing.
        if (entry.expiresAt !== null && typeof entry.expiresAt !== 'number') {
          return undefined;
        }
        return entry.fragment;
      } catch {
        return undefined;
      }
    },

    forget(relicId) {
      const store = read();
      if (store === undefined) return;
      try {
        store.removeItem(`${VAULT_PREFIX}${relicId}`);
      } catch {
        // Nothing to do, and nothing worth telling the reader about.
      }
    },
  };
}

export function makeBrowserDeps(): ViewerDeps {
  return {
    serviceOrigin: SERVICE_ORIGIN,
    fetch: globalThis.fetch.bind(globalThis),
    keyVault: localStorageKeyVault(),
    takeFragment: () => window.location.hash,
    stripFragment: () => {
      // Replace the current entry with the fragment removed. The URL that
      // carried it already existed, so this shrinks the window rather than
      // closing it.
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    },
    locationHref: window.location.href,
  };
}

async function main(): Promise<void> {
  const root = document.getElementById('relic-root');
  const relicId = root?.dataset['relicId'] ?? '';
  const usercontentOrigin = root?.dataset['usercontentOrigin'] ?? '';
  const deps = makeBrowserDeps();
  const state = await load(relicId, deps);

  if (state.kind === 'ready')
    renderReady(state.view, relicId, usercontentOrigin, deps);
  else if (state.kind === 'dead') renderDead(state.dead);
}

if (typeof document !== 'undefined') {
  void main();
}
