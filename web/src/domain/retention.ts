// Thirty days after the day, everything is deleted. docs/ARCHITECTURE.md, section 7.5.
// Safe to run any number of times: before the date it does nothing, and after the
// deletion there is nothing left to delete.
import { adminSession, alternative, attempt, character, event, guest } from "@/db/schema";
import { nowOf, type Domain } from "./context";
import { expiresAt, getEvent } from "./event";

export async function runRetention(
  domain: Domain,
): Promise<{ deleted: boolean; due: Date | null }> {
  const row = await getEvent(domain);
  if (!row) return { deleted: false, due: null };
  const due = expiresAt(row);
  if (!due || nowOf(domain).getTime() < due.getTime()) return { deleted: false, due };

  await domain.db.transaction(async (tx) => {
    await tx.delete(alternative);
    await tx.delete(guest);
    await tx.delete(character);
    await tx.delete(adminSession);
    await tx.delete(attempt);
    await tx.delete(event);
  });
  return { deleted: true, due };
}
