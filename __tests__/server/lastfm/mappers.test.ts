import { describe, expect, it } from 'vitest'
import {
	isNowPlaying,
	lastfmTrackId,
	toLastfmCatalogRows,
	toLastfmListenRows,
	toTrack
} from '@/server/lastfm/mappers'
import { isSpotifyId } from '@/server/spotify/mappers'
import { createNowPlaying, createScrobble } from '@/test/factories/lastfm'

describe('last.fm mappers', () => {
	it('derives a track id from the last.fm url that spotify never accepts', () => {
		const id = lastfmTrackId(createScrobble(1))

		expect(id).toBe('lastfm:Artist+1/_/Track+1')
		expect(isSpotifyId(id)).toBe(false)
	})

	it('detects the track that is playing right now', () => {
		expect(isNowPlaying(createNowPlaying(1))).toBe(true)
		expect(isNowPlaying(createScrobble(1))).toBe(false)
	})

	it('maps a scrobble to the feed track shape with a spotify search link', () => {
		expect(toTrack(createScrobble(2))).toEqual({
			id: 'lastfm:Artist+2/_/Track+2',
			name: 'Track 2',
			artist: 'Artist 2',
			album: 'Album 2',
			url: 'https://open.spotify.com/search/Artist%202%20Track%202',
			image: 'https://lastfm.freetls.fastly.net/xl/2.jpg',
			played_at: '2026-11-14T17:02:00.000Z'
		})
	})

	it('keeps each track and artist once and marks tracks as enriched', () => {
		const enrichedAt = new Date('2026-11-14T18:00:00.000Z')
		const rows = toLastfmCatalogRows(
			[createScrobble(1), createScrobble(1), createScrobble(2)],
			enrichedAt
		)

		expect(rows.tracks.map(track => track.id)).toEqual([
			'lastfm:Artist+1/_/Track+1',
			'lastfm:Artist+2/_/Track+2'
		])
		expect(rows.tracks[0]?.enrichedAt).toBe(enrichedAt)
		expect(rows.artists).toEqual([
			{ id: 'lastfm:Artist+1', name: 'Artist 1' },
			{ id: 'lastfm:Artist+2', name: 'Artist 2' }
		])
		expect(rows.trackArtists[1]).toEqual({
			trackId: 'lastfm:Artist+2/_/Track+2',
			artistId: 'lastfm:Artist+2',
			position: 0
		})
	})

	it('turns scrobbles into listens with source lastfm', () => {
		expect(toLastfmListenRows([createScrobble(3)])).toEqual([
			{
				trackId: 'lastfm:Artist+3/_/Track+3',
				playedAt: new Date('2026-11-14T17:03:00.000Z'),
				msPlayed: null,
				contextType: null,
				contextUri: null,
				source: 'lastfm'
			}
		])
	})
})
