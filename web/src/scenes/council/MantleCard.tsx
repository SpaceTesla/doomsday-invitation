import { copy, fill } from "@/copy";
import { CornerBolts } from "@/components/CornerBolts";
import { Label } from "@/components/Label";
import { SuitRune } from "@/components/Mark";
import { RuneBand } from "@/components/Runes";

/**
 * A mantle in full (design/DESIGN.md, 8.18): the mantle's inscription lit, the suit rune
 * at level 2, the character's name, and whose it is. For the guest's own mantle, "YOURS"
 * and "You stand before the council as …" (copy 5.4 and 5.8); for another guest's, the
 * guest's name, as the list shows it. It opens above the guest list, never inside it.
 */
export function MantleCard({
  id,
  character,
  holder,
  yours,
  onClose,
}: {
  id: string;
  character: string;
  /** The holder's name as the guest list shows it (without a title). */
  holder: string;
  yours: boolean;
  onClose: () => void;
}) {
  return (
    <section
      id={id}
      className="panel-plate panel-plate--principal cn-mantle-card"
      aria-label={character}
    >
      <CornerBolts />
      <RuneBand inscription="to the viktor go the spoils" state="lit" />
      <div className="cn-yours">
        <SuitRune level={2} className="cn-yours-mark" />
        <div>
          {yours ? <Label>{copy["5.4"]}</Label> : null}
          <p className="cn-yours-name">{character}</p>
          {yours ? null : <p className="cn-yours-holder">{holder}</p>}
        </div>
        {yours ? (
          <p className="t-procl cn-yours-line">{fill(copy["5.8"], { "[Character]": character })}</p>
        ) : null}
      </div>
      <button type="button" className="cn-card-close" aria-label={copy["9.10"]} onClick={onClose} />
    </section>
  );
}
