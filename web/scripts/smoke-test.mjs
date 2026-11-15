// Ask a deployment, through Vercel's protection bypass, whether it can read its
// database and has every migration this commit carries. Exit non-zero if not, which
// stops the workflow before promotion. Usage: node scripts/smoke-test.mjs <deployment URL>
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const url = process.argv[2];
const expected = JSON.parse(fs.readFileSync("drizzle/meta/_journal.json", "utf8")).entries.length;
const args = ["curl", "/api/health", "--deployment", url, "--yes"];
if (process.env.VERCEL_TOKEN) args.push("--token", process.env.VERCEL_TOKEN);

for (let attempt = 1; attempt <= 5; attempt += 1) {
  const result = spawnSync("vercel", args, {
    encoding: "utf8",
    env: { ...process.env, MSYS_NO_PATHCONV: "1" },
    shell: process.platform === "win32",
  });
  const line = (result.stdout ?? "").trim().split("\n").pop() ?? "";
  try {
    const health = JSON.parse(line);
    if (health.ok && health.database && health.migrations === expected) {
      console.log(
        `healthy: database reachable, ${health.migrations} of ${expected} migrations applied`,
      );
      process.exit(0);
    }
    console.log(`attempt ${attempt}: not ready (${JSON.stringify(health)})`);
  } catch {
    console.log(`attempt ${attempt}: no answer yet`);
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
console.error("The deployment failed its smoke test. It has not been promoted.");
process.exit(1);
