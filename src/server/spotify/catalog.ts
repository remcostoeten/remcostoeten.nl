import { inArray, isNull, sql } from 'drizzle-orm'
import { db, schema } from '@/server/db/connection'
import { fetchArtists, fetchTracks } from './api'
import { toCatalogRows } from './mappers'

const SPOTIFY_BATCH_SIZE = 50

/**
 * @name saveSpotifyCatalog
 * @description Upserts tracks, artists and their links. Tracks are overwritten
 * so names-only rows from the export get full details once Spotify returns
 * them; artists keep their enriched genres and images.
 *
 * @example
 * await saveSpotifyCatalog(toCatalogRows(tracks, new Date()))
 */
export async function saveSpotifyCatalog(
	rows: ReturnType<typeof toCatalogRows>
) {
	if (rows.tracks.length === 0) return

	await db
		.insert(schema.spotifyArtists)
		.values(rows.artists)
		.onConflictDoNothing()
	await db
		.insert(schema.spotifyTracks)
		.values(rows.tracks)
		.onConflictDoUpdate({
			target: schema.spotifyTracks.id,
			set: {
				name: sql.raw('excluded.name'),
				artistName: sql.raw('excluded.artist_name'),
				albumId: sql.raw('excluded.album_id'),
				albumName: sql.raw('excluded.album_name'),
				albumImage: sql.raw('excluded.album_image'),
				durationMs: sql.raw('excluded.duration_ms'),
				explicit: sql.raw('excluded.explicit'),
				url: sql.raw('excluded.url'),
				enrichedAt: sql.raw('excluded.enriched_at')
			}
		})
	await db
		.insert(schema.spotifyTrackArtists)
		.values(rows.trackArtists)
		.onConflictDoNothing()
}

async function enrichTracks(enrichedAt: Date) {
	const pending = await db
		.select({ id: schema.spotifyTracks.id })
		.from(schema.spotifyTracks)
		.where(isNull(schema.spotifyTracks.enrichedAt))
		.limit(SPOTIFY_BATCH_SIZE)
	if (pending.length === 0) return 0

	const ids = pending.map(track => track.id)
	const tracks = await fetchTracks(ids)
	if (!tracks) return 0

	const found = tracks.filter(track => track !== null)
	await saveSpotifyCatalog(toCatalogRows(found, enrichedAt))

	const foundIds = new Set(found.map(track => track.id))
	const missing = ids.filter(id => !foundIds.has(id))
	if (missing.length > 0) {
		await db
			.update(schema.spotifyTracks)
			.set({ enrichedAt })
			.where(inArray(schema.spotifyTracks.id, missing))
	}

	return pending.length
}

async function enrichArtists(enrichedAt: Date) {
	const pending = await db
		.select({ id: schema.spotifyArtists.id })
		.from(schema.spotifyArtists)
		.where(isNull(schema.spotifyArtists.enrichedAt))
		.limit(SPOTIFY_BATCH_SIZE)
	if (pending.length === 0) return 0

	const ids = pending.map(artist => artist.id)
	const artists = await fetchArtists(ids)
	if (!artists) return 0

	const found = artists.filter(artist => artist !== null)
	if (found.length > 0) {
		await db
			.insert(schema.spotifyArtists)
			.values(
				found.map(artist => ({
					id: artist.id,
					name: artist.name,
					genres: artist.genres,
					imageUrl: artist.images[0]?.url ?? null,
					enrichedAt
				}))
			)
			.onConflictDoUpdate({
				target: schema.spotifyArtists.id,
				set: {
					name: sql.raw('excluded.name'),
					genres: sql.raw('excluded.genres'),
					imageUrl: sql.raw('excluded.image_url'),
					enrichedAt: sql.raw('excluded.enriched_at')
				}
			})
	}

	const foundIds = new Set(found.map(artist => artist.id))
	const missing = ids.filter(id => !foundIds.has(id))
	if (missing.length > 0) {
		await db
			.update(schema.spotifyArtists)
			.set({ enrichedAt })
			.where(inArray(schema.spotifyArtists.id, missing))
	}

	return pending.length
}

/**
 * @name enrichSpotifyCatalog
 * @description Fills in one batch of tracks without full details (duration,
 * album, artist links) and one batch of artists without genres and images.
 * Returns how many of each were processed; zero means nothing was pending or
 * Spotify could not be reached.
 *
 * @example
 * let result = await enrichSpotifyCatalog()
 * while (result.tracks + result.artists > 0) result = await enrichSpotifyCatalog()
 */
export async function enrichSpotifyCatalog() {
	const enrichedAt = new Date()
	const tracks = await enrichTracks(enrichedAt)
	const artists = await enrichArtists(enrichedAt)

	return { tracks, artists }
}
