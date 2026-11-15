// Failed attempts, counted in the database (attempt). Five in fifteen minutes locks
// that key for fifteen minutes. docs/ARCHITECTURE.md, section 7.3.
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { attempt } from "@/db/schema";
import { nowOf, type Domain } from "@/domain/context";

export const LIMIT = 5;
export const WINDOW_MS = 15 * 60 * 1000;

export async function isLocked(domain: Domain, key: string): Promise<boolean> {
  const since = new Date(nowOf(domain).getTime() - WINDOW_MS);
  const [row] = await domain.db
    .select({ count: sql<number>`count(*)::int` })
    .from(attempt)
    .where(and(eq(attempt.key, key), gte(attempt.at, since)));
  return (row?.count ?? 0) >= LIMIT;
}

export async function recordFailure(domain: Domain, key: string): Promise<void> {
  const now = nowOf(domain);
  await domain.db.insert(attempt).values({ key, at: now });
  // Keep the table small: nothing older than a day matters.
  await domain.db
    .delete(attempt)
    .where(lt(attempt.at, new Date(now.getTime() - 24 * 60 * 60 * 1000)));
}

export async function clearFailures(domain: Domain, key: string): Promise<void> {
  await domain.db.delete(attempt).where(eq(attempt.key, key));
}

/** The caller's address as Vercel reports it. Used only as a counting key. */
export function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}
