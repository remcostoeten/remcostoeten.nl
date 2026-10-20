import { db, schema } from '@/server/db/connection'
import { fetchRecentlyPlayed } from './api'
import { enrichSpotifyCatalog, saveSpotifyCatalog } from './catalog'
import { toApiListenRows, toCatalogRows } from './mappers'

const SPOTIFY_HISTORY_LIMIT = 50

/**
 * @name syncSpotifyListens
 * @description Saves the last 50 plays from Spotify's recently played history
 * with their tracks and artists, skips plays that are already stored, then
 * enriches one batch of the catalog. Spotify keeps no more than 50 plays, so
 * `possibleGap` is true when all of them were new and older plays may have
 * been missed. Returns null when Spotify cannot be reached.
 *
 * @example
 * const result = await syncSpotifyListens()
 * if (result?.possibleGap) console.warn('Spotify plays may be missing')
 */
export async function syncSpotifyListens() {
	const items = await fetchRecentlyPlayed(SPOTIFY_HISTORY_LIMIT)
	if (!items) return null

	const listens = toApiListenRows(items)
	if (listens.length === 0) {
		return {
			fetched: items.length,
			saved: 0,
			possibleGap: false,
			enriched: { tracks: 0, artists: 0 }
		}
	}

	await saveSpotifyCatalog(
		toCatalogRows(
			items.map(item => item.track),
			new Date()
		)
	)
	const saved = await db
		.insert(schema.spotifyListens)
		.values(listens)
		.onConflictDoNothing({
			target: [
				schema.spotifyListens.playedAt,
				schema.spotifyListens.trackId
			]
		})
		.returning({ id: schema.spotifyListens.id })
	const enriched = await enrichSpotifyCatalog()

	return {
		fetched: items.length,
		saved: saved.length,
		possibleGap:
			items.length === SPOTIFY_HISTORY_LIMIT &&
			saved.length === listens.length,
		enriched
	}
}
