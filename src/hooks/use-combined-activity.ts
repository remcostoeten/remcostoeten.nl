'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { SpotifyTrack } from '@/server/services/spotify'
import type { GitHubEventDetail } from './use-github'

export interface CombinedActivityData {
    contributions: Array<{ date: string; contributionCount: number }>
    totalContributions: number
    recentActivity: GitHubEventDetail[]
    spotifyTracks: SpotifyTrack[]
    fetchedAt: number
}

/**
 * Single hook that fetches all activity data in one request
 * This replaces:
 * - useGitHubContributions (for current + previous year)
 * - useGitHubRecentActivity
 * - getLatestTracks (Spotify)
 * 
 * Benefits:
 * - Single network request instead of 4-5 separate ones
 * - Server-side caching with unstable_cache
 * - Deduplication of Spotify track fetching
 */
export function useCombinedActivity(activityLimit = 5, tracksLimit = 10) {
    return useQuery({
        queryKey: ['combined-activity', activityLimit, tracksLimit],
        queryFn: async (): Promise<CombinedActivityData> => {
            const response = await fetch(
                `/api/activity/combined?activityLimit=${activityLimit}&tracksLimit=${tracksLimit}`
            )
            if (!response.ok) {
                throw new Error('Failed to fetch combined activity')
            }
            return response.json()
        },
        staleTime: 60 * 1000, // 1 minute before considered stale
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
        retry: 2,
        retryDelay: 1000,
        placeholderData: keepPreviousData,
    })
}

/**
 * Hook to get just contributions map for the graph
 */
export function useContributionsFromCombined(activityLimit = 5, tracksLimit = 10) {
    const query = useCombinedActivity(activityLimit, tracksLimit)

    const contributionsMap = new Map<string, { date: string; contributionCount: number }>()
    if (query.data?.contributions) {
        for (const item of query.data.contributions) {
            contributionsMap.set(item.date, item)
        }
    }

    return {
        ...query,
        data: contributionsMap,
        totalContributions: query.data?.totalContributions || 0,
    }
}
