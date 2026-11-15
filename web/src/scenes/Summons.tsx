import { copy, fill } from "@/copy";
import { Seal } from "@/components/Seal";
import { SummonsActions } from "./SummonsActions";
import { FitName } from "./FitName";
import { SummonsMotion } from "./SummonsMotion";

// The royal summons: a steel plate bearing the guest's name (design/DESIGN.md, 8.4).
// The plate is baked artwork; every word on it is real text, in reading order.

const DATE = "the [day] day of [Month], [year]";

export function Summons({
  token,
  address,
  dating,
}: {
  token: string;
  /** "Mr. Anish", or the name alone. */
  address: string;
  /** "the fifteenth day of November, MMXXVI", from the day the invitation was created. */
  dating: string;
}) {
  const wide = copy["3.8"].replace(DATE, dating);
  const split = wide.indexOf(dating);
  const captionFirst = wide.slice(0, split).trim();
  const captionSecond = wide.slice(split);

  return (
    <main className="sm-stage">
      <FitName className="sm-plate" nameSelector=".sm-name">
        <div className="sm-seal">
          <Seal state="active" />
        </div>
        {/* On the wide plate the dating clause sits under the seal; upright, it closes the body. */}
        <p className="sm-caption" aria-hidden="true">
          {captionFirst}
          <br />
          {captionSecond}
        </p>
        <div className="sm-copy">
          <p className="sm-from">{copy["3.1"]}</p>
          <p className="sm-title">{copy["3.2"]}</p>
          <h1 className="sm-name">{fill(copy["3.3"], { "[Title] [Name]": address })}</h1>
          <p className="sm-greet">{copy["3.4"]}</p>
          <div className="sm-body">
            <p>{copy["3.5"]}</p>
            <p>{copy["3.6"]}</p>
            <p className="sm-sanction">{copy["3.7"]}</p>
            <p className="sm-date">{copy["3.8.phone"].replace(DATE, dating)}</p>
          </div>
          <SummonsActions token={token} />
        </div>
        <SummonsMotion />
      </FitName>
    </main>
  );
}
