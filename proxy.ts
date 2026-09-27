import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "rvyk_super_secret_admin_token_2026_phi";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect routes under /admin
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    const isAuthenticated = sessionCookie === SESSION_SECRET;

    // If user is trying to access /admin/login
    if (pathname === "/admin/login") {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // For any other /admin routes, check authentication
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
