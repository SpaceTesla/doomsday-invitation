import crypto from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { addCharacter, claimCharacter } from "@/domain/characters";
import { forEvent } from "@/domain/context";
import { accept, addGuest, decline, recordOpeningPlayed, type Title } from "@/domain/guests";
import { amendPlan, approve, finalise, setProposal } from "@/domain/proposal";
import { zonedInstant } from "@/domain/time";
import { E2E_ORGANIZER } from "./constants";

const URL =
  process.env.E2E_DATABASE_URL ?? "postgres://throne:throne@localhost:54329/iron_throne_e2e";
export const TZ = "Asia/Kolkata";
export const YEAR = new Date().getFullYear() + 1;

const ALL_TABLES =
  "alternative, guest, character, event, admin_session, attempt, organizer, organizer_session, organizer_account, organizer_verification, auth_rate_limit";

type GuestSpec = {
  name: string;
  title?: Title;
  state?: "new" | "summons" | "seated" | "declined";
  holds?: string;
  approves?: boolean;
};

type EventSpec = {
  /** Doom has decreed the plan. */
  decreed?: boolean;
  /** The day of the screening is behind us (set directly; the panel refuses past days). */
  dayPassed?: boolean;
};

let lastEventId = 0;

/** The id of the event the last seed made, owned by E2E_ORGANIZER. */
export const seededEventId = () => lastEventId;

/**
 * An organizer account with a password, written the way Better Auth writes one, so a test
 * can sign in through the real form. Returns the organizer's id.
 */
export async function seedOrganizer(
  pool: Pool,
  who: { name: string; email: string; password: string },
): Promise<string> {
  const id = crypto.randomUUID();
  await pool.query("insert into organizer (id, name, email) values ($1, $2, $3)", [
    id,
    who.name,
    who.email,
  ]);
  await pool.query(
    "insert into organizer_account (id, account_id, provider_id, user_id, password) values ($1, $2, 'credential', $2, $3)",
    [crypto.randomUUID(), id, await hashPassword(who.password)],
  );
  return id;
}

/**
 * Empty the end-to-end database and fill it with an organizer, their event (with the name
 * beneath Doom), a roster and the given guests.
 */
export async function seed(
  guests: GuestSpec[],
  roster = ["Thor", "Loki", "Scarlet Witch"],
  eventSpec: EventSpec = {},
) {
  const pool = new Pool({ connectionString: URL });
  try {
    await pool.query(`truncate ${ALL_TABLES} restart identity cascade`);
    const organizerId = await seedOrganizer(pool, E2E_ORGANIZER);
    const { rows } = await pool.query<{ id: number }>(
      "insert into event (timezone, host_name, organizer_id) values ($1, 'Arjun Rao', $2) returning id",
      [TZ, organizerId],
    );
    lastEventId = rows[0].id;
    const domain = forEvent({ db: drizzle(pool) }, lastEventId);
    await setProposal(domain, zonedInstant(TZ, YEAR, 1, 8, 19, 30), "the Grand Cinema");
    const ids: Record<string, string> = {};
    for (const name of roster) {
      const added = await addCharacter(domain, name);
      if (added.ok) ids[name] = added.id;
    }
    const links: Record<string, string> = {};
    for (const spec of guests) {
      const added = await addGuest(domain, { name: spec.name, title: spec.title ?? "" });
      if (!added.ok) throw new Error(added.reason);
      links[spec.name] = `/s/${added.token}`;
      if (spec.state === "summons") await recordOpeningPlayed(domain, added.id);
      if (spec.state === "seated") {
        await recordOpeningPlayed(domain, added.id);
        await accept(domain, added.id);
        if (spec.holds) await claimCharacter(domain, added.id, ids[spec.holds]);
        if (spec.approves) await approve(domain, added.id);
      }
      if (spec.state === "declined") {
        await recordOpeningPlayed(domain, added.id);
        await decline(domain, added.id);
      }
    }
    if (eventSpec.decreed) await finalise(domain);
    if (eventSpec.dayPassed) {
      await pool.query("update event set proposal_at = now() - interval '2 days' where id = $1", [
        lastEventId,
      ]);
    }
    return links;
  } finally {
    await pool.end();
  }
}

/** Doom amends the decree to another day: guests are shown the amended decree. */
export async function amendDecree() {
  const pool = new Pool({ connectionString: URL });
  try {
    const result = await amendPlan(
      forEvent({ db: drizzle(pool) }, lastEventId),
      zonedInstant(TZ, YEAR, 1, 9, 20, 0),
      "the Grand Cinema",
    );
    if (!result.ok) throw new Error(result.reason);
  } finally {
    await pool.end();
  }
}

/** A second organizer with their own event and one guest, for isolation tests. */
export async function seedRival() {
  const pool = new Pool({ connectionString: URL });
  try {
    const organizerId = await seedOrganizer(pool, {
      name: "Rival Organizer",
      email: "rival@throne.test",
      password: "rival-only-password",
    });
    const { rows } = await pool.query<{ id: number }>(
      "insert into event (timezone, organizer_id, proposal_at, proposal_venue, proposal_version) values ($1, $2, now() + interval '60 days', 'the Rival Hall', 1) returning id",
      [TZ, organizerId],
    );
    const domain = forEvent({ db: drizzle(pool) }, rows[0].id);
    const added = await addGuest(domain, { name: "Rival Guest", title: "" });
    if (!added.ok) throw new Error(added.reason);
    return { eventId: rows[0].id, guestId: added.id, link: `/s/${added.token}` };
  } finally {
    await pool.end();
  }
}

/** The current link of the guest with this name, read from the end-to-end database. */
export async function linkOf(name: string): Promise<string> {
  const pool = new Pool({ connectionString: URL });
  try {
    const { rows } = await pool.query<{ token: string }>(
      "select token from guest where name = $1 and token is not null",
      [name],
    );
    if (!rows[0]) throw new Error(`no link for ${name}`);
    return `/s/${rows[0].token}`;
  } finally {
    await pool.end();
  }
}
