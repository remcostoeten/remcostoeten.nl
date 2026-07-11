import { NextResponse } from 'next/server'
import { getYTMusicTracks } from '@/server/ytmusic/tracks'
import { hasYTMusicCredentials } from '@/server/ytmusic/auth'
import { parseBoundedIntParam } from '@/shared/lib/request-params'


export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const limit = parseBoundedIntParam(searchParams.get('limit'), {
			defaultValue: 10,
			min: 1,
			max: 50
		})

		if (!hasYTMusicCredentials()) {
			return NextResponse.json(
				{ error: 'No YouTube Music cookie configured', tracks: [] },
				{ status: 200 }
			)
		}

		const tracks = await getYTMusicTracks(limit)
		return NextResponse.json({ tracks })
	} catch (error) {
		console.error('[YTM API] Error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch tracks', tracks: [] },
			{ status: 500 }
		)
	}
}
