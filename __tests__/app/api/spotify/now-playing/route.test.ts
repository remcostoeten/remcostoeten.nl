import { beforeEach, describe, expect, it, vi } from 'vitest'

const nowPlayingMocks = vi.hoisted(() => ({
	getLastfmNowPlaying: vi.fn()
}))

vi.mock('@/server/lastfm/now-playing', () => nowPlayingMocks)

describe('now-playing route', () => {
	beforeEach(() => {
		vi.resetModules()
		nowPlayingMocks.getLastfmNowPlaying.mockReset()
	})

	it('returns the last.fm now playing state', async () => {
		nowPlayingMocks.getLastfmNowPlaying.mockResolvedValue({
			isPlaying: true,
			progress_ms: 1000,
			duration_ms: 200000,
			track: { id: 'lastfm:A/_/B', name: 'B' }
		})

		const { GET } = await import('@/app/api/spotify/now-playing/route')
		const response = await GET()

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({
			isPlaying: true,
			progress_ms: 1000,
			duration_ms: 200000,
			track: { id: 'lastfm:A/_/B', name: 'B' }
		})
	})

	it('answers 500 when last.fm fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		nowPlayingMocks.getLastfmNowPlaying.mockRejectedValue(new Error('down'))

		const { GET } = await import('@/app/api/spotify/now-playing/route')
		const response = await GET()

		expect(response.status).toBe(500)
	})
})
