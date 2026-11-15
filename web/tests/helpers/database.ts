import crypto from "node:crypto";
import { Client } from "pg";

/**
 * Tests run against a real PostgreSQL: the Docker container locally, a service
 * container in CI. They never read .env.local, so they cannot reach Neon.
 */
export const ADMIN_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://throne:throne@localhost:54329/postgres";

function urlFor(database: string): string {
  const url = new URL(ADMIN_URL);
  url.pathname = `/${database}`;
  return url.toString();
}

export type TestDatabase = { name: string; url: string; drop: () => Promise<void> };

/** Create an empty database for one test, and return how to reach and remove it. */
export async function createTestDatabase(): Promise<TestDatabase> {
  const name = `test_${crypto.randomBytes(6).toString("hex")}`;
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();
  try {
    await admin.query(`create database ${name}`);
  } finally {
    await admin.end();
  }
  return {
    name,
    url: urlFor(name),
    drop: async () => {
      const client = new Client({ connectionString: ADMIN_URL });
      await client.connect();
      try {
        await client.query(`drop database if exists ${name} with (force)`);
      } finally {
        await client.end();
      }
    },
  };
}

/** Run one query on a fresh connection and close it. */
export async function queryOnce<Row extends Record<string, unknown>>(
  url: string,
  text: string,
  values: unknown[] = [],
): Promise<Row[]> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const result = await client.query(text, values);
    return result.rows as Row[];
  } finally {
    await client.end();
  }
}
