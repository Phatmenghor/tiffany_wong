// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for both customer and admin tokens
  const adminToken = req.cookies.get(COOKIE_KEYS.ADMIN_ACCESS_TOKEN)?.value;

  // =============================
  // ADMIN ROUTES - REQUIRE ADMIN TOKEN
  // =============================
  if (pathname.startsWith("/admin")) {
    // Need admin token for /admin
    if (!adminToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  // Continue request with locale header
  const response = NextResponse.next();
  return response;
}

// Matcher config
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};
