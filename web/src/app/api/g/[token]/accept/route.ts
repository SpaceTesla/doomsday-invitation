import { accept } from "@/domain/guests";
import { json } from "@/lib/admin";
import { asGuest } from "@/lib/guest";

/** Take your seat. 409 after the day. */
export async function POST(request: Request, ctx: RouteContext<"/api/g/[token]/accept">) {
  return asGuest(request, ctx.params, async (domain, { guest }) => {
    const result = await accept(domain, guest.id);
    return result.ok ? json({ ok: true }) : json({ error: result.reason }, 409);
  });
}
