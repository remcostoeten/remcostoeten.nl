import { max } from 'drizzle-orm'
import { db, schema } from '@/server/db/connection'
import { saveSpotifyCatalog } from '@/server/spotify/catalog'
import {
	fetchLastfmScrobbles,
	hasLastfmCredentials,
	type LastfmScrobble
} from './api'
import {
	isNowPlaying,
	toLastfmCatalogRows,
	toLastfmListenRows
} from './mappers'

const PAGE_SIZE = 200
const MAX_PAGES = 10

async function latestStoredPlay() {
	const [row] = await db
		.select({ latest: max(schema.spotifyListens.playedAt) })
		.from(schema.spotifyListens)

	return row?.latest ?? null
}

/**
 * @name syncLastfmListens
 * @description Saves every Last.fm scrobble made after the newest stored
 * listen, with its track and artist. Last.fm keeps the full history, so a
 * missed run is caught up on the next one, up to 2000 plays per run. Returns
 * null when Last.fm is not configured; throws when Last.fm fails.
 *
 * @example
 * const result = await syncLastfmListens()
 * if (result) console.log(`saved ${result.saved} plays`)
 */
export async function syncLastfmListens() {
	if (!hasLastfmCredentials()) return null

	const latest = await latestStoredPlay()
	const from = latest ? new Date(latest.getTime() + 1000) : undefined
	const scrobbles: LastfmScrobble[] = []

	for (let page = 1; page <= MAX_PAGES; page++) {
		const result = await fetchLastfmScrobbles(PAGE_SIZE, page, from)
		scrobbles.push(...result.scrobbles.filter(s => !isNowPlaying(s)))
		if (page >= result.totalPages) break
	}

	if (scrobbles.length === 0) return { fetched: 0, saved: 0 }

	await saveSpotifyCatalog(toLastfmCatalogRows(scrobbles, new Date()))
	const saved = await db
		.insert(schema.spotifyListens)
		.values(toLastfmListenRows(scrobbles))
		.onConflictDoNothing({
			target: [
				schema.spotifyListens.playedAt,
				schema.spotifyListens.trackId
			]
		})
		.returning({ id: schema.spotifyListens.id })

	return { fetched: scrobbles.length, saved: saved.length }
}
