// The approved rule for long names (design/DESIGN.md, section 2.2):
// wrap at spaces and hyphens first; when the name takes two lines, apply the approved
// fit; step down to 80% only when a single word is still too wide; never smaller.
// If the screen still does not hold everything, the page scrolls.

export type Fit = "two-lines" | "step" | null;

/** Lines a block of text occupies, from its height and line height. */
export function linesOf(height: number, lineHeight: number): number {
  return lineHeight > 0 ? Math.round(height / lineHeight) : 1;
}

/** Decide the fit from measurements alone, so the rule can be tested without a browser. */
export function decideFit(lines: number, overflowsWidth: boolean): Fit {
  if (overflowsWidth) return "step";
  if (lines >= 2) return "two-lines";
  return null;
}

/** Measure a rendered name and decide its fit. */
export function fitOf(element: HTMLElement): Fit {
  const style = getComputedStyle(element);
  const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.1;
  const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const lines = linesOf(element.clientHeight - padding, lineHeight);
  const overflows = element.scrollWidth > element.clientWidth + 1;
  return decideFit(lines, overflows);
}
