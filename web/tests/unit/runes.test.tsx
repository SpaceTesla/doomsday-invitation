import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Runes } from "@/components/Runes";
import { INSCRIPTIONS, runeLine } from "@/lib/runes";

// Line widths computed by the approved board generator (art.runes_width, size 100).
// The application must lay the same glyphs out the same way.
const generatorWidths: Record<(typeof INSCRIPTIONS)[number], number> = {
  "viktor von doom": 1260.4,
  latveria: 690.0,
  "there is no promise of tomorro": 2432.6,
  "to the viktor go the spoils": 2283.0,
  justice: 643.5,
  revenge: 581.9,
};

describe("Doomscript", () => {
  it("lays out every approved inscription exactly as the board generator does", () => {
    for (const inscription of INSCRIPTIONS) {
      expect(runeLine(inscription).width).toBeCloseTo(generatorWidths[inscription], 1);
    }
  });

  it("places each rune where the generator places it", () => {
    const xs = runeLine("latveria").glyphs.map((glyph) => Number(glyph.x.toFixed(2)));
    expect(xs).toEqual([0, 113.8, 205.7, 296.6, 384.0, 463.6, 546.5, 626.1]);
  });

  it("writes hard C, K and Q with the one K rune", () => {
    const keys = (text: string) => runeLine(text).glyphs.map((glyph) => glyph.key);
    expect(keys("kq")).toEqual(["k", "k"]);
  });

  it("refuses every letter the script lacks, and anything that is not a letter", () => {
    for (const letter of ["b", "w", "x", "y", "z", "7", "é", "-"]) {
      expect(() => runeLine(`doom${letter}`), letter).toThrow(/no rune/);
    }
    expect(() => runeLine("tomorrow")).toThrow(/no rune for "w"/);
  });

  it("is hidden from assistive technology", () => {
    const html = renderToStaticMarkup(<Runes inscription="latveria" />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('class="rune-line"');
    expect(html.match(/<path /g)).toHaveLength(8);
  });
});
