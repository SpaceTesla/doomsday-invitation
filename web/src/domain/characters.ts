// The roster and who holds what. docs/PRODUCT_SPEC.md, Stage 3 and section 3.9.
//
// One guest per character is a database constraint (guest.character_id is unique).
// Claiming or changing is one UPDATE: two guests racing for a character cannot both
// win, and a guest changing character never holds two or none. Every statement is
// limited to the domain's event, so a character or guest of another event matches nothing.
import { and, eq, sql } from "drizzle-orm";
import { character, event, guest } from "@/db/schema";
import {
  FOREIGN_KEY_VIOLATION,
  postgresCode,
  refuse,
  UNIQUE_VIOLATION,
  type EventDomain,
  type Refused,
} from "./context";
import type { Faction } from "./factions";

export type Holder = { title: string; name: string };

const nameKey = (name: string) => name.trim().toLowerCase();

export async function addCharacter(
  domain: EventDomain,
  rawName: string,
  faction: Faction | null = null,
): Promise<{ ok: true; id: string } | Refused<"no_name" | "duplicate">> {
  const name = rawName.trim();
  if (!name) return refuse("no_name");
  try {
    const [row] = await domain.db
      .insert(character)
      .values({ eventId: domain.eventId, name, nameKey: nameKey(name), faction })
      .returning({ id: character.id });
    return { ok: true, id: row.id };
  } catch (error) {
    if (postgresCode(error) === UNIQUE_VIOLATION) return refuse("duplicate");
    throw error;
  }
}

/** The guest of this event holding a character, if any. */
export async function holderOf(domain: EventDomain, characterId: string): Promise<Holder | null> {
  const rows = await domain.db
    .select({ title: guest.title, name: guest.name })
    .from(guest)
    .where(and(eq(guest.characterId, characterId), eq(guest.eventId, domain.eventId)));
  return rows[0] ?? null;
}

/**
 * Remove a character from the roster. If a guest holds it, Doom is warned first, by
 * name; with `confirm` it is removed and that guest is sent back to choose again.
 * A character of another event is left alone.
 */
export async function removeCharacter(
  domain: EventDomain,
  characterId: string,
  options: { confirm?: boolean } = {},
): Promise<{ ok: true } | ({ ok: false; reason: "held" } & { holder: Holder })> {
  if (!options.confirm) {
    const holder = await holderOf(domain, characterId);
    if (holder) return { ok: false, reason: "held", holder };
  }
  await domain.db.transaction(async (tx) => {
    const [removed] = await tx
      .select({ name: character.name })
      .from(character)
      .where(and(eq(character.id, characterId), eq(character.eventId, domain.eventId)));
    if (!removed) return;
    await tx
      .update(guest)
      .set({ characterRemoved: true, removedCharacterName: removed.name })
      .where(and(eq(guest.characterId, characterId), eq(guest.eventId, domain.eventId)));
    // The foreign key clears guest.character_id.
    await tx
      .delete(character)
      .where(and(eq(character.id, characterId), eq(character.eventId, domain.eventId)));
  });
  return { ok: true };
}

export type ClaimRefusal =
  | { ok: false; reason: "taken"; holder: Holder }
  | Refused<"not_seated" | "after_decree" | "unknown_character" | "unknown_guest">;

/**
 * Claim a character, or change to another. A first choice is allowed after the decree;
 * a change is not. If someone else holds it, the answer names them. Only a character of
 * the guest's own event can be claimed.
 */
export async function claimCharacter(
  domain: EventDomain,
  guestId: string,
  characterId: string,
): Promise<{ ok: true } | ClaimRefusal> {
  try {
    const rows = await domain.db
      .update(guest)
      .set({ characterId, characterRemoved: false, removedCharacterName: null })
      .where(
        and(
          eq(guest.id, guestId),
          eq(guest.eventId, domain.eventId),
          eq(guest.status, "seated"),
          sql`exists (select 1 from ${character} c
                      where c.id = ${characterId} and c.event_id = ${guest.eventId})`,
          sql`(${guest.characterId} is null
               or ${guest.characterId} = ${characterId}
               or (select e.finalised_at from ${event} e where e.id = ${guest.eventId}) is null)`,
        ),
      )
      .returning({ id: guest.id });
    if (rows.length) return { ok: true };
  } catch (error) {
    const code = postgresCode(error);
    if (code === UNIQUE_VIOLATION) {
      const holder = await holderOf(domain, characterId);
      // The holder may have let go between the conflict and this read. Say so plainly
      // and let the guest try again rather than inventing a name.
      return holder ? { ok: false, reason: "taken", holder } : refuse("unknown_character");
    }
    if (code === FOREIGN_KEY_VIOLATION) return refuse("unknown_character");
    throw error;
  }

  // Nothing changed: say why.
  const rows = await domain.db
    .select({ status: guest.status })
    .from(guest)
    .where(and(eq(guest.id, guestId), eq(guest.eventId, domain.eventId)));
  if (!rows[0]) return refuse("unknown_guest");
  if (rows[0].status !== "seated") return refuse("not_seated");
  const known = await domain.db
    .select({ id: character.id })
    .from(character)
    .where(and(eq(character.id, characterId), eq(character.eventId, domain.eventId)));
  if (!known.length) return refuse("unknown_character");
  return refuse("after_decree");
}
