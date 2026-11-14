import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createNowPlaying, createScrobble } from '@/test/factories/lastfm'

const dbMocks = vi.hoisted(() => ({
	findMany: vi.fn()
}))

const apiMocks = vi.hoisted(() => ({
	fetchLastfmScrobbles: vi.fn(),
	hasLastfmCredentials: vi.fn()
}))

vi.mock('next/cache', () => ({
	unstable_cache: vi.fn((fn: unknown) => fn)
}))
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
vi.mock('@/server/lastfm/api', () => apiMocks)

const storedListen = {
	playedAt: new Date('2026-03-30T06:00:00.000Z'),
	track: {
		id: 'stored-1',
		name: 'Stored track',
		artistName: 'Stored artist',
		albumName: null,
		url: 'https://open.spotify.com/track/stored-1',
		albumImage: null
	}
}

const storedTrack = {
	id: 'stored-1',
	name: 'Stored track',
	artist: 'Stored artist',
	album: '',
	url: 'https://open.spotify.com/track/stored-1',
	image: '',
	played_at: '2026-03-30T06:00:00.000Z'
}

describe('recent track retrieval', () => {
	beforeEach(() => {
		vi.resetModules()
		dbMocks.findMany.mockReset()
		dbMocks.findMany.mockResolvedValue([storedListen])
		apiMocks.fetchLastfmScrobbles.mockReset()
		apiMocks.hasLastfmCredentials.mockReset()
		apiMocks.hasLastfmCredentials.mockReturnValue(true)
	})

	it('reads stored listens when last.fm is not configured', async () => {
		apiMocks.hasLastfmCredentials.mockReturnValue(false)

		const { getSpotifyTracks } = await import('@/server/spotify/tracks')

		expect(await getSpotifyTracks(5)).toEqual([storedTrack])
		expect(apiMocks.fetchLastfmScrobbles).not.toHaveBeenCalled()
		expect(dbMocks.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ limit: 5, with: { track: true } })
		)
	})

	it('returns finished last.fm plays and leaves out the one playing now', async () => {
		apiMocks.fetchLastfmScrobbles.mockResolvedValue({
			scrobbles: [
				createNowPlaying(3),
				createScrobble(2),
				createScrobble(1)
			],
			totalPages: 1
		})

		const { getSpotifyTracks } = await import('@/server/spotify/tracks')
		const result = await getSpotifyTracks(2)

		expect(apiMocks.fetchLastfmScrobbles).toHaveBeenCalledWith(3, 1)
		expect(result.map(track => track.name)).toEqual(['Track 2', 'Track 1'])
		expect(dbMocks.findMany).not.toHaveBeenCalled()
	})

	it('falls back to stored listens when last.fm fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		apiMocks.fetchLastfmScrobbles.mockRejectedValue(new Error('down'))

		const { getSpotifyTracks } = await import('@/server/spotify/tracks')

		expect(await getSpotifyTracks(5)).toEqual([storedTrack])
	})

	it('falls back to stored listens when last.fm has no plays', async () => {
		apiMocks.fetchLastfmScrobbles.mockResolvedValue({
			scrobbles: [],
			totalPages: 0
		})

		const { getSpotifyTracks } = await import('@/server/spotify/tracks')

		expect(await getSpotifyTracks(5)).toEqual([storedTrack])
	})
})
