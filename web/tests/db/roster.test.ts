import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runMigrations } from "@/db/migrate";
import { FACTIONS } from "@/domain/factions";
import { createTestDatabase, queryOnce, type TestDatabase } from "../helpers/database";

// The Doomsday roster is seeded by migration 0002 (docs/PRODUCT_SPEC.md, section 3.9):
// once per database, grouped by faction, and without Doctor Doom.
const migrationsFolder = path.resolve(__dirname, "..", "..", "drizzle");

let db: TestDatabase;
beforeAll(async () => {
  db = await createTestDatabase();
  await runMigrations({ connectionString: db.url, migrationsFolder });
});
afterAll(async () => db.drop());

type Row = { name: string; faction: string; position: number };
const roster = () =>
  queryOnce<Row>(db.url, "select name, faction, position from character order by name");

describe("the seeded roster", () => {
  it("holds 38 characters across the seven factions, in the owner's order", async () => {
    const rows = await roster();
    expect(rows).toHaveLength(38);
    const counts = Object.fromEntries(
      FACTIONS.map((f) => [f, rows.filter((r) => r.faction === f).length]),
    );
    expect(counts).toEqual({
      avengers: 6,
      "new-avengers": 6,
      "fantastic-four": 4,
      "x-men": 9,
      "wakanda-talokan": 4,
      "multiverse-tva": 4,
      "dooms-team": 5,
    });
    const first = (faction: string) =>
      rows.find((r) => r.faction === faction && r.position === 1)?.name;
    expect(first("avengers")).toBe("Captain America / Sam Wilson");
    expect(first("x-men")).toBe("Professor X");
    expect(first("dooms-team")).toBe("Hulk");
    expect(rows.map((r) => r.name)).toContain("M'Baku");
  });

  it("never offers Doctor Doom", async () => {
    const rows = await roster();
    expect(rows.some((r) => r.name.toLowerCase() === "doctor doom")).toBe(false);
  });

  it("does not come back after Doom removes a character and migrations run again", async () => {
    await queryOnce(db.url, "delete from character where name = 'Thor'");
    await runMigrations({ connectionString: db.url, migrationsFolder });
    const rows = await roster();
    expect(rows.map((r) => r.name)).not.toContain("Thor");
    expect(rows).toHaveLength(37);
  });

  it("refuses an unknown faction", async () => {
    await expect(
      queryOnce(
        db.url,
        "insert into character (name, name_key, faction) values ('X', 'x', 'nope')",
      ),
    ).rejects.toThrow(/character_faction_known/);
  });
});
