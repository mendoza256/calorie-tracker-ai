import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth API routes to pass through
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // For login/signup pages, check if user is already logged in
  if (pathname === "/login" || pathname === "/signup") {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      if (session) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // If session check fails, allow access to login/signup
    }
    return NextResponse.next();
  }

  // Check authentication for all other routes
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    // If session check fails, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
