import { approve, withdrawApproval } from "@/domain/proposal";
import { json } from "@/lib/admin";
import { asGuest } from "@/lib/guest";

/** Approve the current proposal. */
export async function PUT(request: Request, ctx: RouteContext<"/api/g/[token]/approval">) {
  return asGuest(request, ctx.params, async (domain, { guest }) => {
    const result = await approve(domain, guest.id);
    return result.ok ? json({ ok: true }) : json({ error: result.reason }, 409);
  });
}

/** Withdraw the approval. */
export async function DELETE(request: Request, ctx: RouteContext<"/api/g/[token]/approval">) {
  return asGuest(request, ctx.params, async (domain, { guest }) => {
    const result = await withdrawApproval(domain, guest.id);
    return result.ok ? json({ ok: true }) : json({ error: result.reason }, 409);
  });
}
