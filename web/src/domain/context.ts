import type { NodePgDatabase } from "drizzle-orm/node-postgres";

/**
 * Every domain function takes the database and, optionally, a clock, so tests can set
 * the time. Nothing in src/domain imports Next.js or Vercel.
 */
export type Domain = {
  db: NodePgDatabase;
  now?: () => Date;
};

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
