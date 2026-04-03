import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  // Check for better-auth session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token")

  const path = request.nextUrl.pathname

  // Protect authenticated routes - redirect to sign-in if no session
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  // Redirect /dashboard to /onboarding (server-side check will redirect to playground if onboarded)
  if (path === "/dashboard") {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/playground/:path*", "/onboarding"],
}
