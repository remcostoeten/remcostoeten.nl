import { and, eq, gte, lte } from 'drizzle-orm'
import { db, schema } from '@/server/db/connection'
import { parseStreamingHistory, type StreamingHistoryEntry } from './mappers'

const INSERT_CHUNK_SIZE = 1000

function chunk<Item>(items: Item[], size: number) {
	return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
		items.slice(index * size, (index + 1) * size)
	)
}

/**
 * @name importStreamingHistory
 * @description Imports entries from Spotify's Extended streaming history
 * export. The export is complete and has exact listening time, so API-synced
 * plays inside its time range are replaced by the exported ones. Running it
 * again with the same files changes nothing.
 *
 * @example
 * const result = await importStreamingHistory(entries)
 * console.log(result.listens, result.replaced)
 */
export async function importStreamingHistory(entries: StreamingHistoryEntry[]) {
	const { tracks, listens } = parseStreamingHistory(entries)
	if (listens.length === 0) return { tracks: 0, listens: 0, replaced: 0 }

	const times = listens.map(listen => listen.playedAt.getTime())
	const from = new Date(times.reduce((min, time) => Math.min(min, time)))
	const to = new Date(times.reduce((max, time) => Math.max(max, time)))

	for (const rows of chunk(tracks, INSERT_CHUNK_SIZE)) {
		await db.insert(schema.spotifyTracks).values(rows).onConflictDoNothing()
	}

	const replaced = await db
		.delete(schema.spotifyListens)
		.where(
			and(
				eq(schema.spotifyListens.source, 'api'),
				gte(schema.spotifyListens.playedAt, from),
				lte(schema.spotifyListens.playedAt, to)
			)
		)
		.returning({ id: schema.spotifyListens.id })

	let inserted = 0
	for (const rows of chunk(listens, INSERT_CHUNK_SIZE)) {
		const saved = await db
			.insert(schema.spotifyListens)
			.values(rows)
			.onConflictDoNothing({
				target: [
					schema.spotifyListens.playedAt,
					schema.spotifyListens.trackId
				]
			})
			.returning({ id: schema.spotifyListens.id })
		inserted += saved.length
	}

	return {
		tracks: tracks.length,
		listens: inserted,
		replaced: replaced.length
	}
}
