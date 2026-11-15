import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * The application's database handle.
 *
 * It connects lazily, on first use, so importing this module (for example during
 * `next build`) never opens a connection. In production DATABASE_URL is Neon's
 * pooled connection string; the pool here is kept small because each serverless
 * instance has its own.
 */
type Holder = { pool?: Pool; db?: NodePgDatabase };

// Reuse one pool across hot reloads in development.
const holder = globalThis as typeof globalThis & { __ironThroneDb?: Holder };
const state: Holder = (holder.__ironThroneDb ??= {});

export function getPool(): Pool {
  if (!state.pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set.");
    }
    state.pool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
    // An idle client can be dropped by the server (Neon sleeps). Never let that crash the process.
    state.pool.on("error", () => {});
  }
  return state.pool;
}

export function getDb(): NodePgDatabase {
  return (state.db ??= drizzle(getPool()));
}

export type Db = NodePgDatabase;
