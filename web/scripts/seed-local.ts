// Fill the LOCAL database with a sample event, for trying the guest journey by hand.
// Usage: npm run seed:local
// It empties the local database first, except the roster (seeded by migration 0002), and
// refuses any database that is not on this machine. The links it prints work only against
// the local database.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { addCharacter, claimCharacter } from "../src/domain/characters";
import { ensureEvent } from "../src/domain/event";
import { accept, addGuest, decline, recordOpeningPlayed, type Title } from "../src/domain/guests";
import { approve, proposeAlternative, setProposal } from "../src/domain/proposal";
import { zonedInstant } from "../src/domain/time";

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  const host = new URL(url).hostname;
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error("seed:local only runs against a database on this machine.");
  }
  const pool = new Pool({ connectionString: url });
  const domain = { db: drizzle(pool) };
  const tz = process.env.EVENT_TIMEZONE ?? "Asia/Kolkata";

  await pool.query(
    "truncate alternative, guest, event, admin_session, attempt restart identity cascade",
  );
  await ensureEvent(domain, tz);

  const year = new Date().getFullYear() + (new Date().getMonth() === 11 ? 1 : 0);
  await setProposal(
    domain,
    zonedInstant(tz, year, 12, 18, 19, 30),
    "the Grand Cinema, in the fourth hall",
  );

  // The sample guests use Thor from the seeded roster; he is added back if removed.
  const roster: Record<string, string> = {};
  const found = await pool.query<{ id: string }>(
    "select id from character where name_key = 'thor'",
  );
  if (found.rows[0]) roster.Thor = found.rows[0].id;
  else {
    const added = await addCharacter(domain, "Thor", "avengers");
    if (added.ok) roster.Thor = added.id;
  }

  const guests: [string, Title, string][] = [
    ["Anish", "Mr.", "new: sees the opening"],
    ["Tara Menon", "Ms.", "seated, holds Thor, approves, suggested another day"],
    ["Ravi", "Dr.", "seated, no mantle yet"],
    ["Bhattacharya-Okonkwo", "Ms.", "a long name: summons, opening already seen"],
    ["José Nuñez", "", "declined"],
  ];
  const links: string[] = [];
  for (const [name, title, note] of guests) {
    const added = await addGuest(domain, { name, title });
    if (!added.ok) continue;
    links.push(
      `${(title ? `${title} ${name}` : name).padEnd(26)} ${note}\n    http://localhost:3000/s/${added.token}`,
    );
    if (name === "Tara Menon") {
      await accept(domain, added.id);
      await claimCharacter(domain, added.id, roster.Thor);
      await approve(domain, added.id);
      await proposeAlternative(domain, added.id, zonedInstant(tz, year, 12, 19, 18, 0));
    } else if (name === "Ravi") {
      await accept(domain, added.id);
    } else if (name === "Bhattacharya-Okonkwo") {
      await recordOpeningPlayed(domain, added.id);
    } else if (name === "José Nuñez") {
      await decline(domain, added.id);
    }
  }
  console.log("Local sample event created. Links (local database only):\n");
  console.log(links.join("\n"));
  await pool.end();
}

main().catch((failure: unknown) => {
  console.error(failure instanceof Error ? failure.message : "failed");
  process.exit(1);
});
