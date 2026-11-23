"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { copy } from "@/copy";

export type ActionResult =
  { ok: true; status: number; data: unknown } | { ok: false; status: number; data: unknown };

/**
 * Send one change to the panel's API and refresh the page from the server when it lands.
 * A lost session goes back to sign-in; an event that is not yours answers 404 like any
 * missing thing. The message says "Saved." or "That did not save", in the deck's words;
 * anything more specific is the caller's to say, with setMessage after the run.
 */
export function useAdminAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const run = useCallback(
    async (
      method: string,
      url: string,
      body?: unknown,
      options: { refresh?: boolean } = {},
    ): Promise<ActionResult> => {
      setBusy(true);
      setMessage(null);
      try {
        const response = await fetch(url, {
          method,
          headers: body === undefined ? undefined : { "content-type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
          cache: "no-store",
        });
        if (response.status === 401) {
          router.replace("/sign-in");
          return { ok: false, status: 401, data: null };
        }
        const data = response.headers.get("content-type")?.includes("json")
          ? await response.json().catch(() => null)
          : null;
        if (response.ok) {
          setMessage({ text: copy["10.42"], error: false });
          if (options.refresh !== false) router.refresh();
          return { ok: true, status: response.status, data };
        }
        // A failure never passes in silence: "That did not save" unless the caller says
        // something more specific. A 404 or 409 means the page is behind (the event or
        // guest is gone, or changed in another tab), so it is redrawn from the server.
        setMessage({ text: copy["10.43"], error: true });
        if ((response.status === 404 || response.status === 409) && options.refresh !== false)
          router.refresh();
        return { ok: false, status: response.status, data };
      } catch {
        setMessage({ text: copy["10.43"], error: true });
        return { ok: false, status: 0, data: null };
      } finally {
        setBusy(false);
      }
    },
    [router],
  );

  return { run, busy, message, setMessage };
}

/** The message line under a form: announced politely, never by colour alone. */
export function ActionMessage({ message }: { message: { text: string; error: boolean } | null }) {
  return (
    <p
      className={message?.error ? "notice notice--error" : "notice"}
      role="status"
      aria-live="polite"
    >
      {message?.text ?? ""}
    </p>
  );
}
