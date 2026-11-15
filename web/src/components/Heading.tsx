import type { ElementType } from "react";
import { splitHeading } from "@/lib/typography";

type HeadingProps = {
  /** The heading's text, from src/copy. Plain text only. */
  children: string;
  /** The element to render. Choose it for the document outline, not for size. */
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  /** "title" is the council title; "heading" is a panel or screen heading. */
  size?: "title" | "heading";
  className?: string;
  id?: string;
};

/**
 * A display heading in Pirata One.
 *
 * Pirata One must never render an individual word containing V or v (it draws them as
 * U and o). The heading is not handed to Cinzel as a whole when that happens: only the
 * affected word is, at the approved pairing of the two faces, and the heading keeps its
 * size, colour and place in the hierarchy.
 *
 * The copy deck was written so that no approved heading contains such a word, and a
 * test keeps it so. The fallback is a guard, and it says so in development.
 */
export function Heading({ children, as = "h2", size = "heading", className, id }: HeadingProps) {
  const Tag: ElementType = as;
  const parts = splitHeading(children);

  if (process.env.NODE_ENV !== "production") {
    const affected = parts.filter((part) => part.face === "serif").map((part) => part.text);
    if (affected.length > 0) {
      console.warn(
        `Heading "${children}": Pirata One cannot set ${affected.map((word) => `"${word}"`).join(", ")}. ` +
          "Set in Cinzel for now; reword the heading without a V.",
      );
    }
  }

  return (
    <Tag
      id={id}
      className={["hd", size === "title" && "hd--title", className].filter(Boolean).join(" ")}
    >
      {parts.map((part, index) =>
        part.face === "serif" ? (
          <span key={index} className="hd-serif">
            {part.text}
          </span>
        ) : (
          part.text
        ),
      )}
    </Tag>
  );
}
