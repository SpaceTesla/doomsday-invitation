// Dates and times in words, as docs/COPY.md, section 1.5 sets them out. Numerals never
// appear in a date or time shown to a guest.
//
//   Friday the eighteenth of December, at half past seven in the evening.
//   the fifteenth day of November, MMXXVI
//
// Times are quarter hours (the controls offer nothing else):
//   :00 "at seven o'clock", :15 "at quarter past seven", :30 "at half past seven",
//   :45 "at quarter to eight". 12:00 is "at noon" and 00:00 "at midnight", with no part
//   of day. Before noon is "in the morning"; from noon to five o'clock inclusive "in the
//   afternoon"; after five "in the evening".
import { localParts } from "./time";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const HOURS = [
  "twelve",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
];
const ORDINALS = [
  "",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
  "thirteenth",
  "fourteenth",
  "fifteenth",
  "sixteenth",
  "seventeenth",
  "eighteenth",
  "nineteenth",
  "twentieth",
  "twenty-first",
  "twenty-second",
  "twenty-third",
  "twenty-fourth",
  "twenty-fifth",
  "twenty-sixth",
  "twenty-seventh",
  "twenty-eighth",
  "twenty-ninth",
  "thirtieth",
  "thirty-first",
];

export function ordinalInWords(day: number): string {
  const word = ORDINALS[day];
  if (!word) throw new RangeError(`No ordinal for day ${day}.`);
  return word;
}

export function romanNumerals(year: number): string {
  if (!Number.isInteger(year) || year < 1 || year > 3999) {
    throw new RangeError(`Cannot write ${year} in Roman numerals.`);
  }
  const table: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let rest = year;
  let out = "";
  for (const [value, numeral] of table) {
    while (rest >= value) {
      out += numeral;
      rest -= value;
    }
  }
  return out;
}

function partOfDay(hour: number, minute: number): string {
  const minutes = hour * 60 + minute;
  if (minutes < 12 * 60) return "in the morning";
  if (minutes <= 17 * 60) return "in the afternoon";
  return "in the evening";
}

/** "at half past seven in the evening", "at noon". Quarter hours only. */
export function timeInWords(hour: number, minute: number): string {
  if (minute % 15 !== 0) throw new RangeError(`Times are quarter hours; got minute ${minute}.`);
  if (hour === 12 && minute === 0) return "at noon";
  if (hour === 0 && minute === 0) return "at midnight";

  const part = partOfDay(hour, minute);
  const name = (h: number) => HOURS[h % 12];
  switch (minute) {
    case 0:
      return `at ${name(hour)} o'clock ${part}`;
    case 15:
      return `at quarter past ${name(hour)} ${part}`;
    case 30:
      return `at half past ${name(hour)} ${part}`;
    default:
      return `at quarter to ${name(hour + 1)} ${part}`;
  }
}

/** "Friday the eighteenth of December, at half past seven in the evening." */
export function dateTimeInWords(instant: Date, timeZone: string): string {
  const p = localParts(instant, timeZone);
  return `${WEEKDAYS[p.weekday]} the ${ordinalInWords(p.day)} of ${MONTHS[p.month - 1]}, ${timeInWords(p.hour, p.minute)}.`;
}

/** The summons' dating clause: "the fifteenth day of November, MMXXVI". */
export function datingClause(instant: Date, timeZone: string): string {
  const p = localParts(instant, timeZone);
  return `the ${ordinalInWords(p.day)} day of ${MONTHS[p.month - 1]}, ${romanNumerals(p.year)}`;
}
