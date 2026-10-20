import type { SpotifyApiTrack, SpotifyPlayHistoryItem } from './api'

const TRACK_URI_PREFIX = 'spotify:track:'

export type StreamingHistoryEntry = {
	ts: string
	ms_played: number
	spotify_track_uri: string | null
	master_metadata_track_name: string | null
	master_metadata_album_artist_name: string | null
	master_metadata_album_album_name: string | null
}

/**
 * @name toCatalogRows
 * @description Turns Spotify track objects into rows for spotify_tracks,
 * spotify_artists and spotify_track_artists, with each track and artist once.
 * Local files are skipped because they have no Spotify ID.
 *
 * @example
 * const rows = toCatalogRows(items.map(item => item.track), new Date())
 * await saveSpotifyCatalog(rows)
 */
export function toCatalogRows(tracks: SpotifyApiTrack[], enrichedAt: Date) {
	const uniqueTracks = [
		...new Map(
			tracks
				.filter(track => !track.is_local && track.id)
				.map(track => [track.id, track])
		).values()
	]
	const artists = new Map(
		uniqueTracks.flatMap(track =>
			track.artists.map(artist => [
				artist.id,
				{ id: artist.id, name: artist.name }
			])
		)
	)

	return {
		tracks: uniqueTracks.map(track => ({
			id: track.id,
			name: track.name,
			artistName: track.artists.map(artist => artist.name).join(', '),
			albumId: track.album.id,
			albumName: track.album.name,
			albumImage: track.album.images[0]?.url ?? null,
			durationMs: track.duration_ms,
			explicit: track.explicit,
			url: track.external_urls.spotify,
			enrichedAt
		})),
		artists: [...artists.values()],
		trackArtists: uniqueTracks.flatMap(track =>
			track.artists.map((artist, position) => ({
				trackId: track.id,
				artistId: artist.id,
				position
			}))
		)
	}
}

/**
 * @name toApiListenRows
 * @description Turns recently played history entries into spotify_listens
 * rows, keeping the playlist, album or artist the play started from. Local
 * files are skipped.
 *
 * @example
 * const listens = toApiListenRows(items)
 */
export function toApiListenRows(items: SpotifyPlayHistoryItem[]) {
	return items
		.filter(item => !item.track.is_local && item.track.id)
		.map(item => ({
			trackId: item.track.id,
			playedAt: new Date(item.played_at),
			contextType: item.context?.type ?? null,
			contextUri: item.context?.uri ?? null,
			source: 'api' as const
		}))
}

/**
 * @name parseStreamingHistory
 * @description Turns entries from Spotify's Extended streaming history export
 * into spotify_tracks and spotify_listens rows. Podcast episodes, local files
 * and entries with no playback are skipped. Tracks carry only the names the
 * export has; enrichment fills in the rest.
 *
 * @example
 * const { tracks, listens } = parseStreamingHistory(entries)
 */
export function parseStreamingHistory(entries: StreamingHistoryEntry[]) {
	const tracks = new Map<
		string,
		{
			id: string
			name: string
			artistName: string
			albumName: string | null
			url: string
		}
	>()
	const listens: Array<{
		trackId: string
		playedAt: Date
		msPlayed: number
		source: 'export'
	}> = []

	for (const entry of entries) {
		const uri = entry.spotify_track_uri
		const name = entry.master_metadata_track_name
		if (!uri?.startsWith(TRACK_URI_PREFIX) || !name || entry.ms_played <= 0)
			continue

		const trackId = uri.slice(TRACK_URI_PREFIX.length)
		if (!tracks.has(trackId)) {
			tracks.set(trackId, {
				id: trackId,
				name,
				artistName: entry.master_metadata_album_artist_name ?? '',
				albumName: entry.master_metadata_album_album_name,
				url: `https://open.spotify.com/track/${trackId}`
			})
		}

		listens.push({
			trackId,
			playedAt: new Date(entry.ts),
			msPlayed: entry.ms_played,
			source: 'export'
		})
	}

	return { tracks: [...tracks.values()], listens }
}
