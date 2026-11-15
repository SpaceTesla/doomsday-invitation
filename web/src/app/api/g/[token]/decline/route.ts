import { decline } from "@/domain/guests";
import { json } from "@/lib/admin";
import { asGuest } from "@/lib/guest";

/** Refuse the summons. 409 for a guest already seated: they leave instead. */
export async function POST(request: Request, ctx: RouteContext<"/api/g/[token]/decline">) {
  return asGuest(request, ctx.params, async (domain, { guest }) => {
    const result = await decline(domain, guest.id);
    return result.ok ? json({ ok: true }) : json({ error: result.reason }, 409);
  });
}
