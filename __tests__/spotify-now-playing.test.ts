import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
	getSpotifyAccessToken: vi.fn(),
	hasSpotifyCredentials: vi.fn(),
	invalidateSpotifyTokenCache: vi.fn()
}))

vi.mock('@/server/spotify/auth', () => authMocks)

describe('spotify now-playing route', () => {
	beforeEach(() => {
		vi.resetModules()
		authMocks.getSpotifyAccessToken.mockReset()
		authMocks.hasSpotifyCredentials.mockReset()
		authMocks.invalidateSpotifyTokenCache.mockReset()
		vi.unstubAllGlobals()
	})

	it('returns a non-playing state when credentials are missing', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(false)

		const { GET } = await import('@/app/api/spotify/now-playing/route')
		const response = await GET()
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data).toEqual({
			isPlaying: false,
			message: 'No refresh token configured'
		})
	})

	it('returns a normalized live track payload on success', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(true)
		authMocks.getSpotifyAccessToken.mockResolvedValue('token-123')
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				status: 200,
				json: vi.fn().mockResolvedValue({
					is_playing: true,
					progress_ms: 1234,
					item: {
						id: 'live-1',
						name: 'Live song',
						artists: [{ name: 'Artist one' }, { name: 'Artist two' }],
						album: {
							name: 'Album one',
							images: [{ url: 'https://i.scdn.co/image/live-1' }]
						},
						external_urls: {
							spotify: 'https://open.spotify.com/track/live-1'
						},
						duration_ms: 200000
					}
				})
			})
		)

		const { GET } = await import('@/app/api/spotify/now-playing/route')
		const response = await GET()
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data.isPlaying).toBe(true)
		expect(data.progress_ms).toBe(1234)
		expect(data.duration_ms).toBe(200000)
		expect(data.track.id).toBe('live-1')
		expect(data.track.artist).toBe('Artist one, Artist two')
	})

	it('retries once on 401 and returns a non-playing state when spotify stays unavailable', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(true)
		authMocks.getSpotifyAccessToken
			.mockResolvedValueOnce('token-1')
			.mockResolvedValueOnce('token-2')

		vi.stubGlobal(
			'fetch',
			vi.fn()
				.mockResolvedValueOnce({ status: 401 })
				.mockResolvedValueOnce({ status: 204 })
		)

		const { GET } = await import('@/app/api/spotify/now-playing/route')
		const response = await GET()
		const data = await response.json()

		expect(authMocks.invalidateSpotifyTokenCache).toHaveBeenCalledTimes(1)
		expect(response.status).toBe(200)
		expect(data).toEqual({ isPlaying: false })
	})
})
