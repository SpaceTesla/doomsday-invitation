import { requireEvent } from "@/domain/event";
import { amendPlan } from "@/domain/proposal";
import { asEventOwner, json, parseBody } from "@/lib/admin";
import { instantFrom, proposalInput } from "@/lib/admin-input";

/** Amend the decree. Guests are shown that it changed. */
export async function PUT(request: Request, ctx: RouteContext<"/api/events/[eventId]/plan">) {
  return asEventOwner(request, ctx.params, async (domain) => {
    const input = await parseBody(request, proposalInput);
    const eventRow = await requireEvent(domain);
    const result = await amendPlan(domain, instantFrom(input, eventRow.timezone), input.venue);
    if (!result.ok)
      return json({ error: result.reason }, result.reason === "not_decreed" ? 409 : 422);
    return json({ changed: result.changed });
  });
}
