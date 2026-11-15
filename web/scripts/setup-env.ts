// Create or complete web/.env.local. Usage: npm run env:setup
//
// - Copies the two Neon connection strings from the project root's .env, telling
//   pooled from direct by the host name, not by the variable name.
// - Points the application at the local Docker database.
// - Generates the secrets that can be generated.
//
// It only adds what is missing, so it is safe to run again, and it prints variable
// names only: never a value.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isPooledConnectionString } from "../src/db/migrate";

const webDir = path.resolve(__dirname, "..");
const rootEnvPath = path.resolve(webDir, "..", ".env");
const localEnvPath = path.join(webDir, ".env.local");

const LOCAL_DATABASE = "postgres://throne:throne@localhost:54329/iron_throne";

function parse(text: string): Map<string, string> {
  const values = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values.set(match[1], value);
  }
  return values;
}

function main() {
  const existing = fs.existsSync(localEnvPath)
    ? parse(fs.readFileSync(localEnvPath, "utf8"))
    : new Map<string, string>();
  const root = fs.existsSync(rootEnvPath)
    ? parse(fs.readFileSync(rootEnvPath, "utf8"))
    : new Map<string, string>();

  let neonPooled = "";
  let neonDirect = "";
  for (const value of root.values()) {
    if (!/^postgres(ql)?:\/\//.test(value)) continue;
    if (isPooledConnectionString(value)) neonPooled ||= value;
    else neonDirect ||= value;
  }

  const wanted: [string, string][] = [
    ["DATABASE_URL", LOCAL_DATABASE],
    ["DATABASE_URL_DIRECT", LOCAL_DATABASE],
    ["NEON_DATABASE_URL", neonPooled],
    ["NEON_DATABASE_URL_DIRECT", neonDirect],
    ["EVENT_TIMEZONE", "Asia/Kolkata"],
    ["SESSION_KEY", crypto.randomBytes(32).toString("base64url")],
    ["CRON_SECRET", crypto.randomBytes(32).toString("base64url")],
  ];

  const added: string[] = [];
  const kept: string[] = [];
  const empty: string[] = [];
  const lines: string[] = [];
  for (const [name, value] of wanted) {
    if (existing.get(name)) {
      kept.push(name);
      continue;
    }
    if (!value) {
      empty.push(name);
      continue;
    }
    lines.push(`${name}=${value}`);
    added.push(name);
  }

  if (lines.length > 0) {
    const prefix = fs.existsSync(localEnvPath) ? fs.readFileSync(localEnvPath, "utf8") : "";
    const separator = prefix && !prefix.endsWith("\n") ? "\n" : "";
    fs.writeFileSync(localEnvPath, `${prefix}${separator}${lines.join("\n")}\n`, { mode: 0o600 });
  }

  console.log(`added:   ${added.join(", ") || "none"}`);
  console.log(`kept:    ${kept.join(", ") || "none"}`);
  console.log(`not set: ${empty.join(", ") || "none"}`);
}

main();
