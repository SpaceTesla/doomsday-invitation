import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runMigrations } from "@/db/migrate";
import { forEvent } from "@/domain/context";
import { councilForGuest } from "@/domain/council";
import { claimUnownedEvents, ownedEvent } from "@/domain/event";
import { findByToken } from "@/domain/guests";
import { newGuestToken } from "@/domain/tokens";
import { createTestDatabase, queryOnce, type TestDatabase } from "../helpers/database";

// Migration 0003 (organizers and events) against a copy of a live single-event database:
// built at the schema before it (0000 to 0002), filled the way the real event is (guests
// in every state, a held mantle, a removed one, approvals of the current and an older
// proposal, an alternative, a decree that was amended, a cancelled link, sessions and
// attempts), then migrated. Nothing may be lost, regenerated or changed. Never production.

const folder = path.resolve(__dirname, "..", "..", "drizzle");

/** A copy of the migrations folder holding only the first `count` migrations. */
function migrationsUpTo(count: number): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "throne-migrations-"));
  fs.mkdirSync(path.join(dir, "meta"));
  const journal = JSON.parse(fs.readFileSync(path.join(folder, "meta", "_journal.json"), "utf8"));
  journal.entries = journal.entries.slice(0, count);
  for (const entry of journal.entries) {
    fs.copyFileSync(path.join(folder, `${entry.tag}.sql`), path.join(dir, `${entry.tag}.sql`));
  }
  fs.writeFileSync(path.join(dir, "meta", "_journal.json"), JSON.stringify(journal));
  return dir;
}

let db: TestDatabase;
let before: Record<string, unknown[]>;
const tokens = {
  anish: newGuestToken(),
  tara: newGuestToken(),
  ravi: newGuestToken(),
  jose: newGuestToken(),
};

const LEGACY_TABLES = ["event", "guest", "character", "alternative", "admin_session", "attempt"];

async function dump(url: string, columnsOf: (table: string) => string = () => "*") {
  const out: Record<string, unknown[]> = {};
  for (const table of LEGACY_TABLES) {
    const order = table === "event" ? "id" : table === "attempt" ? "key, at" : "1";
    out[table] = await queryOnce(
      url,
      `select ${columnsOf(table)} from "${table}" order by ${order}`,
    );
  }
  return out;
}

beforeAll(async () => {
  db = await createTestDatabase();
  await runMigrations({ connectionString: db.url, migrationsFolder: migrationsUpTo(3) });

  // The live event as it stands on the old schema.
  await queryOnce(
    db.url,
    `insert into event (id, timezone, proposal_at, proposal_venue, proposal_version, finalised_at, plan_version)
     values (1, 'Asia/Kolkata', '2026-12-18 14:00:00+00', 'the Grand Cinema', 3, '2026-12-10 10:00:00+00', 1)`,
  );
  const id = (name: string) =>
    queryOnce<{ id: string }>(db.url, "select id from character where name_key = $1", [name]).then(
      (rows) => rows[0].id,
    );
  const thor = await id("thor");
  const loki = await id("loki");
  await queryOnce(db.url, "delete from character where name_key = 'sentry'");
  await queryOnce(
    db.url,
    `insert into guest (token, title, name, status, character_id, approved_version, seen_proposal, seen_plan,
                        character_removed, removed_character_name, opened_at, opening_played_at, invited_at, answered_at)
     values
       ($1, 'Mr.', 'Anish', 'seated', $5, 3, 3, 2, false, null, '2026-11-15 10:00+00', '2026-11-15 10:01+00', '2026-11-14 09:00+00', '2026-11-15 10:02+00'),
       ($2, 'Ms.', 'Tara Menon', 'seated', $6, 2, 2, 0, false, null, '2026-11-15 11:00+00', '2026-11-15 11:01+00', '2026-11-14 09:01+00', '2026-11-15 11:02+00'),
       ($3, 'Dr.', 'Ravi', 'seated', null, null, 1, 0, true, 'Sentry', '2026-11-16 08:00+00', '2026-11-16 08:00+00', '2026-11-14 09:02+00', '2026-11-16 08:01+00'),
       ($4, '', 'José Nuñez', 'declined', null, null, 0, 0, false, null, '2026-11-16 09:00+00', '2026-11-16 09:00+00', '2026-11-14 09:03+00', '2026-11-16 09:05+00'),
       (null, '', 'Bhattacharya-Okonkwo', 'summoned', null, null, 0, 0, false, null, null, null, '2026-11-14 09:04+00', null)`,
    [tokens.anish, tokens.tara, tokens.ravi, tokens.jose, thor, loki],
  );
  await queryOnce(
    db.url,
    `insert into alternative (guest_id, at, created_at)
     select id, '2026-12-19 12:30:00+00', '2026-11-16 12:00+00' from guest where name = 'Tara Menon'`,
  );
  await queryOnce(
    db.url,
    "insert into admin_session (id, expires_at) values ('11111111-1111-4111-8111-111111111111', now() + interval '1 day')",
  );
  await queryOnce(db.url, "insert into attempt (key, at) values ('link:203.0.113.9', now())");

  before = await dump(db.url);
  await runMigrations({ connectionString: db.url, migrationsFolder: folder });
});

afterAll(async () => db?.drop());

describe("migration 0003 on a copy of the live event", () => {
  it("keeps every row of every existing table exactly as it was", async () => {
    // The old columns only, so the comparison is of what existed before.
    const oldColumns: Record<string, string> = {
      event:
        "id, timezone, proposal_at, proposal_venue, proposal_version, finalised_at, plan_version, created_at",
      guest:
        "id, token, title, name, status, character_id, approved_version, seen_proposal, seen_plan, character_removed, removed_character_name, opened_at, opening_played_at, invited_at, answered_at",
      character: "id, name, name_key, faction, position, created_at",
    };
    const after = await dump(db.url, (table) => oldColumns[table] ?? "*");
    expect(after).toEqual(before);
  });

  it("gives every guest and character to the first event, which keeps id 1 and no owner", async () => {
    const events = await queryOnce(db.url, "select id, organizer_id, host_name from event");
    expect(events).toEqual([{ id: 1, organizer_id: null, host_name: null }]);
    const stray = await queryOnce(
      db.url,
      "select (select count(*) from guest where event_id is distinct from 1)::int as guests, (select count(*) from character where event_id is distinct from 1)::int as characters",
    );
    expect(stray).toEqual([{ guests: 0, characters: 0 }]);
  });

  it("keeps every link working, each opening its own guest in the same state", async () => {
    const pool = new Pool({ connectionString: db.url });
    try {
      const domain = { db: drizzle(pool), now: () => new Date("2026-12-12T10:00:00Z") };
      for (const [name, token] of [
        ["Anish", tokens.anish],
        ["Tara Menon", tokens.tara],
        ["Ravi", tokens.ravi],
        ["José Nuñez", tokens.jose],
      ]) {
        const found = await findByToken(domain, token);
        expect(found?.guest.name, name).toBe(name);
        expect(found?.event.id).toBe(1);
      }
      // The council reads as it did: Anish holds Thor, approves the current proposal; Tara
      // approved an older one; Ravi was told Sentry was removed; the decree stands, amended.
      const anish = await findByToken(domain, tokens.anish);
      const council = await councilForGuest(forEvent(domain, 1), anish!.guest.id);
      expect(council).toMatchObject({
        decreed: true,
        hostName: null,
        count: { approved: 1, total: 3 },
        you: { approves: true },
      });
      expect(council?.guests.find((g) => g.name === "Anish")?.character).toBe("Thor");
      expect(council?.guests.find((g) => g.name === "Tara Menon")?.character).toBe("Loki");
      expect(council?.mantles).toHaveLength(37);
      const ravi = await findByToken(domain, tokens.ravi);
      expect(
        (await councilForGuest(forEvent(domain, 1), ravi!.guest.id))?.you.removedCharacter,
      ).toBe("Sentry");
    } finally {
      await pool.end();
    }
  });

  it("is then claimed by the first organizer, and new events take the next ids", async () => {
    const pool = new Pool({ connectionString: db.url });
    try {
      const domain = { db: drizzle(pool) };
      await pool.query(
        "insert into organizer (id, name, email) values ('first', 'Shivansh', 'first@example.test')",
      );
      expect(await claimUnownedEvents(domain, "first@example.test", "Shivansh")).toEqual([1]);
      expect(await ownedEvent(domain, "first", 1)).toMatchObject({
        id: 1,
        hostName: "Shivansh",
        proposalVersion: 3,
        planVersion: 1,
      });
      const { rows } = await pool.query<{ id: number }>(
        "insert into event (timezone, organizer_id) values ('UTC', 'first') returning id",
      );
      expect(rows[0].id).toBe(2);
      // The tokens did not change in the claim.
      const kept = await pool.query<{ token: string }>(
        "select token from guest where token is not null order by invited_at",
      );
      expect(kept.rows.map((r) => r.token)).toEqual([
        tokens.anish,
        tokens.tara,
        tokens.ravi,
        tokens.jose,
      ]);
    } finally {
      await pool.end();
    }
  });
});

describe("migration 0003 on a fresh database", () => {
  it("makes the first event for the seeded roster, so every character has an event", async () => {
    const fresh = await createTestDatabase();
    try {
      await runMigrations({ connectionString: fresh.url, migrationsFolder: folder });
      expect(await queryOnce(fresh.url, "select id, organizer_id from event")).toEqual([
        { id: 1, organizer_id: null },
      ]);
      expect(
        await queryOnce(fresh.url, "select count(*)::int as n from character where event_id = 1"),
      ).toEqual([{ n: 38 }]);
    } finally {
      await fresh.drop();
    }
  });
});
