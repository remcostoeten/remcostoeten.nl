import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
	fetchRecentlyPlayed: vi.fn()
}))

const catalogMocks = vi.hoisted(() => ({
	saveSpotifyCatalog: vi.fn(),
	enrichSpotifyCatalog: vi.fn()
}))

const dbMocks = vi.hoisted(() => {
	const returning = vi.fn()
	const onConflictDoNothing = vi.fn(() => ({ returning }))
	const values = vi.fn(() => ({ onConflictDoNothing }))
	const insert = vi.fn(() => ({ values }))

	return { insert, values, onConflictDoNothing, returning }
})

vi.mock('@/server/spotify/api', () => apiMocks)
vi.mock('@/server/spotify/catalog', () => catalogMocks)
vi.mock('@/server/db/connection', () => ({
	db: { insert: dbMocks.insert },
	schema: {
		spotifyListens: {
			id: 'id',
			playedAt: 'playedAt',
			trackId: 'trackId'
		}
	}
}))

function createItem(index: number) {
	return {
		played_at: new Date(Date.UTC(2026, 9, 20, 10, index)).toISOString(),
		context: null,
		track: {
			id: `track-${index}`,
			name: `Track ${index}`,
			duration_ms: 180000,
			explicit: false,
			is_local: false,
			external_urls: {
				spotify: `https://open.spotify.com/track/track-${index}`
			},
			artists: [{ id: 'artist-1', name: 'Artist' }],
			album: { id: 'album-1', name: 'Album', images: [] }
		}
	}
}

describe('spotify listen sync', () => {
	beforeEach(() => {
		vi.resetModules()
		apiMocks.fetchRecentlyPlayed.mockReset()
		catalogMocks.saveSpotifyCatalog.mockReset()
		catalogMocks.enrichSpotifyCatalog.mockReset()
		catalogMocks.enrichSpotifyCatalog.mockResolvedValue({
			tracks: 0,
			artists: 1
		})
		dbMocks.insert.mockClear()
		dbMocks.values.mockClear()
		dbMocks.onConflictDoNothing.mockClear()
		dbMocks.returning.mockReset()
	})

	it('returns null when spotify cannot be reached', async () => {
		apiMocks.fetchRecentlyPlayed.mockResolvedValue(null)

		const { syncSpotifyListens } = await import('@/server/spotify/sync')

		expect(await syncSpotifyListens()).toBeNull()
		expect(dbMocks.insert).not.toHaveBeenCalled()
	})

	it('skips writes when spotify returns no plays', async () => {
		apiMocks.fetchRecentlyPlayed.mockResolvedValue([])

		const { syncSpotifyListens } = await import('@/server/spotify/sync')

		expect(await syncSpotifyListens()).toEqual({
			fetched: 0,
			saved: 0,
			possibleGap: false,
			enriched: { tracks: 0, artists: 0 }
		})
		expect(catalogMocks.saveSpotifyCatalog).not.toHaveBeenCalled()
		expect(dbMocks.insert).not.toHaveBeenCalled()
	})

	it('saves the catalog before the plays and enriches afterwards', async () => {
		apiMocks.fetchRecentlyPlayed.mockResolvedValue([
			createItem(1),
			createItem(2)
		])
		dbMocks.returning.mockResolvedValue([{ id: 'row-1' }])

		const { syncSpotifyListens } = await import('@/server/spotify/sync')
		const result = await syncSpotifyListens()

		expect(apiMocks.fetchRecentlyPlayed).toHaveBeenCalledWith(50)
		expect(catalogMocks.saveSpotifyCatalog).toHaveBeenCalledWith(
			expect.objectContaining({
				tracks: [
					expect.objectContaining({ id: 'track-1' }),
					expect.objectContaining({ id: 'track-2' })
				],
				artists: [{ id: 'artist-1', name: 'Artist' }]
			})
		)
		expect(
			catalogMocks.saveSpotifyCatalog.mock.invocationCallOrder[0]
		).toBeLessThan(dbMocks.insert.mock.invocationCallOrder[0] ?? 0)
		expect(dbMocks.values).toHaveBeenCalledWith([
			expect.objectContaining({ trackId: 'track-1', source: 'api' }),
			expect.objectContaining({ trackId: 'track-2', source: 'api' })
		])
		expect(dbMocks.onConflictDoNothing).toHaveBeenCalledWith({
			target: ['playedAt', 'trackId']
		})
		expect(result).toEqual({
			fetched: 2,
			saved: 1,
			possibleGap: false,
			enriched: { tracks: 0, artists: 1 }
		})
	})

	it('flags a possible gap when all 50 plays were new', async () => {
		const items = Array.from({ length: 50 }, (_, index) =>
			createItem(index)
		)
		apiMocks.fetchRecentlyPlayed.mockResolvedValue(items)
		dbMocks.returning.mockResolvedValue(
			items.map(item => ({ id: item.track.id }))
		)

		const { syncSpotifyListens } = await import('@/server/spotify/sync')
		const result = await syncSpotifyListens()

		expect(result?.possibleGap).toBe(true)
	})
})
