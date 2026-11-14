import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createNowPlaying, createScrobble } from '@/test/factories/lastfm'

const apiMocks = vi.hoisted(() => ({
	fetchLastfmScrobbles: vi.fn(),
	fetchLastfmTrackDuration: vi.fn(),
	hasLastfmCredentials: vi.fn()
}))

vi.mock('next/cache', () => ({
	unstable_cache: vi.fn((fn: unknown) => fn)
}))
vi.mock('@/server/lastfm/api', () => apiMocks)

const PREVIOUS_START = Date.UTC(2026, 10, 14, 17, 1)

describe('last.fm now playing', () => {
	beforeEach(() => {
		vi.resetModules()
		vi.useFakeTimers()
		apiMocks.fetchLastfmScrobbles.mockReset()
		apiMocks.fetchLastfmTrackDuration.mockReset()
		apiMocks.hasLastfmCredentials.mockReset()
		apiMocks.hasLastfmCredentials.mockReturnValue(true)
	})

	it('reports nothing playing without credentials', async () => {
		apiMocks.hasLastfmCredentials.mockReturnValue(false)

		const { getLastfmNowPlaying } =
			await import('@/server/lastfm/now-playing')

		expect(await getLastfmNowPlaying()).toEqual({ isPlaying: false })
	})

	it('reports nothing playing when the last scrobble is finished', async () => {
		apiMocks.fetchLastfmScrobbles.mockResolvedValue({
			scrobbles: [createScrobble(1), createScrobble(0)],
			totalPages: 1
		})

		const { getLastfmNowPlaying } =
			await import('@/server/lastfm/now-playing')

		expect(await getLastfmNowPlaying()).toEqual({ isPlaying: false })
	})

	it('estimates progress from when the previous track ended', async () => {
		vi.setSystemTime(PREVIOUS_START + 180_000 + 30_000)
		apiMocks.fetchLastfmScrobbles.mockResolvedValue({
			scrobbles: [createNowPlaying(2), createScrobble(1)],
			totalPages: 1
		})
		apiMocks.fetchLastfmTrackDuration.mockImplementation(
			async (_artist: string, track: string) =>
				track === 'Track 2' ? 200_000 : 180_000
		)

		const { getLastfmNowPlaying } =
			await import('@/server/lastfm/now-playing')
		const result = await getLastfmNowPlaying()

		expect(result).toMatchObject({
			isPlaying: true,
			progress_ms: 30_000,
			duration_ms: 200_000,
			track: expect.objectContaining({ name: 'Track 2' })
		})
	})

	it('hides progress when the estimate is implausible', async () => {
		vi.setSystemTime(PREVIOUS_START + 3_600_000)
		apiMocks.fetchLastfmScrobbles.mockResolvedValue({
			scrobbles: [createNowPlaying(2), createScrobble(1)],
			totalPages: 1
		})
		apiMocks.fetchLastfmTrackDuration.mockResolvedValue(180_000)

		const { getLastfmNowPlaying } =
			await import('@/server/lastfm/now-playing')

		expect(await getLastfmNowPlaying()).toMatchObject({
			isPlaying: true,
			progress_ms: 0,
			duration_ms: 0
		})
	})

	it('still reports the track when the duration lookup fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		apiMocks.fetchLastfmScrobbles.mockResolvedValue({
			scrobbles: [createNowPlaying(2), createScrobble(1)],
			totalPages: 1
		})
		apiMocks.fetchLastfmTrackDuration.mockRejectedValue(new Error('down'))

		const { getLastfmNowPlaying } =
			await import('@/server/lastfm/now-playing')

		expect(await getLastfmNowPlaying()).toMatchObject({
			isPlaying: true,
			duration_ms: 0
		})
	})
})
