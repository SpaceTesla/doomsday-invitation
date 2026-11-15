import { labelProblems, splitLabel } from "@/lib/typography";

type LabelProps = {
  /** Fixed copy from src/copy. Never a guest's or a character's name. */
  children: string;
  /** Render as a block above a list or a field. */
  block?: boolean;
  className?: string;
};

/**
 * A short label in Orbitron capitals: status words, tags, button and control labels.
 *
 * Orbitron never sets a numeral or a name. In development a label that breaks the rule
 * throws, so it is caught before it ships. In production a stray numeral is set in
 * Cinzel instead, which is the approved face for every figure.
 */
export function Label({ children, block = false, className }: LabelProps) {
  const problems = labelProblems(children);
  if (problems.length > 0 && process.env.NODE_ENV !== "production") {
    throw new Error(
      `Label "${children}" ${problems.join(" and ")}. See design/DESIGN.md, section 2.2.`,
    );
  }

  return (
    <span className={["lbl", block && "lbl--block", className].filter(Boolean).join(" ")}>
      {splitLabel(children).map((part, index) =>
        part.face === "serif" ? (
          <span key={index} className="fig">
            {part.text}
          </span>
        ) : (
          part.text
        ),
      )}
    </span>
  );
}
