// The organizer's side of the server: who is signed in, and the wrappers every organizer
// Route Handler runs through. Each handler checks the session and the event's owner
// itself; there is no middleware and no client-side gate. docs/ARCHITECTURE.md, 7.3.
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import { forEvent, type Domain, type EventDomain } from "@/domain/context";
import { ownedEvent, type EventRow } from "@/domain/event";
import { getAuth } from "@/lib/auth";

export function serverDomain(): Domain {
  return { db: getDb() };
}

export type Organizer = { id: string; name: string };

/** The organizer a set of request headers is signed in as, or null. */
export async function organizerFrom(requestHeaders: Headers): Promise<Organizer | null> {
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  return session ? { id: session.user.id, name: session.user.name } : null;
}

/** For pages: the signed-in organizer, or null. */
export async function currentOrganizer(): Promise<Organizer | null> {
  return organizerFrom(await headers());
}

/**
 * For pages: the event at this address, if the signed-in organizer owns it. Null for a
 * missing event and for someone else's alike, so the page shows the same not-found.
 */
export async function pageEvent(
  organizer: Organizer,
  rawId: string,
): Promise<{ domain: EventDomain; event: EventRow } | null> {
  const id = eventIdOf(rawId);
  if (id === null) return null;
  const domain = serverDomain();
  const row = await ownedEvent(domain, organizer.id, id);
  return row ? { domain: forEvent(domain, row.id), event: row } : null;
}

/** An event id from an address: a positive whole number, or null. */
export function eventIdOf(raw: string): number | null {
  if (!/^[1-9]\d{0,9}$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id <= 2_147_483_647 ? id : null;
}

/** Mutations must come from our own pages. Browsers always send Origin on these. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return host !== null && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const json = (body: unknown, status = 200) => Response.json(body, { status });

export class BadRequest extends Error {}

/** Parse a JSON body with a schema, or answer 400. */
export async function parseBody<T extends z.ZodType>(request: Request, schema: T) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BadRequest();
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new BadRequest();
  return parsed.data as z.infer<T>;
}

/** Run a handler with a plain failure that reveals nothing. */
async function guarded(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (failure) {
    if (failure instanceof BadRequest) return json({ error: "bad_request" }, 400);
    // Never log the error itself: a query error carries its parameters.
    console.error("organizer action failed");
    return json({ error: "failed" }, 500);
  }
}

/**
 * Run an organizer handler that is not about one event (creating one): same origin for
 * anything that changes state, and a live session.
 */
export async function asOrganizer(
  request: Request,
  handler: (domain: Domain, organizer: Organizer) => Promise<Response>,
): Promise<Response> {
  return guarded(async () => {
    if (request.method !== "GET" && !sameOrigin(request)) return json({ error: "forbidden" }, 403);
    const organizer = await organizerFrom(request.headers);
    if (!organizer) return json({ error: "signed_out" }, 401);
    return handler(serverDomain(), organizer);
  });
}

/**
 * Run a handler for one event: same origin for changes, a live session, and an event the
 * organizer owns. Someone else's event, a missing one and a malformed id all answer 404,
 * so the answer says nothing about events that are not yours. The handler receives the
 * domain scoped to that event, and every query it runs is limited to it.
 */
export async function asEventOwner(
  request: Request,
  params: Promise<{ eventId: string }>,
  handler: (domain: EventDomain, event: EventRow, organizer: Organizer) => Promise<Response>,
): Promise<Response> {
  return guarded(async () => {
    if (request.method !== "GET" && !sameOrigin(request)) return json({ error: "forbidden" }, 403);
    const organizer = await organizerFrom(request.headers);
    if (!organizer) return json({ error: "signed_out" }, 401);
    const id = eventIdOf((await params).eventId);
    if (id === null) return json({ error: "not_found" }, 404);
    const domain = serverDomain();
    const row = await ownedEvent(domain, organizer.id, id);
    if (!row) return json({ error: "not_found" }, 404);
    return handler(forEvent(domain, row.id), row, organizer);
  });
}

/**
 * For an event's pages: the event at this address, scoped domain included, or the page
 * ends here (sign-in when signed out, not-found for anyone else's event). Pages render
 * alongside their layout, so each page checks for itself rather than trusting the layout.
 */
export async function requirePageEvent(
  params: Promise<{ eventId: string }>,
): Promise<{ domain: EventDomain; event: EventRow; organizer: Organizer }> {
  const organizer = await currentOrganizer();
  if (!organizer) redirect("/sign-in");
  const found = await pageEvent(organizer, (await params).eventId);
  if (!found) notFound();
  return { ...found, organizer };
}
