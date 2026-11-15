import { cancelLink, replaceLink } from "@/domain/guests";
import { asAdmin, BadRequest, json } from "@/lib/admin";
import { idParam } from "@/lib/admin-input";

async function guestId(ctx: RouteContext<"/api/admin/guests/[id]/link">) {
  const parsed = idParam.safeParse((await ctx.params).id);
  if (!parsed.success) throw new BadRequest();
  return parsed.data;
}

/** Replace the guest's link. The old one stops working at once. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/guests/[id]/link">) {
  return asAdmin(request, async (domain) => {
    const result = await replaceLink(domain, await guestId(ctx));
    if (!result.ok) return json({ error: result.reason }, 404);
    return json({ token: result.token });
  });
}

/** Cancel the guest's link. */
export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/guests/[id]/link">) {
  return asAdmin(request, async (domain) => {
    const result = await cancelLink(domain, await guestId(ctx));
    if (!result.ok) return json({ error: result.reason }, 404);
    return json({ ok: true });
  });
}
