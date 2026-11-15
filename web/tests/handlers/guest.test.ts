import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { runMigrations } from "@/db/migrate";
import { addCharacter } from "@/domain/characters";
import { ensureEvent } from "@/domain/event";
import { addGuest, cancelLink } from "@/domain/guests";
import { setProposal } from "@/domain/proposal";
import { zonedInstant } from "@/domain/time";
import { createTestDatabase, type TestDatabase } from "../helpers/database";

import * as accept from "@/app/api/g/[token]/accept/route";
import * as alternative from "@/app/api/g/[token]/alternative/route";
import * as approval from "@/app/api/g/[token]/approval/route";
import * as character from "@/app/api/g/[token]/character/route";
import * as decline from "@/app/api/g/[token]/decline/route";
import * as leave from "@/app/api/g/[token]/leave/route";
import * as opened from "@/app/api/g/[token]/opened/route";
import * as seen from "@/app/api/g/[token]/seen/route";

const HOST = "throne.test";
const ORIGIN = `https://${HOST}`;
const TZ = "Asia/Kolkata";
const NEXT_YEAR = new Date().getFullYear() + 1;

let database: TestDatabase;
let sql: Client;
let pool: Pool;
const domain = () => ({ db: drizzle(pool) });

beforeAll(async () => {
  database = await createTestDatabase();
  await runMigrations({
    connectionString: database.url,
    migrationsFolder: path.resolve(__dirname, "..", "..", "drizzle"),
  });
  process.env.DATABASE_URL = database.url;
  sql = new Client({ connectionString: database.url });
  await sql.connect();
  pool = new Pool({ connectionString: database.url });
});

beforeEach(async () => {
  await sql.query(
    "truncate alternative, guest, character, event, admin_session, attempt restart identity cascade",
  );
  await ensureEvent(domain(), TZ);
  await setProposal(domain(), zonedInstant(TZ, NEXT_YEAR, 1, 8, 19, 30), "the Grand Cinema");
});

afterAll(async () => {
  await sql?.end();
  await pool?.end();
  const { getPool } = await import("@/db/client");
  await getPool().end();
  await database?.drop();
});

type Options = { method?: string; body?: unknown; origin?: string | null; ip?: string };

function call(token: string, options: Options = {}) {
  const headers: Record<string, string> = {
    host: HOST,
    "x-forwarded-for": options.ip ?? "203.0.113.20",
  };
  if (options.origin !== null) headers.origin = options.origin ?? ORIGIN;
  if (options.body !== undefined) headers["content-type"] = "application/json";
  const request = new Request(`${ORIGIN}/api/g/${token}/x`, {
    method: options.method ?? "POST",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  return { request, ctx: { params: Promise.resolve({ token }) } };
}

async function guest(name: string, title: "" | "Mr." | "Ms." | "Dr." = "") {
  const added = await addGuest(domain(), { name, title });
  if (!added.ok) throw new Error(added.reason);
  return added;
}

const status = async (response: Promise<Response>) => (await response).status;

describe("links that are not a summons", () => {
  it("unknown and cancelled links get the same answer, and reveal nothing", async () => {
    const anish = await guest("Anish");
    await cancelLink(domain(), anish.id);
    const unknown = call("u".repeat(43));
    const cancelled = call(anish.token);
    const a = await accept.POST(unknown.request, unknown.ctx);
    const b = await accept.POST(cancelled.request, cancelled.ctx);
    expect(a.status).toBe(404);
    expect(b.status).toBe(404);
    expect(await a.text()).toBe(await b.text());
  });

  it("after five unknown links from one address, even a valid link answers as unknown there", async () => {
    const anish = await guest("Anish");
    for (let i = 0; i < 5; i += 1) {
      const miss = call(`${"m".repeat(42)}${i}`, { ip: "198.51.100.40" });
      expect(await status(accept.POST(miss.request, miss.ctx))).toBe(404);
    }
    const locked = call(anish.token, { ip: "198.51.100.40" });
    expect(await status(accept.POST(locked.request, locked.ctx))).toBe(404);
    const elsewhere = call(anish.token, { ip: "198.51.100.41" });
    expect(await status(accept.POST(elsewhere.request, elsewhere.ctx))).toBe(200);
  });

  it("refuses an action posted from another site, or with no origin", async () => {
    const anish = await guest("Anish");
    const evil = call(anish.token, { origin: "https://evil.example" });
    expect(await status(accept.POST(evil.request, evil.ctx))).toBe(403);
    const none = call(anish.token, { origin: null });
    expect(await status(accept.POST(none.request, none.ctx))).toBe(403);
  });
});

describe("the journey through the API", () => {
  it("opens, accepts, and without a mantle approves, suggests and withdraws; then claims one", async () => {
    const anish = await guest("Anish", "Mr.");
    const t = anish.token;
    const thor = await addCharacter(domain(), "Thor");
    if (!thor.ok) throw new Error();

    const o = call(t, { body: { played: true } });
    expect(await status(opened.POST(o.request, o.ctx))).toBe(200);
    const row = (
      await sql.query("select opened_at, opening_played_at from guest where id = $1", [anish.id])
    ).rows[0];
    expect(row.opened_at).not.toBeNull();
    expect(row.opening_played_at).not.toBeNull();

    const a = call(t);
    expect(await status(accept.POST(a.request, a.ctx))).toBe(200);

    const ap = call(t, { method: "PUT" });
    expect(await status(approval.PUT(ap.request, ap.ctx))).toBe(200);
    const alt = call(t, { method: "PUT", body: { day: `${NEXT_YEAR}-01-09`, hour: "18:00" } });
    expect(await (await alternative.PUT(alt.request, alt.ctx)).json()).toEqual({
      ok: true,
      replaced: false,
    });
    const wa = call(t, { method: "DELETE" });
    expect(await status(alternative.DELETE(wa.request, wa.ctx))).toBe(200);
    const wd = call(t, { method: "DELETE" });
    expect(await status(approval.DELETE(wd.request, wd.ctx))).toBe(200);

    const c = call(t, { method: "PUT", body: { characterId: thor.id } });
    expect(await status(character.PUT(c.request, c.ctx))).toBe(200);
    const s = call(t);
    expect(await status(seen.POST(s.request, s.ctx))).toBe(200);
  });

  it("answers a lost race with who holds the mantle now", async () => {
    const anish = await guest("Anish", "Mr.");
    const tara = await guest("Tara", "Ms.");
    const thor = await addCharacter(domain(), "Thor");
    if (!thor.ok) throw new Error();
    for (const g of [anish, tara]) {
      const a = call(g.token);
      await accept.POST(a.request, a.ctx);
    }
    const first = call(anish.token, { method: "PUT", body: { characterId: thor.id } });
    await character.PUT(first.request, first.ctx);
    const second = call(tara.token, { method: "PUT", body: { characterId: thor.id } });
    const response = await character.PUT(second.request, second.ctx);
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body).toEqual({ error: "taken", holder: { title: "Mr.", name: "Anish" } });
    expect(JSON.stringify(body)).not.toContain(anish.token);
  });

  it("explains an alternative it refuses", async () => {
    const anish = await guest("Anish");
    const a = call(anish.token);
    await accept.POST(a.request, a.ctx);
    const reasons = async (body: unknown) => {
      const r = call(anish.token, { method: "PUT", body });
      const response = await alternative.PUT(r.request, r.ctx);
      return [response.status, (await response.json()).error];
    };
    expect(await reasons({ day: `${NEXT_YEAR}-01-09` })).toEqual([422, "missing"]);
    expect(await reasons({ day: "2020-01-09", hour: "18:00" })).toEqual([422, "past"]);
    expect(await reasons({ day: `${NEXT_YEAR}-01-08`, hour: "19:30" })).toEqual([
      422,
      "same_as_proposal",
    ]);
  });

  it("declines, returns, leaves", async () => {
    const anish = await guest("Anish");
    const d = call(anish.token);
    expect(await status(decline.POST(d.request, d.ctx))).toBe(200);
    const a = call(anish.token);
    expect(await status(accept.POST(a.request, a.ctx))).toBe(200);
    const l = call(anish.token);
    expect(await status(leave.POST(l.request, l.ctx))).toBe(200);
    const again = call(anish.token);
    expect(await status(decline.POST(again.request, again.ctx))).toBe(200);
  });
});
