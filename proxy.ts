import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token")

  const path = request.nextUrl.pathname

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (path === "/dashboard") {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/playground/:path*", "/onboarding"],
}
