// Create a fresh database for the end-to-end tests and migrate it. Run by the
// Playwright web server before the application starts. Local Docker only.
import path from "node:path";
import { Client } from "pg";
import { runMigrations } from "../src/db/migrate";

export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? "postgres://throne:throne@localhost:54329/iron_throne_e2e";

async function main() {
  const target = new URL(E2E_DATABASE_URL);
  if (target.hostname !== "localhost" && target.hostname !== "127.0.0.1") {
    throw new Error("The end-to-end database must be on this machine.");
  }
  const name = target.pathname.slice(1);
  if (!/^[a-z0-9_]+$/.test(name)) throw new Error("Unexpected database name.");
  const admin = new URL(E2E_DATABASE_URL);
  admin.pathname = "/postgres";
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    await client.query(`drop database if exists ${name} with (force)`);
    await client.query(`create database ${name}`);
  } finally {
    await client.end();
  }
  await runMigrations({
    connectionString: E2E_DATABASE_URL,
    migrationsFolder: path.resolve(__dirname, "..", "drizzle"),
  });
  console.log("end-to-end database ready");
}

main().catch((failure: unknown) => {
  console.error(failure instanceof Error ? failure.message : "failed");
  process.exit(1);
});
