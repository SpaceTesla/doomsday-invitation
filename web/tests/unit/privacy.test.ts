import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Invitation tokens appear in request paths. Our own code must never write one to a
// log: no logging call may take a token, a request URL or a raw error (Drizzle's query
// errors carry the query's parameters, which can include a token).
const srcDir = path.resolve(__dirname, "..", "..", "src");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith("generated.ts") ? [full] : [];
  });
}

describe("logging", () => {
  it("never passes a token, a request URL or a raw error to a log", () => {
    const offences: string[] = [];
    for (const file of sourceFiles(srcDir)) {
      const text = fs.readFileSync(file, "utf8");
      // Only the arguments matter, and a plain string literal is always safe.
      for (const match of text.matchAll(/console\.\w+\(([\s\S]*?)\);/g)) {
        const args = match[1].trim();
        if (/^"[^"`$]*"$/.test(args)) continue;
        if (/token|\.url\b|request\b|req\b|params|\berror\b|\berr\b|\be\b|failure/.test(args)) {
          offences.push(`${path.relative(srcDir, file)}: ${match[0].slice(0, 80)}`);
        }
      }
    }
    expect(offences).toEqual([]);
  });
});
