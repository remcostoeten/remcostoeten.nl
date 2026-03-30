import { db, schema } from '../db/connection'
import { and, desc, gte, inArray, lte, sql } from 'drizzle-orm'
import { getSpotifyAccessToken, hasSpotifyCredentials } from '../spotify/auth'
import type { SyncResult, SpotifyRecentlyPlayedItem } from './types'

export async function syncSpotifyListens(): Promise<SyncResult> {
	try {
		const accessToken = await getSpotifyAccessToken()

		if (!accessToken) {
			return {
				service: 'spotify',
				newItems: 0,
				totalItems: 0,
				lastSyncAt: new Date(),
				error: hasSpotifyCredentials()
					? 'Token refresh failed'
					: 'No credentials configured'
			}
		}

		const response = await fetch(
			'https://api.spotify.com/v1/me/player/recently-played?limit=50',
			{
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}
		)

		if (!response.ok) {
			throw new Error(`Spotify API error: ${response.status}`)
		}

		const data = await response.json()
		const items: SpotifyRecentlyPlayedItem[] = data.items || []

		if (items.length === 0) {
			return {
				service: 'spotify',
				newItems: 0,
				totalItems: 0,
				lastSyncAt: new Date()
			}
		}

		const now = new Date()
		const playedAtDates = items.map(item => new Date(item.played_at))
		const existingListens = await db.query.spotifyListens.findMany({
			where: inArray(schema.spotifyListens.playedAt, playedAtDates),
			columns: { playedAt: true }
		})
		const existingTimestamps = new Set(
			existingListens.map(e => e.playedAt.getTime())
		)

		const newItems: { item: SpotifyRecentlyPlayedItem; playedAt: Date }[] =
			[]
		for (const item of items) {
			const playedAt = new Date(item.played_at)
			if (!existingTimestamps.has(playedAt.getTime())) {
				newItems.push({ item, playedAt })
			}
		}

		if (newItems.length === 0) {
			const totalResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.spotifyListens)

			return {
				service: 'spotify',
				newItems: 0,
				totalItems: Number(totalResult[0]?.count || 0),
				lastSyncAt: now
			}
		}

		const minDate = new Date(
			Math.min(...playedAtDates.map(d => d.getTime())) - 5 * 60 * 1000
		)
		const maxDate = new Date(
			Math.max(...playedAtDates.map(d => d.getTime())) + 5 * 60 * 1000
		)

		const nearbyActivities = await db.query.githubActivities.findMany({
			where: and(
				gte(schema.githubActivities.eventDate, minDate),
				lte(schema.githubActivities.eventDate, maxDate)
			),
			orderBy: desc(schema.githubActivities.eventDate)
		})

		let insertedCount = 0

		for (const { item, playedAt } of newItems) {
			try {
				const fiveMinutesBefore = playedAt.getTime() - 5 * 60 * 1000
				const fiveMinutesAfter = playedAt.getTime() + 5 * 60 * 1000

				const linkedActivity = nearbyActivities.find(a => {
					const activityTime = a.eventDate.getTime()
					return (
						activityTime >= fiveMinutesBefore &&
						activityTime <= fiveMinutesAfter
					)
				})

				await db.insert(schema.spotifyListens).values({
					trackId: item.track.id,
					trackName: item.track.name,
					artistName: item.track.artists.map(a => a.name).join(', '),
					albumName: item.track.album?.name,
					albumImage: item.track.album?.images?.[0]?.url,
					trackUrl: item.track.external_urls.spotify,
					durationMs: item.track.duration_ms,
					playedAt,
					linkedActivityId: linkedActivity?.id || null
				})
				insertedCount++
			} catch {
				console.log(`Skipping duplicate track at: ${item.played_at}`)
			}
		}

		await db
			.insert(schema.syncMetadata)
			.values({
				service: 'spotify',
				lastSyncAt: now,
				lastEventId: items[0]?.played_at || null,
				syncCount: 1
			})
			.onConflictDoUpdate({
				target: schema.syncMetadata.service,
				set: {
					lastSyncAt: now,
					lastEventId: items[0]?.played_at || null,
					syncCount: sql`${schema.syncMetadata.syncCount} + 1`,
					updatedAt: now
				}
			})

		const totalResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.spotifyListens)

		return {
			service: 'spotify',
			newItems: insertedCount,
			totalItems: Number(totalResult[0]?.count || 0),
			lastSyncAt: now
		}
	} catch (error) {
		console.error('Spotify sync error:', error)
		return {
			service: 'spotify',
			newItems: 0,
			totalItems: 0,
			lastSyncAt: new Date(),
			error: error instanceof Error ? error.message : 'Unknown error'
		}
	}
}
