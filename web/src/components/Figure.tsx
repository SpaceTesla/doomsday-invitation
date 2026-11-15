/**
 * A figure. Every numeral shown to a guest or to Doom is set in Cinzel: counts such as
 * "3 of 7". Dates and times are written in words and need no figures.
 */
export function Figure({ children }: { children: number | string }) {
  return <span className="fig">{children}</span>;
}
