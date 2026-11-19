import { finalise } from "@/domain/proposal";
import { asEventOwner, json } from "@/lib/admin";

/** Decree the current proposal, whatever the count. */
export async function POST(request: Request, ctx: RouteContext<"/api/events/[eventId]/finalise">) {
  return asEventOwner(request, ctx.params, async (domain) => {
    const result = await finalise(domain);
    if (!result.ok) return json({ error: result.reason }, 409);
    return json({ ok: true });
  });
}
