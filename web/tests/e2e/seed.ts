import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { addCharacter, claimCharacter } from "@/domain/characters";
import { ensureEvent } from "@/domain/event";
import { accept, addGuest, decline, recordOpeningPlayed, type Title } from "@/domain/guests";
import { amendPlan, approve, finalise, setProposal } from "@/domain/proposal";
import { zonedInstant } from "@/domain/time";

const URL =
  process.env.E2E_DATABASE_URL ?? "postgres://throne:throne@localhost:54329/iron_throne_e2e";
export const TZ = "Asia/Kolkata";
export const YEAR = new Date().getFullYear() + 1;

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

/** Empty the end-to-end database and fill it with an event, a roster and the given guests. */
export async function seed(
  guests: GuestSpec[],
  roster = ["Thor", "Loki", "Scarlet Witch"],
  eventSpec: EventSpec = {},
) {
  const pool = new Pool({ connectionString: URL });
  const domain = { db: drizzle(pool) };
  try {
    await pool.query(
      "truncate alternative, guest, character, event, admin_session, attempt restart identity cascade",
    );
    await ensureEvent(domain, TZ);
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
      await pool.query("update event set proposal_at = now() - interval '2 days' where id = 1");
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
      { db: drizzle(pool) },
      zonedInstant(TZ, YEAR, 1, 9, 20, 0),
      "the Grand Cinema",
    );
    if (!result.ok) throw new Error(result.reason);
  } finally {
    await pool.end();
  }
}
