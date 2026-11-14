import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createNowPlaying, createScrobble } from '@/test/factories/lastfm'

const apiMocks = vi.hoisted(() => ({
	fetchLastfmScrobbles: vi.fn(),
	hasLastfmCredentials: vi.fn()
}))

const catalogMocks = vi.hoisted(() => ({
	saveSpotifyCatalog: vi.fn()
}))

const dbMocks = vi.hoisted(() => {
	const returning = vi.fn()
	const onConflictDoNothing = vi.fn(() => ({ returning }))
	const values = vi.fn(() => ({ onConflictDoNothing }))
	const insert = vi.fn(() => ({ values }))
	const from = vi.fn()
	const select = vi.fn(() => ({ from }))

	return { insert, values, onConflictDoNothing, returning, select, from }
})

vi.mock('@/server/lastfm/api', () => apiMocks)
vi.mock('@/server/spotify/catalog', () => catalogMocks)
vi.mock('@/server/db/connection', () => ({
	db: { insert: dbMocks.insert, select: dbMocks.select },
	schema: {
		spotifyListens: {
			id: 'id',
			playedAt: 'playedAt',
			trackId: 'trackId'
		}
	}
}))

describe('last.fm listen sync', () => {
	beforeEach(() => {
		vi.resetModules()
		apiMocks.fetchLastfmScrobbles.mockReset()
		apiMocks.hasLastfmCredentials.mockReset()
		apiMocks.hasLastfmCredentials.mockReturnValue(true)
		catalogMocks.saveSpotifyCatalog.mockReset()
		dbMocks.insert.mockClear()
		dbMocks.values.mockClear()
		dbMocks.returning.mockReset()
		dbMocks.from.mockReset()
		dbMocks.from.mockResolvedValue([
			{ latest: new Date('2026-10-26T12:00:00.000Z') }
		])
	})

	it('returns null when last.fm is not configured', async () => {
		apiMocks.hasLastfmCredentials.mockReturnValue(false)

		const { syncLastfmListens } = await import('@/server/lastfm/sync')

		expect(await syncLastfmListens()).toBeNull()
		expect(apiMocks.fetchLastfmScrobbles).not.toHaveBeenCalled()
	})

	it('only asks for plays after the newest stored listen', async () => {
		apiMocks.fetchLastfmScrobbles.mockResolvedValue({
			scrobbles: [],
			totalPages: 0
		})

		const { syncLastfmListens } = await import('@/server/lastfm/sync')

		expect(await syncLastfmListens()).toEqual({ fetched: 0, saved: 0 })
		expect(apiMocks.fetchLastfmScrobbles).toHaveBeenCalledWith(
			200,
			1,
			new Date('2026-10-26T12:00:01.000Z')
		)
		expect(dbMocks.insert).not.toHaveBeenCalled()
	})

	it('pages through every page and skips the track playing now', async () => {
		apiMocks.fetchLastfmScrobbles
			.mockResolvedValueOnce({
				scrobbles: [createNowPlaying(9), createScrobble(2)],
				totalPages: 2
			})
			.mockResolvedValueOnce({
				scrobbles: [createScrobble(1)],
				totalPages: 2
			})
		dbMocks.returning.mockResolvedValue([{ id: 'a' }, { id: 'b' }])

		const { syncLastfmListens } = await import('@/server/lastfm/sync')
		const result = await syncLastfmListens()

		expect(apiMocks.fetchLastfmScrobbles).toHaveBeenCalledTimes(2)
		expect(catalogMocks.saveSpotifyCatalog).toHaveBeenCalledWith(
			expect.objectContaining({
				tracks: [
					expect.objectContaining({
						id: 'lastfm:Artist+2/_/Track+2'
					}),
					expect.objectContaining({ id: 'lastfm:Artist+1/_/Track+1' })
				]
			})
		)
		expect(dbMocks.values).toHaveBeenCalledWith([
			expect.objectContaining({ source: 'lastfm' }),
			expect.objectContaining({ source: 'lastfm' })
		])
		expect(result).toEqual({ fetched: 2, saved: 2 })
	})
})
