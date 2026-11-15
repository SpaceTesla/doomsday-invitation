import { leave } from "@/domain/guests";
import { json } from "@/lib/admin";
import { asGuest } from "@/lib/guest";

/** Leave the council, until the decree. 409 after it. */
export async function POST(request: Request, ctx: RouteContext<"/api/g/[token]/leave">) {
  return asGuest(request, ctx.params, async (domain, { guest }) => {
    const result = await leave(domain, guest.id);
    return result.ok ? json({ ok: true }) : json({ error: result.reason }, 409);
  });
}
