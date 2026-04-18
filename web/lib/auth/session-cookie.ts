import type { RoleCode, SessionUser } from "@/lib/types/session";

const ROLES: RoleCode[] = [
  "OWNER",
  "MKT",
  "SALES",
  "STOCK",
  "SUPPLY",
  "ADMIN",
];

export function isRoleCode(v: unknown): v is RoleCode {
  return typeof v === "string" && (ROLES as string[]).includes(v);
}

export function serializeSession(user: SessionUser): string {
  return encodeURIComponent(JSON.stringify(user));
}

export function parseSessionCookie(raw: string | undefined): SessionUser | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const data = JSON.parse(decoded) as Partial<SessionUser>;
    if (
      typeof data.id === "string" &&
      typeof data.email === "string" &&
      typeof data.name === "string" &&
      isRoleCode(data.role)
    ) {
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      };
    }
  } catch {
    /* invalid cookie */
  }
  return null;
}
