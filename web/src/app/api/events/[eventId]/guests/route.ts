import { canSummon } from "@/domain/event";
import { addGuest } from "@/domain/guests";
import { asEventOwner, json, parseBody } from "@/lib/admin";
import { guestInput } from "@/lib/admin-input";

/**
 * Summon a guest. Answers with the new guest's id and link token, or 409 `no_proposal`
 * while nothing is proposed: the proposal comes first (docs/PRODUCT_SPEC.md, section 8.2).
 */
export async function POST(request: Request, ctx: RouteContext<"/api/events/[eventId]/guests">) {
  return asEventOwner(request, ctx.params, async (domain, event) => {
    const input = await parseBody(request, guestInput);
    if (!canSummon(event)) return json({ error: "no_proposal" }, 409);
    const result = await addGuest(domain, input);
    if (!result.ok) return json({ error: result.reason }, 422);
    return json({ id: result.id, token: result.token }, 201);
  });
}
