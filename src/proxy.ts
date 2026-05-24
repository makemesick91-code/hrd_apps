import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "daengtisia-super-secret-jwt-key-2024-enterprise-grade";

function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-otp", "/careers", "/about"];
const publicApiPaths = ["/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", "/api/auth/verify-otp", "/api/auth/reset-password", "/api/auth/refresh", "/api/recruitment/public"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/public") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // Allow public paths
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow public API paths
  if (publicApiPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check auth for API routes — accept Bearer header OR auth-token cookie
  if (pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : cookieToken;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    try {
      verifyToken(token);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }
  }

  // Check cookie for dashboard pages
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  try {
    verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons).*)"],
};
