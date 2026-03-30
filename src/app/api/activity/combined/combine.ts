import {
	getCachedGitHubActivity,
	getCachedGitHubContributions
} from '@/server/github'
import { getSpotifyTracks } from '@/server/spotify'
import type { CombinedActivityResponse } from './types'

export async function getCombinedActivity(
	activityLimit: number,
	tracksLimit: number
): Promise<CombinedActivityResponse> {
	const currentYear = new Date().getFullYear()
	const previousYear = currentYear - 1

	const [
		currentYearContributions,
		previousYearContributions,
		recentActivity,
		spotifyTracks
	] = await Promise.all([
		getCachedGitHubContributions(currentYear),
		getCachedGitHubContributions(previousYear),
		getCachedGitHubActivity(activityLimit),
		getSpotifyTracks(tracksLimit)
	])

	const contributionsMap: Record<
		string,
		{ date: string; contributionCount: number }
	> = {}

	for (const year of [previousYearContributions, currentYearContributions]) {
		if (!year?.weeks) continue

		for (const week of year.weeks) {
			for (const day of week.contributionDays || []) {
				contributionsMap[day.date] = {
					date: day.date,
					contributionCount: day.contributionCount
				}
			}
		}
	}

	return {
		contributions: Object.values(contributionsMap),
		totalContributions:
			(currentYearContributions?.totalContributions || 0) +
			(previousYearContributions?.totalContributions || 0),
		recentActivity,
		spotifyTracks,
		fetchedAt: Date.now()
	}
}
