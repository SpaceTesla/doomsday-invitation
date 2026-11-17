/**
 * The four corner bolts of a principal panel (design/DESIGN.md, 2.4 and 8.14): the gold
 * disc with an inner ring, from the summons plate. One principal panel per step at most.
 */
export function CornerBolts() {
  return (
    <>
      {["tl", "tr", "bl", "br"].map((corner) => (
        // eslint-disable-next-line @next/next/no-img-element -- a static SVG mark, served as it is
        <img key={corner} className={`bolt bolt--${corner}`} src="/icons/bolt.svg" alt="" />
      ))}
    </>
  );
}
