// The administrator's side of the server: who is signed in, and the wrapper every
// administrator Route Handler runs through. Each handler checks the session itself;
// there is no middleware and no client-side gate.
import { cookies } from "next/headers";
import { z } from "zod";
import { getDb } from "@/db/client";
import type { Domain } from "@/domain/context";
import { ensureEvent } from "@/domain/event";
import { serverEnv } from "@/lib/env";
import { readCookie, SESSION_COOKIE, sessionIsLive, unsealSession } from "@/lib/session";

export function serverDomain(): Domain {
  return { db: getDb() };
}

/** The live session id behind a cookie value, or null. */
export async function liveSessionId(domain: Domain, cookieValue: string | undefined) {
  const id = unsealSession(cookieValue, serverEnv().SESSION_KEY);
  if (!id) return null;
  return (await sessionIsLive(domain, id)) ? id : null;
}

/** For pages: is Doom signed in? */
export async function isSignedIn(): Promise<boolean> {
  const store = await cookies();
  return (await liveSessionId(serverDomain(), store.get(SESSION_COOKIE)?.value)) !== null;
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

type Handler = (domain: Domain, sessionId: string) => Promise<Response>;

/**
 * Run an administrator handler: same origin for anything that changes state, a live
 * session for everything, the event in place, and a plain failure that reveals nothing.
 */
export async function asAdmin(request: Request, handler: Handler): Promise<Response> {
  try {
    if (request.method !== "GET" && !sameOrigin(request)) return json({ error: "forbidden" }, 403);
    const domain = serverDomain();
    const sessionId = await liveSessionId(
      domain,
      readCookie(request.headers.get("cookie"), SESSION_COOKIE),
    );
    if (!sessionId) return json({ error: "signed_out" }, 401);
    await ensureEvent(domain, serverEnv().EVENT_TIMEZONE);
    return await handler(domain, sessionId);
  } catch (failure) {
    if (failure instanceof BadRequest) return json({ error: "bad_request" }, 400);
    // Never log the error itself: a query error carries its parameters.
    console.error("administrator action failed");
    return json({ error: "failed" }, 500);
  }
}
