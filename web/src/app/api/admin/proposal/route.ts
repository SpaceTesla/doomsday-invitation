import { requireEvent } from "@/domain/event";
import { setProposal } from "@/domain/proposal";
import { asAdmin, json, parseBody } from "@/lib/admin";
import { instantFrom, proposalInput } from "@/lib/admin-input";

/** Set or change the proposal. A real change clears every approval. */
export async function PUT(request: Request) {
  return asAdmin(request, async (domain) => {
    const input = await parseBody(request, proposalInput);
    const eventRow = await requireEvent(domain);
    const result = await setProposal(domain, instantFrom(input, eventRow.timezone), input.venue);
    if (!result.ok)
      return json({ error: result.reason }, result.reason === "after_decree" ? 409 : 422);
    return json({ changed: result.changed });
  });
}
