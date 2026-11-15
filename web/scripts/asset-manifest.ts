// The approved assets the application ships, and where each comes from.
// Source paths are relative to the project root; see design/DESIGN.md, section 9.
//
// Figure layers come from assets/v4 ONLY. The folders v2 and v3 hold older figures
// under the same file names. Nothing under references/ is ever listed here.

export type AssetEntry = { from: string; to: string };

const ASSETS = "design/explorations/assets";

const opening = (layout: "d" | "p"): AssetEntry[] => [
  { from: `${ASSETS}/v2/hero-${layout}-sky.jpg`, to: `public/art/hero-${layout}-sky.jpg` },
  {
    from: `${ASSETS}/v4/hero-${layout}-figure-dark.webp`,
    to: `public/art/hero-${layout}-figure-dark.webp`,
  },
  {
    from: `${ASSETS}/v4/hero-${layout}-figure-lit.webp`,
    to: `public/art/hero-${layout}-figure-lit.webp`,
  },
  { from: `${ASSETS}/v2/hero-${layout}-haze.webp`, to: `public/art/hero-${layout}-haze.webp` },
  { from: `${ASSETS}/v2/hero-${layout}-bokeh.webp`, to: `public/art/hero-${layout}-bokeh.webp` },
  ...(["top", "left", "right", "bottom"] as const).map((side) => ({
    from: `${ASSETS}/v2/hero-${layout}-rock-${side}.webp`,
    to: `public/art/hero-${layout}-rock-${side}.webp`,
  })),
  { from: `${ASSETS}/v4/hero-${layout}-layout.json`, to: `src/data/hero-${layout}-layout.json` },
];

export const assets: AssetEntry[] = [
  ...opening("d"),
  ...opening("p"),
  { from: `${ASSETS}/v2/hero-dust.webp`, to: "public/art/hero-dust.webp" },

  { from: `${ASSETS}/v2/hall-d-plate.jpg`, to: "public/art/hall-d-plate.jpg" },
  { from: `${ASSETS}/v2/hall-p-plate.jpg`, to: "public/art/hall-p-plate.jpg" },
  { from: `${ASSETS}/v2/hall-d-doom.webp`, to: "public/art/hall-d-doom.webp" },
  { from: `${ASSETS}/v2/hall-p-doom.webp`, to: "public/art/hall-p-doom.webp" },

  { from: `${ASSETS}/doomscript-glyphs.json`, to: "src/data/doomscript-glyphs.json" },
  { from: `${ASSETS}/iron-throne-seal.svg`, to: "public/icons/iron-throne-seal.svg" },
  { from: `${ASSETS}/v2/mask-level-1.svg`, to: "public/icons/mask-level-1.svg" },
  { from: `${ASSETS}/v2/mask-level-2.svg`, to: "public/icons/mask-level-2.svg" },
  { from: `${ASSETS}/v2/suit-rune-level-1.svg`, to: "public/icons/suit-rune-level-1.svg" },
  { from: `${ASSETS}/v2/suit-rune-level-2.svg`, to: "public/icons/suit-rune-level-2.svg" },
];

// The four approved families, as Latin-subset WOFF2 files from the @fontsource
// packages (SIL Open Font License 1.1). Paths are relative to web/.
const font = (pkg: string, file: string): AssetEntry => ({
  from: `node_modules/@fontsource/${pkg}/files/${file}`,
  to: `src/fonts/${file}`,
});
const licence = (pkg: string): AssetEntry => ({
  from: `node_modules/@fontsource/${pkg}/LICENSE`,
  to: `src/fonts/LICENSE-${pkg}.txt`,
});

export const fonts: AssetEntry[] = [
  font("pirata-one", "pirata-one-latin-400-normal.woff2"),
  font("cinzel", "cinzel-latin-500-normal.woff2"),
  font("orbitron", "orbitron-latin-600-normal.woff2"),
  font("cormorant-garamond", "cormorant-garamond-latin-500-normal.woff2"),
  font("cormorant-garamond", "cormorant-garamond-latin-500-italic.woff2"),
  font("cormorant-garamond", "cormorant-garamond-latin-700-normal.woff2"),
  font("cormorant-garamond", "cormorant-garamond-latin-700-italic.woff2"),
  licence("pirata-one"),
  licence("cinzel"),
  licence("orbitron"),
  licence("cormorant-garamond"),
];
