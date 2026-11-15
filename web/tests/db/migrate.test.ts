import path from "node:path";
import { Client } from "pg";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MIGRATION_LOCK_KEY, isPooledConnectionString, runMigrations } from "@/db/migrate";
import { createTestDatabase, queryOnce, type TestDatabase } from "../helpers/database";

const fixture = (name: string) => path.resolve(__dirname, "..", "fixtures", "migrations", name);

/** Backends in this database that hold the migration lock right now. */
async function lockHolders(url: string): Promise<number[]> {
  const rows = await queryOnce<{ pid: number }>(
    url,
    `select l.pid from pg_locks l
     where l.locktype = 'advisory' and l.classid = 0 and l.objid = $1 and l.objsubid = 1 and l.granted
       and l.database = (select oid from pg_database where datname = current_database())`,
    [MIGRATION_LOCK_KEY],
  );
  return rows.map((row) => row.pid);
}

async function tableExists(url: string, table: string): Promise<boolean> {
  const rows = await queryOnce<{ found: boolean }>(
    url,
    "select to_regclass($1) is not null as found",
    [table],
  );
  return rows[0].found;
}

describe("runMigrations", () => {
  let database: TestDatabase;

  beforeEach(async () => {
    database = await createTestDatabase();
  });

  afterEach(async () => {
    await database.drop();
  });

  it("holds the lock on the same connection that runs the migrations", async () => {
    await runMigrations({ connectionString: database.url, migrationsFolder: fixture("probe") });

    // The migration itself recorded its own backend and the backend holding the lock.
    const rows = await queryOnce<{ migrator_pid: number; lock_pid: number | null }>(
      database.url,
      "select migrator_pid, lock_pid from probe",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].lock_pid).not.toBeNull();
    expect(rows[0].lock_pid).toBe(rows[0].migrator_pid);
  });

  it("releases the lock after a successful run", async () => {
    await runMigrations({ connectionString: database.url, migrationsFolder: fixture("probe") });
    expect(await lockHolders(database.url)).toEqual([]);
  });

  it("runs two simultaneous runners one after the other, applying each migration once", async () => {
    const options = {
      connectionString: database.url,
      migrationsFolder: fixture("slow"),
      pollMs: 50,
    };
    const [first, second] = await Promise.all([runMigrations(options), runMigrations(options)]);

    // The two lock periods do not overlap.
    const [earlier, later] = [first, second].sort((a, b) => a.lockedAt - b.lockedAt);
    expect(later.lockedAt).toBeGreaterThanOrEqual(earlier.releasedAt);

    const applied = await queryOnce<{ count: string }>(
      database.url,
      "select count(*) as count from drizzle.__drizzle_migrations",
    );
    expect(applied[0].count).toBe("1");
    const log = await queryOnce<{ count: string }>(
      database.url,
      "select count(*) as count from slow_log",
    );
    expect(log[0].count).toBe("1");
    expect(await lockHolders(database.url)).toEqual([]);
  });

  it("releases the lock when a migration fails, and applies none of it", async () => {
    await expect(
      runMigrations({ connectionString: database.url, migrationsFolder: fixture("bad") }),
    ).rejects.toThrow();

    expect(await lockHolders(database.url)).toEqual([]);
    // Drizzle applies a run in one transaction, so the first statement was rolled back too.
    expect(await tableExists(database.url, "created_before_the_failure")).toBe(false);

    // The next run takes the lock at once.
    const started = Date.now();
    const result = await runMigrations({
      connectionString: database.url,
      migrationsFolder: fixture("probe"),
      waitMs: 2_000,
    });
    expect(result.ran).toBe(true);
    expect(result.lockedAt - started).toBeLessThan(1_500);
  });

  it("waits while another connection holds the lock, then gives up without applying anything", async () => {
    const holder = new Client({ connectionString: database.url });
    await holder.connect();
    try {
      await holder.query("select pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);

      const started = Date.now();
      await expect(
        runMigrations({
          connectionString: database.url,
          migrationsFolder: fixture("probe"),
          waitMs: 600,
          pollMs: 50,
        }),
      ).rejects.toThrow(/still holds the lock/);
      expect(Date.now() - started).toBeGreaterThanOrEqual(600);

      expect(await tableExists(database.url, "probe")).toBe(false);
      // The waiting runner must not have taken or disturbed the lock.
      expect(await lockHolders(database.url)).toHaveLength(1);
    } finally {
      await holder.end();
    }
  });

  it("proceeds once the other holder lets go", async () => {
    const holder = new Client({ connectionString: database.url });
    await holder.connect();
    await holder.query("select pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    const release = setTimeout(() => void holder.end(), 400);
    try {
      const result = await runMigrations({
        connectionString: database.url,
        migrationsFolder: fixture("probe"),
        waitMs: 5_000,
        pollMs: 50,
      });
      expect(result.ran).toBe(true);
      expect(await tableExists(database.url, "probe")).toBe(true);
    } finally {
      clearTimeout(release);
    }
  });

  it("does nothing, and still releases the lock, when there are no migrations yet", async () => {
    const result = await runMigrations({
      connectionString: database.url,
      migrationsFolder: fixture("does-not-exist"),
    });
    expect(result.ran).toBe(false);
    expect(await lockHolders(database.url)).toEqual([]);
  });

  it("refuses a pooled connection string before connecting", async () => {
    const pooled =
      "postgresql://user:secret@ep-example-123456-pooler.eu-central-1.aws.neon.tech/db";
    expect(isPooledConnectionString(pooled)).toBe(true);
    expect(isPooledConnectionString(database.url)).toBe(false);
    await expect(
      runMigrations({ connectionString: pooled, migrationsFolder: fixture("probe") }),
    ).rejects.toThrow(/direct connection string/);
  });
});
