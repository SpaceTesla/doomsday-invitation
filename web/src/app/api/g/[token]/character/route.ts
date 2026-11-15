import { z } from "zod";
import { claimCharacter } from "@/domain/characters";
import { json } from "@/lib/admin";
import { asGuest, readJson } from "@/lib/guest";

const body = z.object({ characterId: z.uuid() });

/**
 * Claim a mantle, or change to another. 409 "taken" names who holds it now; 409
 * "after_decree" for a change after the decree; 409 "gone" if Doom removed it.
 */
export async function PUT(request: Request, ctx: RouteContext<"/api/g/[token]/character">) {
  return asGuest(request, ctx.params, async (domain, { guest }) => {
    const parsed = body.safeParse(await readJson(request));
    if (!parsed.success) return json({ error: "bad_request" }, 400);
    const result = await claimCharacter(domain, guest.id, parsed.data.characterId);
    if (result.ok) return json({ ok: true });
    if (result.reason === "taken") return json({ error: "taken", holder: result.holder }, 409);
    if (result.reason === "unknown_character") return json({ error: "gone" }, 409);
    return json({ error: result.reason }, 409);
  });
}
