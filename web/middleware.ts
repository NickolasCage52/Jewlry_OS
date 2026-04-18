import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { canAccessPath, getDefaultAppPath } from "@/lib/auth/access";
import { parseSessionCookie } from "@/lib/auth/session-cookie";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/app")) {
    return NextResponse.next();
  }

  const session = parseSessionCookie(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (!canAccessPath(session.role, pathname)) {
    const fallback = new URL(getDefaultAppPath(session.role), request.url);
    return NextResponse.redirect(fallback);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
