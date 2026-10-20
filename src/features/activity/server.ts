import { cacheLife, cacheTag } from 'next/cache'
import { getCombinedActivity } from './combine'
import { ACTIVITY_LIMIT, TRACKS_LIMIT, type ActivityData } from './types'

/**
 * @name getActivityData
 * @description Loads the GitHub contributions, recent events and listening
 * history that the home activity section renders, cached across requests.
 *
 * @example
 * const data = await getActivityData()
 * const total = data.totalContributions
 */
export async function getActivityData(): Promise<ActivityData> {
	'use cache'
	cacheTag('github', 'activity')

	const data = await getCombinedActivity(ACTIVITY_LIMIT, TRACKS_LIMIT)

	// The build skips GitHub fetches, so refresh soon instead of serving empty data for hours.
	if (data.contributions.length === 0) {
		cacheLife('minutes')
	} else {
		cacheLife('hours')
	}

	return data
}
