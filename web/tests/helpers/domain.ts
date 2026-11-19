import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { runMigrations } from "@/db/migrate";
import type { EventDomain } from "@/domain/context";
import { addGuest, accept, type Title } from "@/domain/guests";
import { createTestDatabase, type TestDatabase } from "./database";

export const TIME_ZONE = "Asia/Kolkata";

/** Every table, for emptying a test database between tests. */
export const ALL_TABLES =
  "alternative, guest, character, event, admin_session, attempt, organizer, organizer_session, organizer_account, organizer_verification, auth_rate_limit";

/** An event with no owner and no roster, for tests of what happens inside one event. */
export async function insertEvent(pool: Pool, organizerId: string | null = null): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    "insert into event (timezone, organizer_id) values ($1, $2) returning id",
    [TIME_ZONE, organizerId],
  );
  return rows[0].id;
}

/** An instant from a wall-clock time in India, e.g. ist("2026-12-18 19:30"). */
export function ist(wallClock: string): Date {
  return new Date(`${wallClock.replace(" ", "T")}:00+05:30`);
}

/**
 * One migrated database per test file, emptied before each test, and a clock the test
 * can move. The pool is large enough for the concurrency tests.
 */
export function setupDomain(options: { start?: Date } = {}) {
  const start = options.start ?? ist("2026-12-01 10:00");
  const state = {
    database: undefined as unknown as TestDatabase,
    pool: undefined as unknown as Pool,
    now: start,
    eventId: 0,
  };

  // Scoped to the test's one event, made fresh before each test with an empty roster.
  const domain: EventDomain = {
    get db() {
      return drizzle(state.pool);
    },
    now: () => state.now,
    get eventId() {
      return state.eventId;
    },
  };

  beforeAll(async () => {
    state.database = await createTestDatabase();
    await runMigrations({
      connectionString: state.database.url,
      migrationsFolder: path.resolve(__dirname, "..", "..", "drizzle"),
    });
    state.pool = new Pool({ connectionString: state.database.url, max: 25 });
  });

  beforeEach(async () => {
    state.now = start;
    await state.pool.query(`truncate ${ALL_TABLES} restart identity cascade`);
    state.eventId = await insertEvent(state.pool);
  });

  afterAll(async () => {
    await state.pool?.end();
    await state.database?.drop();
  });

  return {
    domain,
    pool: () => state.pool,
    eventId: () => state.eventId,
    setNow: (instant: Date) => {
      state.now = instant;
    },
    /** A guest who has accepted, with their id and token. */
    async seatedGuest(name: string, title: Title = "") {
      const added = await addGuest(domain, { name, title });
      if (!added.ok) throw new Error(added.reason);
      const answered = await accept(domain, added.id);
      if (!answered.ok) throw new Error(answered.reason);
      return added;
    },
    async summonedGuest(name: string, title: Title = "") {
      const added = await addGuest(domain, { name, title });
      if (!added.ok) throw new Error(added.reason);
      return added;
    },
  };
}
