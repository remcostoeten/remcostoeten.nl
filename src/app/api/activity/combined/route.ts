import { NextResponse } from 'next/server'
import { getCombinedActivity } from './combine'
import { parseBoundedIntParam } from '@/shared/lib/request-params'

// Aggressive caching - 5 minutes for combined activity data
export const revalidate = 300

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const activityLimit = parseBoundedIntParam(
		searchParams.get('activityLimit'),
		{ defaultValue: 5, min: 1, max: 25 }
	)
	const tracksLimit = parseBoundedIntParam(searchParams.get('tracksLimit'), {
		defaultValue: 10,
		min: 1,
		max: 50
	})

	const combinedActivity = await getCombinedActivity(
		activityLimit,
		tracksLimit
	)

	return NextResponse.json(combinedActivity, {
		headers: {
			'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
		}
	})
}
