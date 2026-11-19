// Guests, their links and their answers. docs/PRODUCT_SPEC.md, sections 2 and 3.
// Every statement is limited to the domain's event: a guest id from another event
// matches nothing, and is answered as an unknown guest.
import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { alternative, event, guest } from "@/db/schema";
import { nowOf, refuse, type Domain, type EventDomain, type Refused } from "./context";
import { dayHasPassed, getEvent, hasExpired, type EventRow } from "./event";
import { looksLikeGuestToken, newGuestToken } from "./tokens";

export type GuestRow = typeof guest.$inferSelect;

/** How Doom may address a guest. An empty string is no title: the name stands alone. */
export const TITLES = ["", "Mr.", "Ms.", "Dr."] as const;
export type Title = (typeof TITLES)[number];

export type GuestInput = { name: string; title: Title };

function cleanName(name: string): string {
  // Stored as typed. Only the spaces around it are dropped.
  return name.trim();
}

/** "Mr. Anish", or "Anish" with no title. */
export function addressOf(row: { title: string; name: string }): string {
  return row.title ? `${row.title} ${row.name}` : row.name;
}

/** This guest, in this event. */
const ours = (domain: EventDomain, guestId: string) =>
  and(eq(guest.id, guestId), eq(guest.eventId, domain.eventId));

/** The decree of the guest's own event has not been made. */
const ownEventNotDecreed = sql`(select e.finalised_at from ${event} e where e.id = ${guest.eventId}) is null`;

// ---------------------------------------------------------------- organizer

export async function addGuest(
  domain: EventDomain,
  input: GuestInput,
): Promise<{ ok: true; id: string; token: string } | Refused<"no_name" | "bad_title">> {
  const name = cleanName(input.name);
  if (!name) return refuse("no_name");
  if (!TITLES.includes(input.title)) return refuse("bad_title");
  const token = newGuestToken();
  const [row] = await domain.db
    .insert(guest)
    .values({ eventId: domain.eventId, name, title: input.title, token, invitedAt: nowOf(domain) })
    .returning({ id: guest.id });
  return { ok: true, id: row.id, token };
}

export async function editGuest(
  domain: EventDomain,
  id: string,
  input: GuestInput,
): Promise<{ ok: true } | Refused<"no_name" | "bad_title" | "unknown_guest">> {
  const name = cleanName(input.name);
  if (!name) return refuse("no_name");
  if (!TITLES.includes(input.title)) return refuse("bad_title");
  const rows = await domain.db
    .update(guest)
    .set({ name, title: input.title })
    .where(ours(domain, id))
    .returning({ id: guest.id });
  return rows.length ? { ok: true } : refuse("unknown_guest");
}

/**
 * Remove a guest, answered or not. Their character is freed with the row, their
 * alternative goes by cascade, and their approval goes with them. The link then
 * behaves as an invalid link.
 */
export async function removeGuest(domain: EventDomain, id: string): Promise<{ ok: true }> {
  await domain.db.delete(guest).where(ours(domain, id));
  return { ok: true };
}

/** A new link. The old one stops working at once. */
export async function replaceLink(
  domain: EventDomain,
  id: string,
): Promise<{ ok: true; token: string } | Refused<"unknown_guest">> {
  const token = newGuestToken();
  const rows = await domain.db
    .update(guest)
    .set({ token })
    .where(ours(domain, id))
    .returning({ id: guest.id });
  return rows.length ? { ok: true, token } : refuse("unknown_guest");
}

export async function cancelLink(
  domain: EventDomain,
  id: string,
): Promise<{ ok: true } | Refused<"unknown_guest">> {
  const rows = await domain.db
    .update(guest)
    .set({ token: null })
    .where(ours(domain, id))
    .returning({ id: guest.id });
  return rows.length ? { ok: true } : refuse("unknown_guest");
}

// ---------------------------------------------------------------- finding a guest

/**
 * The guest a link belongs to, with that guest's own event. Null for every link that must
 * show the invalid-link screen: malformed, unknown, cancelled, replaced, or past its
 * event's retention. The caller cannot tell these apart, and neither can the guest.
 */
export async function findByToken(
  domain: Domain,
  token: string,
): Promise<{ guest: GuestRow; event: EventRow } | null> {
  if (!looksLikeGuestToken(token)) return null;
  const rows = await domain.db
    .select({ guest, event })
    .from(guest)
    .innerJoin(event, eq(event.id, guest.eventId))
    .where(eq(guest.token, token));
  const found = rows[0];
  if (!found || hasExpired(found.event, nowOf(domain))) return null;
  return found;
}

/** What a guest's link shows, by state. docs/ARCHITECTURE.md, section 5. */
export type Stage = "opening" | "summons" | "council" | "closing" | "day_passed";

export function stageOf(row: GuestRow, eventRow: EventRow, now: Date): Stage {
  if (row.status === "seated") return "council";
  if (dayHasPassed(eventRow, now)) return "day_passed";
  if (row.status === "declined") return "closing";
  return row.openingPlayedAt ? "summons" : "opening";
}

export async function recordOpened(domain: EventDomain, guestId: string): Promise<void> {
  await domain.db
    .update(guest)
    .set({ openedAt: nowOf(domain) })
    .where(and(ours(domain, guestId), isNull(guest.openedAt)));
}

export async function recordOpeningPlayed(domain: EventDomain, guestId: string): Promise<void> {
  const now = nowOf(domain);
  await domain.db
    .update(guest)
    .set({ openingPlayedAt: now, openedAt: sql`coalesce(${guest.openedAt}, ${now})` })
    .where(and(ours(domain, guestId), isNull(guest.openingPlayedAt)));
}

// ---------------------------------------------------------------- answering

/** Take your seat. Allowed until the end of the day, from summoned or declined. */
export async function accept(
  domain: EventDomain,
  guestId: string,
): Promise<{ ok: true } | Refused<"after_day" | "unknown_guest">> {
  const eventRow = await getEvent(domain);
  if (eventRow && dayHasPassed(eventRow, nowOf(domain))) {
    // A guest already seated stays seated; nobody new is seated after the day.
    const rows = await domain.db
      .select({ status: guest.status })
      .from(guest)
      .where(ours(domain, guestId));
    if (!rows[0]) return refuse("unknown_guest");
    return rows[0].status === "seated" ? { ok: true } : refuse("after_day");
  }
  const updated = await domain.db
    .update(guest)
    .set({ status: "seated", answeredAt: nowOf(domain) })
    .where(and(ours(domain, guestId), ne(guest.status, "seated")))
    .returning({ id: guest.id });
  if (updated.length) return { ok: true };
  const rows = await domain.db.select({ id: guest.id }).from(guest).where(ours(domain, guestId));
  return rows.length ? { ok: true } : refuse("unknown_guest");
}

/** Refuse the summons. A seated guest leaves the council instead (see leave). */
export async function decline(
  domain: EventDomain,
  guestId: string,
): Promise<{ ok: true } | Refused<"seated" | "unknown_guest">> {
  const updated = await domain.db
    .update(guest)
    .set({ status: "declined", answeredAt: nowOf(domain) })
    .where(and(ours(domain, guestId), eq(guest.status, "summoned")))
    .returning({ id: guest.id });
  if (updated.length) return { ok: true };
  const rows = await domain.db
    .select({ status: guest.status })
    .from(guest)
    .where(ours(domain, guestId));
  if (!rows[0]) return refuse("unknown_guest");
  return rows[0].status === "declined" ? { ok: true } : refuse("seated");
}

/**
 * Leave the council, until the decree. The guest counts as declined; their character
 * is freed and their approval and alternative are struck out, all or nothing.
 */
export async function leave(
  domain: EventDomain,
  guestId: string,
): Promise<{ ok: true } | Refused<"after_decree" | "not_seated" | "unknown_guest">> {
  const changed = await domain.db.transaction(async (tx) => {
    const rows = await tx
      .update(guest)
      .set({
        status: "declined",
        characterId: null,
        approvedVersion: null,
        answeredAt: nowOf(domain),
      })
      .where(and(ours(domain, guestId), eq(guest.status, "seated"), ownEventNotDecreed))
      .returning({ id: guest.id });
    if (rows.length) {
      await tx.delete(alternative).where(eq(alternative.guestId, guestId));
    }
    return rows.length > 0;
  });
  if (changed) return { ok: true };

  const rows = await domain.db
    .select({ status: guest.status })
    .from(guest)
    .where(ours(domain, guestId));
  if (!rows[0]) return refuse("unknown_guest");
  if (rows[0].status === "declined") return { ok: true };
  if (rows[0].status !== "seated") return refuse("not_seated");
  return refuse("after_decree");
}

/** Record that the guest has seen the current proposal and decree, so notices show once. */
export async function markSeen(domain: EventDomain, guestId: string): Promise<void> {
  await domain.db.execute(sql`
    update ${guest} set
      seen_proposal = e.proposal_version,
      seen_plan = case when e.finalised_at is null then ${guest.seenPlan} else e.plan_version + 1 end
    from ${event} e
    where ${guest.id} = ${guestId} and ${guest.eventId} = ${domain.eventId}
      and e.id = ${guest.eventId}
  `);
}
