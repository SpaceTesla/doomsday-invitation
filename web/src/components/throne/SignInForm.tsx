"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { copy } from "@/copy";
import { Button } from "@/components/Button";
import { Label } from "@/components/Label";

export function SignInForm() {
  const router = useRouter();
  const fieldId = useId();
  const messageId = useId();
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!passphrase) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      if (response.status === 204) {
        router.replace("/throne/guests");
        router.refresh();
        return;
      }
      setPassphrase("");
      setError(
        response.status === 401
          ? copy["10.3c"]
          : response.status === 429
            ? copy["10.3d"]
            : copy["9.3"],
      );
    } catch {
      setError(copy["9.3"]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <div className="field-row">
        <label htmlFor={fieldId}>
          <Label>{copy["10.3a"]}</Label>
        </label>
        <input
          id={fieldId}
          className="field"
          type="password"
          autoComplete="current-password"
          autoCapitalize="none"
          spellCheck={false}
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          required
        />
      </div>
      <div>
        <Button type="submit" disabled={busy}>
          {copy["10.3b"]}
        </Button>
      </div>
      <p id={messageId} className="notice notice--error" role="alert">
        {error ?? ""}
      </p>
    </form>
  );
}
