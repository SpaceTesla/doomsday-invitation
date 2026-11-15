import { describe, expect, it } from "vitest";
import { decideFit, linesOf } from "@/lib/fit";

describe("the long-name rule", () => {
  it("leaves a name on one line alone", () => {
    expect(decideFit(linesOf(48, 48), false)).toBeNull();
  });
  it("applies the approved fit when the name takes two lines or more", () => {
    expect(decideFit(linesOf(100, 50), false)).toBe("two-lines");
    expect(decideFit(linesOf(150, 50), false)).toBe("two-lines");
  });
  it("steps down once when a single word is wider than the line", () => {
    expect(decideFit(1, true)).toBe("step");
  });
});
