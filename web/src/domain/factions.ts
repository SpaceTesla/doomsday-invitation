// The factions the roster is grouped under (docs/PRODUCT_SPEC.md, section 3.9), in the
// order guests and Doom see them. The keys are stored in character.faction; the names
// guests read are copy lines 5.14 (docs/COPY.md). Adding a faction needs a migration,
// because the database checks the key.
import { copy } from "@/copy";

export const FACTIONS = [
  "avengers",
  "new-avengers",
  "fantastic-four",
  "x-men",
  "wakanda-talokan",
  "multiverse-tva",
  "dooms-team",
] as const;

export type Faction = (typeof FACTIONS)[number];

export const isFaction = (value: unknown): value is Faction =>
  typeof value === "string" && (FACTIONS as readonly string[]).includes(value);

export function factionName(faction: Faction): string {
  return copy[`5.14.${faction}`];
}

/**
 * Group a roster by faction, in faction order. Within a faction the given order is
 * kept. Characters without a faction (none in the seeded roster) come last, together.
 */
export function byFaction<T extends { faction: string | null }>(
  rows: T[],
): { faction: Faction | null; rows: T[] }[] {
  const groups: { faction: Faction | null; rows: T[] }[] = [];
  for (const faction of FACTIONS) {
    const members = rows.filter((row) => row.faction === faction);
    if (members.length) groups.push({ faction, rows: members });
  }
  const loose = rows.filter((row) => !isFaction(row.faction));
  if (loose.length) groups.push({ faction: null, rows: loose });
  return groups;
}
