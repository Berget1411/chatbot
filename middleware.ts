import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path starts with /chat
  if (path.startsWith("/chat")) {
    try {
      // Get session from request headers/cookies
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Session validation failed:", error);
      // If session validation fails, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*"], // Protect all chat routes
};
