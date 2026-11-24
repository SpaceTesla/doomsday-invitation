"use client";

import { useId } from "react";
import { copy } from "@/copy";
import { Label } from "@/components/Label";

export type EventFieldValues = { timeZone: string; hostName: string };

/** The event's time zone and the name beneath Doom: creating and settings share them. */
export function EventFields({
  values,
  onChange,
  zones,
  zoneLocked = false,
}: {
  values: EventFieldValues;
  onChange: (values: EventFieldValues) => void;
  zones: string[];
  zoneLocked?: boolean;
}) {
  const ids = {
    zone: useId(),
    zoneHelp: useId(),
    host: useId(),
    hostHelp: useId(),
  };
  const set = (part: Partial<EventFieldValues>) => onChange({ ...values, ...part });
  return (
    <>
      <div className="field-row">
        <label htmlFor={ids.zone}>
          <Label>{copy["13.28.zone"]}</Label>
        </label>
        <select
          id={ids.zone}
          className="field"
          value={values.timeZone}
          disabled={zoneLocked}
          onChange={(event) => set({ timeZone: event.target.value })}
          aria-describedby={ids.zoneHelp}
        >
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <p id={ids.zoneHelp} className="field-help">
          {zoneLocked ? copy["13.40"] : copy["13.30"]}
        </p>
      </div>
      <div className="field-row">
        <label htmlFor={ids.host}>
          <Label>{copy["13.28.host"]}</Label>
        </label>
        <input
          id={ids.host}
          className="field field--serif"
          value={values.hostName}
          maxLength={60}
          autoComplete="off"
          onChange={(event) => set({ hostName: event.target.value })}
          aria-describedby={ids.hostHelp}
        />
        <p id={ids.hostHelp} className="field-help">
          {copy["13.31"]}
        </p>
      </div>
    </>
  );
}
