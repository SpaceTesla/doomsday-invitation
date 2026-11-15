import { removeCharacter } from "@/domain/characters";
import { asAdmin, BadRequest, json } from "@/lib/admin";
import { idParam } from "@/lib/admin-input";

/**
 * Remove a character. If a guest holds it, answers 409 naming them, unless the request
 * carries ?confirm=1 after Doom has seen that warning.
 */
export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/characters/[id]">) {
  return asAdmin(request, async (domain) => {
    const parsed = idParam.safeParse((await ctx.params).id);
    if (!parsed.success) throw new BadRequest();
    const confirm = new URL(request.url).searchParams.get("confirm") === "1";
    const result = await removeCharacter(domain, parsed.data, { confirm });
    if (!result.ok) return json({ error: result.reason, holder: result.holder }, 409);
    return json({ ok: true });
  });
}
