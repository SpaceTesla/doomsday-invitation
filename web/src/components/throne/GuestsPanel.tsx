"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { copy, fill } from "@/copy";
import { Button } from "@/components/Button";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { SealMark } from "@/components/Mark";
import { Panel, PanelActions, Well } from "@/components/Panel";
import { QuietControl } from "@/components/QuietControl";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useEventPaths } from "./EventPaths";
import { ActionMessage, useAdminAction } from "./useAdminAction";

type Title = "" | "Mr." | "Ms." | "Dr.";

export type GuestRow = {
  id: string;
  title: Title;
  name: string;
  token: string | null;
  status: "summoned" | "opened" | "seated" | "declined";
  character: string | null;
};

const titleChoices: { value: Title; label: string }[] = [
  { value: "Mr.", label: copy["10.6.mr"] },
  { value: "Ms.", label: copy["10.6.ms"] },
  { value: "Dr.", label: copy["10.6.dr"] },
  { value: "", label: copy["10.6.none"] },
];

const statusLabel = {
  summoned: copy["10.10.summoned"],
  opened: copy["10.10.opened"],
  seated: copy["10.10.seated"],
  declined: copy["10.10.declined"],
} as const;

const address = (g: { title: string; name: string }) => (g.title ? `${g.title} ${g.name}` : g.name);

/** The name and title fields, shared by "Summon a guest" and "Edit name". */
function NameFields({
  name,
  title,
  onName,
  onTitle,
  invalid,
  describedBy,
}: {
  name: string;
  title: Title;
  onName: (value: string) => void;
  onTitle: (value: Title) => void;
  invalid: boolean;
  describedBy: string;
}) {
  const nameId = useId();
  const helpId = useId();
  const group = useId();
  return (
    <>
      <div className="field-row">
        <label htmlFor={nameId}>
          <Label>{copy["10.5.name"]}</Label>
        </label>
        <input
          id={nameId}
          className="field field--serif"
          value={name}
          maxLength={200}
          autoComplete="off"
          onChange={(event) => onName(event.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={`${helpId} ${describedBy}`}
        />
        <p id={helpId} className="field-help">
          {copy["10.7"]}
        </p>
      </div>
      <fieldset className="field-row border-0 p-0">
        <legend className="mb-1.5">
          <Label>{copy["10.5.title"]}</Label>
        </legend>
        <div className="choice-row">
          {titleChoices.map((choice) => (
            <label key={choice.label} className="choice">
              <input
                type="radio"
                name={group}
                value={choice.value}
                checked={title === choice.value}
                onChange={() => onTitle(choice.value)}
              />
              <span>{choice.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}

function SummonForm() {
  const paths = useEventPaths();
  const action = useAdminAction();
  const messageId = useId();
  const [name, setName] = useState("");
  const [title, setTitle] = useState<Title>("");
  const [missing, setMissing] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setMissing(true);
      action.setMessage({ text: copy["10.9"], error: true });
      return;
    }
    setMissing(false);
    const result = await action.run("POST", `${paths.api}/guests`, { name, title });
    if (result.ok) {
      setName("");
      setTitle("");
    } else if (result.status === 422) {
      action.setMessage({ text: copy["10.9"], error: true });
    }
  }

  return (
    <Panel labelledBy="summon-heading">
      <Heading as="h1" id="summon-heading">
        {copy["10.4"]}
      </Heading>
      <form onSubmit={submit} className="mt-4 grid gap-5" noValidate>
        <NameFields
          name={name}
          title={title}
          onName={setName}
          onTitle={setTitle}
          invalid={missing}
          describedBy={messageId}
        />
        <div>
          <Button type="submit" disabled={action.busy}>
            {copy["10.8"]}
          </Button>
          <div id={messageId}>
            <ActionMessage message={action.message} />
          </div>
        </div>
      </form>
    </Panel>
  );
}

type Pending = { kind: "replace" | "cancel" | "remove"; guest: GuestRow } | null;

function GuestEntry({
  guest,
  onAsk,
  onCopy,
}: {
  guest: GuestRow;
  onAsk: (pending: NonNullable<Pending>) => void;
  onCopy: (guest: GuestRow) => void;
}) {
  const paths = useEventPaths();
  const action = useAdminAction();
  const messageId = useId();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(guest.name);
  const [title, setTitle] = useState<Title>(guest.title);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      action.setMessage({ text: copy["10.9"], error: true });
      return;
    }
    const result = await action.run("PATCH", `${paths.api}/guests/${guest.id}`, { name, title });
    if (result.ok) setEditing(false);
  }

  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="t-name">{address(guest)}</span>
        <Label>{statusLabel[guest.status]}</Label>
      </div>
      {guest.character ? <p className="t-holder mt-1">{guest.character}</p> : null}

      {editing ? (
        <form onSubmit={save} className="mt-4 grid gap-4" noValidate>
          <NameFields
            name={name}
            title={title}
            onName={setName}
            onTitle={setTitle}
            invalid={!name.trim() && action.message?.error === true}
            describedBy={messageId}
          />
          <PanelActions>
            <Button type="submit" disabled={action.busy}>
              {copy["10.45"]}
            </Button>
            <QuietControl
              onClick={() => {
                setEditing(false);
                setName(guest.name);
                setTitle(guest.title);
                action.setMessage(null);
              }}
            >
              {copy["7.21"]}
            </QuietControl>
          </PanelActions>
        </form>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-x-5">
          {guest.token ? (
            <>
              <QuietControl onClick={() => onCopy(guest)}>{copy["10.11.copy"]}</QuietControl>
              <QuietControl onClick={() => onAsk({ kind: "replace", guest })}>
                {copy["10.11.replace"]}
              </QuietControl>
              <QuietControl onClick={() => onAsk({ kind: "cancel", guest })}>
                {copy["10.11.cancel"]}
              </QuietControl>
            </>
          ) : (
            <>
              <Label>{copy["10.46"]}</Label>
              <QuietControl onClick={() => onAsk({ kind: "replace", guest })}>
                {copy["10.11.replace"]}
              </QuietControl>
            </>
          )}
          <QuietControl onClick={() => setEditing(true)}>{copy["10.15"]}</QuietControl>
          <QuietControl onClick={() => onAsk({ kind: "remove", guest })}>
            {copy["10.16"]}
          </QuietControl>
        </div>
      )}
      <div id={messageId}>{action.message ? <ActionMessage message={action.message} /> : null}</div>
    </li>
  );
}

/** Before a day is proposed there is nothing to summon guests to: the proposal comes first. */
function ProposeFirst() {
  const paths = useEventPaths();
  return (
    <Panel labelledBy="summon-heading">
      <Heading as="h1" id="summon-heading">
        {copy["10.4"]}
      </Heading>
      <p className="t-expl mt-3">{copy["10.39"]}</p>
      <div className="mt-5">
        <Link href={`${paths.page}/proposal`} className="btn-plate no-underline">
          <SealMark />
          <Label>{copy["10.29"]}</Label>
        </Link>
      </div>
    </Panel>
  );
}

export function GuestsPanel({ guests, canSummon }: { guests: GuestRow[]; canSummon: boolean }) {
  const paths = useEventPaths();
  const action = useAdminAction();
  const [pending, setPending] = useState<Pending>(null);
  const [manualLink, setManualLink] = useState<string | null>(null);

  async function copyLink(guest: GuestRow) {
    if (!guest.token) return;
    const link = `${window.location.origin}/s/${guest.token}`;
    try {
      await navigator.clipboard.writeText(link);
      setManualLink(null);
      action.setMessage({ text: copy["10.12"], error: false });
    } catch {
      // No clipboard (an insecure context, or permission refused): show it to copy by hand.
      setManualLink(link);
    }
  }

  async function confirm() {
    if (!pending) return;
    const { kind, guest } = pending;
    const result =
      kind === "replace"
        ? await action.run("POST", `${paths.api}/guests/${guest.id}/link`)
        : kind === "cancel"
          ? await action.run("DELETE", `${paths.api}/guests/${guest.id}/link`)
          : await action.run("DELETE", `${paths.api}/guests/${guest.id}`);
    setPending(null);
    if (result.ok && kind === "replace") {
      const token = (result.data as { token?: string } | null)?.token;
      if (token) await copyLink({ ...guest, token });
    }
  }

  const dialog = pending
    ? pending.kind === "replace"
      ? {
          text: copy["10.13"],
          confirmLabel: copy["10.13.confirm"],
          cancelLabel: copy["10.13.cancel"],
        }
      : pending.kind === "cancel"
        ? {
            text: fill(copy["10.14"], { "[Title] [Name]": address(pending.guest) }),
            confirmLabel: copy["10.14.confirm"],
            cancelLabel: copy["10.14.cancel"],
          }
        : {
            text: fill(copy["10.17"], { "[Title] [Name]": address(pending.guest) }),
            confirmLabel: copy["10.17.confirm"],
            cancelLabel: copy["10.17.cancel"],
          }
    : null;

  return (
    <>
      {canSummon ? <SummonForm /> : <ProposeFirst />}
      <Panel labelledBy="guest-list-label">
        <span id="guest-list-label">
          <Label block>{copy["10.2.guests"]}</Label>
        </span>
        <Well>
          {guests.length === 0 ? (
            <p className="m-0">{copy["10.18"]}</p>
          ) : (
            <ul className="row-list">
              {guests.map((guest) => (
                <GuestEntry
                  key={`${guest.id}:${guest.name}:${guest.title}`}
                  guest={guest}
                  onAsk={setPending}
                  onCopy={copyLink}
                />
              ))}
            </ul>
          )}
        </Well>
        {manualLink ? (
          <input
            className="field field--serif mt-4"
            readOnly
            value={manualLink}
            onFocus={(e) => e.target.select()}
          />
        ) : null}
        <ActionMessage message={action.message} />
      </Panel>
      <ConfirmDialog
        open={dialog !== null}
        text={dialog?.text ?? ""}
        confirmLabel={dialog?.confirmLabel ?? copy["7.21"]}
        cancelLabel={dialog?.cancelLabel ?? copy["7.21"]}
        busy={action.busy}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
