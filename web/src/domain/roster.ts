// The roster every new event starts with: the Doomsday roster, grouped by faction, in the
// owner's order. It is the same list migration 0002 seeded for the first event
// (tests/domain/events.test.ts holds the two together). Doctor Doom is not here: he is
// never a mantle (docs/PRODUCT_SPEC.md, Stage 3). An organizer edits their own copy.
import type { Faction } from "./factions";

type Entry = readonly [name: string, faction: Faction];

const entries: readonly Entry[] = [
  ["Captain America / Sam Wilson", "avengers"],
  ["Captain America / Steve Rogers", "avengers"],
  ["Thor", "avengers"],
  ["Ant-Man", "avengers"],
  ["Shang-Chi", "avengers"],
  ["Falcon / Joaquin Torres", "avengers"],
  ["Yelena Belova", "new-avengers"],
  ["Winter Soldier", "new-avengers"],
  ["Sentry", "new-avengers"],
  ["Ghost", "new-avengers"],
  ["U.S. Agent", "new-avengers"],
  ["Red Guardian", "new-avengers"],
  ["Reed Richards / Mister Fantastic", "fantastic-four"],
  ["Sue Storm / Invisible Woman", "fantastic-four"],
  ["Johnny Storm / Human Torch", "fantastic-four"],
  ["Ben Grimm / The Thing", "fantastic-four"],
  ["Professor X", "x-men"],
  ["Magneto", "x-men"],
  ["Cyclops", "x-men"],
  ["Mystique", "x-men"],
  ["Nightcrawler", "x-men"],
  ["Beast", "x-men"],
  ["Gambit", "x-men"],
  ["Wolverine", "x-men"],
  ["Deadpool", "x-men"],
  ["Black Panther / Shuri", "wakanda-talokan"],
  ["M'Baku", "wakanda-talokan"],
  ["Namor", "wakanda-talokan"],
  ["Namora", "wakanda-talokan"],
  ["Spider-Man / Peter 2", "multiverse-tva"],
  ["Loki", "multiverse-tva"],
  ["Mobius", "multiverse-tva"],
  ["Peggy Carter", "multiverse-tva"],
  ["Hulk", "dooms-team"],
  ["Scarlet Witch", "dooms-team"],
  ["Clea", "dooms-team"],
  ["Sylvie", "dooms-team"],
  ["Doctor Strange", "dooms-team"],
];

export type RosterEntry = { name: string; faction: Faction; position: number };

/** Each entry with its place within its faction, counting from 1. */
export const DEFAULT_ROSTER: readonly RosterEntry[] = entries.map(([name, faction], index) => ({
  name,
  faction,
  position: entries.slice(0, index + 1).filter(([, f]) => f === faction).length,
}));
