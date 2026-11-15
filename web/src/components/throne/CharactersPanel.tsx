"use client";

import { useId, useState, type FormEvent } from "react";
import { copy, fill } from "@/copy";
import { Button } from "@/components/Button";
import { Label } from "@/components/Label";
import { Panel, Well } from "@/components/Panel";
import { QuietControl } from "@/components/QuietControl";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ActionMessage, useAdminAction } from "./useAdminAction";

export type CharacterRow = {
  id: string;
  name: string;
  holder: { title: string; name: string } | null;
};

const address = (g: { title: string; name: string }) => (g.title ? `${g.title} ${g.name}` : g.name);

export function CharactersPanel({ characters }: { characters: CharacterRow[] }) {
  const add = useAdminAction();
  const remove = useAdminAction();
  const fieldId = useId();
  const [name, setName] = useState("");
  const [pending, setPending] = useState<CharacterRow | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const result = await add.run("POST", "/api/admin/characters", { name: trimmed });
    if (result.ok) setName("");
    else if (result.status === 409) {
      add.setMessage({ text: fill(copy["10.21"], { "[Character]": trimmed }), error: true });
    }
  }

  async function removeCharacter(character: CharacterRow, confirmed: boolean) {
    const result = await remove.run(
      "DELETE",
      `/api/admin/characters/${character.id}${confirmed ? "?confirm=1" : ""}`,
    );
    if (!result.ok && result.status === 409) {
      // Taken since the page loaded: warn, naming who holds it now.
      const holder = (result.data as { holder?: CharacterRow["holder"] } | null)?.holder ?? null;
      setPending({ ...character, holder });
      return;
    }
    setPending(null);
  }

  return (
    <>
      <Panel labelledBy="roster-label">
        <span id="roster-label">
          <Label block>{copy["10.2.characters"]}</Label>
        </span>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="field-row">
            <label htmlFor={fieldId}>
              <Label>{copy["10.19"]}</Label>
            </label>
            <input
              id={fieldId}
              className="field field--serif"
              value={name}
              maxLength={120}
              autoComplete="off"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <Button type="submit" disabled={add.busy || !name.trim()}>
              {copy["10.20"]}
            </Button>
            <ActionMessage message={add.message} />
          </div>
        </form>

        <Well>
          {characters.length === 0 ? (
            <p className="m-0">{copy["10.26"]}</p>
          ) : (
            <ul className="row-list">
              {characters.map((character) => (
                <li
                  key={character.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
                >
                  <div className="min-w-0">
                    <span className="t-name">{character.name}</span>
                    <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                      {character.holder ? (
                        <>
                          <Label>{copy["10.23"]}</Label>
                          <span className="t-holder">{address(character.holder)}</span>
                        </>
                      ) : (
                        <Label>{copy["10.22"]}</Label>
                      )}
                    </p>
                  </div>
                  <QuietControl
                    onClick={() =>
                      character.holder ? setPending(character) : removeCharacter(character, false)
                    }
                  >
                    {copy["10.24"]}
                  </QuietControl>
                </li>
              ))}
            </ul>
          )}
        </Well>
        <p className="t-expl mt-4">{copy["10.27"]}</p>
        <ActionMessage message={remove.message} />
      </Panel>
      <ConfirmDialog
        open={pending !== null}
        text={
          pending?.holder
            ? fill(copy["10.25"], {
                "[Character]": pending.name,
                "[Title] [Name]": address(pending.holder),
              })
            : ""
        }
        confirmLabel={copy["10.25.confirm"]}
        cancelLabel={copy["10.25.cancel"]}
        busy={remove.busy}
        onConfirm={() => pending && removeCharacter(pending, true)}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
