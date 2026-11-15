import { addGuest } from "@/domain/guests";
import { asAdmin, json, parseBody } from "@/lib/admin";
import { guestInput } from "@/lib/admin-input";

/** Summon a guest. Answers with the new guest's id and link token. */
export async function POST(request: Request) {
  return asAdmin(request, async (domain) => {
    const input = await parseBody(request, guestInput);
    const result = await addGuest(domain, input);
    if (!result.ok) return json({ error: result.reason }, 422);
    return json({ id: result.id, token: result.token }, 201);
  });
}
