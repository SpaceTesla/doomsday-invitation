"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
import { copy } from "@/copy";
import { Button } from "@/components/Button";
import { Label } from "@/components/Label";

const PASSWORD_MIN = 6;

type Mode = "sign-in" | "sign-up";

/** What Better Auth's answer means, in the deck's words. */
function messageFor(mode: Mode, status: number, code: string): string {
  if (status === 429) return copy["10.3d"];
  if (code.includes("PASSWORD_TOO_SHORT")) return copy["13.20"];
  if (code.includes("INVALID_EMAIL_OR_PASSWORD")) return copy["13.18"];
  if (code.includes("INVALID_EMAIL")) return copy["13.21"];
  if (code.includes("ALREADY_EXISTS")) return copy["13.19"];
  if (code.includes("SIGN_UP") && code.includes("DISABLED")) return copy["13.10"];
  if (mode === "sign-in" && status === 401) return copy["13.18"];
  return copy["9.3"];
}

/**
 * Sign in or create an organizer account. The form posts to Better Auth's own endpoints
 * (/api/auth), which set the session cookie; nothing about the password stays in the page.
 */
export function AccountForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const ids = { name: useId(), email: useId(), password: useId(), help: useId(), message: useId() };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordField = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if ((mode === "sign-up" && !name.trim()) || !email.trim() || !password) {
      setError(copy["13.17"]);
      return;
    }
    if (mode === "sign-up" && password.length < PASSWORD_MIN) {
      setError(copy["13.20"]);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/${mode}/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          mode === "sign-up"
            ? { name: name.trim(), email: email.trim(), password }
            : { email: email.trim(), password },
        ),
        cache: "no-store",
      });
      if (response.ok) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      const body = (await response.json().catch(() => null)) as { code?: unknown } | null;
      // The password is cleared and has focus again, ready to be typed once more.
      setPassword("");
      passwordField.current?.focus();
      setError(messageFor(mode, response.status, typeof body?.code === "string" ? body.code : ""));
    } catch {
      setError(copy["9.3"]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      {mode === "sign-up" ? (
        <div className="field-row">
          <label htmlFor={ids.name}>
            <Label>{copy["10.5.name"]}</Label>
          </label>
          <input
            id={ids.name}
            className="field field--serif"
            value={name}
            maxLength={60}
            autoComplete="name"
            onChange={(event) => setName(event.target.value)}
            aria-describedby={`${ids.help}-name ${ids.message}`}
          />
          <p id={`${ids.help}-name`} className="field-help">
            {copy["13.14"]}
          </p>
        </div>
      ) : null}
      <div className="field-row">
        <label htmlFor={ids.email}>
          <Label>{copy["13.13.email"]}</Label>
        </label>
        <input
          id={ids.email}
          className="field"
          type="email"
          value={email}
          maxLength={254}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.message}
        />
      </div>
      <div className="field-row">
        <label htmlFor={ids.password}>
          <Label>{copy["13.13.password"]}</Label>
        </label>
        <input
          id={ids.password}
          ref={passwordField}
          className="field"
          type="password"
          value={password}
          maxLength={128}
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={mode === "sign-up" ? `${ids.help} ${ids.message}` : ids.message}
        />
        {mode === "sign-up" ? (
          <p id={ids.help} className="field-help">
            {copy["13.15"]}
          </p>
        ) : null}
      </div>
      <div>
        <Button type="submit" disabled={busy}>
          {mode === "sign-up" ? copy["13.16"] : copy["13.8"]}
        </Button>
      </div>
      <p id={ids.message} className="notice notice--error" role="alert">
        {error ?? ""}
      </p>
      <p className="field-help">
        <Link className="link-body" href={mode === "sign-up" ? "/sign-in" : "/sign-up"}>
          {mode === "sign-up" ? copy["13.23"] : copy["13.22"]}
        </Link>
      </p>
    </form>
  );
}
