import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwtPayload(token: string): { sub?: string; role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("krono_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Role-Based Protection for /admin routes (Milestone 4 - Slide 8)
  if (pathname.startsWith("/admin")) {
    // Permit access to the dedicated Admin Login portal
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      loginUrl.searchParams.set("unauthorized", "true");
      loginUrl.searchParams.set("role_required", "admin");
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(token);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (!payload || (payload.exp && payload.exp < nowInSeconds)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      loginUrl.searchParams.set("session_expired", "true");
      return NextResponse.redirect(loginUrl);
    }

    if (payload.role !== "admin") {
      // Non-admin user detected: redirect to admin login with unauthorized message
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      loginUrl.searchParams.set("error", "admin_forbidden");
      loginUrl.searchParams.set("message", "Access Denied: Administrator credentials required");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. Protected customer account routes
  const protectedCustomerRoutes = ["/profile", "/account"];
  const isProtectedCustomer = protectedCustomerRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedCustomer && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    loginUrl.searchParams.set("unauthorized", "true");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/account/:path*"],
};

