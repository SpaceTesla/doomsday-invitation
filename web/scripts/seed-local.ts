// Fill the LOCAL database with a sample event, for trying the guest journey by hand.
// Usage: npm run seed:local [-- --owner <email of a local organizer>]
//
// It deletes every event (and so every guest and roster) in the local database, keeps the
// organizer accounts, and makes one sample event with the default roster. With --owner the
// event belongs to that organizer, who sees it on their dashboard; without it the event has
// no owner until `npm run organizer:claim`. It refuses any database that is not on this
// machine. The links it prints work only against the local database.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { claimCharacter } from "../src/domain/characters";
import { forEvent } from "../src/domain/context";
import { claimUnownedEvents, createEvent } from "../src/domain/event";
import { accept, addGuest, decline, recordOpeningPlayed, type Title } from "../src/domain/guests";
import { approve, proposeAlternative, setProposal } from "../src/domain/proposal";
import { zonedInstant } from "../src/domain/time";

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  const host = new URL(url).hostname;
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error("seed:local only runs against a database on this machine.");
  }
  const ownerIndex = process.argv.indexOf("--owner");
  const owner = ownerIndex > 0 ? process.argv[ownerIndex + 1] : undefined;
  const pool = new Pool({ connectionString: url });
  const base = { db: drizzle(pool) };
  const tz = "Asia/Kolkata";

  await pool.query(
    "truncate alternative, guest, character, event, attempt restart identity cascade",
  );
  const created = await createEvent(base, null, {
    timeZone: tz,
    hostName: "",
  });
  if (!created.ok) throw new Error(created.reason);
  const domain = forEvent(base, created.id);

  const year = new Date().getFullYear() + (new Date().getMonth() === 11 ? 1 : 0);
  await setProposal(
    domain,
    zonedInstant(tz, year, 12, 18, 19, 30),
    "the Grand Cinema, in the fourth hall",
  );
  const found = await pool.query<{ id: string }>(
    "select id from character where event_id = $1 and name_key = 'thor'",
    [created.id],
  );
  const thor = found.rows[0]?.id;

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
      if (thor) await claimCharacter(domain, added.id, thor);
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

  let ownership = "It has no owner yet: sign up locally, then run `npm run organizer:claim`.";
  if (owner) {
    const claimed = await claimUnownedEvents(base, owner);
    ownership = claimed
      ? "It belongs to that organizer: open http://localhost:3000/dashboard."
      : "No local organizer has that email; the event has no owner yet.";
  }
  console.log(`Local sample event created. ${ownership}\nLinks (local database only):\n`);
  console.log(links.join("\n"));
  await pool.end();
}

main().catch((failure: unknown) => {
  console.error(failure instanceof Error ? failure.message : "failed");
  process.exit(1);
});
