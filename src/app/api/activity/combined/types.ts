import type { GitHubEventDetail } from '@/features/github/types'
import type { SpotifyTrack } from '@/features/spotify/types'

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
	recentActivity: GitHubEventDetail[]
	spotifyTracks: SpotifyTrack[]
	fetchedAt: number
}
