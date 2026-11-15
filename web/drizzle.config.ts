import { defineConfig } from "drizzle-kit";

// Used only to generate migrations from src/db/schema.ts (`npm run db:generate`).
// Migrations are applied by our own runner (`npm run db:migrate`), never by drizzle-kit.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  strict: true,
  verbose: true,
});
