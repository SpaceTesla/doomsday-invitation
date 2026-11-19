// Events and their cut-offs. docs/ARCHITECTURE.md, sections 4.3 and 4.4:
//
// - Each event belongs to one organizer. Only that organizer can read or change it;
//   `ownedEvent` is the one check every organizer action goes through.
// - "The day" is the date of the decree, or of the current proposal while there is
//   none, in the event's time zone. Cut-offs fall at its end. The decree's date is the
//   proposal's date once finalised, so both are read from proposal_at.
// - Thirty days after the day, the event's links stop working and its data is deleted.
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { character, event, guest, organizer } from "@/db/schema";
import { refuse, type Domain, type EventDomain, type Refused } from "./context";
import { DEFAULT_ROSTER } from "./roster";
import { endOfLocalDay, isTimeZone, localDate, type LocalDate } from "./time";

export const RETENTION_DAYS = 30;

export type EventRow = typeof event.$inferSelect;

export const HOST_NAME_MAX = 60;

/**
 * What an organizer sets about an event. Events have no name of their own: each is the one
 * summons to the screening, told apart on the dashboard by its day and venue.
 */
export type EventInput = { timeZone: string; hostName: string };

type EventRefusal = Refused<"bad_time_zone">;

/** Spaces collapsed and trimmed; an empty host name is none. */
function clean(input: EventInput) {
  const hostName = input.hostName.trim().replace(/\s+/g, " ").slice(0, HOST_NAME_MAX);
  return { hostName: hostName || null, timeZone: input.timeZone };
}

function check(input: ReturnType<typeof clean>): EventRefusal | null {
  if (!isTimeZone(input.timeZone)) return refuse("bad_time_zone");
  return null;
}

/** Guests are summoned only once a day is proposed: the summons and council are built on it. */
export const canSummon = (row: EventRow): boolean => row.proposalAt !== null;

/**
 * A new event for an organizer, with the default roster to start from. Only scripts make
 * one with no owner (null); the API always passes the signed-in organizer.
 */
export async function createEvent(
  domain: Domain,
  organizerId: string | null,
  input: EventInput,
): Promise<{ ok: true; id: number } | EventRefusal> {
  const cleaned = clean(input);
  const problem = check(cleaned);
  if (problem) return problem;
  const id = await domain.db.transaction(async (tx) => {
    const [row] = await tx
      .insert(event)
      .values({
        organizerId,
        hostName: cleaned.hostName,
        timezone: cleaned.timeZone,
      })
      .returning({ id: event.id });
    await tx.insert(character).values(
      DEFAULT_ROSTER.map((entry) => ({
        eventId: row.id,
        name: entry.name,
        nameKey: entry.name.trim().toLowerCase(),
        faction: entry.faction,
        position: entry.position,
      })),
    );
    return row.id;
  });
  return { ok: true, id };
}

/**
 * The event, if this organizer owns it. Null for an event that does not exist, belongs to
 * someone else, or has no owner yet: the caller answers all three the same way.
 */
export async function ownedEvent(
  domain: Domain,
  organizerId: string,
  eventId: number,
): Promise<EventRow | null> {
  if (!Number.isSafeInteger(eventId) || eventId < 1) return null;
  const rows = await domain.db
    .select()
    .from(event)
    .where(and(eq(event.id, eventId), eq(event.organizerId, organizerId)));
  return rows[0] ?? null;
}

export type EventSummary = {
  id: number;
  timeZone: string;
  proposalAt: Date | null;
  proposalVenue: string | null;
  decreed: boolean;
  summoned: number;
  seated: number;
};

/** An organizer's events, newest first, with how many are summoned and seated. */
export async function listEvents(domain: Domain, organizerId: string): Promise<EventSummary[]> {
  const rows = await domain.db
    .select({
      id: event.id,
      timeZone: event.timezone,
      proposalAt: event.proposalAt,
      proposalVenue: event.proposalVenue,
      finalisedAt: event.finalisedAt,
      summoned: sql<number>`count(${guest.id})::int`,
      seated: sql<number>`count(${guest.id}) filter (where ${guest.status} = 'seated')::int`,
    })
    .from(event)
    .leftJoin(guest, eq(guest.eventId, event.id))
    .where(eq(event.organizerId, organizerId))
    .groupBy(event.id)
    .orderBy(sql`${event.createdAt} desc`, asc(event.id));
  return rows.map(({ finalisedAt, ...row }) => ({ ...row, decreed: finalisedAt !== null }));
}

/**
 * Set the name beneath Doom, and the time zone. The time zone can change only while
 * nothing is proposed, since every date already set is a time in it.
 */
export async function updateEvent(
  domain: EventDomain,
  input: EventInput,
): Promise<{ ok: true } | EventRefusal | Refused<"zone_fixed" | "no_event">> {
  const cleaned = clean(input);
  const problem = check(cleaned);
  if (problem) return problem;
  const row = await getEvent(domain);
  if (!row) return refuse("no_event");
  if (cleaned.timeZone !== row.timezone && row.proposalAt) return refuse("zone_fixed");
  await domain.db
    .update(event)
    .set({ hostName: cleaned.hostName, timezone: cleaned.timeZone })
    .where(eq(event.id, domain.eventId));
  return { ok: true };
}

/** Delete the event and everything in it: guests, links, roster, approvals, alternatives. */
export async function deleteEvent(domain: EventDomain): Promise<void> {
  // The foreign keys cascade from the event to its guests and characters, and from each
  // guest to their alternative.
  await domain.db.delete(event).where(eq(event.id, domain.eventId));
}

export async function getEvent(domain: EventDomain): Promise<EventRow | undefined> {
  const rows = await domain.db.select().from(event).where(eq(event.id, domain.eventId));
  return rows[0];
}

export async function requireEvent(domain: EventDomain): Promise<EventRow> {
  const row = await getEvent(domain);
  if (!row) throw new Error("The event does not exist.");
  return row;
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

/**
 * Give every event without an owner (the first event, from before organizers) to the
 * organizer with this email, and optionally set the name beneath Doom on them. Run once,
 * by the owner, from scripts/claim-event.ts. Events that already have an owner are never
 * touched. Answers the ids it claimed, or null when no organizer has that email.
 */
export async function claimUnownedEvents(
  domain: Domain,
  email: string,
  hostName?: string,
): Promise<number[] | null> {
  const [owner] = await domain.db
    .select({ id: organizer.id })
    .from(organizer)
    .where(eq(sql`lower(${organizer.email})`, email.trim().toLowerCase()));
  if (!owner) return null;
  const host = hostName?.trim().replace(/\s+/g, " ").slice(0, HOST_NAME_MAX);
  const rows = await domain.db
    .update(event)
    .set(host ? { organizerId: owner.id, hostName: host } : { organizerId: owner.id })
    .where(isNull(event.organizerId))
    .returning({ id: event.id });
  return rows.map((row) => row.id);
}
