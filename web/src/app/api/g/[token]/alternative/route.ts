import { proposeAlternative, withdrawAlternative } from "@/domain/proposal";
import { instantFrom, whenInput } from "@/lib/admin-input";
import { json } from "@/lib/admin";
import { asGuest, readJson } from "@/lib/guest";

/**
 * Put forward another day and hour. 422 "missing", "past", "same_as_proposal" or
 * "not_quarter_hour"; 409 after the decree or for a guest not seated.
 */
export async function PUT(request: Request, ctx: RouteContext<"/api/g/[token]/alternative">) {
  return asGuest(request, ctx.params, async (domain, { guest, event }) => {
    const parsed = whenInput.safeParse(await readJson(request));
    if (!parsed.success) return json({ error: "missing" }, 422);
    const result = await proposeAlternative(
      domain,
      guest.id,
      instantFrom(parsed.data, event.timezone),
    );
    if (result.ok) return json({ ok: true, replaced: result.replaced });
    const conflict = result.reason === "after_decree" || result.reason === "not_seated";
    return json({ error: result.reason }, conflict ? 409 : 422);
  });
}

/** Withdraw the alternative. */
export async function DELETE(request: Request, ctx: RouteContext<"/api/g/[token]/alternative">) {
  return asGuest(request, ctx.params, async (domain, { guest }) => {
    const result = await withdrawAlternative(domain, guest.id);
    return result.ok ? json({ ok: true }) : json({ error: result.reason }, 409);
  });
}
