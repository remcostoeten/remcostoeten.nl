import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireDevToolsAccess } from '@/lib/dev-access'

export const dynamic = 'force-dynamic'

export async function GET() {
	const denied = await requireDevToolsAccess()
	if (denied) return denied

	const cookieStore = await cookies()
	const refreshToken =
		cookieStore.get('spotify_dev_refresh_token')?.value ?? null
	const accessToken =
		cookieStore.get('spotify_dev_access_token')?.value ?? null

	const response = NextResponse.json({
		refresh_token: refreshToken,
		access_token: accessToken
	})
	response.headers.set('Cache-Control', 'no-store')

	response.cookies.delete('spotify_dev_refresh_token')
	response.cookies.delete('spotify_dev_access_token')

	return response
}
