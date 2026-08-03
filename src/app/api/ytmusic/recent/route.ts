import { NextResponse } from 'next/server'
import { unstable_rethrow } from 'next/navigation'
import { getYTMusicResult } from '@/server/ytmusic/tracks'
import { parseBoundedIntParam } from '@/shared/lib/request-params'

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const limit = parseBoundedIntParam(searchParams.get('limit'), {
			defaultValue: 10,
			min: 1,
			max: 50
		})
		const forceRefresh = searchParams.get('refresh') === '1'
		const result = await getYTMusicResult(limit, { forceRefresh })
		const status = getHttpStatus(result.status)

		return NextResponse.json(result, {
			status,
			headers: { 'Cache-Control': 'private, no-store' }
		})
	} catch (error) {
		unstable_rethrow(error)
		console.error('[YTM API] Error:', error)
		return NextResponse.json(
			{
				status: 'error',
				source: 'none',
				tracks: [],
				message: 'The YouTube Music endpoint failed unexpectedly.',
				credentialsConfigured: false,
				isStale: false,
				fetchedAt: new Date().toISOString(),
				cacheUpdatedAt: null
			},
			{
				status: 500,
				headers: { 'Cache-Control': 'private, no-store' }
			}
		)
	}
}

function getHttpStatus(status: string): number {
	if (status === 'unauthorized') return 401
	if (status === 'unconfigured') return 503
	if (status === 'error') return 502
	return 200
}
