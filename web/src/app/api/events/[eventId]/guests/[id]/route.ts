import { editGuest, removeGuest } from "@/domain/guests";
import { asEventOwner, BadRequest, json, parseBody } from "@/lib/admin";
import { guestInput, idParam } from "@/lib/admin-input";

async function guestId(ctx: RouteContext<"/api/events/[eventId]/guests/[id]">) {
  const parsed = idParam.safeParse((await ctx.params).id);
  if (!parsed.success) throw new BadRequest();
  return parsed.data;
}

/** Correct a guest's name and title. */
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/events/[eventId]/guests/[id]">,
) {
  return asEventOwner(request, ctx.params, async (domain) => {
    const id = await guestId(ctx);
    const result = await editGuest(domain, id, await parseBody(request, guestInput));
    if (!result.ok)
      return json({ error: result.reason }, result.reason === "unknown_guest" ? 404 : 422);
    return json({ ok: true });
  });
}

/** Remove a guest, answered or not. */
export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/events/[eventId]/guests/[id]">,
) {
  return asEventOwner(request, ctx.params, async (domain) => {
    await removeGuest(domain, await guestId(ctx));
    return json({ ok: true });
  });
}
