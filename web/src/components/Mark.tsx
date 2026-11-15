import { cuirassTileEmpty } from "@/marks/cuirassTileEmpty";
import { maskLevel1 } from "@/marks/maskLevel1";
import { sealMark } from "@/marks/sealMark";
import { suitRuneLevel1 } from "@/marks/suitRuneLevel1";
import { suitRuneLevel2 } from "@/marks/suitRuneLevel2";
import type { MarkData } from "@/marks/types";

// The marks. Their geometry is exported from the approved board generator
// (scripts/export-marks.py) and is final: these components place and colour it,
// and never redraw it. Every mark is decoration and hidden from assistive technology;
// a status is always given by a word as well. The small marks live here; the mask
// insignia (MaskInsignia.tsx) and the seal (Seal.tsx) have files of their own, so their
// large drawings reach a page's script only where they are used.

export type MarkTone = "steel" | "silver" | "gold" | "emerald" | "dim";

export type MarkProps = { tone?: MarkTone; className?: string };

export function classes(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

export function InlineMark({
  data,
  paint,
  tone,
  className,
}: MarkProps & { data: MarkData; paint: "stroke" | "fill" | "own" }) {
  return (
    <svg
      className={classes(
        "mk",
        paint !== "own" && `mk--${paint}`,
        tone && tone !== "steel" && `mk--${tone}`,
        className,
      )}
      viewBox={data.viewBox}
      aria-hidden="true"
      focusable="false"
      // Trusted, build-time markup from src/marks/. Never user input.
      dangerouslySetInnerHTML={{ __html: data.body }}
    />
  );
}

/** The seal reduced to an icon. It sits on every primary button. */
export function SealMark(props: MarkProps) {
  return <InlineMark data={sealMark} paint="stroke" {...props} />;
}

/** The mask at level 1: the icon, 16 to 32 px. The insignia is MaskInsignia. */
export function Mask(props: MarkProps) {
  return <InlineMark data={maskLevel1} paint="fill" {...props} />;
}

/** The suit rune. A mark, never a letter, and unrelated to Doomscript. */
export function SuitRune({ level = 1, ...props }: MarkProps & { level?: 1 | 2 }) {
  return <InlineMark data={level === 1 ? suitRuneLevel1 : suitRuneLevel2} paint="own" {...props} />;
}

/** The empty cuirass tile: the mark of a seat declined. */
export function CuirassTile(props: MarkProps) {
  return <InlineMark data={cuirassTileEmpty} paint="stroke" {...props} />;
}
