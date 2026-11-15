import fs from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { withFullVerification } from "./tls";

/**
 * Key of the session-level advisory lock that serialises migration runs.
 * It fits in 32 bits, so in pg_locks it appears as classid 0, objid MIGRATION_LOCK_KEY.
 */
export const MIGRATION_LOCK_KEY = 1953719668;

export type MigrateOptions = {
  /** A direct (not pooled) PostgreSQL connection string. */
  connectionString: string;
  /** Folder holding Drizzle's SQL files and meta/_journal.json. */
  migrationsFolder: string;
  /** How long to wait for another runner to finish before giving up. */
  waitMs?: number;
  /** How often to retry the lock while waiting. */
  pollMs?: number;
};

export type MigrateResult = {
  /** False when the folder holds no migrations yet. */
  ran: boolean;
  /**
   * Clock times, for callers that want to show or test ordering. `lockedAt` is taken just
   * after the lock was granted; `releasedAt` just before the unlock is sent, so the lock
   * is certainly held from one to the other, and no other runner can hold it in between.
   */
  lockedAt: number;
  releasedAt: number;
};

/** Neon's pooled hosts carry "-pooler" in the first label of the host name. */
export function isPooledConnectionString(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname.split(".")[0].endsWith("-pooler");
  } catch {
    return false;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Apply pending migrations, one runner at a time.
 *
 * The advisory lock and Drizzle's migrator share ONE connection: a session-level
 * lock belongs to the connection that took it, so taking it on one connection and
 * migrating on another would protect nothing. For the same reason a pooled
 * connection string is refused: transaction pooling hands each statement to an
 * arbitrary backend.
 *
 * The lock is released in `finally`, and the connection is closed after it. If the
 * unlock itself fails, closing the connection still releases the lock, so a failed
 * or crashed run can never leave it held.
 */
export async function runMigrations(options: MigrateOptions): Promise<MigrateResult> {
  const { connectionString, migrationsFolder, waitMs = 120_000, pollMs = 250 } = options;

  if (isPooledConnectionString(connectionString)) {
    throw new Error(
      "Migrations need the direct connection string. A pooled connection cannot hold the migration lock.",
    );
  }

  const hasMigrations = fs.existsSync(path.join(migrationsFolder, "meta", "_journal.json"));

  const client = new Client({ connectionString: withFullVerification(connectionString) });
  await client.connect();

  let locked = false;
  let lockedAt = 0;
  let releasedAt = 0;
  try {
    const deadline = Date.now() + waitMs;
    for (;;) {
      const { rows } = await client.query<{ locked: boolean }>(
        "select pg_try_advisory_lock($1) as locked",
        [MIGRATION_LOCK_KEY],
      );
      if (rows[0].locked) {
        locked = true;
        lockedAt = Date.now();
        break;
      }
      if (Date.now() >= deadline) {
        throw new Error(
          `Another migration run still holds the lock after ${waitMs} ms. Nothing was applied.`,
        );
      }
      await sleep(pollMs);
    }

    if (hasMigrations) {
      // The same client, so the same backend that holds the lock.
      await migrate(drizzle(client), { migrationsFolder });
    }
  } finally {
    try {
      if (locked) {
        releasedAt = Date.now();
        await client.query("select pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]);
      }
    } finally {
      await client.end();
    }
  }

  return { ran: hasMigrations, lockedAt, releasedAt };
}
