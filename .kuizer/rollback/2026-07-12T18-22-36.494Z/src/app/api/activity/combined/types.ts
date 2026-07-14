export type GitHubContributionDay = {
	date: string
	contributionCount: number
	contributionTypes?: Record<string, number>
}

export type GitHubContributionWeek = {
	contributionDays: GitHubContributionDay[]
	firstDay: string
}

export type GitHubContributionData = {
	totalContributions: number
	weeks: GitHubContributionWeek[]
}

export type CombinedActivityResponse = {
	contributions: Array<{ date: string; contributionCount: number }>
	totalContributions: number
	recentActivity: unknown[]
	spotifyTracks: unknown[]
	fetchedAt: number
}
