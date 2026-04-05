import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	createContributionDay,
	createContributionWeek,
	createGitHubActivity
} from '@/test/factories/github'
import { createSpotifyTrack } from '@/test/factories/spotify'

const githubMocks = vi.hoisted(() => ({
	getCachedGitHubActivity: vi.fn(),
	getCachedGitHubContributions: vi.fn()
}))

const spotifyMocks = vi.hoisted(() => ({
	getSpotifyTracks: vi.fn()
}))

vi.mock('@/server/github', () => githubMocks)
vi.mock('@/server/spotify', () => spotifyMocks)

describe('getCombinedActivity', () => {
	beforeEach(() => {
		vi.resetModules()
		githubMocks.getCachedGitHubActivity.mockReset()
		githubMocks.getCachedGitHubContributions.mockReset()
		spotifyMocks.getSpotifyTracks.mockReset()
	})

	it('merges both contribution years, preserves activity, and includes spotify tracks', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-03-30T06:15:00.000Z'))

		githubMocks.getCachedGitHubContributions
			.mockResolvedValueOnce({
				totalContributions: 10,
				weeks: [
					createContributionWeek('2026-01-01', [
						createContributionDay('2026-01-01', 4),
						createContributionDay('2026-01-02', 1)
					])
				]
			})
			.mockResolvedValueOnce({
				totalContributions: 7,
				weeks: [
					createContributionWeek('2025-12-29', [
						createContributionDay('2025-12-31', 3),
						createContributionDay('2026-01-01', 2)
					])
				]
			})

		const recentActivity = [
			createGitHubActivity({ id: 'activity-1' }),
			createGitHubActivity({ id: 'activity-2', type: 'pr' })
		]
		const spotifyTracks = [
			createSpotifyTrack({ id: 'track-1' }),
			createSpotifyTrack({ id: 'track-2', name: 'Fallback cache' })
		]

		githubMocks.getCachedGitHubActivity.mockResolvedValue(recentActivity)
		spotifyMocks.getSpotifyTracks.mockResolvedValue(spotifyTracks)

		const { getCombinedActivity } = await import('@/app/api/activity/combined/combine')
		const result = await getCombinedActivity(5, 5)

		expect(githubMocks.getCachedGitHubContributions).toHaveBeenNthCalledWith(
			1,
			2026
		)
		expect(githubMocks.getCachedGitHubContributions).toHaveBeenNthCalledWith(
			2,
			2025
		)
		expect(githubMocks.getCachedGitHubActivity).toHaveBeenCalledWith(5)
		expect(spotifyMocks.getSpotifyTracks).toHaveBeenCalledWith(5)

		expect(result.totalContributions).toBe(17)
		expect(result.recentActivity).toEqual(recentActivity)
		expect(result.spotifyTracks).toEqual(spotifyTracks)
		expect(result.contributions).toEqual([
			{ date: '2025-12-31', contributionCount: 3 },
			{ date: '2026-01-01', contributionCount: 4 },
			{ date: '2026-01-02', contributionCount: 1 }
		])
		expect(result.fetchedAt).toBe(new Date('2026-03-30T06:15:00.000Z').getTime())
	})

	it('returns partial data cleanly when spotify has no tracks', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-03-30T06:15:00.000Z'))

		githubMocks.getCachedGitHubContributions
			.mockResolvedValueOnce({
				totalContributions: 2,
				weeks: [
					createContributionWeek('2026-01-01', [
						createContributionDay('2026-01-01', 2)
					])
				]
			})
			.mockResolvedValueOnce({
				totalContributions: 0,
				weeks: []
			})

		githubMocks.getCachedGitHubActivity.mockResolvedValue([
			createGitHubActivity()
		])
		spotifyMocks.getSpotifyTracks.mockResolvedValue([])

		const { getCombinedActivity } = await import('@/app/api/activity/combined/combine')
		const result = await getCombinedActivity(3, 5)

		expect(result.spotifyTracks).toEqual([])
		expect(result.recentActivity).toHaveLength(1)
		expect(result.contributions).toEqual([
			{ date: '2026-01-01', contributionCount: 2 }
		])
		expect(result.totalContributions).toBe(2)
	})
})
