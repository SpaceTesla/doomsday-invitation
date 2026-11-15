// The roster and who holds what. docs/PRODUCT_SPEC.md, Stage 3 and section 3.9.
//
// One guest per character is a database constraint (guest.character_id is unique).
// Claiming or changing is one UPDATE: two guests racing for a character cannot both
// win, and a guest changing character never holds two or none.
import { and, eq, sql } from "drizzle-orm";
import { character, event, guest } from "@/db/schema";
import {
  FOREIGN_KEY_VIOLATION,
  postgresCode,
  refuse,
  UNIQUE_VIOLATION,
  type Domain,
  type Refused,
} from "./context";

export type Holder = { title: string; name: string };

const nameKey = (name: string) => name.trim().toLowerCase();

export async function addCharacter(
  domain: Domain,
  rawName: string,
): Promise<{ ok: true; id: string } | Refused<"no_name" | "duplicate">> {
  const name = rawName.trim();
  if (!name) return refuse("no_name");
  try {
    const [row] = await domain.db
      .insert(character)
      .values({ name, nameKey: nameKey(name) })
      .returning({ id: character.id });
    return { ok: true, id: row.id };
  } catch (error) {
    if (postgresCode(error) === UNIQUE_VIOLATION) return refuse("duplicate");
    throw error;
  }
}

/** The guest holding a character, if any. */
export async function holderOf(domain: Domain, characterId: string): Promise<Holder | null> {
  const rows = await domain.db
    .select({ title: guest.title, name: guest.name })
    .from(guest)
    .where(eq(guest.characterId, characterId));
  return rows[0] ?? null;
}

/**
 * Remove a character from the roster. If a guest holds it, Doom is warned first, by
 * name; with `confirm` it is removed and that guest is sent back to choose again.
 */
export async function removeCharacter(
  domain: Domain,
  characterId: string,
  options: { confirm?: boolean } = {},
): Promise<{ ok: true } | ({ ok: false; reason: "held" } & { holder: Holder })> {
  if (!options.confirm) {
    const holder = await holderOf(domain, characterId);
    if (holder) return { ok: false, reason: "held", holder };
  }
  await domain.db.transaction(async (tx) => {
    await tx
      .update(guest)
      .set({ characterRemoved: true })
      .where(eq(guest.characterId, characterId));
    // The foreign key clears guest.character_id.
    await tx.delete(character).where(eq(character.id, characterId));
  });
  return { ok: true };
}

export type ClaimRefusal =
  | { ok: false; reason: "taken"; holder: Holder }
  | Refused<"not_seated" | "after_decree" | "unknown_character" | "unknown_guest">;

/**
 * Claim a character, or change to another. A first choice is allowed after the decree;
 * a change is not. If someone else holds it, the answer names them.
 */
export async function claimCharacter(
  domain: Domain,
  guestId: string,
  characterId: string,
): Promise<{ ok: true } | ClaimRefusal> {
  try {
    const rows = await domain.db
      .update(guest)
      .set({ characterId, characterRemoved: false })
      .where(
        and(
          eq(guest.id, guestId),
          eq(guest.status, "seated"),
          sql`(${guest.characterId} is null
               or ${guest.characterId} = ${characterId}
               or (select ${event.finalisedAt} from ${event} where ${event.id} = 1) is null)`,
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
    .where(eq(guest.id, guestId));
  if (!rows[0]) return refuse("unknown_guest");
  if (rows[0].status !== "seated") return refuse("not_seated");
  return refuse("after_decree");
}
