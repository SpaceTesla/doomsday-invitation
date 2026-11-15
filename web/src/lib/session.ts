// The administrator's session: a random id signed with HMAC-SHA256, in an HttpOnly,
// SameSite=Strict cookie. The id must also exist, unexpired, in admin_session, so
// signing out really ends it. docs/ARCHITECTURE.md, section 7.3.
import crypto from "node:crypto";
import { and, eq, gt, lte } from "drizzle-orm";
import { adminSession } from "@/db/schema";
import { nowOf, type Domain } from "@/domain/context";

export const SESSION_COOKIE = "throne_session";
export const SESSION_DAYS = 7;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

function sign(id: string, key: string): string {
  return crypto.createHmac("sha256", key).update(id).digest("base64url");
}

/** The cookie's value for a session id: "id.signature". */
export function sealSession(id: string, key: string): string {
  return `${id}.${sign(id, key)}`;
}

/** The session id inside a cookie value, if its signature holds. */
export function unsealSession(value: string | undefined, key: string): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = value.slice(0, dot);
  const given = Buffer.from(value.slice(dot + 1));
  const expected = Buffer.from(sign(id, key));
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  return /^[0-9a-f-]{36}$/.test(id) ? id : null;
}

export async function startSession(domain: Domain): Promise<{ id: string; expiresAt: Date }> {
  const now = nowOf(domain);
  // Old sessions are swept as new ones begin.
  await domain.db.delete(adminSession).where(lte(adminSession.expiresAt, now));
  const id = crypto.randomUUID();
  const expiresAt = new Date(now.getTime() + SESSION_MS);
  await domain.db.insert(adminSession).values({ id, expiresAt });
  return { id, expiresAt };
}

export async function sessionIsLive(domain: Domain, id: string): Promise<boolean> {
  const rows = await domain.db
    .select({ id: adminSession.id })
    .from(adminSession)
    .where(and(eq(adminSession.id, id), gt(adminSession.expiresAt, nowOf(domain))));
  return rows.length > 0;
}

export async function endSession(domain: Domain, id: string): Promise<void> {
  await domain.db.delete(adminSession).where(eq(adminSession.id, id));
}

/** A cookie value from a Cookie header. */
export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index > 0 && part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return undefined;
}

const secureFlag = () => (process.env.NODE_ENV === "production" ? "; Secure" : "");

export function sessionCookieHeader(value: string, expiresAt: Date): string {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Expires=${expiresAt.toUTCString()}${secureFlag()}`;
}

export function clearedSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureFlag()}`;
}
