"use client";

// The opening plays once per guest, remembered on the server against the link
// (docs/PRODUCT_SPEC.md, Stage 1). Recorded when it ends or is skipped; the request is
// fire-and-forget, and recording twice changes nothing.
const sent = new Set<string>();

export function markOpeningPlayed(token: string): void {
  if (sent.has(token)) return;
  sent.add(token);
  void fetch(`/api/g/${token}/opened`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ played: true }),
    keepalive: true,
  }).catch(() => sent.delete(token));
}
