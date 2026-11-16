import { InlineMark, type MarkProps } from "@/components/Mark";
import type { MarkData } from "@/marks/types";

/**
 * The seeker: the mark beside the mantle search (design/DESIGN.md, section 8.12). Drawn
 * for the build in the marks' own language (a square lens like the cuirass tile, the same
 * 7-unit stroke on a 100-unit field, square ends) with a handle running to the corner.
 * It is not exported from the board generator, so it lives here and not in src/marks/.
 */
const seeker: MarkData = {
  viewBox: "-50 -50 100 100",
  body:
    '<g fill="none" stroke-width="7" stroke-linecap="square">' +
    '<rect x="-38" y="-38" width="54" height="54"/>' +
    '<rect x="-21" y="-21" width="20" height="20"/>' +
    '<path d="M20 20 L38 38"/>' +
    "</g>",
};

export function SearchMark(props: MarkProps) {
  return <InlineMark data={seeker} paint="stroke" {...props} />;
}
