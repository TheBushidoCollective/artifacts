import { describe, expect, test } from 'bun:test';
import { isComponentSource, transpileJsx } from '../src/jsx.ts';

const COMPONENT = `export default function App() {
  return <div className="hero">Hello</div>;
}`;

const TSX_COMPONENT = `type Props = { name: string };
export default function App({ name }: Props) {
  return <h1>{name}</h1>;
}`;

describe('transpileJsx', () => {
  test('turns JSX into createElement calls and leaves no JSX behind', () => {
    const output = transpileJsx(COMPONENT, 'App.jsx');
    expect(output).toContain('React.createElement');
    expect(output).toContain('"Hello"');
    expect(output).not.toContain('<div');
  });

  test('emits classic runtime, because the frame supplies one React binding', () => {
    // The frame binds its bundled React as a global for the module to see;
    // an automatic-runtime import of `react/jsx-runtime` would be a bare
    // specifier that nothing inside an opaque-origin frame can resolve.
    const output = transpileJsx(COMPONENT, 'App.jsx');
    expect(output).not.toContain('jsx-runtime');
    expect(output).not.toContain('require(');
  });

  test('strips TypeScript syntax for a .tsx source', () => {
    const output = transpileJsx(TSX_COMPONENT, 'App.tsx');
    expect(output).toContain('React.createElement');
    expect(output).not.toContain(': string');
    expect(output).not.toContain('type Props');
  });

  test('the dialect follows the extension: TS syntax under a .jsx name throws', () => {
    expect(() => transpileJsx(TSX_COMPONENT, 'App.jsx')).toThrow();
  });

  test('throws on prose, which is how routing tells it from a component', () => {
    expect(() => transpileJsx('just some prose here', 'App.jsx')).toThrow();
  });

  test('transforms without evaluating: side effects in the source never run', () => {
    const probe = globalThis as { __relicTranspileProbe?: boolean };
    probe.__relicTranspileProbe = false;
    transpileJsx(
      'globalThis.__relicTranspileProbe = true;\nexport default null;',
      'App.jsx'
    );
    expect(probe.__relicTranspileProbe).toBe(false);
  });

  test('transforms without evaluating: a top-level throw stays text', () => {
    // If the service origin ever ran the source, this would raise. The
    // transform is a compiler, so it does not.
    const source = 'throw new Error("executed");\nexport default null;';
    expect(() => transpileJsx(source, 'App.jsx')).not.toThrow();
  });

  test('production output carries no dev-mode source decoration', () => {
    expect(transpileJsx(COMPONENT, 'App.jsx')).not.toContain('__source');
  });
});

describe('isComponentSource', () => {
  test('accepts a component module', () => {
    expect(isComponentSource(COMPONENT, 'App.jsx')).toBe(true);
  });

  test('accepts a TypeScript component under its own extension', () => {
    expect(isComponentSource(TSX_COMPONENT, 'App.tsx')).toBe(true);
  });

  test('rejects prose wearing a component name', () => {
    expect(isComponentSource('just some prose here', 'App.jsx')).toBe(false);
  });

  test('rejects parseable code with nothing mountable to export', () => {
    // The frame would import the module, run its side effects, and have
    // nothing to render, so the default export is part of the sniff.
    expect(isComponentSource('console.log("hi");', 'App.jsx')).toBe(false);
  });

  test('rejects TSX syntax presented as .jsx', () => {
    expect(isComponentSource(TSX_COMPONENT, 'App.jsx')).toBe(false);
  });
});
