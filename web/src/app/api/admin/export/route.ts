import { exportEvent } from "@/domain/council";
import { localParts } from "@/domain/time";
import { asAdmin } from "@/lib/admin";

/** The whole event as JSON, downloaded as a file. A backup Doom keeps himself. */
export async function GET(request: Request) {
  return asAdmin(request, async (domain) => {
    const data = await exportEvent(domain);
    const p = localParts(new Date(), data.timeZone ?? "Asia/Kolkata");
    const stamp = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="iron-throne-${stamp}.json"`,
      },
    });
  });
}
