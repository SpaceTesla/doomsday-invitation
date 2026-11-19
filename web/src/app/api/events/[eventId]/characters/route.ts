import { addCharacter } from "@/domain/characters";
import { asEventOwner, json, parseBody } from "@/lib/admin";
import { characterInput } from "@/lib/admin-input";

/** Add a character to the roster, under a faction. 409 if the roster already has that name. */
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/events/[eventId]/characters">,
) {
  return asEventOwner(request, ctx.params, async (domain) => {
    const { name, faction } = await parseBody(request, characterInput);
    const result = await addCharacter(domain, name, faction ?? null);
    if (!result.ok)
      return json({ error: result.reason }, result.reason === "duplicate" ? 409 : 422);
    return json({ id: result.id }, 201);
  });
}
