import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const allCookies = request.cookies.getAll()
  const sessionCookie = allCookies.find(c => c.name.includes("session_token"))
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
