import { NextResponse } from 'next/server'
import { getCombinedActivity } from './combine'

// Aggressive caching - 5 minutes for combined activity data
export const revalidate = 300

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const activityLimit = parseInt(searchParams.get('activityLimit') || '5', 10)
	const tracksLimit = parseInt(searchParams.get('tracksLimit') || '10', 10)

	const combinedActivity = await getCombinedActivity(activityLimit, tracksLimit)

	return NextResponse.json(combinedActivity, {
		headers: {
			'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
		}
	})
}
