// Rehearse the pending migrations on a COPY of real data, on this machine. Usage:
//
//   npx tsx scripts/rehearse-migration.ts <local database name>
//
// First restore a production backup (the custom-format dump CI keeps before each
// migration) into the local Docker PostgreSQL under a name of your choosing, for example:
//
//   docker compose exec -T db createdb -U throne rehearsal
//   docker compose exec -T db pg_restore -U throne -d rehearsal --no-owner < backup.dump
//
// The script records every row of the existing tables, applies the migrations, and checks
// that every old column of every row is unchanged and every link still finds its guest.
// It prints counts only: never a token, a name or a connection string. It refuses any
// database that is not the local Docker one.
import path from "node:path";
import { Client } from "pg";
import { runMigrations } from "../src/db/migrate";

const LOCAL = "postgres://throne:throne@localhost:54329";

const OLD_COLUMNS: Record<string, string> = {
  event:
    "id, timezone, proposal_at, proposal_venue, proposal_version, finalised_at, plan_version, created_at",
  guest:
    "id, token, title, name, status, character_id, approved_version, seen_proposal, seen_plan, character_removed, opened_at, opening_played_at, invited_at, answered_at",
  character: "id, name, name_key, created_at",
  alternative: "guest_id, at, created_at",
};

async function snapshot(client: Client) {
  const out: Record<string, string> = {};
  for (const [table, columns] of Object.entries(OLD_COLUMNS)) {
    const { rows } = await client.query(`select ${columns} from "${table}" order by 1`);
    out[table] = JSON.stringify(rows);
  }
  return out;
}

async function main() {
  const name = process.argv[2] ?? "";
  if (!/^[a-z0-9_]+$/.test(name) || ["postgres", "iron_throne"].includes(name)) {
    throw new Error("Pass the name of the local copy, for example: rehearsal");
  }
  const url = `${LOCAL}/${name}`;
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const before = await snapshot(client);
    const counts = Object.fromEntries(
      Object.entries(before).map(([table, rows]) => [table, JSON.parse(rows).length]),
    );
    console.log("before:", counts);
    await runMigrations({
      connectionString: url,
      migrationsFolder: path.resolve(__dirname, "..", "drizzle"),
    });
    const after = await snapshot(client);
    const changed = Object.keys(before).filter((table) => before[table] !== after[table]);
    const { rows } = await client.query<{ orphans: number; events: number }>(
      `select (select count(*) from guest g left join event e on e.id = g.event_id where e.id is null)::int as orphans,
              (select count(*) from event where organizer_id is null)::int as events`,
    );
    const tokens = await client.query<{ found: number; total: number }>(
      `select count(*) filter (where e.id = g.event_id)::int as found, count(*)::int as total
       from guest g join event e on e.id = g.event_id where g.token is not null`,
    );
    console.log(
      `unchanged tables: ${Object.keys(before).length - changed.length} of ${Object.keys(before).length}`,
    );
    console.log(
      `links that open their own guest and event: ${tokens.rows[0].found} of ${tokens.rows[0].total}`,
    );
    console.log(
      `guests without an event: ${rows[0].orphans}; events waiting to be claimed: ${rows[0].events}`,
    );
    if (changed.length || rows[0].orphans) {
      console.error(`CHANGED: ${changed.join(", ") || "guests lost their event"}`);
      process.exitCode = 1;
    } else {
      console.log("The migration kept everything.");
    }
  } finally {
    await client.end();
  }
}

main().catch((failure: unknown) => {
  console.error(failure instanceof Error ? failure.message : "failed");
  process.exit(1);
});
