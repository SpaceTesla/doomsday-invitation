import { maskLevel2 } from "@/marks/maskLevel2";
import { maskLevel2Plain } from "@/marks/maskLevel2Plain";
import { InlineMark, type MarkProps } from "./Mark";

/**
 * The mask at level 2: the line insignia, for seals, the summons and panels. Below 80 px
 * it is drawn without rivets and with heavier lines ("plain"). design/DESIGN.md, 3.4.
 */
export function MaskInsignia({ plain = false, ...props }: MarkProps & { plain?: boolean }) {
  return <InlineMark data={plain ? maskLevel2Plain : maskLevel2} paint="own" {...props} />;
}
