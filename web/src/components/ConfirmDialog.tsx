"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/Button";
import { Heading } from "@/components/Heading";
import { PanelActions } from "@/components/Panel";
import { QuietControl } from "@/components/QuietControl";

type ConfirmDialogProps = {
  open: boolean;
  /** A heading in Pirata One, for dialogs the deck gives one (declining, leaving). */
  heading?: string;
  /** What will happen, in the deck's words. */
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * A confirmation: a panel over a scrim of Night, one primary button and one quiet
 * control. Escape cancels; focus returns to where it was. design/DESIGN.md, section 8.10.
 */
export function ConfirmDialog({
  open,
  heading,
  text,
  confirmLabel,
  cancelLabel,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const textId = useId();
  const headingId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-describedby={textId}
      aria-labelledby={heading ? headingId : undefined}
      aria-label={heading ? undefined : text}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      {heading ? (
        <Heading as="h2" id={headingId} className="mb-3">
          {heading}
        </Heading>
      ) : null}
      <p id={textId} className="t-expl">
        {text}
      </p>
      <PanelActions>
        <Button onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </Button>
        <QuietControl onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </QuietControl>
      </PanelActions>
    </dialog>
  );
}
