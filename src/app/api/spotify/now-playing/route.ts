import { NextResponse } from 'next/server'
import { getLastfmNowPlaying } from '@/server/lastfm/now-playing'

export async function GET() {
	try {
		return NextResponse.json(await getLastfmNowPlaying())
	} catch (error) {
		console.error('Error fetching Last.fm now playing:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch now playing' },
			{ status: 500 }
		)
	}
}
