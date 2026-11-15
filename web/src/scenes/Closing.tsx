import { copy } from "@/copy";
import { Heading } from "@/components/Heading";
import { Panel } from "@/components/Panel";
import { ClosingActions } from "./ClosingActions";

/** After declining or leaving: Doom's closing line, and the way back until the day. */
export function Closing({ token }: { token: string }) {
  return (
    <main className="closing">
      <Panel labelledBy="closing-heading">
        <Heading as="h1" id="closing-heading">
          {copy["4.5"]}
        </Heading>
        <p className="t-procl mt-2">{copy["4.6"]}</p>
        <ClosingActions token={token} />
      </Panel>
    </main>
  );
}

/** After the day, for a guest who never answered or declined. Nothing to do. */
export function DayPassed() {
  return (
    <main className="closing">
      <Panel labelledBy="day-passed-heading">
        <Heading as="h1" id="day-passed-heading">
          {copy["4.13"]}
        </Heading>
        <p className="t-procl mt-2">{copy["4.14"]}</p>
      </Panel>
    </main>
  );
}
