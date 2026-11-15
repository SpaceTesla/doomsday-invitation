import { markSeen } from "@/domain/guests";
import { json } from "@/lib/admin";
import { asGuest } from "@/lib/guest";

/** The guest has seen the council as it stands: notices of change are shown once. */
export async function POST(request: Request, ctx: RouteContext<"/api/g/[token]/seen">) {
  return asGuest(request, ctx.params, async (domain, { guest }) => {
    await markSeen(domain, guest.id);
    return json({ ok: true });
  });
}
