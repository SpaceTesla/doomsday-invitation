import { createEvent } from "@/domain/event";
import { asOrganizer, json, parseBody } from "@/lib/admin";
import { eventInput } from "@/lib/admin-input";

/** Create an event for the signed-in organizer. It starts with the default roster. */
export async function POST(request: Request) {
  return asOrganizer(request, async (domain, organizer) => {
    const input = await parseBody(request, eventInput);
    const result = await createEvent(domain, organizer.id, input);
    if (!result.ok) return json({ error: result.reason }, 422);
    return json({ id: result.id }, 201);
  });
}
