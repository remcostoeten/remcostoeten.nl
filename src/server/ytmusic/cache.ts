import { eq } from 'drizzle-orm'
import type { YTMusicTrack } from '@/features/ytmusic/types'
import { db } from '@/server/db/connection'
import { ytmusicCache } from '@/server/db/ytmusic-schema'

const DB_CACHE_KEY = 'recent'

export interface YTMusicCacheEntry {
	tracks: YTMusicTrack[]
	updatedAt: Date
}

export async function readYTMusicCache(): Promise<YTMusicCacheEntry | null> {
	try {
		const row = await db.query.ytmusicCache.findFirst({
			where: eq(ytmusicCache.key, DB_CACHE_KEY)
		})
		if (!row) return null

		return {
			tracks: row.tracks.map(track => ({
				...track,
				played_at_estimated: track.played_at_estimated ?? true
			})),
			updatedAt: row.updatedAt
		}
	} catch (error) {
		console.error('[YTM Cache] Read failed:', error)
		return null
	}
}

export async function writeYTMusicCache(
	tracks: YTMusicTrack[]
): Promise<Date | null> {
	const updatedAt = new Date()
	try {
		await db
			.insert(ytmusicCache)
			.values({ key: DB_CACHE_KEY, tracks, updatedAt })
			.onConflictDoUpdate({
				target: ytmusicCache.key,
				set: { tracks, updatedAt }
			})
		return updatedAt
	} catch (error) {
		console.error('[YTM Cache] Write failed:', error)
		return null
	}
}
