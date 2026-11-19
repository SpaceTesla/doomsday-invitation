// The time zones an organizer can choose. The runtime lists some zones by their old names
// (V8 says "Asia/Calcutta"); the list shows the current IANA name instead, and a browser's
// own zone is read the same way, so "Asia/Kolkata" is offered and matched.

const CURRENT: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Rangoon": "Asia/Yangon",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Atlantic/Faeroe": "Atlantic/Faroe",
  "Europe/Kiev": "Europe/Kyiv",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "America/Catamarca": "America/Argentina/Catamarca",
  "America/Cordoba": "America/Argentina/Cordoba",
  "America/Jujuy": "America/Argentina/Jujuy",
  "America/Mendoza": "America/Argentina/Mendoza",
  "America/Indianapolis": "America/Indiana/Indianapolis",
  "America/Louisville": "America/Kentucky/Louisville",
  "Pacific/Enderbury": "Pacific/Kanton",
  "Pacific/Ponape": "Pacific/Pohnpei",
  "Pacific/Truk": "Pacific/Chuuk",
};

/** The current IANA name for a zone. */
export const currentZoneName = (zone: string): string => CURRENT[zone] ?? zone;

/** Every zone, by its current name, sorted, with UTC; `include` is kept even if unlisted. */
export function timeZoneChoices(include?: string): string[] {
  let listed: string[] = [];
  try {
    listed = Intl.supportedValuesOf("timeZone");
  } catch {
    listed = [];
  }
  const zones = new Set(listed.map(currentZoneName));
  zones.add("UTC");
  if (include) zones.add(include);
  return [...zones].sort();
}
