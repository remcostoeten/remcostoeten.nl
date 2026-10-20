import { describe, expect, it } from 'vitest'
import {
	parseStreamingHistory,
	toApiListenRows,
	toCatalogRows
} from '@/server/spotify/mappers'

function createTrack(id: string, artists: Array<[string, string]>) {
	return {
		id,
		name: `Track ${id}`,
		duration_ms: 180000,
		explicit: false,
		is_local: false,
		external_urls: { spotify: `https://open.spotify.com/track/${id}` },
		artists: artists.map(([artistId, name]) => ({ id: artistId, name })),
		album: {
			id: `album-${id}`,
			name: `Album ${id}`,
			images: [{ url: `https://i.scdn.co/image/${id}` }]
		}
	}
}

describe('spotify catalog rows', () => {
	it('keeps each track and artist once and links artists in order', () => {
		const enrichedAt = new Date('2026-10-20T12:00:00.000Z')
		const first = createTrack('t1', [
			['a1', 'Artist one'],
			['a2', 'Artist two']
		])
		const second = createTrack('t2', [['a1', 'Artist one']])

		const rows = toCatalogRows([first, second, first], enrichedAt)

		expect(rows.tracks).toEqual([
			{
				id: 't1',
				name: 'Track t1',
				artistName: 'Artist one, Artist two',
				albumId: 'album-t1',
				albumName: 'Album t1',
				albumImage: 'https://i.scdn.co/image/t1',
				durationMs: 180000,
				explicit: false,
				url: 'https://open.spotify.com/track/t1',
				enrichedAt
			},
			expect.objectContaining({ id: 't2', artistName: 'Artist one' })
		])
		expect(rows.artists).toEqual([
			{ id: 'a1', name: 'Artist one' },
			{ id: 'a2', name: 'Artist two' }
		])
		expect(rows.trackArtists).toEqual([
			{ trackId: 't1', artistId: 'a1', position: 0 },
			{ trackId: 't1', artistId: 'a2', position: 1 },
			{ trackId: 't2', artistId: 'a1', position: 0 }
		])
	})

	it('skips local files', () => {
		const local = {
			...createTrack('local', [['a1', 'Artist']]),
			is_local: true
		}

		expect(toCatalogRows([local], new Date()).tracks).toEqual([])
	})
})

describe('spotify api listen rows', () => {
	it('keeps the context a play started from', () => {
		const rows = toApiListenRows([
			{
				played_at: '2026-10-20T19:39:02.745Z',
				track: createTrack('t1', [['a1', 'Artist']]),
				context: { type: 'playlist', uri: 'spotify:playlist:p1' }
			},
			{
				played_at: '2026-10-20T19:35:53.294Z',
				track: createTrack('t2', [['a1', 'Artist']]),
				context: null
			}
		])

		expect(rows).toEqual([
			{
				trackId: 't1',
				playedAt: new Date('2026-10-20T19:39:02.745Z'),
				contextType: 'playlist',
				contextUri: 'spotify:playlist:p1',
				source: 'api'
			},
			{
				trackId: 't2',
				playedAt: new Date('2026-10-20T19:35:53.294Z'),
				contextType: null,
				contextUri: null,
				source: 'api'
			}
		])
	})
})

describe('streaming history export', () => {
	function createEntry(
		uri: string | null,
		msPlayed: number,
		ts = '2024-05-01T10:00:00Z'
	) {
		return {
			ts,
			ms_played: msPlayed,
			spotify_track_uri: uri,
			master_metadata_track_name: uri ? 'Song' : null,
			master_metadata_album_artist_name: uri ? 'Artist' : null,
			master_metadata_album_album_name: uri ? 'Album' : null
		}
	}

	it('turns track plays into listens with exact listening time', () => {
		const { tracks, listens } = parseStreamingHistory([
			createEntry('spotify:track:t1', 215000),
			createEntry('spotify:track:t1', 12000, '2024-05-01T10:05:00Z')
		])

		expect(tracks).toEqual([
			{
				id: 't1',
				name: 'Song',
				artistName: 'Artist',
				albumName: 'Album',
				url: 'https://open.spotify.com/track/t1'
			}
		])
		expect(listens).toEqual([
			{
				trackId: 't1',
				playedAt: new Date('2024-05-01T10:00:00Z'),
				msPlayed: 215000,
				source: 'export'
			},
			{
				trackId: 't1',
				playedAt: new Date('2024-05-01T10:05:00Z'),
				msPlayed: 12000,
				source: 'export'
			}
		])
	})

	it('skips episodes, local files and entries with no playback', () => {
		const { tracks, listens } = parseStreamingHistory([
			createEntry('spotify:episode:e1', 600000),
			createEntry(null, 200000),
			createEntry('spotify:track:t2', 0)
		])

		expect(tracks).toEqual([])
		expect(listens).toEqual([])
	})
})
