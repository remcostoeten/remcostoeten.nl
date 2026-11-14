import type { SpotifyTrack } from '@/features/spotify/types'
import type { LastfmScrobble } from './api'

const LASTFM_MUSIC_PATH = 'https://www.last.fm/music/'
const LASTFM_ID_PREFIX = 'lastfm:'

/**
 * @name isNowPlaying
 * @description Checks whether a scrobble is the track playing right now
 * rather than a finished play.
 *
 * @example
 * const current = scrobbles.find(isNowPlaying)
 */
export function isNowPlaying(scrobble: LastfmScrobble) {
	return scrobble['@attr']?.nowplaying === 'true'
}

/**
 * @name lastfmTrackId
 * @description Builds a stable track ID from the scrobble's Last.fm URL,
 * which is unique per artist and title. The `lastfm:` prefix keeps these IDs
 * apart from Spotify IDs, so catalog enrichment never sends them to Spotify.
 *
 * @example
 * lastfmTrackId(scrobble) // 'lastfm:The+Opposites/_/Oew+Oew'
 */
export function lastfmTrackId(scrobble: LastfmScrobble) {
	return `${LASTFM_ID_PREFIX}${scrobble.url.replace(LASTFM_MUSIC_PATH, '')}`
}

function lastfmArtistId(scrobble: LastfmScrobble) {
	return lastfmTrackId(scrobble).split('/_/')[0]
}

function spotifySearchUrl(scrobble: LastfmScrobble) {
	return `https://open.spotify.com/search/${encodeURIComponent(
		`${scrobble.artist['#text']} ${scrobble.name}`
	)}`
}

function largestImage(scrobble: LastfmScrobble) {
	return scrobble.image.findLast(image => image['#text'])?.['#text'] ?? ''
}

function playedAt(scrobble: LastfmScrobble) {
	return new Date(Number(scrobble.date?.uts ?? 0) * 1000)
}

/**
 * @name toTrack
 * @description Turns a scrobble into the track shape the activity feed
 * renders. A track that is playing right now gets the current time as its
 * play time. Links go to a Spotify search because Last.fm has no Spotify IDs.
 *
 * @example
 * const tracks = scrobbles.filter(s => !isNowPlaying(s)).map(toTrack)
 */
export function toTrack(scrobble: LastfmScrobble): SpotifyTrack {
	return {
		id: lastfmTrackId(scrobble),
		name: scrobble.name,
		artist: scrobble.artist['#text'],
		album: scrobble.album['#text'],
		url: spotifySearchUrl(scrobble),
		image: largestImage(scrobble),
		played_at: scrobble.date
			? playedAt(scrobble).toISOString()
			: new Date().toISOString()
	}
}

/**
 * @name toLastfmCatalogRows
 * @description Turns finished scrobbles into rows for spotify_tracks,
 * spotify_artists and spotify_track_artists, each once. Rows are marked as
 * enriched straight away because Spotify cannot look up Last.fm IDs.
 *
 * @example
 * await saveSpotifyCatalog(toLastfmCatalogRows(scrobbles, new Date()))
 */
export function toLastfmCatalogRows(
	scrobbles: LastfmScrobble[],
	enrichedAt: Date
) {
	const unique = [
		...new Map(
			scrobbles.map(scrobble => [lastfmTrackId(scrobble), scrobble])
		).values()
	]
	const artists = new Map(
		unique.map(scrobble => [
			lastfmArtistId(scrobble),
			{ id: lastfmArtistId(scrobble), name: scrobble.artist['#text'] }
		])
	)

	return {
		tracks: unique.map(scrobble => ({
			id: lastfmTrackId(scrobble),
			name: scrobble.name,
			artistName: scrobble.artist['#text'],
			albumId: null,
			albumName: scrobble.album['#text'] || null,
			albumImage: largestImage(scrobble) || null,
			durationMs: null,
			explicit: null,
			url: spotifySearchUrl(scrobble),
			enrichedAt
		})),
		artists: [...artists.values()],
		trackArtists: unique.map(scrobble => ({
			trackId: lastfmTrackId(scrobble),
			artistId: lastfmArtistId(scrobble),
			position: 0
		}))
	}
}

/**
 * @name toLastfmListenRows
 * @description Turns finished scrobbles into spotify_listens rows with
 * source `lastfm`.
 *
 * @example
 * await db.insert(schema.spotifyListens).values(toLastfmListenRows(scrobbles))
 */
export function toLastfmListenRows(scrobbles: LastfmScrobble[]) {
	return scrobbles.map(scrobble => ({
		trackId: lastfmTrackId(scrobble),
		playedAt: playedAt(scrobble),
		msPlayed: null,
		contextType: null,
		contextUri: null,
		source: 'lastfm' as const
	}))
}
