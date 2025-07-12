import { NextFetchEvent, NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest, event: NextFetchEvent) {
  // Get the current session or authentication data
  const token = request.headers.get('authorization');
  
  // If token doesn't exist, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Simple token validation
  const isTokenValid = validateToken(token);

  if (!isTokenValid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

function validateToken(token: string | null): boolean {
  // Mock validation function
  return token === "valid-token";
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};

