// Wall-clock arithmetic in the event's time zone, with Intl only (no date library).

export type LocalParts = {
  year: number;
  month: number; // 1 to 12
  day: number; // 1 to 31
  hour: number; // 0 to 23
  minute: number;
  second: number;
  weekday: number; // 0 Sunday to 6 Saturday
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let found = formatters.get(timeZone);
  if (!found) {
    found = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      weekday: "short",
    });
    formatters.set(timeZone, found);
  }
  return found;
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** True when the name is an IANA time zone this runtime knows. */
export function isTimeZone(timeZone: string): boolean {
  try {
    formatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** The wall-clock reading of an instant in a time zone. */
export function localParts(instant: Date, timeZone: string): LocalParts {
  const parts: Record<string, string> = {};
  for (const part of formatter(timeZone).formatToParts(instant)) parts[part.type] = part.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: WEEKDAYS[parts.weekday],
  };
}

/** Offset of the zone from UTC at an instant, in milliseconds. */
function offsetAt(instant: Date, timeZone: string): number {
  const p = localParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** The instant at which a wall-clock time occurs in a time zone. */
export function zonedInstant(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  // Two passes settle the offset, including across a change of offset.
  let instant = guess - offsetAt(new Date(guess), timeZone);
  instant = guess - offsetAt(new Date(instant), timeZone);
  return new Date(instant);
}

export type LocalDate = { year: number; month: number; day: number };

/** The calendar date of an instant in a time zone. */
export function localDate(instant: Date, timeZone: string): LocalDate {
  const { year, month, day } = localParts(instant, timeZone);
  return { year, month, day };
}

/** The first instant after the given local date has ended: midnight that night. */
export function endOfLocalDay(date: LocalDate, timeZone: string): Date {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + 1));
  return zonedInstant(
    timeZone,
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
    0,
    0,
  );
}

/** True when the instant falls on a quarter hour in the zone, to the second. */
export function isQuarterHour(instant: Date, timeZone: string): boolean {
  const { minute, second } = localParts(instant, timeZone);
  return minute % 15 === 0 && second === 0 && instant.getMilliseconds() === 0;
}
