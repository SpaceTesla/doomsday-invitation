import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { assets, fonts } from "../../scripts/asset-manifest";

const webDir = path.resolve(__dirname, "..", "..");
const rootDir = path.resolve(webDir, "..");

const sha256 = (file: string) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function filesUnder(dir: string, skip: string[] = []): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(full, skip));
    else out.push(full);
  }
  return out;
}

describe("approved assets", () => {
  it("are byte-for-byte copies of their sources", () => {
    for (const entry of assets) {
      expect(sha256(path.join(webDir, entry.to)), entry.to).toBe(
        sha256(path.join(rootDir, entry.from)),
      );
    }
    for (const entry of fonts) {
      expect(sha256(path.join(webDir, entry.to)), entry.to).toBe(
        sha256(path.join(webDir, entry.from)),
      );
    }
  });

  it("take the figure layers from assets/v4 and from nowhere else", () => {
    const figures = assets.filter((entry) => /figure-(dark|lit)\.webp$/.test(entry.to));
    expect(figures).toHaveLength(4);
    for (const entry of figures) {
      expect(entry.from).toContain("/assets/v4/");
      // The older folders hold different figures under the same names. Make sure the
      // shipped file is not one of them.
      const name = path.basename(entry.from);
      const shipped = sha256(path.join(webDir, entry.to));
      for (const older of ["v2", "v3"]) {
        const olderFile = path.join(rootDir, "design", "explorations", "assets", older, name);
        expect(shipped, `${name} must not be the ${older} figure`).not.toBe(sha256(olderFile));
      }
    }
  });

  it("list nothing from references/", () => {
    for (const entry of [...assets, ...fonts]) {
      expect(entry.from.startsWith("references/"), entry.from).toBe(false);
    }
  });
});

describe("the reference library", () => {
  it("has no file anywhere in the application", () => {
    const references = filesUnder(path.join(rootDir, "references"));
    expect(references.length).toBeGreaterThan(0);
    const referenceHashes = new Map(references.map((file) => [sha256(file), file]));

    const shipped = [
      ...filesUnder(path.join(webDir, "public")),
      ...filesUnder(path.join(webDir, "src")),
    ];
    expect(shipped.length).toBeGreaterThan(0);
    for (const file of shipped) {
      const match = referenceHashes.get(sha256(file));
      expect(
        match,
        `${path.relative(webDir, file)} is a copy of a reference image`,
      ).toBeUndefined();
    }
  });
});
