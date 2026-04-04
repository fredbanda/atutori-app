import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token")
  const path = request.nextUrl.pathname

  console.log(`[proxy] path=${path} hasCookie=${!!sessionCookie} cookieName=${sessionCookie?.name ?? "none"}`)
  console.log(`[proxy] all cookies=${request.cookies.getAll().map(c => c.name).join(", ") || "none"}`)

  if (!sessionCookie) {
    console.log(`[proxy] NO SESSION COOKIE → redirecting to /sign-in from ${path}`)
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (path === "/dashboard") {
    console.log(`[proxy] /dashboard → redirecting to /onboarding`)
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  console.log(`[proxy] PASS → ${path}`)
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/playground/:path*", "/onboarding"],
}
