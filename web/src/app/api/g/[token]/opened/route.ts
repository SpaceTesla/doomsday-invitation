import { z } from "zod";
import { recordOpened, recordOpeningPlayed } from "@/domain/guests";
import { json } from "@/lib/admin";
import { asGuest, readJson } from "@/lib/guest";

const body = z.object({ played: z.boolean().optional() });

/** The guest's page has opened; with played, the guest has pressed an opening action. */
export async function POST(request: Request, ctx: RouteContext<"/api/g/[token]/opened">) {
  return asGuest(request, ctx.params, async (domain, { guest }) => {
    const parsed = body.safeParse((await readJson(request)) ?? {});
    await recordOpened(domain, guest.id);
    if (parsed.success && parsed.data.played) await recordOpeningPlayed(domain, guest.id);
    return json({ ok: true });
  });
}
