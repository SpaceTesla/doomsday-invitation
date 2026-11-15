import path from "node:path";
import { Client } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { runMigrations } from "@/db/migrate";
import { hashPassphrase } from "@/lib/passphrase";
import { sealSession, SESSION_COOKIE } from "@/lib/session";
import { createTestDatabase, type TestDatabase } from "../helpers/database";

import * as sessionRoute from "@/app/api/admin/session/route";
import * as guestsRoute from "@/app/api/admin/guests/route";
import * as guestRoute from "@/app/api/admin/guests/[id]/route";
import * as linkRoute from "@/app/api/admin/guests/[id]/link/route";
import * as charactersRoute from "@/app/api/admin/characters/route";
import * as characterRoute from "@/app/api/admin/characters/[id]/route";
import * as proposalRoute from "@/app/api/admin/proposal/route";
import * as finaliseRoute from "@/app/api/admin/finalise/route";
import * as planRoute from "@/app/api/admin/plan/route";
import * as exportRoute from "@/app/api/admin/export/route";

const PASSPHRASE = "test-pass-phrase-only";
const SESSION_KEY = "k".repeat(43);
const HOST = "throne.test";
const ORIGIN = `https://${HOST}`;
const NEXT_YEAR = new Date().getFullYear() + 1;

let database: TestDatabase;
let sql: Client;

beforeAll(async () => {
  database = await createTestDatabase();
  await runMigrations({
    connectionString: database.url,
    migrationsFolder: path.resolve(__dirname, "..", "..", "drizzle"),
  });
  // The handlers read these on first use; nothing here comes from .env.local.
  process.env.DATABASE_URL = database.url;
  process.env.SESSION_KEY = SESSION_KEY;
  process.env.EVENT_TIMEZONE = "Asia/Kolkata";
  process.env.ADMIN_PASSPHRASE_HASH = await hashPassphrase(PASSPHRASE);
  sql = new Client({ connectionString: database.url });
  await sql.connect();
});

beforeEach(async () => {
  await sql.query(
    "truncate alternative, guest, character, event, admin_session, attempt restart identity cascade",
  );
});

afterAll(async () => {
  await sql?.end();
  const { getPool } = await import("@/db/client");
  await getPool().end();
  await database?.drop();
});

type Options = {
  method?: string;
  body?: unknown;
  cookie?: string;
  origin?: string | null;
  ip?: string;
};

function request(pathname: string, options: Options = {}): Request {
  const headers: Record<string, string> = {
    host: HOST,
    "x-forwarded-for": options.ip ?? "203.0.113.7",
  };
  if (options.origin !== null) headers.origin = options.origin ?? ORIGIN;
  if (options.cookie) headers.cookie = `${SESSION_COOKIE}=${options.cookie}`;
  if (options.body !== undefined) headers["content-type"] = "application/json";
  return new Request(`${ORIGIN}${pathname}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

const ctx = <T extends Record<string, string>>(params: T) => ({ params: Promise.resolve(params) });

async function signIn(passphrase = PASSPHRASE, ip?: string) {
  return sessionRoute.POST(
    request("/api/admin/session", { method: "POST", body: { passphrase }, ip }),
  );
}

async function signedInCookie(): Promise<string> {
  const response = await signIn();
  expect(response.status).toBe(204);
  const header = response.headers.get("set-cookie") ?? "";
  return header.split(";")[0].split("=").slice(1).join("=");
}

describe("signing in", () => {
  it("accepts the passphrase and sets a strict, HttpOnly session cookie", async () => {
    const response = await signIn();
    expect(response.status).toBe(204);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(new RegExp(`^${SESSION_COOKIE}=`));
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/");
  });

  it("refuses a wrong passphrase", async () => {
    expect((await signIn("not it")).status).toBe(401);
  });

  it("locks an address out after five failures, even for the right passphrase", async () => {
    for (let i = 0; i < 4; i += 1) expect((await signIn("wrong")).status).toBe(401);
    expect((await signIn("wrong")).status).toBe(429);
    expect((await signIn()).status).toBe(429);
    // Another address is not locked.
    expect((await signIn(PASSPHRASE, "198.51.100.9")).status).toBe(204);
  });

  it("refuses a sign-in posted from another site", async () => {
    const response = await sessionRoute.POST(
      request("/api/admin/session", {
        method: "POST",
        body: { passphrase: PASSPHRASE },
        origin: "https://evil.example",
      }),
    );
    expect(response.status).toBe(403);
  });

  it("signing out ends the session for good, even if the cookie is kept", async () => {
    const cookie = await signedInCookie();
    expect((await exportRoute.GET(request("/api/admin/export", { cookie }))).status).toBe(200);
    const out = await sessionRoute.DELETE(
      request("/api/admin/session", { method: "DELETE", cookie }),
    );
    expect(out.status).toBe(204);
    expect(out.headers.get("set-cookie")).toContain("Max-Age=0");
    expect((await exportRoute.GET(request("/api/admin/export", { cookie }))).status).toBe(401);
  });
});

describe("every administrator route needs a live session", () => {
  const id = "00000000-0000-4000-8000-000000000000";
  const calls: [string, (cookie?: string) => Promise<Response>][] = [
    [
      "POST guests",
      (c) =>
        guestsRoute.POST(
          request("/api/admin/guests", {
            method: "POST",
            body: { name: "A", title: "" },
            cookie: c,
          }),
        ),
    ],
    [
      "PATCH guest",
      (c) =>
        guestRoute.PATCH(
          request(`/api/admin/guests/${id}`, {
            method: "PATCH",
            body: { name: "A", title: "" },
            cookie: c,
          }),
          ctx({ id }),
        ),
    ],
    [
      "DELETE guest",
      (c) =>
        guestRoute.DELETE(
          request(`/api/admin/guests/${id}`, { method: "DELETE", cookie: c }),
          ctx({ id }),
        ),
    ],
    [
      "POST link",
      (c) =>
        linkRoute.POST(
          request(`/api/admin/guests/${id}/link`, { method: "POST", cookie: c }),
          ctx({ id }),
        ),
    ],
    [
      "DELETE link",
      (c) =>
        linkRoute.DELETE(
          request(`/api/admin/guests/${id}/link`, { method: "DELETE", cookie: c }),
          ctx({ id }),
        ),
    ],
    [
      "POST characters",
      (c) =>
        charactersRoute.POST(
          request("/api/admin/characters", { method: "POST", body: { name: "Thor" }, cookie: c }),
        ),
    ],
    [
      "DELETE character",
      (c) =>
        characterRoute.DELETE(
          request(`/api/admin/characters/${id}`, { method: "DELETE", cookie: c }),
          ctx({ id }),
        ),
    ],
    [
      "PUT proposal",
      (c) =>
        proposalRoute.PUT(
          request("/api/admin/proposal", {
            method: "PUT",
            body: { day: `${NEXT_YEAR}-01-08`, hour: "19:30", venue: "x" },
            cookie: c,
          }),
        ),
    ],
    [
      "POST finalise",
      (c) => finaliseRoute.POST(request("/api/admin/finalise", { method: "POST", cookie: c })),
    ],
    [
      "PUT plan",
      (c) =>
        planRoute.PUT(
          request("/api/admin/plan", {
            method: "PUT",
            body: { day: `${NEXT_YEAR}-01-08`, hour: "19:30", venue: "x" },
            cookie: c,
          }),
        ),
    ],
    ["GET export", (c) => exportRoute.GET(request("/api/admin/export", { cookie: c }))],
  ];

  it.each(calls)("%s without a cookie: 401", async (_name, call) => {
    expect((await call()).status).toBe(401);
  });

  it.each(calls)("%s with a forged cookie: 401", async (_name, call) => {
    const forged = sealSession(crypto.randomUUID(), "a-different-key-".repeat(3));
    expect((await call(forged)).status).toBe(401);
  });

  it.each(calls)("%s with a guest's link token as the cookie: 401", async (_name, call) => {
    expect((await call("q".repeat(43))).status).toBe(401);
  });

  it("refuses a correctly signed session that has expired", async () => {
    const id = crypto.randomUUID();
    await sql.query(
      "insert into admin_session (id, expires_at) values ($1, now() - interval '1 minute')",
      [id],
    );
    const response = await exportRoute.GET(
      request("/api/admin/export", { cookie: sealSession(id, SESSION_KEY) }),
    );
    expect(response.status).toBe(401);
  });

  it("refuses a change posted from another site, even with a live session", async () => {
    const cookie = await signedInCookie();
    const response = await guestsRoute.POST(
      request("/api/admin/guests", {
        method: "POST",
        body: { name: "A", title: "" },
        cookie,
        origin: "https://evil.example",
      }),
    );
    expect(response.status).toBe(403);
    const missing = await guestsRoute.POST(
      request("/api/admin/guests", {
        method: "POST",
        body: { name: "A", title: "" },
        cookie,
        origin: null,
      }),
    );
    expect(missing.status).toBe(403);
  });
});

describe("running an event from the panel", () => {
  it("summons guests, keeps the roster, proposes, decrees, amends and exports", async () => {
    const cookie = await signedInCookie();

    const added = await guestsRoute.POST(
      request("/api/admin/guests", {
        method: "POST",
        body: { name: "Anish", title: "Mr." },
        cookie,
      }),
    );
    expect(added.status).toBe(201);
    const { id, token } = await added.json();
    expect(token).toHaveLength(43);

    expect(
      (
        await guestsRoute.POST(
          request("/api/admin/guests", { method: "POST", body: { name: " ", title: "" }, cookie }),
        )
      ).status,
    ).toBe(422);
    expect(
      (
        await guestRoute.PATCH(
          request(`/api/admin/guests/${id}`, {
            method: "PATCH",
            body: { name: "Anisha", title: "Ms." },
            cookie,
          }),
          ctx({ id }),
        )
      ).status,
    ).toBe(200);

    const replaced = await linkRoute.POST(
      request(`/api/admin/guests/${id}/link`, { method: "POST", cookie }),
      ctx({ id }),
    );
    const newToken = (await replaced.json()).token;
    expect(newToken).not.toBe(token);

    const thor = await charactersRoute.POST(
      request("/api/admin/characters", { method: "POST", body: { name: "Thor" }, cookie }),
    );
    expect(thor.status).toBe(201);
    const thorId = (await thor.json()).id;
    expect(
      (
        await charactersRoute.POST(
          request("/api/admin/characters", { method: "POST", body: { name: "thor" }, cookie }),
        )
      ).status,
    ).toBe(409);

    // A guest takes Thor; removing it now needs confirmation that names them.
    await sql.query("update guest set status = 'seated', character_id = $1 where id = $2", [
      thorId,
      id,
    ]);
    const warned = await characterRoute.DELETE(
      request(`/api/admin/characters/${thorId}`, { method: "DELETE", cookie }),
      ctx({ id: thorId }),
    );
    expect(warned.status).toBe(409);
    expect(await warned.json()).toEqual({
      error: "held",
      holder: { title: "Ms.", name: "Anisha" },
    });
    const removed = await characterRoute.DELETE(
      request(`/api/admin/characters/${thorId}?confirm=1`, { method: "DELETE", cookie }),
      ctx({ id: thorId }),
    );
    expect(removed.status).toBe(200);

    expect(
      (await finaliseRoute.POST(request("/api/admin/finalise", { method: "POST", cookie }))).status,
    ).toBe(409);
    const badHour = await proposalRoute.PUT(
      request("/api/admin/proposal", {
        method: "PUT",
        body: { day: `${NEXT_YEAR}-01-08`, hour: "19:20", venue: "x" },
        cookie,
      }),
    );
    expect(badHour.status).toBe(400);
    const proposed = await proposalRoute.PUT(
      request("/api/admin/proposal", {
        method: "PUT",
        body: { day: `${NEXT_YEAR}-01-08`, hour: "19:30", venue: "the Grand Cinema" },
        cookie,
      }),
    );
    expect(await proposed.json()).toEqual({ changed: true });
    expect(
      (await finaliseRoute.POST(request("/api/admin/finalise", { method: "POST", cookie }))).status,
    ).toBe(200);
    const amended = await planRoute.PUT(
      request("/api/admin/plan", {
        method: "PUT",
        body: { day: `${NEXT_YEAR}-01-09`, hour: "12:00", venue: "the Grand Cinema" },
        cookie,
      }),
    );
    expect(await amended.json()).toEqual({ changed: true });

    const exported = await exportRoute.GET(request("/api/admin/export", { cookie }));
    expect(exported.headers.get("content-disposition")).toMatch(
      /attachment; filename="iron-throne-/,
    );
    const data = await exported.json();
    expect(data.decreed).toBe(true);
    expect(data.proposal.at).toBe(new Date(`${NEXT_YEAR}-01-09T12:00:00+05:30`).toISOString());
    expect(data.guests).toHaveLength(1);

    expect(
      (
        await linkRoute.DELETE(
          request(`/api/admin/guests/${id}/link`, { method: "DELETE", cookie }),
          ctx({ id }),
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await guestRoute.DELETE(
          request(`/api/admin/guests/${id}`, { method: "DELETE", cookie }),
          ctx({ id }),
        )
      ).status,
    ).toBe(200);
  });

  it("answers 400 for an id that is not one, and never 500", async () => {
    const cookie = await signedInCookie();
    const response = await guestRoute.DELETE(
      request("/api/admin/guests/nope", { method: "DELETE", cookie }),
      ctx({ id: "nope" }),
    );
    expect(response.status).toBe(400);
  });
});
