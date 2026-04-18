import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { parseSessionCookie, serializeSession } from "@/lib/auth/session-cookie";
import type { SessionUser } from "@/lib/types/session";

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return parseSessionCookie(store.get(SESSION_COOKIE)?.value);
}

export { serializeSession };
