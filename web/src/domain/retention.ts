// Thirty days after its day, each event is deleted with everything in it.
// docs/ARCHITECTURE.md, section 7.5. Safe to run any number of times: an event before its
// date is left alone, and after the deletion there is nothing left to delete. Other events,
// and organizer accounts, are untouched.
import { lt } from "drizzle-orm";
import { attempt, event } from "@/db/schema";
import { forEvent, nowOf, type Domain } from "./context";
import { deleteEvent, expiresAt } from "./event";

export async function runRetention(
  domain: Domain,
): Promise<{ deleted: boolean; events: number[] }> {
  const now = nowOf(domain);
  const rows = await domain.db.select().from(event);
  const deleted: number[] = [];
  for (const row of rows) {
    const due = expiresAt(row);
    if (!due || now.getTime() < due.getTime()) continue;
    // The foreign keys take the guests, their links and alternatives, and the roster.
    await deleteEvent(forEvent(domain, row.id));
    deleted.push(row.id);
  }
  // Failed-link counts are only kept a day in any case.
  await domain.db.delete(attempt).where(lt(attempt.at, new Date(now.getTime() - 86_400_000)));
  return { deleted: deleted.length > 0, events: deleted };
}
