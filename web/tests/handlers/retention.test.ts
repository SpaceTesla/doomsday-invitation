import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runMigrations } from "@/db/migrate";
import { createTestDatabase, type TestDatabase } from "../helpers/database";
import * as retention from "@/app/api/cron/retention/route";
import * as health from "@/app/api/health/route";

let database: TestDatabase;

beforeAll(async () => {
  database = await createTestDatabase();
  await runMigrations({
    connectionString: database.url,
    migrationsFolder: path.resolve(__dirname, "..", "..", "drizzle"),
  });
  process.env.DATABASE_URL = database.url;
  process.env.CRON_SECRET = "c".repeat(43);
});

afterAll(async () => {
  const { getPool } = await import("@/db/client");
  await getPool().end();
  await database?.drop();
});

const get = (authorization?: string) =>
  new Request("https://throne.test/api/cron/retention", {
    headers: authorization ? { authorization } : {},
  });

describe("the retention endpoint", () => {
  it("answers 401 without the cron secret, or with the wrong one", async () => {
    expect((await retention.GET(get())).status).toBe(401);
    expect((await retention.GET(get("Bearer wrong"))).status).toBe(401);
    expect((await retention.GET(get("c".repeat(43)))).status).toBe(401);
  });

  it("runs with the secret, and with no event there is nothing to delete", async () => {
    const response = await retention.GET(get(`Bearer ${"c".repeat(43)}`));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: false });
  });
});

describe("the health check", () => {
  it("reads the database and reports how many migrations it has applied", async () => {
    const response = await health.GET();
    const body = await response.json();
    expect(body).toMatchObject({ ok: true, database: true });
    expect(body.migrations).toBeGreaterThanOrEqual(2);
  });
});
