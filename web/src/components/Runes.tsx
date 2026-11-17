import type { CSSProperties } from "react";
import { runeLine, type Inscription } from "@/lib/runes";

type RunesProps = {
  /** One of the fixed inscriptions. Anything else does not compile. */
  inscription: Inscription;
  className?: string;
  /**
   * Engraved runes stay dark steel; lit runes are Emerald light, and mean a state has been
   * reached (design/DESIGN.md, 4.1 rule 4). Leave unset for the plain current-colour line.
   */
  state?: "engraved" | "lit";
  /** Light the runes one after another, in reading order, from engraved to lit. */
  sequence?: boolean;
  /** With `sequence`: seconds before the first rune lights. */
  delay?: number;
};

/** Seconds between one rune lighting and the next (design/DESIGN.md, 6.6). */
export const RUNE_STEP = 0.075;

/**
 * A line of Doomscript. Decoration only: it never carries anything a guest must read,
 * and it is hidden from assistive technology. Its height is 1em of the surrounding
 * text and its colour is the current colour, unless it is engraved or lit.
 */
export function Runes({ inscription, className, state, sequence = false, delay = 0 }: RunesProps) {
  const line = runeLine(inscription);
  const classes = [
    "rune-line",
    state && `rune-line--${state}`,
    state === "lit" && sequence && "rune-line--lighting",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <svg
      className={classes}
      viewBox={`0 0 ${line.width.toFixed(1)} ${line.height}`}
      aria-hidden="true"
      focusable="false"
    >
      {line.glyphs.map((glyph, index) => (
        <path
          key={index}
          d={glyph.path}
          fillRule="evenodd"
          transform={`translate(${glyph.x.toFixed(2)},0)`}
          style={
            sequence
              ? ({ animationDelay: `${(delay + index * RUNE_STEP).toFixed(3)}s` } as CSSProperties)
              : undefined
          }
        />
      ))}
      {line.dots.map((dot, index) => (
        <circle key={`dot-${index}`} cx={dot.cx} cy={dot.cy} r={dot.r} />
      ))}
    </svg>
  );
}

/**
 * The rune band of design/DESIGN.md, 2.4: an inscription between a dotted line and a rule,
 * engraved into the top of a principal panel. It lights when its state is reached.
 */
export function RuneBand(props: Omit<RunesProps, "className">) {
  return (
    <div className="rune-band" aria-hidden="true">
      <span className="rune-band-dots" />
      <Runes {...props} />
      <span className="rune-band-rule" />
    </div>
  );
}
