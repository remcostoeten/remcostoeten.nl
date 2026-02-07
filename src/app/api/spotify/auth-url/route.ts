import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const clientId = process.env.SPOTIFY_CLIENT_ID
		const redirectUri = process.env.SPOTIFY_REDIRECT_URI

		if (!clientId) {
			return NextResponse.json(
				{
					error: 'Spotify Client ID not configured. Please add SPOTIFY_CLIENT_ID to your .env file.'
				},
				{ status: 400 }
			)
		}

		const scopes = [
			'user-read-currently-playing',
			'user-read-recently-played',
			'user-read-playback-state'
		].join(' ')

		const params = new URLSearchParams({
			response_type: 'code',
			client_id: clientId,
			scope: scopes,
			redirect_uri:
				redirectUri || 'http://127.0.0.1:3000/api/spotify/callback',
			show_dialog: 'true'
		})

		const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`

		return NextResponse.json({ authUrl })
	} catch (error) {
		console.error('Error generating auth URL:', error)
		return NextResponse.json(
			{ error: 'Failed to generate authorization URL' },
			{ status: 500 }
		)
	}
}
