import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { MAX_DIFF_BYTES } from '../src/diff.ts';
import {
  buildBar,
  buildCurrentStage,
  renderTextComparison,
} from '../src/main.ts';
import type { ReadyView } from '../src/viewer.ts';

class ElementStub {
  readonly tagName: string;
  className = '';
  textContent = '';
  innerHTML = '';
  hidden = false;
  readonly children: ElementStub[] = [];
  readonly attributes = new Map<string, string>();
  readonly classList = {
    add: (name: string): void => {
      this.className = `${this.className} ${name}`.trim();
    },
  };

  constructor(tag: string) {
    this.tagName = tag.toUpperCase();
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  appendChild(child: ElementStub): ElementStub {
    this.children.push(child);
    return child;
  }

  append(...children: ElementStub[]): void {
    this.children.push(...children);
  }

  replaceChildren(...children: ElementStub[]): void {
    this.children.splice(0, this.children.length, ...children);
  }

  addEventListener(): void {}
}

const encoder = new TextEncoder();

function view(
  route: ReadyView['route'],
  version: number,
  content: Uint8Array = encoder.encode('const current = true;\n')
): ReadyView {
  return {
    filename: route === 'download' ? 'archive.zip' : 'notes.ts',
    declaredMimetype:
      route === 'download' ? 'application/zip' : 'text/typescript',
    content,
    route,
    downgradeNotice: undefined,
    shareUrl: 'https://relik.example/aaaaaaaaaaaaaaaaaaaaaaaaaa#key',
    version,
    currentVersion: version,
  };
}

function textOf(element: ElementStub): string {
  return [element.textContent, ...element.children.map(textOf)].join(' ');
}

function descendants(element: ElementStub): ElementStub[] {
  return [element, ...element.children.flatMap(descendants)];
}

describe('version comparison affordance', () => {
  beforeEach(() => {
    (globalThis as { document?: unknown }).document = {
      createElement: (tag: string) => new ElementStub(tag),
      createElementNS: (_namespace: string, tag: string) =>
        new ElementStub(tag),
    };
    (globalThis as { window?: unknown }).window = {
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

  afterEach(() => {
    delete (globalThis as { document?: unknown }).document;
    delete (globalThis as { window?: unknown }).window;
  });

  test('version 1 shows no comparison affordance at all', () => {
    const bar = buildBar(view('code', 1), 'aaaaaaaaaaaaaaaaaaaaaaaaaa', {
      onCompare: () => {},
    }) as unknown as ElementStub;

    const buttons = descendants(bar).filter(
      (element) => element.tagName === 'BUTTON'
    );
    expect(buttons.map(textOf).join(' ')).not.toContain('Compare versions');
  });

  test('version 2 or higher offers comparison', () => {
    const bar = buildBar(view('code', 2), 'aaaaaaaaaaaaaaaaaaaaaaaaaa', {
      onCompare: () => {},
    }) as unknown as ElementStub;

    const buttons = descendants(bar).filter(
      (element) => element.tagName === 'BUTTON'
    );
    expect(buttons.map(textOf).join(' ')).toContain('Compare versions');
  });

  test('download-only history states why it cannot compare and keeps the download view', () => {
    const current = view('download', 3);
    const bar = buildBar(current, 'aaaaaaaaaaaaaaaaaaaaaaaaaa', {
      onCompare: () => {},
    }) as unknown as ElementStub;
    const stage = buildCurrentStage(
      current,
      'https://relik-usercontent.example'
    ) as unknown as ElementStub;

    expect(textOf(bar)).not.toContain('Compare versions');
    expect(textOf(stage)).toContain('download-only');
    expect(
      descendants(stage).some(
        (element) => element.className === 'doc doc-download'
      )
    ).toBe(true);
  });

  test('oversized history states the ceiling and keeps rendering current code', () => {
    const current = view('code', 3, new Uint8Array(MAX_DIFF_BYTES + 1));
    const bar = buildBar(current, 'aaaaaaaaaaaaaaaaaaaaaaaaaa', {
      onCompare: () => {},
    }) as unknown as ElementStub;
    const stage = buildCurrentStage(
      current,
      'https://relik-usercontent.example'
    ) as unknown as ElementStub;

    expect(textOf(bar)).not.toContain('Compare versions');
    expect(textOf(stage)).toContain('4 MiB');
    expect(
      descendants(stage).some((element) => element.className === 'code')
    ).toBe(true);
  });

  test('html source diff stays in text nodes and never creates a frame', () => {
    const collector = 'https://collector.invalid/diff-probe';
    const historical = {
      ...view(
        'sandboxed-html',
        2,
        encoder.encode(
          `<img src="${collector}"><script>fetch('${collector}')</script>`
        )
      ),
      currentVersion: 5,
    };
    const current = view(
      'sandboxed-html',
      5,
      encoder.encode('<p>Current version</p>')
    );

    const comparison = renderTextComparison(
      current,
      historical,
      'source'
    ) as unknown as ElementStub;

    expect(textOf(comparison)).toContain(collector);
    expect(
      descendants(comparison).some((element) => element.tagName === 'IFRAME')
    ).toBe(false);
  });
});
