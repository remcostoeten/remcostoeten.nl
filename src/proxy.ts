import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Matches a path segment that holds a dot, starts with "wp-" or holds a bracket, such as /blog/wp-login.php or /tools/.env.
const PROBE_SEGMENT = /\/(?:[^/]*[.[\]][^/]*|wp-[^/]*)(?=\/|$)/

function isProbe(pathname: string) {
	return PROBE_SEGMENT.test(pathname.replace(/\.rsc$/, ''))
}

function guardAdmin(request: NextRequest) {
	const isServerAction = request.headers.has('Next-Action')
	if (isServerAction) {
		return NextResponse.next()
	}

	if (
		process.env.NODE_ENV !== 'production' &&
		process.env.DEV_OPEN_ADMIN === 'true'
	) {
		return NextResponse.next()
	}

	const sessionCookie = getSessionCookie(request)

	if (!sessionCookie) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return NextResponse.next()
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	if (pathname === '/admin' || pathname.startsWith('/admin/')) {
		return guardAdmin(request)
	}

	if (isProbe(pathname)) {
		return new NextResponse(null, { status: 404 })
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		'/admin/:path*',
		'/blog/:path+',
		'/packages/:path+',
		'/tools/:path+'
	]
}
