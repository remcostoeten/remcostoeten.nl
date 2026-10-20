import { beforeEach, describe, expect, it, vi } from 'vitest'

const trackMocks = vi.hoisted(() => ({
	fetchRecentSpotifyTracks: vi.fn()
}))

const dbMocks = vi.hoisted(() => {
	const returning = vi.fn()
	const onConflictDoNothing = vi.fn(() => ({ returning }))
	const values = vi.fn(() => ({ onConflictDoNothing }))
	const insert = vi.fn(() => ({ values }))

	return { insert, values, onConflictDoNothing, returning }
})

vi.mock('@/server/spotify/tracks', () => trackMocks)
vi.mock('@/server/db/connection', () => ({
	db: { insert: dbMocks.insert },
	schema: {
		spotifyListens: {
			id: 'id',
			playedAt: 'playedAt'
		}
	}
}))

function createTrack(index: number) {
	return {
		id: `track-${index}`,
		name: `Track ${index}`,
		artist: 'Artist',
		album: '',
		url: `https://open.spotify.com/track/track-${index}`,
		image: '',
		played_at: new Date(Date.UTC(2026, 9, 20, 10, index)).toISOString()
	}
}

describe('spotify listen sync', () => {
	beforeEach(() => {
		vi.resetModules()
		trackMocks.fetchRecentSpotifyTracks.mockReset()
		dbMocks.insert.mockClear()
		dbMocks.values.mockClear()
		dbMocks.onConflictDoNothing.mockClear()
		dbMocks.returning.mockReset()
	})

	it('returns null when spotify cannot be reached', async () => {
		trackMocks.fetchRecentSpotifyTracks.mockResolvedValue(null)

		const { syncSpotifyListens } = await import('@/server/spotify/sync')

		expect(await syncSpotifyListens()).toBeNull()
		expect(dbMocks.insert).not.toHaveBeenCalled()
	})

	it('skips the insert when spotify returns no plays', async () => {
		trackMocks.fetchRecentSpotifyTracks.mockResolvedValue([])

		const { syncSpotifyListens } = await import('@/server/spotify/sync')

		expect(await syncSpotifyListens()).toEqual({
			fetched: 0,
			saved: 0,
			possibleGap: false
		})
		expect(dbMocks.insert).not.toHaveBeenCalled()
	})

	it('stores the last 50 plays and ignores ones already saved', async () => {
		trackMocks.fetchRecentSpotifyTracks.mockResolvedValue([
			createTrack(1),
			createTrack(2)
		])
		dbMocks.returning.mockResolvedValue([{ id: 'row-1' }])

		const { syncSpotifyListens } = await import('@/server/spotify/sync')
		const result = await syncSpotifyListens()

		expect(trackMocks.fetchRecentSpotifyTracks).toHaveBeenCalledWith(50)
		expect(dbMocks.values).toHaveBeenCalledWith([
			{
				trackId: 'track-1',
				trackName: 'Track 1',
				artistName: 'Artist',
				albumName: null,
				albumImage: null,
				trackUrl: 'https://open.spotify.com/track/track-1',
				playedAt: new Date(Date.UTC(2026, 9, 20, 10, 1))
			},
			expect.objectContaining({ trackId: 'track-2' })
		])
		expect(dbMocks.onConflictDoNothing).toHaveBeenCalledWith({
			target: 'playedAt'
		})
		expect(result).toEqual({ fetched: 2, saved: 1, possibleGap: false })
	})

	it('flags a possible gap when all 50 plays were new', async () => {
		const tracks = Array.from({ length: 50 }, (_, index) =>
			createTrack(index)
		)
		trackMocks.fetchRecentSpotifyTracks.mockResolvedValue(tracks)
		dbMocks.returning.mockResolvedValue(
			tracks.map(track => ({ id: track.id }))
		)

		const { syncSpotifyListens } = await import('@/server/spotify/sync')

		expect(await syncSpotifyListens()).toEqual({
			fetched: 50,
			saved: 50,
			possibleGap: true
		})
	})
})
