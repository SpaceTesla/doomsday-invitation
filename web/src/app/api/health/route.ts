import { getPool } from "@/db/client";

export const dynamic = "force-dynamic";

// Says whether the application can read its database. It reveals nothing else, and
// never the reason for a failure.
export async function GET() {
  try {
    const { rows } = await getPool().query<{ one: number }>("select 1 as one");
    if (rows[0]?.one !== 1) throw new Error("unexpected answer");
    return Response.json({ ok: true, database: true });
  } catch {
    return Response.json({ ok: false, database: false }, { status: 503 });
  }
}
