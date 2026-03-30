import { db, schema } from '../db/connection'
import { inArray, sql } from 'drizzle-orm'
import { githubService } from '@/server/github'
import type { SyncResult } from './types'

export async function syncGitHubActivities(): Promise<SyncResult> {
	try {
		const now = new Date()
		const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

		const events = await githubService.getDetailedEvents(
			ninetyDaysAgo.toISOString().split('T')[0],
			now.toISOString().split('T')[0]
		)

		const allEvents = events.flatMap(day => day.events)

		if (allEvents.length === 0) {
			return {
				service: 'github',
				newItems: 0,
				totalItems: 0,
				lastSyncAt: now
			}
		}

		const allEventIds = allEvents.map(e => e.id)
		const existingEvents = await db.query.githubActivities.findMany({
			where: inArray(schema.githubActivities.eventId, allEventIds),
			columns: { eventId: true }
		})
		const existingIds = new Set(existingEvents.map(e => e.eventId))
		const newEvents = allEvents.filter(e => !existingIds.has(e.id))

		let newItems = 0

		for (const event of newEvents) {
			try {
				await db.insert(schema.githubActivities).values({
					eventId: event.id,
					type: event.type,
					title: event.title,
					description: event.description,
					repository: event.repository,
					url: event.url,
					isPrivate: event.isPrivate,
					eventDate: new Date(event.timestamp),
					payload: event.payload ? JSON.stringify(event.payload) : null
				})
				newItems++
			} catch {
				console.log(`Skipping duplicate event: ${event.id}`)
			}
		}

		await db
			.insert(schema.syncMetadata)
			.values({
				service: 'github',
				lastSyncAt: now,
				lastEventId: allEvents[allEvents.length - 1]?.id || null,
				syncCount: 1
			})
			.onConflictDoUpdate({
				target: schema.syncMetadata.service,
				set: {
					lastSyncAt: now,
					syncCount: sql`${schema.syncMetadata.syncCount} + 1`,
					updatedAt: now
				}
			})

		const totalResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.githubActivities)

		return {
			service: 'github',
			newItems,
			totalItems: Number(totalResult[0]?.count || 0),
			lastSyncAt: now
		}
	} catch (error) {
		console.error('GitHub sync error:', error)
		return {
			service: 'github',
			newItems: 0,
			totalItems: 0,
			lastSyncAt: new Date(),
			error: error instanceof Error ? error.message : 'Unknown error'
		}
	}
}
