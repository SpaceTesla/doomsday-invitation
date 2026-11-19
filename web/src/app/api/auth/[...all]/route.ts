import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Better Auth's endpoints: sign-up, sign-in, sign-out and the session, under /api/auth.
// It checks the Origin of every change and rate-limits sign-in and sign-up itself.
export async function GET(request: Request) {
  return getAuth().handler(request);
}

export async function POST(request: Request) {
  return getAuth().handler(request);
}
