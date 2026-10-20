import { NextResponse } from 'next/server'
import { syncSpotifyListens } from '@/server/spotify/sync'

export async function GET(request: Request) {
	const cronSecret = process.env.CRON_SECRET
	const authorization = request.headers.get('authorization')

	if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const result = await syncSpotifyListens()

		if (!result) {
			return NextResponse.json(
				{ error: 'Spotify is unavailable' },
				{ status: 502 }
			)
		}

		return NextResponse.json(result)
	} catch (error) {
		console.error('Error syncing Spotify listens:', error)
		return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
	}
}
