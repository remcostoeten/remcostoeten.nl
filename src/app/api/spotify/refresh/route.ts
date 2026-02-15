import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { requireDevToolsAccess } from '@/lib/dev-access'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
	const denied = await requireDevToolsAccess()
	if (denied) return denied

	try {
		const { refresh_token } = await request.json()

		if (!refresh_token) {
			return NextResponse.json(
				{ error: 'Refresh token required' },
				{ status: 400 }
			)
		}

		const clientId = process.env.SPOTIFY_CLIENT_ID
		const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

		if (!clientId || !clientSecret) {
			return NextResponse.json(
				{ error: 'Missing credentials' },
				{ status: 500 }
			)
		}

		const authString = `${clientId}:${clientSecret}`
		const base64Auth = Buffer.from(authString).toString('base64')

		const response = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${base64Auth}`
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token
			})
		})

		if (!response.ok) {
			const errorData = await response.json()
			return NextResponse.json(
				{
					error: 'Token refresh failed',
					details: errorData.error_description || errorData.error
				},
				{ status: 400 }
			)
		}

		const data = await response.json()

		return NextResponse.json({
			access_token: data.access_token,
			expires_in: data.expires_in,
			refresh_token: data.refresh_token || refresh_token // Spotify may return a new refresh token
		})
	} catch (error) {
		console.error('Error refreshing token:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
