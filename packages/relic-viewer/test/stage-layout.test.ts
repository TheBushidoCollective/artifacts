import { describe, expect, test } from 'bun:test';

/**
 * The stage holds exactly one scroll container.
 *
 * Rendered geometry belongs in a browser and is checked there. What is
 * checkable here is the mechanism, and the mechanism is what failed: a frame
 * sized `calc(100vh - var(--bar-height))` has to guess the taskbar to the
 * pixel. `.bar` carries a min-height rather than a height, so the guess is
 * wrong at most widths, the frame ends up taller than the row, and the row
 * grows a second scrollbar beside the iframe's own.
 *
 * A viewport reserve cannot be measured from a stylesheet, but it can be
 * refused, which is what this file does.
 */
function stageLayoutFaults(source: string): readonly string[] {
  // Comments first, or the checker reads prose. This file's own explanation of
  // the defect quotes the `calc()` it replaced, which tripped it against the
  // fixed stylesheet the first time it ran.
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const faults: string[] = [];
  const rule = (selector: string): string => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return (
      new RegExp(`${escaped}\\s*(,[^{]*)?\\{([^}]*)\\}`).exec(css)?.[2] ?? ''
    );
  };

  const stage = rule('.stage-sandboxed-html');
  const frame = rule('.stage-sandboxed-html .usercontent-frame');

  if (/calc\(\s*100[vd]h/.test(frame)) {
    faults.push('the frame guesses the chrome height with a viewport reserve');
  }
  if (!/flex:\s*1/.test(frame)) {
    faults.push('the frame does not absorb the leftover row height');
  }
  if (!/min-height:\s*0/.test(frame)) {
    faults.push("the frame's automatic minimum can still overflow the row");
  }
  if (!/height:\s*100%/.test(stage)) {
    faults.push('the stage has no definite height for the frame to fill');
  }
  if (!/display:\s*flex/.test(stage)) {
    faults.push('the stage cannot distribute height to the frame');
  }
  return faults;
}
describe('the sandboxed stage', () => {
  test('nothing sizes itself by subtracting the chrome', async () => {
    // The class, not the instance. Two rules guessed the taskbar height, and
    // the second one was dead code that nothing ever read, which is exactly
    // how the first one survived review.
    const css = (
      await Bun.file(new URL('../src/styles.css', import.meta.url)).text()
    ).replace(/\/\*[\s\S]*?\*\//g, '');

    const reserves = [...css.matchAll(/calc\([^)]*100[vd]h[^)]*-[^)]*\)/g)].map(
      (match) => match[0]
    );
    expect(reserves).toEqual([]);
  });

  test('fills the row instead of guessing at the chrome', async () => {
    const css = await Bun.file(
      new URL('../src/styles.css', import.meta.url)
    ).text();
    expect(stageLayoutFaults(css)).toEqual([]);
  });

  test('the check names every fault in the CSS that shipped', () => {
    // Verbatim shape of the rules that produced the double scrollbar, so the
    // check is proven against the real defect rather than a strawman.
    const shipped = `
      .stage-sandboxed-html,
      .stage-sandboxed-jsx {
        padding: 0;
      }
      .stage-sandboxed-html .usercontent-frame,
      .stage-sandboxed-jsx .usercontent-frame {
        display: block;
        height: calc(100vh - var(--bar-height));
        border: 0;
      }
    `;
    expect(stageLayoutFaults(shipped)).toEqual([
      'the frame guesses the chrome height with a viewport reserve',
      'the frame does not absorb the leftover row height',
      "the frame's automatic minimum can still overflow the row",
      'the stage has no definite height for the frame to fill',
      'the stage cannot distribute height to the frame',
    ]);
  });

  test('the row is the only vertical scroller above the frame', async () => {
    const css = await Bun.file(
      new URL('../src/styles.css', import.meta.url)
    ).text();

    // `.stage-wrap` scrolls, which is correct: markdown and code are longer
    // than the row. What must not come back is a second scroller between it
    // and the frame, which is what the tray round briefly introduced.
    expect(/\.stage-wrap\s*\{[^}]*overflow:\s*auto/.test(css)).toBe(true);
    expect(/\.stage-wrap\s*>\s*\.stage\s*\{[^}]*overflow/.test(css)).toBe(
      false
    );
  });
});
