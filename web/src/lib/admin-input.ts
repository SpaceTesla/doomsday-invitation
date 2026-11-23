// Input shapes for the organizer's requests, and the conversion of the panel's
// day-and-hour fields into an instant in the event's time zone.
import { z } from "zod";
import { FACTIONS } from "@/domain/factions";
import { HOST_NAME_MAX } from "@/domain/event";
import { TITLES } from "@/domain/guests";
import { zonedInstant } from "@/domain/time";

export const idParam = z.uuid();

export const eventInput = z.object({
  timeZone: z.string().max(64),
  hostName: z.string().max(HOST_NAME_MAX * 2),
});

export const guestInput = z.object({
  name: z.string().max(200),
  title: z.enum(TITLES),
});

export const characterInput = z.object({
  name: z.string().max(120),
  faction: z.enum(FACTIONS).nullable().optional(),
});

/** DAY as YYYY-MM-DD and HOUR as HH:MM on a quarter hour, as the panel's controls send them. */
export const whenInput = z.object({
  // A day that exists: 30 February would otherwise roll over into March.
  day: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    }),
  hour: z.string().regex(/^([01]\d|2[0-3]):(00|15|30|45)$/),
});

export const proposalInput = whenInput.extend({ venue: z.string().max(300) });

export function instantFrom(when: { day: string; hour: string }, timeZone: string): Date {
  const [year, month, day] = when.day.split("-").map(Number);
  const [hour, minute] = when.hour.split(":").map(Number);
  return zonedInstant(timeZone, year, month, day, hour, minute);
}
