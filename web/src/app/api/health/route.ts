import { getPool } from "@/db/client";

export const dynamic = "force-dynamic";

// Says whether the application can read its database, and how many migrations that
// database has applied (the deployment's smoke test compares this with the build's).
// It reveals nothing else, and never the reason for a failure.
export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query<{ one: number }>("select 1 as one");
    if (rows[0]?.one !== 1) throw new Error("unexpected answer");
    const applied = await pool.query<{ count: number }>(
      `select case when to_regclass('drizzle.__drizzle_migrations') is null then 0
              else (select count(*)::int from drizzle.__drizzle_migrations) end as count`,
    );
    return Response.json({ ok: true, database: true, migrations: applied.rows[0]?.count ?? 0 });
  } catch {
    return Response.json({ ok: false, database: false }, { status: 503 });
  }
}
