// Give the events that have no owner (the first event, made before organizer accounts) to
// an organizer, by the email they signed up with. Usage:
//
//   npm run organizer:claim -- --email <email> [--host-name "<name beneath Doom>"]
//
// It reads DATABASE_URL from .env.local, which points at the local database. To run it
// against another database, the owner sets DATABASE_URL in their own terminal and passes
// --remote as well; the script refuses a database that is not on this machine without it.
// It prints the ids it claimed and nothing else: never a connection string or an email.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { claimUnownedEvents } from "../src/domain/event";
import { withFullVerification } from "../src/db/tls";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index > 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = argument("email");
  if (!email || email.startsWith("--")) throw new Error("Pass --email <the organizer's email>.");
  const hostName = argument("host-name");
  const url = process.env.DATABASE_URL ?? "";
  if (!url) throw new Error("DATABASE_URL is not set.");
  const host = new URL(url).hostname;
  const local = host === "localhost" || host === "127.0.0.1";
  if (!local && !process.argv.includes("--remote")) {
    throw new Error("That database is not on this machine. Pass --remote if you mean it.");
  }
  const pool = new Pool({ connectionString: withFullVerification(url), max: 1 });
  try {
    const claimed = await claimUnownedEvents({ db: drizzle(pool) }, email, hostName);
    if (claimed === null) {
      console.log("No organizer has that email. Create the account first, then run this again.");
      process.exitCode = 1;
    } else if (claimed.length === 0) {
      console.log("Every event already has an owner. Nothing changed.");
    } else {
      console.log(`Claimed event ${claimed.join(", ")} (${local ? "local" : "remote"} database).`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((failure: unknown) => {
  console.error(failure instanceof Error ? failure.message : "failed");
  process.exit(1);
});
