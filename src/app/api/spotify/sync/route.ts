import { NextResponse } from 'next/server'
import { syncLastfmListens } from '@/server/lastfm/sync'

export async function GET(request: Request) {
	const cronSecret = process.env.CRON_SECRET
	const authorization = request.headers.get('authorization')

	if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const result = await syncLastfmListens()

		if (!result) {
			return NextResponse.json(
				{ error: 'Last.fm is not configured' },
				{ status: 503 }
			)
		}

		return NextResponse.json(result)
	} catch (error) {
		console.error('Error syncing Last.fm listens:', error)
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Sync failed'
			},
			{ status: 500 }
		)
	}
}
