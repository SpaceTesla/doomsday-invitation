import type { NodePgDatabase } from "drizzle-orm/node-postgres";

/**
 * Every domain function takes the database and, optionally, a clock, so tests can set
 * the time. Nothing in src/domain imports Next.js or Vercel.
 */
export type Domain = {
  db: NodePgDatabase;
  now?: () => Date;
};

/**
 * The domain, scoped to one event. Every function that reads or changes an event's
 * guests, roster, proposal or decree takes this, and every query it runs is limited to
 * `eventId`, so an id from another event matches nothing. Callers build it only after
 * proving the right to the event: the organizer owns it (src/lib/admin.ts), or the guest's
 * link belongs to it (src/lib/guest.ts).
 */
export type EventDomain = Domain & { eventId: number };

export const forEvent = (domain: Domain, eventId: number): EventDomain => ({
  // Read through, so a domain whose database is attached later (in tests) still works.
  get db() {
    return domain.db;
  },
  get now() {
    return domain.now;
  },
  eventId,
});

export const nowOf = (domain: Domain): Date => (domain.now ? domain.now() : new Date());

/** A refused action, with a reason the screen can explain in the copy deck's words. */
export type Refused<Reason extends string> = { ok: false; reason: Reason };

export const refuse = <Reason extends string>(reason: Reason): Refused<Reason> => ({
  ok: false,
  reason,
});

/** The PostgreSQL error code behind a failed query, through Drizzle's wrapper. */
export function postgresCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    if (typeof current === "object" && current !== null && "code" in current) {
      const code = (current as { code: unknown }).code;
      if (typeof code === "string") return code;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

export const UNIQUE_VIOLATION = "23505";
export const FOREIGN_KEY_VIOLATION = "23503";
