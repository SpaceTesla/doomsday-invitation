import { z } from "zod";
import { BadRequest, json, liveSessionId, parseBody, sameOrigin, serverDomain } from "@/lib/admin";
import { passphraseHash, sessionKey } from "@/lib/env";
import { verifyPassphrase } from "@/lib/passphrase";
import { clearFailures, clientAddress, isLocked, recordFailure } from "@/lib/rate-limit";
import {
  clearedSessionCookieHeader,
  endSession,
  readCookie,
  SESSION_COOKIE,
  sealSession,
  sessionCookieHeader,
  startSession,
} from "@/lib/session";

const signIn = z.object({ passphrase: z.string().min(1).max(200) });

/** Sign in. 204 with a session cookie; 401 for a wrong passphrase; 429 when locked out. */
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
    const domain = serverDomain();
    const key = `signin:${clientAddress(request)}`;
    if (await isLocked(domain, key)) return json({ error: "locked" }, 429);

    const { passphrase } = await parseBody(request, signIn);
    const hash = passphraseHash();
    if (!hash || !(await verifyPassphrase(passphrase, hash))) {
      await recordFailure(domain, key);
      return (await isLocked(domain, key))
        ? json({ error: "locked" }, 429)
        : json({ error: "wrong" }, 401);
    }

    await clearFailures(domain, key);
    const session = await startSession(domain);
    return new Response(null, {
      status: 204,
      headers: {
        "Set-Cookie": sessionCookieHeader(sealSession(session.id, sessionKey()), session.expiresAt),
      },
    });
  } catch (failure) {
    if (failure instanceof BadRequest) return json({ error: "bad_request" }, 400);
    console.error("sign-in failed");
    return json({ error: "failed" }, 500);
  }
}

/** Sign out: the session row is deleted, so the cookie is worthless even if kept. */
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const domain = serverDomain();
  const id = await liveSessionId(domain, readCookie(request.headers.get("cookie"), SESSION_COOKIE));
  if (id) await endSession(domain, id);
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": clearedSessionCookieHeader() },
  });
}
