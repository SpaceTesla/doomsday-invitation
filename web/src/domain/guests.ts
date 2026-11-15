// Guests, their links and their answers. docs/PRODUCT_SPEC.md, sections 2 and 3.
import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { alternative, event, guest } from "@/db/schema";
import { nowOf, refuse, type Domain, type Refused } from "./context";
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

// ---------------------------------------------------------------- administrator

export async function addGuest(
  domain: Domain,
  input: GuestInput,
): Promise<{ ok: true; id: string; token: string } | Refused<"no_name" | "bad_title">> {
  const name = cleanName(input.name);
  if (!name) return refuse("no_name");
  if (!TITLES.includes(input.title)) return refuse("bad_title");
  const token = newGuestToken();
  const [row] = await domain.db
    .insert(guest)
    .values({ name, title: input.title, token, invitedAt: nowOf(domain) })
    .returning({ id: guest.id });
  return { ok: true, id: row.id, token };
}

export async function editGuest(
  domain: Domain,
  id: string,
  input: GuestInput,
): Promise<{ ok: true } | Refused<"no_name" | "bad_title" | "unknown_guest">> {
  const name = cleanName(input.name);
  if (!name) return refuse("no_name");
  if (!TITLES.includes(input.title)) return refuse("bad_title");
  const rows = await domain.db
    .update(guest)
    .set({ name, title: input.title })
    .where(eq(guest.id, id))
    .returning({ id: guest.id });
  return rows.length ? { ok: true } : refuse("unknown_guest");
}

/**
 * Remove a guest, answered or not. Their character is freed with the row, their
 * alternative goes by cascade, and their approval goes with them. The link then
 * behaves as an invalid link.
 */
export async function removeGuest(domain: Domain, id: string): Promise<{ ok: true }> {
  await domain.db.delete(guest).where(eq(guest.id, id));
  return { ok: true };
}

/** A new link. The old one stops working at once. */
export async function replaceLink(
  domain: Domain,
  id: string,
): Promise<{ ok: true; token: string } | Refused<"unknown_guest">> {
  const token = newGuestToken();
  const rows = await domain.db
    .update(guest)
    .set({ token })
    .where(eq(guest.id, id))
    .returning({ id: guest.id });
  return rows.length ? { ok: true, token } : refuse("unknown_guest");
}

export async function cancelLink(
  domain: Domain,
  id: string,
): Promise<{ ok: true } | Refused<"unknown_guest">> {
  const rows = await domain.db
    .update(guest)
    .set({ token: null })
    .where(eq(guest.id, id))
    .returning({ id: guest.id });
  return rows.length ? { ok: true } : refuse("unknown_guest");
}

// ---------------------------------------------------------------- finding a guest

/**
 * The guest a link belongs to, with the event. Null for every link that must show the
 * invalid-link screen: malformed, unknown, cancelled, replaced, or past retention. The
 * caller cannot tell these apart, and neither can the guest.
 */
export async function findByToken(
  domain: Domain,
  token: string,
): Promise<{ guest: GuestRow; event: EventRow } | null> {
  if (!looksLikeGuestToken(token)) return null;
  const rows = await domain.db.select().from(guest).where(eq(guest.token, token));
  const found = rows[0];
  if (!found) return null;
  const row = await getEvent(domain);
  if (!row || hasExpired(row, nowOf(domain))) return null;
  return { guest: found, event: row };
}

/** What a guest's link shows, by state. docs/ARCHITECTURE.md, section 5. */
export type Stage = "opening" | "summons" | "council" | "closing" | "day_passed";

export function stageOf(row: GuestRow, eventRow: EventRow, now: Date): Stage {
  if (row.status === "seated") return "council";
  if (dayHasPassed(eventRow, now)) return "day_passed";
  if (row.status === "declined") return "closing";
  return row.openingPlayedAt ? "summons" : "opening";
}

export async function recordOpened(domain: Domain, guestId: string): Promise<void> {
  await domain.db
    .update(guest)
    .set({ openedAt: nowOf(domain) })
    .where(and(eq(guest.id, guestId), isNull(guest.openedAt)));
}

export async function recordOpeningPlayed(domain: Domain, guestId: string): Promise<void> {
  const now = nowOf(domain);
  await domain.db
    .update(guest)
    .set({ openingPlayedAt: now, openedAt: sql`coalesce(${guest.openedAt}, ${now})` })
    .where(and(eq(guest.id, guestId), isNull(guest.openingPlayedAt)));
}

// ---------------------------------------------------------------- answering

/** Take your seat. Allowed until the end of the day, from summoned or declined. */
export async function accept(
  domain: Domain,
  guestId: string,
): Promise<{ ok: true } | Refused<"after_day" | "unknown_guest">> {
  const eventRow = await getEvent(domain);
  if (eventRow && dayHasPassed(eventRow, nowOf(domain))) {
    // A guest already seated stays seated; nobody new is seated after the day.
    const rows = await domain.db
      .select({ status: guest.status })
      .from(guest)
      .where(eq(guest.id, guestId));
    if (!rows[0]) return refuse("unknown_guest");
    return rows[0].status === "seated" ? { ok: true } : refuse("after_day");
  }
  const updated = await domain.db
    .update(guest)
    .set({ status: "seated", answeredAt: nowOf(domain) })
    .where(and(eq(guest.id, guestId), ne(guest.status, "seated")))
    .returning({ id: guest.id });
  if (updated.length) return { ok: true };
  const rows = await domain.db.select({ id: guest.id }).from(guest).where(eq(guest.id, guestId));
  return rows.length ? { ok: true } : refuse("unknown_guest");
}

/** Refuse the summons. A seated guest leaves the council instead (see leave). */
export async function decline(
  domain: Domain,
  guestId: string,
): Promise<{ ok: true } | Refused<"seated" | "unknown_guest">> {
  const updated = await domain.db
    .update(guest)
    .set({ status: "declined", answeredAt: nowOf(domain) })
    .where(and(eq(guest.id, guestId), eq(guest.status, "summoned")))
    .returning({ id: guest.id });
  if (updated.length) return { ok: true };
  const rows = await domain.db
    .select({ status: guest.status })
    .from(guest)
    .where(eq(guest.id, guestId));
  if (!rows[0]) return refuse("unknown_guest");
  return rows[0].status === "declined" ? { ok: true } : refuse("seated");
}

/**
 * Leave the council, until the decree. The guest counts as declined; their character
 * is freed and their approval and alternative are struck out, all or nothing.
 */
export async function leave(
  domain: Domain,
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
      .where(
        and(
          eq(guest.id, guestId),
          eq(guest.status, "seated"),
          sql`(select ${event.finalisedAt} from ${event} where ${event.id} = 1) is null`,
        ),
      )
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
    .where(eq(guest.id, guestId));
  if (!rows[0]) return refuse("unknown_guest");
  if (rows[0].status === "declined") return { ok: true };
  if (rows[0].status !== "seated") return refuse("not_seated");
  return refuse("after_decree");
}

/** Record that the guest has seen the current proposal and decree, so notices show once. */
export async function markSeen(domain: Domain, guestId: string): Promise<void> {
  await domain.db.execute(sql`
    update ${guest} set
      seen_proposal = e.proposal_version,
      seen_plan = case when e.finalised_at is null then ${guest.seenPlan} else e.plan_version + 1 end
    from ${event} e
    where ${guest.id} = ${guestId} and e.id = 1
  `);
}
