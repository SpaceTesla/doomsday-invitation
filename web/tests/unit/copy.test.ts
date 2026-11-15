import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { copy } from "@/copy";

// docs/COPY.md is the source of truth for every word. Each line in src/copy must appear,
// word for word, in the row of the deck with the same number.
const deck = fs.readFileSync(path.resolve(__dirname, "..", "..", "..", "docs", "COPY.md"), "utf8");

const rows = new Map<string, string>();
for (const line of deck.split(/\r?\n/)) {
  const match = /^\| (\d+\.\d+[a-z]?) \|(.*)$/.exec(line);
  if (match) rows.set(match[1], match[2]);
}

const normalise = (text: string) => text.replace(/\s+/g, " ").replace(/[’]/g, "'").toLowerCase();

describe("the copy module follows COPY.md", () => {
  it.each(Object.entries(copy))("%s is in the deck word for word", (key, value) => {
    const number = key.split(".").slice(0, 2).join(".");
    const row = rows.get(number);
    expect(row, `COPY.md has no line ${number}`).toBeDefined();
    expect(normalise(row ?? "")).toContain(normalise(value));
  });
});
