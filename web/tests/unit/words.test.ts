import { describe, expect, it } from "vitest";
import { endOfLocalDay, isQuarterHour, localDate, zonedInstant } from "@/domain/time";
import {
  dateTimeInWords,
  datingClause,
  ordinalInWords,
  romanNumerals,
  timeInWords,
} from "@/domain/words";
import { ist } from "../helpers/domain";

const IST = "Asia/Kolkata";

describe("dates and times in words (COPY.md, section 1.5)", () => {
  it("writes the copy deck's own example", () => {
    expect(dateTimeInWords(ist("2026-12-18 19:30"), IST)).toBe(
      "Friday the eighteenth of December, at half past seven in the evening.",
    );
  });

  it.each([
    [0, 0, "at midnight"],
    [0, 15, "at quarter past twelve in the morning"],
    [7, 0, "at seven o'clock in the morning"],
    [9, 45, "at quarter to ten in the morning"],
    [11, 45, "at quarter to twelve in the morning"],
    [12, 0, "at noon"],
    [12, 15, "at quarter past twelve in the afternoon"],
    [12, 45, "at quarter to one in the afternoon"],
    [16, 45, "at quarter to five in the afternoon"],
    [17, 0, "at five o'clock in the afternoon"],
    [17, 15, "at quarter past five in the evening"],
    [19, 30, "at half past seven in the evening"],
    [23, 45, "at quarter to twelve in the evening"],
  ])("%i:%i is %s", (hour, minute, words) => {
    expect(timeInWords(hour, minute)).toBe(words);
  });

  it("covers every quarter hour of the day without a numeral", () => {
    for (let hour = 0; hour < 24; hour += 1) {
      for (const minute of [0, 15, 30, 45]) {
        const words = timeInWords(hour, minute);
        expect(words).toMatch(/^at [a-z' ]+$/);
      }
    }
  });

  it("refuses a time that is not a quarter hour", () => {
    expect(() => timeInWords(19, 20)).toThrow(RangeError);
  });

  it("writes every ordinal a month needs, and month ends correctly", () => {
    expect(ordinalInWords(1)).toBe("first");
    expect(ordinalInWords(22)).toBe("twenty-second");
    expect(ordinalInWords(31)).toBe("thirty-first");
    expect(() => ordinalInWords(32)).toThrow(RangeError);
    expect(dateTimeInWords(ist("2027-02-28 12:00"), IST)).toBe(
      "Sunday the twenty-eighth of February, at noon.",
    );
    expect(dateTimeInWords(ist("2026-12-31 23:45"), IST)).toBe(
      "Thursday the thirty-first of December, at quarter to twelve in the evening.",
    );
  });

  it("uses the event's time zone, not the server's", () => {
    // 14:00 UTC is half past seven in the evening in India.
    expect(dateTimeInWords(new Date("2026-12-18T14:00:00Z"), IST)).toBe(
      "Friday the eighteenth of December, at half past seven in the evening.",
    );
    // 20:00 UTC on the 18th is already the 19th in India.
    expect(dateTimeInWords(new Date("2026-12-18T20:00:00Z"), IST)).toBe(
      "Saturday the nineteenth of December, at half past one in the morning.",
    );
  });

  it("writes the summons' dating clause", () => {
    expect(datingClause(ist("2026-11-15 09:00"), IST)).toBe(
      "the fifteenth day of November, MMXXVI",
    );
    expect(romanNumerals(2027)).toBe("MMXXVII");
    expect(romanNumerals(1999)).toBe("MCMXCIX");
  });
});

describe("time-zone arithmetic", () => {
  it("finds the instant of a wall-clock time", () => {
    expect(zonedInstant(IST, 2026, 12, 18, 19, 30).toISOString()).toBe("2026-12-18T14:00:00.000Z");
    // A zone with daylight saving, on both sides of the change.
    expect(zonedInstant("Europe/London", 2026, 3, 28, 12, 0).toISOString()).toBe(
      "2026-03-28T12:00:00.000Z",
    );
    expect(zonedInstant("Europe/London", 2026, 3, 30, 12, 0).toISOString()).toBe(
      "2026-03-30T11:00:00.000Z",
    );
  });

  it("ends a day at the following local midnight", () => {
    expect(endOfLocalDay({ year: 2026, month: 12, day: 18 }, IST).toISOString()).toBe(
      "2026-12-18T18:30:00.000Z",
    );
    expect(endOfLocalDay({ year: 2026, month: 12, day: 31 }, IST).toISOString()).toBe(
      "2026-12-31T18:30:00.000Z",
    );
    expect(localDate(new Date("2026-12-18T18:29:59Z"), IST)).toEqual({
      year: 2026,
      month: 12,
      day: 18,
    });
    expect(localDate(new Date("2026-12-18T18:30:00Z"), IST)).toEqual({
      year: 2026,
      month: 12,
      day: 19,
    });
  });

  it("recognises quarter hours in the zone", () => {
    expect(isQuarterHour(ist("2026-12-18 19:45"), IST)).toBe(true);
    expect(isQuarterHour(ist("2026-12-18 19:50"), IST)).toBe(false);
    expect(isQuarterHour(new Date("2026-12-18T14:00:30Z"), IST)).toBe(false);
  });
});
