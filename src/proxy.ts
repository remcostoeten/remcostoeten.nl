import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function proxy(request: NextRequest) {
	const isServerAction = request.headers.has('Next-Action')
	if (isServerAction) {
		return NextResponse.next()
	}

	const sessionCookie = getSessionCookie(request)

	if (!sessionCookie) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/admin/:path*']
}
