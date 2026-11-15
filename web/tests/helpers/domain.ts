import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { runMigrations } from "@/db/migrate";
import type { Domain } from "@/domain/context";
import { ensureEvent } from "@/domain/event";
import { addGuest, accept, type Title } from "@/domain/guests";
import { createTestDatabase, type TestDatabase } from "./database";

export const TIME_ZONE = "Asia/Kolkata";

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
  };

  const domain: Domain = {
    get db() {
      return drizzle(state.pool);
    },
    now: () => state.now,
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
    await state.pool.query(
      "truncate alternative, guest, character, event, admin_session, attempt restart identity cascade",
    );
    await ensureEvent(domain, TIME_ZONE);
  });

  afterAll(async () => {
    await state.pool?.end();
    await state.database?.drop();
  });

  return {
    domain,
    pool: () => state.pool,
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
