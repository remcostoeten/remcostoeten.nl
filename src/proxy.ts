import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function proxy(request: NextRequest) {
    const sessionCookie = getSessionCookie(request)

    // Optimistic redirect - actual auth check should happen in pages/routes
    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*"],
}
