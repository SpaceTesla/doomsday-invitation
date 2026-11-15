import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { copy, displayHeadings } from "@/copy";
import { labelProblems, splitHeading, wordsNeedingSerif } from "@/lib/typography";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Pirata One never sets a word containing V or v", () => {
  it("hands only the affected word to Cinzel, and leaves its neighbours in Pirata One", () => {
    expect(splitHeading("Leave the council")).toEqual([
      { text: "Leave", face: "serif" },
      { text: " the council", face: "display" },
    ]);
    expect(splitHeading("The Victor decrees")).toEqual([
      { text: "The ", face: "display" },
      { text: "Victor", face: "serif" },
      { text: " decrees", face: "display" },
    ]);
  });

  it("catches both cases of the letter, and words with punctuation attached", () => {
    expect(wordsNeedingSerif("Victor von Doom")).toEqual(["Victor", "von"]);
    expect(wordsNeedingSerif("Who will leave?")).toEqual(["leave?"]);
  });

  it("leaves a heading without a V whole", () => {
    expect(splitHeading("Council of Doom")).toEqual([{ text: "Council of Doom", face: "display" }]);
  });

  it("renders the heading as a display heading with one Cinzel word inside it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const html = renderToStaticMarkup(<Heading as="h2">Leave the council</Heading>);

    // Still one heading, still the display class: the hierarchy is unchanged.
    expect(html).toBe('<h2 class="hd"><span class="hd-serif">Leave</span> the council</h2>');
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('"Leave"');
  });

  it("renders an approved heading with no Cinzel and no warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const html = renderToStaticMarkup(
      <Heading as="h1" size="title">
        {copy["6.1"]}
      </Heading>,
    );
    expect(html).toBe('<h1 class="hd hd--title">Council of Doom</h1>');
    expect(warn).not.toHaveBeenCalled();
  });

  it("holds for every heading the copy deck sets in Pirata One", () => {
    for (const key of displayHeadings) {
      expect(wordsNeedingSerif(copy[key]), `COPY.md line ${key}: "${copy[key]}"`).toEqual([]);
    }
  });
});

describe("Orbitron labels", () => {
  it("accepts the approved labels", () => {
    for (const key of [
      "2.4",
      "2.5",
      "3.10",
      "3.11",
      "6.5",
      "6.6",
      "6.7",
      "6.8",
      "7.7",
      "7.8",
      "7.10",
      "7.11",
      "7.14",
    ] as const) {
      expect(labelProblems(copy[key]), `COPY.md line ${key}`).toEqual([]);
    }
  });

  it("rejects numerals, long labels and letters Orbitron lacks", () => {
    expect(labelProblems("SEAT 7")).toEqual(["contains a numeral"]);
    expect(labelProblems("ONE TWO THREE FOUR FIVE")).toEqual(["is longer than four words"]);
    expect(labelProblems("JOSÉ")).toEqual(["contains a character Orbitron lacks"]);
  });

  it("throws in development, so a bad label is caught before it ships", () => {
    expect(() => renderToStaticMarkup(<Label>SEAT 7</Label>)).toThrow(/contains a numeral/);
  });

  it("in production sets a stray numeral in Cinzel instead of failing the page", () => {
    vi.stubEnv("NODE_ENV", "production");
    const html = renderToStaticMarkup(<Label>SEAT 7</Label>);
    expect(html).toBe('<span class="lbl">SEAT <span class="fig">7</span></span>');
  });
});
