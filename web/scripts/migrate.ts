// Apply pending migrations. Usage: npm run db:migrate
// Reads DATABASE_URL_DIRECT. Never prints a connection string.
import path from "node:path";
import { runMigrations } from "../src/db/migrate";

async function main() {
  const connectionString = process.env.DATABASE_URL_DIRECT;
  if (!connectionString) {
    throw new Error("DATABASE_URL_DIRECT is not set.");
  }
  const migrationsFolder = path.resolve(__dirname, "..", "drizzle");
  const result = await runMigrations({ connectionString, migrationsFolder });
  if (result.ran) {
    console.log(
      `Migrations are up to date. Lock held for ${result.releasedAt - result.lockedAt} ms.`,
    );
  } else {
    console.log("No migrations to apply yet: the drizzle folder has no journal.");
  }
}

main().catch((error: unknown) => {
  console.error("Migration failed:", error instanceof Error ? error.message : "unknown error");
  process.exit(1);
});
