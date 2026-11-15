import crypto from "node:crypto";
import { runRetention } from "@/domain/retention";
import { json, serverDomain } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** True when the request carries "Authorization: Bearer <CRON_SECRET>". Constant time. */
function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || !header) return false;
  const given = Buffer.from(header);
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

/**
 * Called once a day by Vercel Cron. Thirty days after the day, deletes the event and
 * everything in it; before then, does nothing. Safe to run any number of times.
 * docs/ARCHITECTURE.md, section 7.5.
 */
export async function GET(request: Request) {
  if (!authorised(request)) {
    // Whether a header came at all, never its value: this is how milestone 0B confirms
    // that Vercel sends the secret.
    console.warn("retention refused");
    return json({ error: "unauthorised" }, 401);
  }
  try {
    const result = await runRetention(serverDomain());
    console.log(result.deleted ? "retention deleted the event" : "retention: nothing due");
    return json({ deleted: result.deleted });
  } catch {
    console.error("retention failed");
    return json({ error: "failed" }, 500);
  }
}
