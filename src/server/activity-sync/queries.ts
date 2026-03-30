import { db, schema } from '../db/connection'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

export async function getStoredGitHubActivities(from: Date, to: Date) {
	return db.query.githubActivities.findMany({
		where: and(
			gte(schema.githubActivities.eventDate, from),
			lte(schema.githubActivities.eventDate, to)
		),
		orderBy: desc(schema.githubActivities.eventDate)
	})
}

export async function getStoredSpotifyListens(from: Date, to: Date) {
	return db.query.spotifyListens.findMany({
		where: and(
			gte(schema.spotifyListens.playedAt, from),
			lte(schema.spotifyListens.playedAt, to)
		),
		orderBy: desc(schema.spotifyListens.playedAt)
	})
}

export async function getActivitiesWithMusic(from: Date, to: Date) {
	const activities = await db.query.githubActivities.findMany({
		where: and(
			gte(schema.githubActivities.eventDate, from),
			lte(schema.githubActivities.eventDate, to)
		),
		orderBy: desc(schema.githubActivities.eventDate)
	})

	const linkedListens = await db.query.spotifyListens.findMany({
		where: and(
			gte(schema.spotifyListens.playedAt, from),
			lte(schema.spotifyListens.playedAt, to)
		)
	})

	const listensByActivityId = new Map(
		linkedListens
			.filter(l => l.linkedActivityId)
			.map(l => [l.linkedActivityId, l])
	)

	return activities.map(activity => ({
		...activity,
		linkedTrack: listensByActivityId.get(activity.id) || null
	}))
}

export async function getSyncStatus() {
	const [github, spotify] = await Promise.all([
		db.query.syncMetadata.findFirst({
			where: eq(schema.syncMetadata.service, 'github')
		}),
		db.query.syncMetadata.findFirst({
			where: eq(schema.syncMetadata.service, 'spotify')
		})
	])

	const [githubCount, spotifyCount] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(schema.githubActivities),
		db.select({ count: sql<number>`count(*)` }).from(schema.spotifyListens)
	])

	return {
		github: {
			lastSyncAt: github?.lastSyncAt || null,
			syncCount: github?.syncCount || 0,
			totalActivities: Number(githubCount[0]?.count || 0)
		},
		spotify: {
			lastSyncAt: spotify?.lastSyncAt || null,
			syncCount: spotify?.syncCount || 0,
			totalListens: Number(spotifyCount[0]?.count || 0)
		}
	}
}
