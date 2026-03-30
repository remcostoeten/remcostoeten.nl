import { beforeEach, describe, expect, it, vi } from 'vitest'

const cacheMocks = vi.hoisted(() => ({
	unstable_cache: vi.fn((fn: unknown) => fn)
}))

const dbMocks = vi.hoisted(() => ({
	findMany: vi.fn()
}))

const authMocks = vi.hoisted(() => ({
	getSpotifyAccessToken: vi.fn(),
	hasSpotifyCredentials: vi.fn()
}))

vi.mock('next/cache', () => cacheMocks)
vi.mock('@/server/db/connection', () => ({
	db: {
		query: {
			spotifyListens: {
				findMany: dbMocks.findMany
			}
		}
	},
	schema: {
		spotifyListens: {
			playedAt: 'playedAt'
		}
	}
}))
vi.mock('@/server/spotify/auth', () => authMocks)

describe('spotify track retrieval', () => {
	beforeEach(() => {
		vi.resetModules()
		dbMocks.findMany.mockReset()
		authMocks.getSpotifyAccessToken.mockReset()
		authMocks.hasSpotifyCredentials.mockReset()
		vi.unstubAllGlobals()
	})

	it('falls back to stored tracks when credentials are missing', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(false)
		dbMocks.findMany.mockResolvedValue([
			{
				trackId: 'stored-1',
				trackName: 'Stored track',
				artistName: 'Stored artist',
				albumName: 'Stored album',
				trackUrl: 'https://open.spotify.com/track/stored-1',
				albumImage: 'https://i.scdn.co/image/stored-1',
				playedAt: new Date('2026-03-30T06:00:00.000Z')
			}
		])

		const { getSpotifyTracks } = await import('./tracks')
		const result = await getSpotifyTracks(5)

		expect(result).toEqual([
			{
				id: 'stored-1',
				name: 'Stored track',
				artist: 'Stored artist',
				album: 'Stored album',
				url: 'https://open.spotify.com/track/stored-1',
				image: 'https://i.scdn.co/image/stored-1',
				played_at: '2026-03-30T06:00:00.000Z'
			}
		])
		expect(authMocks.getSpotifyAccessToken).not.toHaveBeenCalled()
	})

	it('falls back to stored tracks when token retrieval fails', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(true)
		authMocks.getSpotifyAccessToken.mockResolvedValue(null)
		dbMocks.findMany.mockResolvedValue([])

		const fetchSpy = vi.fn()
		vi.stubGlobal('fetch', fetchSpy)

		const { getSpotifyTracks } = await import('./tracks')
		const result = await getSpotifyTracks(3)

		expect(result).toEqual([])
		expect(fetchSpy).not.toHaveBeenCalled()
	})

	it('falls back to stored tracks when spotify responds non-ok', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(true)
		authMocks.getSpotifyAccessToken.mockResolvedValue('token-123')
		dbMocks.findMany.mockResolvedValue([
			{
				trackId: 'stored-2',
				trackName: 'Backup listen',
				artistName: 'Backup artist',
				albumName: null,
				trackUrl: 'https://open.spotify.com/track/stored-2',
				albumImage: null,
				playedAt: new Date('2026-03-29T06:00:00.000Z')
			}
		])

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false
			})
		)

		const { getSpotifyTracks } = await import('./tracks')
		const result = await getSpotifyTracks(10)

		expect(result).toEqual([
			{
				id: 'stored-2',
				name: 'Backup listen',
				artist: 'Backup artist',
				album: '',
				url: 'https://open.spotify.com/track/stored-2',
				image: '',
				played_at: '2026-03-29T06:00:00.000Z'
			}
		])
	})

	it('normalizes successful spotify responses', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(true)
		authMocks.getSpotifyAccessToken.mockResolvedValue('token-123')
		dbMocks.findMany.mockResolvedValue([])

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
								name: 'Live listen',
								artists: [{ name: 'Artist one' }, { name: 'Artist two' }],
								album: {
									name: 'Album one',
									images: [{ url: 'https://i.scdn.co/image/live-1' }]
								},
								external_urls: {
									spotify: 'https://open.spotify.com/track/live-1'
								}
							}
						}
					]
				})
			})
		)

		const { getSpotifyTracks } = await import('./tracks')
		const result = await getSpotifyTracks(1)

		expect(result).toEqual([
			{
				id: 'live-1',
				name: 'Live listen',
				artist: 'Artist one, Artist two',
				album: 'Album one',
				url: 'https://open.spotify.com/track/live-1',
				image: 'https://i.scdn.co/image/live-1',
				played_at: '2026-03-30T06:10:00.000Z'
			}
		])
	})

	it('falls back to stored tracks when spotify returns no items', async () => {
		authMocks.hasSpotifyCredentials.mockReturnValue(true)
		authMocks.getSpotifyAccessToken.mockResolvedValue('token-123')
		dbMocks.findMany.mockResolvedValue([
			{
				trackId: 'stored-3',
				trackName: 'Cached listen',
				artistName: 'Stored artist',
				albumName: 'Stored album',
				trackUrl: 'https://open.spotify.com/track/stored-3',
				albumImage: 'https://i.scdn.co/image/stored-3',
				playedAt: new Date('2026-03-28T06:00:00.000Z')
			}
		])

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue({ items: [] })
			})
		)

		const { getSpotifyTracks } = await import('./tracks')
		const result = await getSpotifyTracks(5)

		expect(result[0]?.id).toBe('stored-3')
	})
})
