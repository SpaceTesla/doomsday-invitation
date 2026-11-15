import { finalise } from "@/domain/proposal";
import { asAdmin, json } from "@/lib/admin";

/** Decree the current proposal, whatever the count. */
export async function POST(request: Request) {
  return asAdmin(request, async (domain) => {
    const result = await finalise(domain);
    if (!result.ok) return json({ error: result.reason }, 409);
    return json({ ok: true });
  });
}
