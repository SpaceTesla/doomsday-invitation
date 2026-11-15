"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { copy } from "@/copy";
import { Button } from "@/components/Button";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { Panel, PanelActions } from "@/components/Panel";
import { QuietControl } from "@/components/QuietControl";
import { GuestMessageLine, useGuestAction } from "@/components/guest/useGuestAction";
import { timeInWords } from "@/domain/words";

const HOURS = Array.from({ length: 96 }, (_, index) => {
  const hour = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  return {
    value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    label: timeInWords(hour, minute).replace(/^at /, ""),
  };
});

const reasons: Record<string, string> = {
  missing: copy["7.26"],
  past: copy["7.25"],
  same_as_proposal: copy["7.27"],
  not_quarter_hour: copy["7.26"],
};

/** "Propose another": a day and an hour, never a place. A new one replaces the old. */
export function AlternativeEntry({
  token,
  today,
  replacing,
  onDone,
  onCancel,
}: {
  token: string;
  today: string;
  replacing: boolean;
  onDone: () => void;
  onCancel: () => void;
}) {
  const action = useGuestAction(token);
  const dayId = useId();
  const hourId = useId();
  const firstField = useRef<HTMLInputElement>(null);
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [invalid, setInvalid] = useState(false);

  useEffect(() => firstField.current?.focus(), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!day || !hour) {
      setInvalid(true);
      action.setMessage({ text: copy["7.26"], kind: "error" });
      return;
    }
    const result = await action.run("PUT", "alternative", { day, hour });
    if (result.ok) {
      onDone();
      return;
    }
    if (result.status === 422) {
      setInvalid(true);
      action.setMessage({
        text: reasons[result.error ?? "missing"] ?? copy["7.26"],
        kind: "error",
      });
    }
  }

  return (
    <Panel labelledBy="alternative-heading">
      <Heading as="h2" id="alternative-heading">
        {copy["7.17"]}
      </Heading>
      <p className="t-expl">{copy["7.18"]}</p>
      {replacing ? <p className="notice">{copy["7.22"]}</p> : null}
      <form onSubmit={submit} className="mt-4 grid gap-4" noValidate>
        <div className="field-row">
          <label htmlFor={dayId}>
            <Label>{copy["7.19.day"]}</Label>
          </label>
          <input
            ref={firstField}
            id={dayId}
            type="date"
            className="field field--serif"
            min={today}
            value={day}
            onChange={(event) => setDay(event.target.value)}
            aria-invalid={invalid || undefined}
          />
        </div>
        <div className="field-row">
          <label htmlFor={hourId}>
            <Label>{copy["7.19.hour"]}</Label>
          </label>
          <select
            id={hourId}
            className="field"
            value={hour}
            onChange={(event) => setHour(event.target.value)}
            aria-invalid={invalid || undefined}
          >
            <option value="" />
            {HOURS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <PanelActions>
          <Button type="submit" disabled={action.busy}>
            {copy["7.20"]}
          </Button>
          <QuietControl onClick={onCancel}>{copy["7.21"]}</QuietControl>
        </PanelActions>
        <GuestMessageLine message={action.message} busy={action.busy} />
      </form>
    </Panel>
  );
}
