import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/pricing", "/api/auth"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token")

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // Redirect unauthenticated users away from protected routes
  if (!isPublic && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  // Redirect authenticated users away from auth pages
  if (sessionCookie && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/api/auth/redirect", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/playground/:path*",
    "/onboarding",
    "/sign-in",
    "/sign-up",
  ],
}
