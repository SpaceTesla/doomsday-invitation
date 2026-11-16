import { describe, expect, it } from "vitest";
import { FACTIONS, byFaction, factionName, isFaction } from "@/domain/factions";

describe("factions", () => {
  it("groups in faction order, keeps the order within a faction, and puts the unaligned last", () => {
    const rows = [
      { name: "Loki", faction: "multiverse-tva" },
      { name: "Odd one", faction: null },
      { name: "Thor", faction: "avengers" },
      { name: "Mobius", faction: "multiverse-tva" },
    ];
    expect(byFaction(rows).map((g) => [g.faction, g.rows.map((r) => r.name)])).toEqual([
      ["avengers", ["Thor"]],
      ["multiverse-tva", ["Loki", "Mobius"]],
      [null, ["Odd one"]],
    ]);
  });

  it("names every faction from the copy deck", () => {
    expect(FACTIONS.map(factionName)).toEqual([
      "The Avengers (Earth-616)",
      "The New Avengers / Thunderbolts",
      "The Fantastic Four (Earth-828)",
      "The X-Men (Earth-10005)",
      "Wakanda & Talokan",
      "The Multiverse & TVA",
      "Doom's Rumoured Team",
    ]);
  });

  it("knows its own keys only", () => {
    expect(isFaction("x-men")).toBe(true);
    expect(isFaction("doom")).toBe(false);
    expect(isFaction(null)).toBe(false);
  });
});
