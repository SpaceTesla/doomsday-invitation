"use client";

import { useId, useState, type FormEvent } from "react";
import { copy, fill } from "@/copy";
import { Button } from "@/components/Button";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { Panel, Well } from "@/components/Panel";
import { timeInWords } from "@/domain/words";
import { ConfirmDialog } from "./ConfirmDialog";
import { ActionMessage, useAdminAction } from "./useAdminAction";

// Every quarter hour of the day, named in words as guests will read it.
const HOURS = Array.from({ length: 96 }, (_, index) => {
  const hour = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return { value, label: timeInWords(hour, minute).replace(/^at /, "") };
});

export type ProposalView = {
  /** The current proposal (or decree), in words, if there is one. */
  words: { when: string; venue: string } | null;
  /** The same, as the fields' values. */
  fields: { day: string; hour: string; venue: string } | null;
  decreed: boolean;
  /** Approvals a change would clear. */
  approvals: number;
  /** Today in the event's time zone, the earliest day the control offers. */
  today: string;
};

export function ProposalPanel({ view }: { view: ProposalView }) {
  const action = useAdminAction();
  const dayId = useId();
  const hourId = useId();
  const venueId = useId();
  const [day, setDay] = useState(view.fields?.day ?? "");
  const [hour, setHour] = useState(view.fields?.hour ?? "");
  const [venue, setVenue] = useState(view.fields?.venue ?? "");
  const [confirming, setConfirming] = useState(false);
  const [invalid, setInvalid] = useState<"when" | "venue" | null>(null);

  const changing = view.fields !== null;
  const unchanged =
    changing &&
    day === view.fields?.day &&
    hour === view.fields?.hour &&
    venue.trim() === view.fields?.venue;

  function check(): boolean {
    if (!day || !hour) {
      setInvalid("when");
      action.setMessage({ text: copy["7.26"], error: true });
      return false;
    }
    if (!venue.trim()) {
      setInvalid("venue");
      action.setMessage({ text: copy["10.47"], error: true });
      return false;
    }
    setInvalid(null);
    return true;
  }

  async function send() {
    setConfirming(false);
    const url = view.decreed ? "/api/admin/plan" : "/api/admin/proposal";
    const result = await action.run("PUT", url, { day, hour, venue: venue.trim() });
    if (!result.ok && result.status === 422) {
      const reason = (result.data as { error?: string } | null)?.error;
      setInvalid(reason === "no_venue" ? "venue" : "when");
      action.setMessage({
        text:
          reason === "no_venue" ? copy["10.47"] : reason === "past" ? copy["7.25"] : copy["7.26"],
        error: true,
      });
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!check()) return;
    // A first proposal needs no warning; a change or an amendment does.
    if (changing) setConfirming(true);
    else void send();
  }

  const submitLabel = view.decreed ? copy["10.40"] : changing ? copy["10.30"] : copy["10.29"];
  const dialog = view.decreed
    ? { text: copy["10.41"], confirm: copy["10.41.confirm"], cancel: copy["10.41.cancel"] }
    : {
        text: fill(copy["10.31"], { "[n]": view.approvals }),
        confirm: copy["10.31.confirm"],
        cancel: copy["10.31.cancel"],
      };

  return (
    <>
      <Panel labelledBy="proposal-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <Heading as="h1" id="proposal-heading">
            {view.decreed ? copy["8.1"] : copy["7.1"]}
          </Heading>
          {view.words ? <Label>{view.decreed ? copy["8.5"] : copy["8.6"]}</Label> : null}
        </div>
        {view.words ? (
          <>
            <p className="t-procl">{view.words.when}</p>
            <p className="t-procl">{fill(copy["7.3"], { "[venue]": view.words.venue })}</p>
          </>
        ) : null}

        <form onSubmit={submit} className="mt-6 grid gap-5" noValidate>
          <div className="grid gap-5 wide:grid-cols-2">
            <div className="field-row">
              <label htmlFor={dayId}>
                <Label>{copy["10.28.day"]}</Label>
              </label>
              <input
                id={dayId}
                type="date"
                className="field field--serif"
                min={view.today}
                value={day}
                onChange={(event) => setDay(event.target.value)}
                aria-invalid={invalid === "when" || undefined}
              />
            </div>
            <div className="field-row">
              <label htmlFor={hourId}>
                <Label>{copy["10.28.hour"]}</Label>
              </label>
              <select
                id={hourId}
                className="field"
                value={hour}
                onChange={(event) => setHour(event.target.value)}
                aria-invalid={invalid === "when" || undefined}
              >
                <option value="" />
                {HOURS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <label htmlFor={venueId}>
              <Label>{copy["10.28.venue"]}</Label>
            </label>
            <input
              id={venueId}
              className="field"
              value={venue}
              maxLength={300}
              autoComplete="off"
              onChange={(event) => setVenue(event.target.value)}
              aria-invalid={invalid === "venue" || undefined}
            />
          </div>
          <div>
            <Button type="submit" disabled={action.busy || unchanged}>
              {submitLabel}
            </Button>
            <ActionMessage message={action.message} />
          </div>
        </form>
        {!view.decreed && view.words ? (
          <Well>
            <p className="m-0">{copy["10.36"]}</p>
          </Well>
        ) : null}
      </Panel>
      <ConfirmDialog
        open={confirming}
        text={dialog.text}
        confirmLabel={dialog.confirm}
        cancelLabel={dialog.cancel}
        busy={action.busy}
        onConfirm={send}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
