import { db, schema } from '@/server/db/connection'
import { fetchRecentSpotifyTracks } from './tracks'

const SPOTIFY_HISTORY_LIMIT = 50

/**
 * @name syncSpotifyListens
 * @description Saves the last 50 plays from Spotify's recently played history
 * to spotify_listens and skips plays that are already stored. Spotify keeps no
 * more than 50, so `possibleGap` is true when all of them were new and older
 * plays may have been missed. Returns null when Spotify cannot be reached.
 *
 * @example
 * const result = await syncSpotifyListens()
 * if (result?.possibleGap) console.warn('Spotify plays may be missing')
 */
export async function syncSpotifyListens() {
	const tracks = await fetchRecentSpotifyTracks(SPOTIFY_HISTORY_LIMIT)
	if (!tracks) return null
	if (tracks.length === 0) return { fetched: 0, saved: 0, possibleGap: false }

	const saved = await db
		.insert(schema.spotifyListens)
		.values(
			tracks.map(track => ({
				trackId: track.id,
				trackName: track.name,
				artistName: track.artist,
				albumName: track.album || null,
				albumImage: track.image || null,
				trackUrl: track.url,
				playedAt: new Date(track.played_at)
			}))
		)
		.onConflictDoNothing({ target: schema.spotifyListens.playedAt })
		.returning({ id: schema.spotifyListens.id })

	return {
		fetched: tracks.length,
		saved: saved.length,
		possibleGap: saved.length === SPOTIFY_HISTORY_LIMIT
	}
}
