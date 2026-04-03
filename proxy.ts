import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  // Check for better-auth session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token")

  // Protect dashboard routes - redirect to sign-in if no session
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
