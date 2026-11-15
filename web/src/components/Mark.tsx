import {
  CLIP_WAKE_PATH,
  cuirassTileEmpty,
  maskLevel1,
  maskLevel2,
  maskLevel2Plain,
  sealActive,
  sealDormant,
  sealMark,
  sealWaking,
  suitRuneLevel1,
  suitRuneLevel2,
  type MarkData,
} from "@/marks/generated";

// The marks. Their geometry is exported from the approved board generator
// (scripts/export-marks.py) and is final: these components place and colour it,
// and never redraw it. Every mark is decoration and hidden from assistive technology;
// a status is always given by a word as well.

export type MarkTone = "steel" | "silver" | "gold" | "emerald" | "dim";

type MarkProps = { tone?: MarkTone; className?: string };

function classes(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

function InlineMark({
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
      // Trusted, build-time markup from src/marks/generated.ts. Never user input.
      dangerouslySetInnerHTML={{ __html: data.body }}
    />
  );
}

/** The seal reduced to an icon. It sits on every primary button. */
export function SealMark(props: MarkProps) {
  return <InlineMark data={sealMark} paint="stroke" {...props} />;
}

/**
 * The mask. Level 1 is the icon (16 to 32 px); level 2 is the line insignia, and
 * below 80 px it is drawn without rivets and with heavier lines ("plain").
 */
export function Mask({
  level = 1,
  plain = false,
  ...props
}: MarkProps & { level?: 1 | 2; plain?: boolean }) {
  if (level === 1) return <InlineMark data={maskLevel1} paint="fill" {...props} />;
  return <InlineMark data={plain ? maskLevel2Plain : maskLevel2} paint="own" {...props} />;
}

/** The suit rune. A mark, never a letter, and unrelated to Doomscript. */
export function SuitRune({ level = 1, ...props }: MarkProps & { level?: 1 | 2 }) {
  return <InlineMark data={level === 1 ? suitRuneLevel1 : suitRuneLevel2} paint="own" {...props} />;
}

/** The empty cuirass tile: the mark of a seat declined. */
export function CuirassTile(props: MarkProps) {
  return <InlineMark data={cuirassTileEmpty} paint="stroke" {...props} />;
}

export type SealState = "dormant" | "waking" | "active";

const seals: Record<SealState, MarkData> = {
  dormant: sealDormant,
  waking: sealWaking,
  active: sealActive,
};

/** The three-band seal: gold for sovereignty, steel for science, emerald for sorcery. */
export function Seal({ state = "active", className }: { state?: SealState; className?: string }) {
  const data = seals[state];
  const defs =
    state === "waking"
      ? `<defs><clipPath id="clip-wake"><path d="${CLIP_WAKE_PATH}"/></clipPath></defs>`
      : "";
  return (
    <svg
      className={classes("seal-svg", className)}
      viewBox={data.viewBox}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: defs + data.body }}
    />
  );
}
