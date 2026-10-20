import type { GitHubEventDetail } from '@/features/github/types'
import type { SpotifyTrack } from '@/features/spotify/types'

export const ACTIVITY_LIMIT = 20
export const TRACKS_LIMIT = 10

export type ActivityData = {
	contributions: Array<{ date: string; contributionCount: number }>
	totalContributions: number
	recentActivity: GitHubEventDetail[]
	spotifyTracks: SpotifyTrack[]
	fetchedAt: number
}
