import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/activities",
  "/pipes",
  "/clients",
  "/finance",
  "/settings",
];

const authRoutes = ["/login", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("flow-token")?.value;

  // Always allow /activate regardless of auth state
  if (pathname.startsWith("/activate")) {
    return NextResponse.next();
  }

  // Protected routes — redirect to /login if no token
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes — redirect authenticated users to /dashboard
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/activities/:path*",
    "/pipes/:path*",
    "/clients/:path*",
    "/finance/:path*",
    "/settings/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/activate/:path*",
  ],
};
