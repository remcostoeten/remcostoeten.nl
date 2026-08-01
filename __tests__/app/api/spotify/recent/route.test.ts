import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
	getSpotifyAccessToken: vi.fn(),
	hasSpotifyCredentials: vi.fn(),
	invalidateSpotifyTokenCache: vi.fn()
}))

const spotifyMocks = vi.hoisted(() => ({
	getStoredSpotifyTracks: vi.fn()
}))

vi.mock('@/server/spotify/auth', () => authMocks)
vi.mock('@/server/spotify', () => spotifyMocks)

describe('spotify recent route', () => {
	beforeEach(() => {
		vi.resetModules()
		authMocks.getSpotifyAccessToken.mockReset()
		authMocks.hasSpotifyCredentials.mockReset()
		authMocks.invalidateSpotifyTokenCache.mockReset()
		spotifyMocks.getStoredSpotifyTracks.mockReset()
		vi.unstubAllGlobals()
	})

	it('returns stored tracks when credentials are missing', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(false)
		spotifyMocks.getStoredSpotifyTracks.mockResolvedValue([
			{ id: 'stored-1', name: 'Stored', artist: 'Artist' }
		])

		const { GET } = await import('@/app/api/spotify/recent/route')
		const response = await GET(
			new Request('http://127.0.0.1:3000/api/spotify/recent?limit=5')
		)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(spotifyMocks.getStoredSpotifyTracks).toHaveBeenCalledWith(5)
		expect(data).toEqual({
			items: [],
			tracks: [{ id: 'stored-1', name: 'Stored', artist: 'Artist' }]
		})
	})

	it('clamps the requested limit before using the stored tracks fallback', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(false)
		spotifyMocks.getStoredSpotifyTracks.mockResolvedValue([])

		const { GET } = await import('@/app/api/spotify/recent/route')
		const response = await GET(
			new Request('http://127.0.0.1:3000/api/spotify/recent?limit=999')
		)

		expect(response.status).toBe(200)
		expect(spotifyMocks.getStoredSpotifyTracks).toHaveBeenCalledWith(50)
	})

	it('returns stored tracks when spotify upstream fails', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(true)
		authMocks.getSpotifyAccessToken.mockResolvedValue('token-123')
		spotifyMocks.getStoredSpotifyTracks.mockResolvedValue([
			{ id: 'stored-2', name: 'Fallback', artist: 'Artist' }
		])
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 403,
				statusText: 'Forbidden'
			})
		)

		const { GET } = await import('@/app/api/spotify/recent/route')
		const response = await GET(
			new Request('http://127.0.0.1:3000/api/spotify/recent?limit=3')
		)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(spotifyMocks.getStoredSpotifyTracks).toHaveBeenCalledWith(3)
		expect(data.tracks[0].id).toBe('stored-2')
	})

	it('normalizes successful upstream responses', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(true)
		authMocks.getSpotifyAccessToken.mockResolvedValue('token-123')
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue({
					items: [
						{
							played_at: '2026-03-30T06:10:00.000Z',
							track: {
								id: 'live-1',
								name: 'Live',
								artists: [{ name: 'Artist one' }],
								album: {
									name: 'Album',
									images: [
										{
											url: 'https://i.scdn.co/image/live-1'
										}
									]
								},
								external_urls: {
									spotify:
										'https://open.spotify.com/track/live-1'
								}
							}
						}
					]
				})
			})
		)

		const { GET } = await import('@/app/api/spotify/recent/route')
		const response = await GET(
			new Request('http://127.0.0.1:3000/api/spotify/recent?limit=1')
		)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data).toEqual({
			items: [
				{
					played_at: '2026-03-30T06:10:00.000Z',
					track: {
						id: 'live-1',
						name: 'Live',
						artists: [{ name: 'Artist one' }],
						album: {
							name: 'Album',
							images: [{ url: 'https://i.scdn.co/image/live-1' }]
						},
						external_urls: {
							spotify: 'https://open.spotify.com/track/live-1'
						}
					}
				}
			],
			tracks: [
				{
					id: 'live-1',
					name: 'Live',
					artist: 'Artist one',
					album: 'Album',
					url: 'https://open.spotify.com/track/live-1',
					image: 'https://i.scdn.co/image/live-1',
					played_at: '2026-03-30T06:10:00.000Z'
				}
			]
		})
	})
})
