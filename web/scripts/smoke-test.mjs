// Ask a deployment, through Vercel's protection bypass, whether it can read its
// database and has every migration this commit carries. Exit non-zero if not, which
// stops the workflow before promotion. Usage: node scripts/smoke-test.mjs <deployment URL>
//
// `vercel curl` hands any option written after it on to curl, so the CLI's own options
// go before the subcommand, and the token is read from VERCEL_TOKEN in the environment.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const url = process.argv[2];
const expected = JSON.parse(fs.readFileSync("drizzle/meta/_journal.json", "utf8")).entries.length;
const args = ["curl", "/api/health", "--deployment", url, "--yes"];

/** The last lines a command printed, with anything secret-looking removed. */
function tail(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-3)
    .join(" | ")
    .replace(/postgres(ql)?:\/\/\S+/g, "[hidden]")
    .slice(0, 400);
}

for (let attempt = 1; attempt <= 5; attempt += 1) {
  const result = spawnSync("vercel", args, {
    encoding: "utf8",
    env: { ...process.env, MSYS_NO_PATHCONV: "1" },
    shell: process.platform === "win32",
  });
  const lines = (result.stdout ?? "").trim().split(/\r?\n/);
  const last = lines[lines.length - 1] ?? "";
  try {
    const health = JSON.parse(last);
    if (health.ok && health.database && health.migrations === expected) {
      console.log(
        `healthy: database reachable, ${health.migrations} of ${expected} migrations applied`,
      );
      process.exit(0);
    }
    console.log(`attempt ${attempt}: not ready (${JSON.stringify(health)})`);
  } catch {
    const detail = tail(`${result.stderr ?? ""}\n${result.stdout ?? ""}`);
    console.log(`attempt ${attempt}: no answer yet (${detail})`);
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
console.error("The deployment failed its smoke test. It has not been promoted.");
process.exit(1);
