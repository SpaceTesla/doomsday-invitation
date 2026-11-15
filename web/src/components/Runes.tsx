import { runeLine, type Inscription } from "@/lib/runes";

type RunesProps = {
  /** One of the fixed inscriptions. Anything else does not compile. */
  inscription: Inscription;
  className?: string;
};

/**
 * A line of Doomscript. Decoration only: it never carries anything a guest must read,
 * and it is hidden from assistive technology. Its height is 1em of the surrounding
 * text and its colour is the current colour.
 */
export function Runes({ inscription, className }: RunesProps) {
  const line = runeLine(inscription);
  return (
    <svg
      className={["rune-line", className].filter(Boolean).join(" ")}
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
        />
      ))}
      {line.dots.map((dot, index) => (
        <circle key={`dot-${index}`} cx={dot.cx} cy={dot.cy} r={dot.r} />
      ))}
    </svg>
  );
}
