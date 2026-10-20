import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
	fetchTracks: vi.fn(),
	fetchArtists: vi.fn()
}))

const dbMocks = vi.hoisted(() => {
	const limit = vi.fn()
	const selectWhere = vi.fn(() => ({ limit }))
	const from = vi.fn(() => ({ where: selectWhere }))
	const select = vi.fn(() => ({ from }))
	const updateWhere = vi.fn()
	const set = vi.fn(() => ({ where: updateWhere }))
	const update = vi.fn(() => ({ set }))

	return { select, from, limit, update, set, updateWhere }
})

vi.mock('@/server/spotify/api', () => apiMocks)
vi.mock('@/server/db/connection', () => ({
	db: { select: dbMocks.select, update: dbMocks.update },
	schema: {
		spotifyTracks: { id: 'tracks.id', enrichedAt: 'tracks.enrichedAt' },
		spotifyArtists: { id: 'artists.id', enrichedAt: 'artists.enrichedAt' }
	}
}))

const VALID_ID = '0CfQ8hT96TCe8htXMwptJo'

describe('spotify catalog enrichment', () => {
	beforeEach(() => {
		vi.resetModules()
		apiMocks.fetchTracks.mockReset()
		apiMocks.fetchArtists.mockReset()
		dbMocks.limit.mockReset()
		dbMocks.update.mockClear()
		dbMocks.set.mockClear()
		dbMocks.updateWhere.mockReset()
	})

	it('marks malformed ids as done and only sends valid ones to spotify', async () => {
		dbMocks.limit
			.mockResolvedValueOnce([
				{ id: 'seed-07c42751-10' },
				{ id: VALID_ID }
			])
			.mockResolvedValueOnce([])
		apiMocks.fetchTracks.mockResolvedValue([null])

		const { enrichSpotifyCatalog } =
			await import('@/server/spotify/catalog')
		const result = await enrichSpotifyCatalog()

		expect(apiMocks.fetchTracks).toHaveBeenCalledWith([VALID_ID])
		expect(dbMocks.set).toHaveBeenCalledTimes(2)
		expect(result).toEqual({ tracks: 2, artists: 0 })
	})

	it('counts a batch of only malformed ids as processed without calling spotify', async () => {
		dbMocks.limit
			.mockResolvedValueOnce([{ id: 'seed-1' }, { id: 'seed-2' }])
			.mockResolvedValueOnce([{ id: 'seed-artist' }])

		const { enrichSpotifyCatalog } =
			await import('@/server/spotify/catalog')
		const result = await enrichSpotifyCatalog()

		expect(apiMocks.fetchTracks).not.toHaveBeenCalled()
		expect(apiMocks.fetchArtists).not.toHaveBeenCalled()
		expect(result).toEqual({ tracks: 2, artists: 1 })
	})

	it('reports no progress when spotify cannot be reached', async () => {
		dbMocks.limit
			.mockResolvedValueOnce([{ id: VALID_ID }])
			.mockResolvedValueOnce([])
		apiMocks.fetchTracks.mockResolvedValue(null)

		const { enrichSpotifyCatalog } =
			await import('@/server/spotify/catalog')

		expect(await enrichSpotifyCatalog()).toEqual({ tracks: 0, artists: 0 })
		expect(dbMocks.update).not.toHaveBeenCalled()
	})
})
