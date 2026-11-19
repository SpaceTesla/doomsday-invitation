import { deleteEvent, updateEvent } from "@/domain/event";
import { asEventOwner, json, parseBody } from "@/lib/admin";
import { eventInput } from "@/lib/admin-input";

/** Rename the event, set the name beneath Doom, or change the zone before a proposal. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/events/[eventId]">) {
  return asEventOwner(request, ctx.params, async (domain) => {
    const result = await updateEvent(domain, await parseBody(request, eventInput));
    if (!result.ok)
      return json({ error: result.reason }, result.reason === "zone_fixed" ? 409 : 422);
    return json({ ok: true });
  });
}

/** Delete the event and everything in it. Every guest's link stops working at once. */
export async function DELETE(request: Request, ctx: RouteContext<"/api/events/[eventId]">) {
  return asEventOwner(request, ctx.params, async (domain) => {
    await deleteEvent(domain);
    return json({ ok: true });
  });
}
