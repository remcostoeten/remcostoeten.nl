import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { requireDevToolsAccess } from '@/server/security/dev-access'

export const dynamic = 'force-dynamic'

const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com'
const DEFAULT_SPOTIFY_REDIRECT_URI =
	'http://127.0.0.1:3000/api/spotify/callback'

function getConfiguredAppUrl(request: NextRequest) {
	const redirectUri =
		process.env.SPOTIFY_REDIRECT_URI || DEFAULT_SPOTIFY_REDIRECT_URI

	try {
		return new URL(redirectUri).origin
	} catch {
		return new URL(request.url).origin
	}
}

export async function GET(request: NextRequest) {
	const denied = await requireDevToolsAccess()
	if (denied) return denied

	try {
		const appUrl = getConfiguredAppUrl(request)
		const { searchParams } = new URL(request.url)
		const code = searchParams.get('code')
		const error = searchParams.get('error')

		if (error) {
			return NextResponse.redirect(
				new URL('/?error=' + error, appUrl)
			)
		}

		if (!code) {
			return NextResponse.redirect(
				new URL('/?error=no_code', appUrl)
			)
		}

		const clientId = process.env.SPOTIFY_CLIENT_ID
		const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
		const redirectUri = process.env.SPOTIFY_REDIRECT_URI

		if (!clientId || !clientSecret) {
			return NextResponse.redirect(
				new URL('/?error=missing_credentials', appUrl)
			)
		}

		const authString = `${clientId}:${clientSecret}`
		const base64Auth = Buffer.from(authString).toString('base64')

		const tokenResponse = await fetch(
			`${SPOTIFY_ACCOUNTS_BASE}/api/token`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: `Basic ${base64Auth}`
				},
				body: new URLSearchParams({
					grant_type: 'authorization_code',
					code,
					redirect_uri:
						redirectUri || DEFAULT_SPOTIFY_REDIRECT_URI
				})
			}
		)

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.json()
			return NextResponse.redirect(
				new URL(
					`/?error=token_exchange_failed&details=${errorData.error_description || errorData.error}`,
					appUrl
				)
			)
		}

		const tokenData = await tokenResponse.json()
		const refreshToken = tokenData.refresh_token
		const accessToken = tokenData.access_token

		if (!refreshToken) {
			return NextResponse.redirect(
				new URL('/dev/spotify?error=missing_refresh_token', appUrl)
			)
		}

		const redirectUrl = new URL('/dev/spotify', appUrl)
		redirectUrl.searchParams.set('success', 'true')
		const response = NextResponse.redirect(redirectUrl)

		response.cookies.set('spotify_dev_refresh_token', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 5
		})

		if (accessToken) {
			response.cookies.set('spotify_dev_access_token', accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 5
			})
		}

		return response
	} catch (error) {
		console.error('Error in Spotify callback:', error)
		return NextResponse.redirect(
			new URL('/?error=unknown_error', getConfiguredAppUrl(request))
		)
	}
}
