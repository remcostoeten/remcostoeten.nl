import { unstable_cache } from 'next/cache'
import { githubService } from './service'

export const getCachedGitHubContributions = unstable_cache(
	async (year: number) => {
		return githubService.getYearlyContributions(year)
	},
	['github-contributions'],
	{ revalidate: 300, tags: ['github'] }
)

export const getCachedGitHubActivity = unstable_cache(
	async (limit: number) => {
		return githubService.getRecentActivity(limit)
	},
	['github-activity-distinct'],
	{ revalidate: 60, tags: ['github'] }
)
