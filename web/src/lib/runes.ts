// Doomscript: laying out a line of runes from the approved glyph data.
//
// The glyphs are traced from a fan-made decoder and are a fan interpretation, not
// confirmed by Marvel. They are decoration: an inscription never carries information
// and is hidden from assistive technology. See design/DESIGN.md, section 4.1.
import glyphFile from "@/data/doomscript-glyphs.json";

type Glyph = { advance: number; path: string };
const glyphs = glyphFile.glyphs as Record<string, Glyph>;

/** The only inscriptions in use. Guest names are never written in runes. */
export const INSCRIPTIONS = [
  "there is no promise of tomorro",
  "to the viktor go the spoils",
  "justice",
  "revenge",
  "viktor von doom",
  "latveria",
] as const;

export type Inscription = (typeof INSCRIPTIONS)[number];

/** One rune per letter. Hard C, K and Q share the K rune; soft C is written "c". */
const LETTERS: Record<string, string> = Object.fromEntries(
  [..."acdefghijlmnoprstuv"].map((letter) => [letter, letter]),
);
LETTERS.k = "k";
LETTERS.q = "k";

/** The script has no rune for these. They are never invented. */
const MISSING = new Set([..."bwxyz"]);

const SPACE_ADVANCE = 46;
const GLYPH_HEIGHT = 100;

export type RuneGlyph = { key: string; x: number; path: string };
export type RuneDot = { cx: number; cy: number; r: number };
export type RuneLine = { width: number; height: number; glyphs: RuneGlyph[]; dots: RuneDot[] };

/**
 * A straight line of runes in a box `width` by 100 units.
 * Throws on any letter the script lacks, so such text can never reach the screen.
 */
export function runeLine(text: string, gap = 0.28): RuneLine {
  const sequence: { key: string; advance: number }[] = [];
  for (const character of text.toLowerCase()) {
    if (character === " ") {
      sequence.push({ key: "space", advance: SPACE_ADVANCE });
    } else if (character === ".") {
      sequence.push({ key: "dot", advance: SPACE_ADVANCE });
    } else if (MISSING.has(character) || !(character in LETTERS)) {
      throw new Error(`Doomscript has no rune for "${character}" in "${text}".`);
    } else {
      const key = LETTERS[character];
      sequence.push({ key, advance: glyphs[key].advance });
    }
  }

  const gapUnits = gap * GLYPH_HEIGHT;
  const line: RuneLine = { width: 0, height: GLYPH_HEIGHT, glyphs: [], dots: [] };
  let x = 0;
  for (const item of sequence) {
    if (item.key === "dot") {
      line.dots.push({ cx: x + item.advance / 2, cy: GLYPH_HEIGHT / 2, r: GLYPH_HEIGHT * 0.07 });
    } else if (item.key !== "space") {
      line.glyphs.push({ key: item.key, x, path: glyphs[item.key].path });
    }
    x += item.advance + gapUnits;
  }
  line.width = sequence.length > 0 ? x - gapUnits : 0;
  return line;
}
