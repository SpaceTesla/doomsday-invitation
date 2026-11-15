import localFont from "next/font/local";

// The four approved families ("Two: Doomsday"), self-hosted. No request leaves our origin.
// Each exposes a CSS variable; tokens.css assigns them to the four roles, so changing
// a face later is a change of one value there. See design/DESIGN.md, section 2.2.

export const pirataOne = localFont({
  src: "../fonts/pirata-one-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  variable: "--ff-pirata",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

// The name font: the one face the first scene cannot do without, so the only one preloaded.
export const cinzel = localFont({
  src: "../fonts/cinzel-latin-500-normal.woff2",
  weight: "500",
  style: "normal",
  variable: "--ff-cinzel",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
});

export const orbitron = localFont({
  src: "../fonts/orbitron-latin-600-normal.woff2",
  weight: "600",
  style: "normal",
  variable: "--ff-orbitron",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

export const cormorantGaramond = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/cormorant-garamond-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--ff-cormorant",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

export const fontVariables = [
  pirataOne.variable,
  cinzel.variable,
  orbitron.variable,
  cormorantGaramond.variable,
].join(" ");
