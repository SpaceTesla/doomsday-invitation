import { requireEvent } from "@/domain/event";
import { amendPlan } from "@/domain/proposal";
import { asAdmin, json, parseBody } from "@/lib/admin";
import { instantFrom, proposalInput } from "@/lib/admin-input";

/** Amend the decree. Guests are shown that it changed. */
export async function PUT(request: Request) {
  return asAdmin(request, async (domain) => {
    const input = await parseBody(request, proposalInput);
    const eventRow = await requireEvent(domain);
    const result = await amendPlan(domain, instantFrom(input, eventRow.timezone), input.venue);
    if (!result.ok)
      return json({ error: result.reason }, result.reason === "not_decreed" ? 409 : 422);
    return json({ changed: result.changed });
  });
}
