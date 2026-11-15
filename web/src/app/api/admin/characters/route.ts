import { addCharacter } from "@/domain/characters";
import { asAdmin, json, parseBody } from "@/lib/admin";
import { characterInput } from "@/lib/admin-input";

/** Add a character to the roster. 409 if the roster already has that name. */
export async function POST(request: Request) {
  return asAdmin(request, async (domain) => {
    const { name } = await parseBody(request, characterInput);
    const result = await addCharacter(domain, name);
    if (!result.ok)
      return json({ error: result.reason }, result.reason === "duplicate" ? 409 : 422);
    return json({ id: result.id }, 201);
  });
}
