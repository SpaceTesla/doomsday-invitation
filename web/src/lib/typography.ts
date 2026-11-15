// The typography rules that code can enforce. See design/DESIGN.md, section 2.2.

/** Pirata One draws V as U and v as o, so it must never set a word containing either. */
export function wordNeedsSerif(word: string): boolean {
  return /v/i.test(word);
}

export type HeadingPart = { text: string; face: "display" | "serif" };

/**
 * Split a heading into runs by face. The heading stays a Pirata One heading; only an
 * individual word containing V or v is handed to Cinzel. Spaces stay with the display
 * runs, so word spacing is the heading's own.
 */
export function splitHeading(text: string): HeadingPart[] {
  const parts: HeadingPart[] = [];
  for (const token of text.split(/(\s+)/)) {
    if (token === "") continue;
    const face = !/^\s+$/.test(token) && wordNeedsSerif(token) ? "serif" : "display";
    const last = parts[parts.length - 1];
    if (last && last.face === face && face === "display") {
      last.text += token;
    } else {
      parts.push({ text: token, face });
    }
  }
  return parts;
}

/** Words in a heading that Pirata One cannot set. Empty for every approved heading. */
export function wordsNeedingSerif(text: string): string[] {
  return splitHeading(text)
    .filter((part) => part.face === "serif")
    .map((part) => part.text);
}

/**
 * Orbitron sets short labels in capitals: four words at most, no numerals (its 7 and 0
 * misread), and no accented letters (it has none). Names never go in a label; that part
 * of the rule is kept by passing only fixed copy to Label.
 */
export function labelProblems(text: string): string[] {
  const problems: string[] = [];
  if (/\d/.test(text)) problems.push("contains a numeral");
  if (text.trim().split(/\s+/).length > 4) problems.push("is longer than four words");
  if (/[^\x20-\x7E]/.test(text)) problems.push("contains a character Orbitron lacks");
  return problems;
}

export type LabelPart = { text: string; face: "tech" | "serif" };

/** Runs of a label by face: numerals, if any slip through, are set in Cinzel. */
export function splitLabel(text: string): LabelPart[] {
  return text
    .split(/(\d+)/)
    .filter((token) => token !== "")
    .map((token) => ({ text: token, face: /^\d+$/.test(token) ? "serif" : "tech" }));
}
