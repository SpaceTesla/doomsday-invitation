// The guest's side of the server. A guest is identified by the token in the address
// and nothing else: no handler accepts a guest id from the request. Every unknown,
// cancelled, replaced or expired link gets the same answer, and unknown links are
// counted per address so the space of links cannot be searched.
import { headers } from "next/headers";
import type { Domain } from "@/domain/context";
import { findByToken, type GuestRow } from "@/domain/guests";
import type { EventRow } from "@/domain/event";
import { json, sameOrigin, serverDomain } from "@/lib/admin";
import { clientAddress, isLocked, recordFailure } from "@/lib/rate-limit";

export type FoundGuest = { guest: GuestRow; event: EventRow };

const linkKey = (address: string) => `link:${address}`;

/** The guest a link belongs to, or null; counts the miss against the caller's address. */
export async function guestForLink(
  domain: Domain,
  token: string,
  address: string,
): Promise<FoundGuest | null> {
  // A locked address learns nothing more, not even whether a link is valid.
  if (await isLocked(domain, linkKey(address))) return null;
  const found = await findByToken(domain, token);
  if (!found) await recordFailure(domain, linkKey(address));
  return found;
}

/** For the guest page: the caller's address from the request headers. */
export async function pageAddress(): Promise<string> {
  const list = await headers();
  return (
    list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip")?.trim() || "unknown"
  );
}

export const notFound = () => json({ error: "not_found" }, 404);

type Handler = (domain: Domain, found: FoundGuest) => Promise<Response>;

/** Run a guest handler: same origin, a valid link, and a plain failure that reveals nothing. */
export async function asGuest(
  request: Request,
  params: Promise<{ token: string }>,
  handler: Handler,
): Promise<Response> {
  try {
    if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
    const domain = serverDomain();
    const { token } = await params;
    const found = await guestForLink(domain, token, clientAddress(request));
    if (!found) return notFound();
    return await handler(domain, found);
  } catch {
    // Never log the error itself, nor the address: both can carry the token.
    console.error("guest action failed");
    return json({ error: "failed" }, 500);
  }
}

/** Parse a JSON body, or undefined when it is missing or malformed. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
