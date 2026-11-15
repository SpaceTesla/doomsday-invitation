// Read the deployment URL from `vercel deploy` output, which is JSON when not run in a
// terminal and a bare URL otherwise. Usage: node scripts/deployment-url.mjs <file>
import fs from "node:fs";

const text = fs.readFileSync(process.argv[2], "utf8").trim();
let url = "";
try {
  url = JSON.parse(text).deployment?.url ?? "";
} catch {
  url = text.split(/\s+/).find((part) => /^https:\/\/\S+\.vercel\.app$/.test(part)) ?? "";
}
if (!/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(url)) {
  console.error("No deployment URL in the output of vercel deploy.");
  process.exit(1);
}
console.log(url);
