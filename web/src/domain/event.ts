// The event and its cut-offs. docs/ARCHITECTURE.md, section 4.3:
//
// - "The day" is the date of the decree, or of the current proposal while there is
//   none, in the event's time zone. Cut-offs fall at its end. The decree's date is the
//   proposal's date once finalised, so both are read from proposal_at.
// - Thirty days after the day, links stop working and the data is deleted.
import { eq } from "drizzle-orm";
import { event } from "@/db/schema";
import { type Domain } from "./context";
import { endOfLocalDay, isTimeZone, localDate, type LocalDate } from "./time";

export const EVENT_ID = 1;
export const RETENTION_DAYS = 30;

export type EventRow = typeof event.$inferSelect;

/** Create the one event row if it does not exist yet. Safe to call on every request. */
export async function ensureEvent(domain: Domain, timeZone: string): Promise<EventRow> {
  if (!isTimeZone(timeZone)) throw new Error(`Unknown time zone: ${timeZone}`);
  await domain.db.insert(event).values({ id: EVENT_ID, timezone: timeZone }).onConflictDoNothing();
  const row = await getEvent(domain);
  if (!row) throw new Error("The event row could not be created.");
  return row;
}

export async function getEvent(domain: Domain): Promise<EventRow | undefined> {
  const rows = await domain.db.select().from(event).where(eq(event.id, EVENT_ID));
  return rows[0];
}

/** The date of the screening in the event's time zone, or null while nothing is proposed. */
export function theDay(row: EventRow): LocalDate | null {
  return row.proposalAt ? localDate(row.proposalAt, row.timezone) : null;
}

/** The moment the day ends: after it, nobody may accept. Null while there is no day. */
export function endOfTheDay(row: EventRow): Date | null {
  const day = theDay(row);
  return day ? endOfLocalDay(day, row.timezone) : null;
}

export function dayHasPassed(row: EventRow, now: Date): boolean {
  const end = endOfTheDay(row);
  return end !== null && now.getTime() >= end.getTime();
}

/** The moment every link stops working and the data is deleted. */
export function expiresAt(row: EventRow): Date | null {
  const day = theDay(row);
  if (!day) return null;
  const later = new Date(Date.UTC(day.year, day.month - 1, day.day + RETENTION_DAYS));
  return endOfLocalDay(
    { year: later.getUTCFullYear(), month: later.getUTCMonth() + 1, day: later.getUTCDate() },
    row.timezone,
  );
}

export function hasExpired(row: EventRow, now: Date): boolean {
  const end = expiresAt(row);
  return end !== null && now.getTime() >= end.getTime();
}

export const isDecreed = (row: EventRow): boolean => row.finalisedAt !== null;

export async function requireEvent(domain: Domain): Promise<EventRow> {
  const row = await getEvent(domain);
  if (!row) throw new Error("No event exists yet.");
  return row;
}
