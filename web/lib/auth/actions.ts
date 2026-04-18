"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { getDefaultAppPath } from "@/lib/auth/access";
import { getDemoUser } from "@/lib/auth/demo-users";
import { isRoleCode, serializeSession } from "@/lib/auth/session-cookie";
import type { RoleCode } from "@/lib/types/session";

export async function signIn(formData: FormData) {
  const roleRaw = formData.get("role");
  if (typeof roleRaw !== "string" || !isRoleCode(roleRaw)) {
    redirect("/login?error=role");
  }
  const role = roleRaw as RoleCode;
  const user = getDemoUser(role);
  const store = await cookies();
  store.set(SESSION_COOKIE, serializeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(getDefaultAppPath(role));
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
