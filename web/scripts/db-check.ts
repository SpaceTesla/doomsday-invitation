// Check that each configured database answers. Usage: npm run db:check
// Read-only: it runs one select per database. It prints the kind of host and the
// server version, and never a connection string or any part of one.
import { Client } from "pg";
import { isPooledConnectionString } from "../src/db/migrate";

type Target = { label: string; variable: string; required: boolean };

const targets: Target[] = [
  { label: "Application database", variable: "DATABASE_URL", required: true },
  { label: "Migration database", variable: "DATABASE_URL_DIRECT", required: true },
  { label: "Neon, pooled", variable: "NEON_DATABASE_URL", required: false },
  { label: "Neon, direct", variable: "NEON_DATABASE_URL_DIRECT", required: false },
];

function hostKind(connectionString: string): string {
  try {
    const host = new URL(connectionString).hostname;
    if (host === "localhost" || host === "127.0.0.1") return "local";
    if (host.endsWith(".neon.tech")) {
      return isPooledConnectionString(connectionString) ? "Neon, pooled host" : "Neon, direct host";
    }
    return "other host";
  } catch {
    return "unreadable";
  }
}

function safeMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "unknown error";
  return message.replace(/postgres(ql)?:\/\/\S+/gi, "[connection string hidden]");
}

async function check(target: Target): Promise<boolean> {
  const connectionString = process.env[target.variable];
  if (!connectionString) {
    console.log(
      `${target.required ? "FAIL" : "skip"}  ${target.label} (${target.variable}): not set`,
    );
    return !target.required;
  }
  const client = new Client({ connectionString, connectionTimeoutMillis: 15_000 });
  try {
    await client.connect();
    const { rows } = await client.query<{ version: string; one: number }>(
      "select current_setting('server_version') as version, 1 as one",
    );
    console.log(
      `ok    ${target.label} (${target.variable}): ${hostKind(connectionString)}, PostgreSQL ${rows[0].version}`,
    );
    return rows[0].one === 1;
  } catch (error) {
    console.log(
      `FAIL  ${target.label} (${target.variable}): ${hostKind(connectionString)}, ${safeMessage(error)}`,
    );
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  const results: boolean[] = [];
  for (const target of targets) {
    results.push(await check(target));
  }
  if (results.includes(false)) process.exit(1);
}

void main();
