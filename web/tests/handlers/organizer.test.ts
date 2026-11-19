import crypto from "node:crypto";
import path from "node:path";
import { Client } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { runMigrations } from "@/db/migrate";
import { createTestDatabase, type TestDatabase } from "../helpers/database";
import { ALL_TABLES } from "../helpers/domain";

import * as authRoute from "@/app/api/auth/[...all]/route";
import * as eventsRoute from "@/app/api/events/route";
import * as eventRoute from "@/app/api/events/[eventId]/route";
import * as guestsRoute from "@/app/api/events/[eventId]/guests/route";
import * as guestRoute from "@/app/api/events/[eventId]/guests/[id]/route";
import * as linkRoute from "@/app/api/events/[eventId]/guests/[id]/link/route";
import * as charactersRoute from "@/app/api/events/[eventId]/characters/route";
import * as characterRoute from "@/app/api/events/[eventId]/characters/[id]/route";
import * as proposalRoute from "@/app/api/events/[eventId]/proposal/route";
import * as finaliseRoute from "@/app/api/events/[eventId]/finalise/route";
import * as planRoute from "@/app/api/events/[eventId]/plan/route";
import * as exportRoute from "@/app/api/events/[eventId]/export/route";

// Organizer accounts and event ownership, through the real Route Handlers and Better Auth
// (docs/ARCHITECTURE.md, sections 7.3 and 7.6). Every organizer route needs a live session
// and an event the organizer owns; nothing about another organizer's event can be read or
// changed by id, address or body.

const SESSION_KEY = "k".repeat(43);
const HOST = "throne.test";
const ORIGIN = `https://${HOST}`;
const NEXT_YEAR = new Date().getFullYear() + 1;
const PASSWORD = "a-long-test-password";

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
  process.env.BETTER_AUTH_URL = ORIGIN;
  process.env.ORGANIZER_SIGNUP = "open";
  sql = new Client({ connectionString: database.url });
  await sql.connect();
});

beforeEach(async () => {
  await sql.query(`truncate ${ALL_TABLES} restart identity cascade`);
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
  if (options.cookie) headers.cookie = options.cookie;
  if (options.body !== undefined) headers["content-type"] = "application/json";
  return new Request(`${ORIGIN}${pathname}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

const ctx = <T extends Record<string, string>>(params: T) => ({ params: Promise.resolve(params) });

/** The session cookie Better Auth set, as a Cookie header ("name=value"). */
function sessionCookieOf(response: Response): string {
  const set = response.headers.getSetCookie().find((c) => c.includes("session_token="));
  if (!set) throw new Error("no session cookie");
  return set.split(";")[0];
}

let ipCounter = 0;
const freshIp = () => `198.51.100.${(ipCounter += 1) % 250}`;

async function signUp(name: string, email: string, password = PASSWORD) {
  return authRoute.POST(
    request("/api/auth/sign-up/email", {
      method: "POST",
      body: { name, email, password },
      ip: freshIp(),
    }),
  );
}

async function signIn(email: string, password = PASSWORD, options: Partial<Options> = {}) {
  return authRoute.POST(
    request("/api/auth/sign-in/email", {
      method: "POST",
      body: { email, password },
      ip: options.ip ?? freshIp(),
      origin: options.origin,
    }),
  );
}

/** A new organizer, signed in: their session cookie. */
async function organizer(name: string, email: string): Promise<string> {
  const response = await signUp(name, email);
  expect(response.status).toBe(200);
  return sessionCookieOf(response);
}

/** Set a proposal: guests can be summoned only once there is one. */
async function propose(cookie: string, eventId: string, day = `${NEXT_YEAR}-01-07`) {
  const response = await proposalRoute.PUT(
    request(`/api/events/${eventId}/proposal`, {
      method: "PUT",
      body: { day, hour: "19:30", venue: "the Grand Cinema" },
      cookie,
    }),
    ctx({ eventId }),
  );
  expect(response.status).toBe(200);
}

/** A new event, proposed unless asked not to, so guests can be summoned to it. */
async function createEvent(cookie: string, options = { propose: true }): Promise<string> {
  const response = await eventsRoute.POST(
    request("/api/events", {
      method: "POST",
      body: { timeZone: "Asia/Kolkata", hostName: "Arjun Rao" },
      cookie,
    }),
  );
  expect(response.status).toBe(201);
  const eventId = String((await response.json()).id);
  if (options.propose) await propose(cookie, eventId);
  return eventId;
}

async function addGuest(cookie: string, eventId: string, name: string) {
  const response = await guestsRoute.POST(
    request(`/api/events/${eventId}/guests`, {
      method: "POST",
      body: { name, title: "" },
      cookie,
    }),
    ctx({ eventId }),
  );
  expect(response.status).toBe(201);
  return (await response.json()) as { id: string; token: string };
}

describe("organizer accounts", () => {
  it("creates an account and signs in with a strict, HttpOnly session cookie", async () => {
    const response = await signUp("Shivansh", "owner@example.test");
    expect(response.status).toBe(200);
    const set = response.headers.getSetCookie().find((c) => c.includes("session_token=")) ?? "";
    expect(set).toContain("HttpOnly");
    expect(set).toMatch(/SameSite=Strict/i);
    expect(set).toContain("Path=/");
    // The password is stored hashed, never as typed.
    const { rows } = await sql.query<{ password: string }>(
      "select password from organizer_account",
    );
    expect(rows[0].password).not.toContain(PASSWORD);
    // Only what is needed is kept: a name, an email, and the hashed password.
    const columns = await sql.query<{ column_name: string }>(
      "select column_name from information_schema.columns where table_name = 'organizer' order by 1",
    );
    expect(columns.rows.map((c) => c.column_name)).toEqual([
      "created_at",
      "email",
      "email_verified",
      "id",
      "image",
      "name",
      "updated_at",
    ]);
  });

  it("refuses a password shorter than six characters, and a second account on one email", async () => {
    expect((await signUp("A", "short@example.test", "12345")).status).toBe(400);
    // Six characters are enough: this is an invitation, not a bank.
    expect((await signUp("B", "simple@example.test", "doom12")).status).toBe(200);
    expect((await signUp("A", "taken@example.test")).status).toBe(200);
    expect((await signUp("B", "taken@example.test")).status).toBeGreaterThanOrEqual(400);
  });

  it("signs in with the right password and refuses a wrong one", async () => {
    await signUp("Shivansh", "owner@example.test");
    expect((await signIn("owner@example.test")).status).toBe(200);
    expect((await signIn("owner@example.test", "not-the-password")).status).toBe(401);
    expect((await signIn("nobody@example.test")).status).toBe(401);
  });

  it("limits sign-in attempts from one address", async () => {
    await signUp("Shivansh", "owner@example.test");
    const ip = "192.0.2.44";
    const statuses: number[] = [];
    for (let i = 0; i < 12; i += 1) {
      statuses.push((await signIn("owner@example.test", "wrong-password", { ip })).status);
    }
    expect(statuses).toContain(429);
    // Even the right password waits once the address is limited.
    expect((await signIn("owner@example.test", PASSWORD, { ip })).status).toBe(429);
  });

  it("refuses a sign-in posted from another site", async () => {
    await signUp("Shivansh", "owner@example.test");
    const response = await signIn("owner@example.test", PASSWORD, {
      origin: "https://evil.example",
    });
    expect(response.status).toBe(403);
  });

  it("signing out ends the session for good, even if the cookie is kept", async () => {
    const cookie = await organizer("Shivansh", "owner@example.test");
    const eventId = await createEvent(cookie);
    const out = await authRoute.POST(
      request("/api/auth/sign-out", { method: "POST", body: {}, cookie }),
    );
    expect(out.status).toBe(200);
    const after = await exportRoute.GET(
      request(`/api/events/${eventId}/export`, { cookie }),
      ctx({ eventId }),
    );
    expect(after.status).toBe(401);
  });

  it("refuses sign-up while registration is closed", async () => {
    process.env.ORGANIZER_SIGNUP = "closed";
    const holder = globalThis as { __ironThroneAuth?: unknown };
    holder.__ironThroneAuth = undefined;
    try {
      const response = await signUp("Intruder", "intruder@example.test");
      expect(response.status).toBeGreaterThanOrEqual(400);
      const { rows } = await sql.query("select 1 from organizer");
      expect(rows).toHaveLength(0);
    } finally {
      process.env.ORGANIZER_SIGNUP = "open";
      holder.__ironThroneAuth = undefined;
    }
  });
});

/** Every organizer route on one event, with whatever cookie and ids the test gives. */
function eventCalls(eventId: string, guestId: string, characterId: string) {
  const body = { day: `${NEXT_YEAR}-01-08`, hour: "19:30", venue: "x" };
  const e = ctx({ eventId });
  return [
    [
      "PATCH event",
      (c?: string) =>
        eventRoute.PATCH(
          request(`/api/events/${eventId}`, {
            method: "PATCH",
            body: { timeZone: "Asia/Kolkata", hostName: "Mine now" },
            cookie: c,
          }),
          e,
        ),
    ],
    [
      "DELETE event",
      (c?: string) =>
        eventRoute.DELETE(request(`/api/events/${eventId}`, { method: "DELETE", cookie: c }), e),
    ],
    [
      "POST guests",
      (c?: string) =>
        guestsRoute.POST(
          request(`/api/events/${eventId}/guests`, {
            method: "POST",
            body: { name: "A", title: "" },
            cookie: c,
          }),
          e,
        ),
    ],
    [
      "PATCH guest",
      (c?: string) =>
        guestRoute.PATCH(
          request(`/api/events/${eventId}/guests/${guestId}`, {
            method: "PATCH",
            body: { name: "Renamed", title: "" },
            cookie: c,
          }),
          ctx({ eventId, id: guestId }),
        ),
    ],
    [
      "DELETE guest",
      (c?: string) =>
        guestRoute.DELETE(
          request(`/api/events/${eventId}/guests/${guestId}`, { method: "DELETE", cookie: c }),
          ctx({ eventId, id: guestId }),
        ),
    ],
    [
      "POST link",
      (c?: string) =>
        linkRoute.POST(
          request(`/api/events/${eventId}/guests/${guestId}/link`, { method: "POST", cookie: c }),
          ctx({ eventId, id: guestId }),
        ),
    ],
    [
      "DELETE link",
      (c?: string) =>
        linkRoute.DELETE(
          request(`/api/events/${eventId}/guests/${guestId}/link`, {
            method: "DELETE",
            cookie: c,
          }),
          ctx({ eventId, id: guestId }),
        ),
    ],
    [
      "POST characters",
      (c?: string) =>
        charactersRoute.POST(
          request(`/api/events/${eventId}/characters`, {
            method: "POST",
            body: { name: "Kang" },
            cookie: c,
          }),
          e,
        ),
    ],
    [
      "DELETE character",
      (c?: string) =>
        characterRoute.DELETE(
          request(`/api/events/${eventId}/characters/${characterId}?confirm=1`, {
            method: "DELETE",
            cookie: c,
          }),
          ctx({ eventId, id: characterId }),
        ),
    ],
    [
      "PUT proposal",
      (c?: string) =>
        proposalRoute.PUT(
          request(`/api/events/${eventId}/proposal`, { method: "PUT", body, cookie: c }),
          e,
        ),
    ],
    [
      "POST finalise",
      (c?: string) =>
        finaliseRoute.POST(
          request(`/api/events/${eventId}/finalise`, { method: "POST", cookie: c }),
          e,
        ),
    ],
    [
      "PUT plan",
      (c?: string) =>
        planRoute.PUT(
          request(`/api/events/${eventId}/plan`, { method: "PUT", body, cookie: c }),
          e,
        ),
    ],
    [
      "GET export",
      (c?: string) => exportRoute.GET(request(`/api/events/${eventId}/export`, { cookie: c }), e),
    ],
  ] as const;
}

/** Everything about an event that a foreign request must leave as it was. */
async function snapshot(eventId: string) {
  const event = await sql.query("select * from event where id = $1", [eventId]);
  const guests = await sql.query("select * from guest where event_id = $1 order by id", [eventId]);
  const roster = await sql.query("select * from character where event_id = $1 order by id", [
    eventId,
  ]);
  return { event: event.rows, guests: guests.rows, roster: roster.rows };
}

describe("every organizer route needs a live session", () => {
  const id = "00000000-0000-4000-8000-000000000000";
  const calls = eventCalls("2", id, id);

  it.each(calls)("%s without a cookie: 401", async (_name, call) => {
    expect((await call()).status).toBe(401);
  });

  it.each(calls)("%s with a forged session cookie: 401", async (_name, call) => {
    const forged = `throne.session_token=${crypto.randomBytes(24).toString("base64url")}.${crypto.randomBytes(32).toString("base64url")}`;
    expect((await call(forged)).status).toBe(401);
  });

  it.each(calls)("%s with a guest's link token as the cookie: 401", async (_name, call) => {
    expect((await call(`throne.session_token=${"q".repeat(43)}`)).status).toBe(401);
  });

  it("creating an event needs a session too", async () => {
    const response = await eventsRoute.POST(
      request("/api/events", {
        method: "POST",
        body: { timeZone: "UTC", hostName: "" },
      }),
    );
    expect(response.status).toBe(401);
  });

  it("refuses an expired session", async () => {
    const cookie = await organizer("Shivansh", "owner@example.test");
    const eventId = await createEvent(cookie);
    await sql.query("update organizer_session set expires_at = now() - interval '1 minute'");
    const response = await exportRoute.GET(
      request(`/api/events/${eventId}/export`, { cookie }),
      ctx({ eventId }),
    );
    expect(response.status).toBe(401);
  });

  it("refuses a change posted from another site, even with a live session", async () => {
    const cookie = await organizer("Shivansh", "owner@example.test");
    const eventId = await createEvent(cookie);
    for (const origin of ["https://evil.example", null]) {
      const response = await guestsRoute.POST(
        request(`/api/events/${eventId}/guests`, {
          method: "POST",
          body: { name: "A", title: "" },
          cookie,
          origin,
        }),
        ctx({ eventId }),
      );
      expect(response.status).toBe(403);
    }
    const created = await eventsRoute.POST(
      request("/api/events", {
        method: "POST",
        body: { timeZone: "UTC", hostName: "" },
        cookie,
        origin: "https://evil.example",
      }),
    );
    expect(created.status).toBe(403);
  });
});

describe("running an event from the panel", () => {
  it("creates an event with the default roster, proposes, summons, decrees, amends and exports", async () => {
    const cookie = await organizer("Shivansh", "owner@example.test");
    const eventId = await createEvent(cookie, { propose: false });
    const e = ctx({ eventId });

    // Nothing to finalise yet, and no one can be summoned until a day is proposed.
    expect(
      (
        await finaliseRoute.POST(
          request(`/api/events/${eventId}/finalise`, { method: "POST", cookie }),
          e,
        )
      ).status,
    ).toBe(409);
    const early = await guestsRoute.POST(
      request(`/api/events/${eventId}/guests`, {
        method: "POST",
        body: { name: "Too soon", title: "" },
        cookie,
      }),
      e,
    );
    expect(early.status).toBe(409);
    expect(await early.json()).toEqual({ error: "no_proposal" });
    const none = await sql.query("select count(*)::int as n from guest");
    expect(none.rows[0].n).toBe(0);
    await propose(cookie, eventId);

    // A new event starts with the Doomsday roster and the name beneath Doom.
    const roster = await sql.query("select count(*)::int as n from character where event_id = $1", [
      eventId,
    ]);
    expect(roster.rows[0].n).toBe(38);
    const created = await sql.query("select host_name, timezone from event where id = $1", [
      eventId,
    ]);
    expect(created.rows[0]).toEqual({ host_name: "Arjun Rao", timezone: "Asia/Kolkata" });

    const { id, token } = await addGuest(cookie, eventId, "Anish");
    expect(token).toHaveLength(43);
    expect(
      (
        await guestsRoute.POST(
          request(`/api/events/${eventId}/guests`, {
            method: "POST",
            body: { name: " ", title: "" },
            cookie,
          }),
          e,
        )
      ).status,
    ).toBe(422);
    expect(
      (
        await guestRoute.PATCH(
          request(`/api/events/${eventId}/guests/${id}`, {
            method: "PATCH",
            body: { name: "Anisha", title: "Ms." },
            cookie,
          }),
          ctx({ eventId, id }),
        )
      ).status,
    ).toBe(200);

    const replaced = await linkRoute.POST(
      request(`/api/events/${eventId}/guests/${id}/link`, { method: "POST", cookie }),
      ctx({ eventId, id }),
    );
    expect((await replaced.json()).token).not.toBe(token);

    // The roster: Thor is already on it, so a second one is refused; a new one is added
    // under the faction chosen; an unknown faction is refused.
    expect(
      (
        await charactersRoute.POST(
          request(`/api/events/${eventId}/characters`, {
            method: "POST",
            body: { name: "thor" },
            cookie,
          }),
          e,
        )
      ).status,
    ).toBe(409);
    const kang = await charactersRoute.POST(
      request(`/api/events/${eventId}/characters`, {
        method: "POST",
        body: { name: "Kang", faction: "dooms-team" },
        cookie,
      }),
      e,
    );
    expect(kang.status).toBe(201);
    const kangId = (await kang.json()).id;
    expect(
      (
        await charactersRoute.POST(
          request(`/api/events/${eventId}/characters`, {
            method: "POST",
            body: { name: "Kang II", faction: "council-of-kangs" },
            cookie,
          }),
          e,
        )
      ).status,
    ).toBe(400);

    // A guest takes Kang; removing it now needs confirmation that names them.
    await sql.query("update guest set status = 'seated', character_id = $1 where id = $2", [
      kangId,
      id,
    ]);
    const warned = await characterRoute.DELETE(
      request(`/api/events/${eventId}/characters/${kangId}`, { method: "DELETE", cookie }),
      ctx({ eventId, id: kangId }),
    );
    expect(warned.status).toBe(409);
    expect(await warned.json()).toEqual({
      error: "held",
      holder: { title: "Ms.", name: "Anisha" },
    });
    expect(
      (
        await characterRoute.DELETE(
          request(`/api/events/${eventId}/characters/${kangId}?confirm=1`, {
            method: "DELETE",
            cookie,
          }),
          ctx({ eventId, id: kangId }),
        )
      ).status,
    ).toBe(200);

    const badHour = await proposalRoute.PUT(
      request(`/api/events/${eventId}/proposal`, {
        method: "PUT",
        body: { day: `${NEXT_YEAR}-01-08`, hour: "19:20", venue: "x" },
        cookie,
      }),
      e,
    );
    expect(badHour.status).toBe(400);
    const proposed = await proposalRoute.PUT(
      request(`/api/events/${eventId}/proposal`, {
        method: "PUT",
        body: { day: `${NEXT_YEAR}-01-08`, hour: "19:30", venue: "the Grand Cinema" },
        cookie,
      }),
      e,
    );
    expect(await proposed.json()).toEqual({ changed: true });

    // Once something is proposed, the time zone is fixed; the name can still change.
    const zone = await eventRoute.PATCH(
      request(`/api/events/${eventId}`, {
        method: "PATCH",
        body: { timeZone: "Europe/London", hostName: "Arjun" },
        cookie,
      }),
      e,
    );
    expect(zone.status).toBe(409);
    const renamed = await eventRoute.PATCH(
      request(`/api/events/${eventId}`, {
        method: "PATCH",
        body: { timeZone: "Asia/Kolkata", hostName: "Arjun" },
        cookie,
      }),
      e,
    );
    expect(renamed.status).toBe(200);

    expect(
      (
        await finaliseRoute.POST(
          request(`/api/events/${eventId}/finalise`, { method: "POST", cookie }),
          e,
        )
      ).status,
    ).toBe(200);
    const amended = await planRoute.PUT(
      request(`/api/events/${eventId}/plan`, {
        method: "PUT",
        body: { day: `${NEXT_YEAR}-01-09`, hour: "12:00", venue: "the Grand Cinema" },
        cookie,
      }),
      e,
    );
    expect(await amended.json()).toEqual({ changed: true });

    const exported = await exportRoute.GET(request(`/api/events/${eventId}/export`, { cookie }), e);
    expect(exported.headers.get("content-disposition")).toMatch(
      /attachment; filename="iron-throne-/,
    );
    const data = await exported.json();
    expect(data.decreed).toBe(true);
    expect(data.event.hostName).toBe("Arjun");
    expect(data.proposal.at).toBe(new Date(`${NEXT_YEAR}-01-09T12:00:00+05:30`).toISOString());
    expect(data.guests).toHaveLength(1);

    expect(
      (
        await linkRoute.DELETE(
          request(`/api/events/${eventId}/guests/${id}/link`, { method: "DELETE", cookie }),
          ctx({ eventId, id }),
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await guestRoute.DELETE(
          request(`/api/events/${eventId}/guests/${id}`, { method: "DELETE", cookie }),
          ctx({ eventId, id }),
        )
      ).status,
    ).toBe(200);

    // Deleting the event takes everything in it.
    expect(
      (await eventRoute.DELETE(request(`/api/events/${eventId}`, { method: "DELETE", cookie }), e))
        .status,
    ).toBe(200);
    const left = await sql.query(
      "select (select count(*) from event)::int as e, (select count(*) from character)::int as c",
    );
    expect(left.rows[0]).toEqual({ e: 0, c: 0 });
  });

  it("refuses an unknown time zone", async () => {
    const cookie = await organizer("Shivansh", "owner@example.test");
    for (const body of [{ timeZone: "Mars/Olympus", hostName: "" }, { hostName: "" }]) {
      const response = await eventsRoute.POST(
        request("/api/events", { method: "POST", body, cookie }),
      );
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
    }
  });

  it("answers 400 for a guest id that is not one, and 404 for an event id that is not one", async () => {
    const cookie = await organizer("Shivansh", "owner@example.test");
    const eventId = await createEvent(cookie);
    const response = await guestRoute.DELETE(
      request(`/api/events/${eventId}/guests/nope`, { method: "DELETE", cookie }),
      ctx({ eventId, id: "nope" }),
    );
    expect(response.status).toBe(400);
    for (const bad of ["abc", "0", "-1", "1.5", "99999999999", "2 or 1=1"]) {
      const answer = await exportRoute.GET(
        request(`/api/events/${encodeURIComponent(bad)}/export`, { cookie }),
        ctx({ eventId: bad }),
      );
      expect(answer.status, bad).toBe(404);
    }
  });
});

describe("one organizer can never reach another's event", () => {
  it("answers 404 to every route on someone else's event, and changes nothing", async () => {
    const owner = await organizer("Owner", "owner@example.test");
    const rival = await organizer("Rival", "rival@example.test");
    const eventId = await createEvent(owner);
    const { id: guestId } = await addGuest(owner, eventId, "Anish");
    const {
      rows: [thor],
    } = await sql.query<{ id: string }>(
      "select id from character where event_id = $1 and name_key = 'thor'",
      [eventId],
    );
    const before = await snapshot(eventId);

    for (const [name, call] of eventCalls(eventId, guestId, thor.id)) {
      const response = await call(rival);
      expect(response.status, name).toBe(404);
      // The answer says nothing about the event: no name, no guest, no token.
      const text = await response.text();
      expect(text, name).not.toContain("Anish");
      expect(text, name).not.toContain("Arjun Rao");
    }
    expect(await snapshot(eventId)).toEqual(before);
  });

  it("refuses another event's guests and characters through one's own event", async () => {
    const owner = await organizer("Owner", "owner@example.test");
    const rival = await organizer("Rival", "rival@example.test");
    const ownerEvent = await createEvent(owner);
    const rivalEvent = await createEvent(rival);
    const { id: guestId, token } = await addGuest(owner, ownerEvent, "Anish");
    const {
      rows: [thor],
    } = await sql.query<{ id: string }>(
      "select id from character where event_id = $1 and name_key = 'thor'",
      [ownerEvent],
    );
    const before = await snapshot(ownerEvent);

    // The rival's own event id, with the owner's guest and character ids.
    const statuses = new Map<string, number>();
    for (const [name, call] of eventCalls(rivalEvent, guestId, thor.id)) {
      if (name === "DELETE event" || name === "PATCH event") continue;
      statuses.set(name, (await call(rival)).status);
    }
    expect(statuses.get("PATCH guest")).toBe(404);
    expect(statuses.get("POST link")).toBe(404);
    expect(statuses.get("DELETE link")).toBe(404);
    expect(await snapshot(ownerEvent)).toEqual(before);

    // The owner's guest still has their link, which still opens the owner's event only.
    const {
      rows: [row],
    } = await sql.query<{ token: string; event_id: number }>(
      "select token, event_id from guest where id = $1",
      [guestId],
    );
    expect(row).toEqual({ token, event_id: Number(ownerEvent) });

    // The rival's export lists only the rival's own guests.
    const exported = await exportRoute.GET(
      request(`/api/events/${rivalEvent}/export`, { cookie: rival }),
      ctx({ eventId: rivalEvent }),
    );
    const data = await exported.json();
    expect(JSON.stringify(data)).not.toContain(token);
    expect(data.guests.map((g: { name: string }) => g.name)).toEqual(["A"]);
  });

  it("leaves an event no one has claimed out of everyone's reach", async () => {
    const cookie = await organizer("Owner", "owner@example.test");
    const {
      rows: [legacy],
    } = await sql.query<{ id: number }>(
      "insert into event (timezone) values ('Asia/Kolkata') returning id",
    );
    const eventId = String(legacy.id);
    const response = await exportRoute.GET(
      request(`/api/events/${eventId}/export`, { cookie }),
      ctx({ eventId }),
    );
    expect(response.status).toBe(404);
  });

  it("cannot take an event by naming another owner in the body", async () => {
    const owner = await organizer("Owner", "owner@example.test");
    const rival = await organizer("Rival", "rival@example.test");
    const eventId = await createEvent(owner);
    const {
      rows: [ownerRow],
    } = await sql.query<{ id: string }>("select id from organizer where email = $1", [
      "owner@example.test",
    ]);
    // Extra fields are ignored: the owner is always the signed-in organizer.
    const response = await eventsRoute.POST(
      request("/api/events", {
        method: "POST",
        body: { timeZone: "UTC", hostName: "", organizerId: ownerRow.id, id: 1 },
        cookie: rival,
      }),
    );
    expect(response.status).toBe(201);
    const { id } = await response.json();
    expect(String(id)).not.toBe(eventId);
    const owners = await sql.query<{ id: number; email: string }>(
      "select e.id, o.email from event e join organizer o on o.id = e.organizer_id order by e.id",
    );
    expect(owners.rows).toEqual([
      { id: Number(eventId), email: "owner@example.test" },
      { id, email: "rival@example.test" },
    ]);
  });
});
