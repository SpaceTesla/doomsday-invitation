"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { copy } from "@/copy";
import { Button } from "@/components/Button";
import { useStageTransition } from "@/scenes/StageFrame";

export type GuestResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; data: unknown; error?: string };

export type GuestMessage = {
  text: string;
  kind: "neutral" | "error";
  /** Offer RELOAD: the council changed under the guest. */
  reload?: boolean;
};

/**
 * Send one of the guest's actions and, when it lands, re-render the page from the
 * server. Failures are told plainly in the deck's words (COPY.md, section 9); the
 * caller can replace the message with a more specific one. An action that changes the
 * scene (`changesStage`) closes the seal's iris as it is sent, so the wait for the server
 * is part of the movement; if the action fails, the iris opens again on the same scene.
 */
export function useGuestAction(
  token: string,
  options: { changesStage?: boolean; back?: boolean } = {},
) {
  const router = useRouter();
  const { cover, uncover } = useStageTransition();
  const changesStage = options.changesStage ?? false;
  const back = options.back ?? false;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<GuestMessage | null>(null);

  const run = useCallback(
    async (
      method: string,
      action: string,
      body?: unknown,
      // Runs once the server has accepted the action, before the page re-renders with it,
      // so a confirmation can begin in the same update as the new state.
      onAccepted?: () => void,
    ): Promise<GuestResult> => {
      setBusy(true);
      setMessage(null);
      const covering = changesStage ? cover(back) : null;
      const reopen = async () => {
        if (!covering) return;
        await covering;
        uncover();
      };
      try {
        const response = await fetch(`/api/g/${token}/${action}`, {
          method,
          headers: body === undefined ? undefined : { "content-type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
          cache: "no-store",
        });
        const data = response.headers.get("content-type")?.includes("json")
          ? await response.json().catch(() => null)
          : null;
        const error = (data as { error?: string } | null)?.error;
        if (response.ok) {
          await covering;
          onAccepted?.();
          router.refresh();
          return { ok: true, status: response.status, data };
        }
        if (response.status !== 404) await reopen();
        if (response.status === 404) {
          // The link stopped working while the page was open: show what it shows now.
          router.refresh();
        } else if (response.status === 409) {
          setMessage({ text: copy["9.6"], kind: "neutral", reload: true });
        } else if (response.status !== 422) {
          setMessage({ text: copy["9.3"], kind: "error" });
        }
        return { ok: false, status: response.status, data, error };
      } catch {
        await reopen();
        setMessage({ text: copy["9.5"], kind: "error" });
        return { ok: false, status: 0, data: null };
      } finally {
        setBusy(false);
      }
    },
    [router, token, changesStage, back, cover, uncover],
  );

  return { run, busy, message, setMessage };
}

/** The message line under an action: announced politely, never by colour alone. */
export function GuestMessageLine({
  message,
  busy = false,
}: {
  message: GuestMessage | null;
  busy?: boolean;
}) {
  const text = busy ? copy["9.8"] : (message?.text ?? "");
  return (
    <div role="status" aria-live="polite">
      <p className={message?.kind === "error" && !busy ? "notice notice--error" : "notice"}>
        {text}
      </p>
      {message?.reload && !busy ? (
        <div className="mt-3">
          <Button onClick={() => window.location.reload()}>{copy["9.7"]}</Button>
        </div>
      ) : null}
    </div>
  );
}
