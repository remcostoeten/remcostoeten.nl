import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Only protect admin routes with env check
  if (pathname.startsWith('/admin')) {
    // Simple env-based protection
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
    }
  }
  
  // Protect CMS API routes with env check
  if (pathname.startsWith('/api/cms')) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Access denied' }), 
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/api/cms/:path*'
  ],
};

