import { db } from '@/server/db/connection'
import {
	blogPosts,
	blogViews,
	contactSubmissions,
	contactInteractions,
	contactAbandonments
} from '@/server/db/schema'
import { desc, count, countDistinct, gte } from 'drizzle-orm'
import { requireAdmin } from '@/server/queries/auth'
import { connection } from 'next/server'

export async function getAdminMetrics() {
	await requireAdmin()
	await connection()

	const [
		totalViews,
		uniqueVisitors,
		viewsByCountry,
		recentViews,
		contactStats,
		interactions,
		abandonments,
		postStats,
		viewsToday,
		countryCount
	] = await Promise.all([
		db.select({ count: count() }).from(blogViews),
		db
			.select({ count: countDistinct(blogViews.fingerprint) })
			.from(blogViews),
		db
			.select({
				country: blogViews.geoCountry,
				count: count()
			})
			.from(blogViews)
			.groupBy(blogViews.geoCountry)
			.orderBy(desc(count()))
			.limit(10),
		db.select().from(blogViews).orderBy(desc(blogViews.viewedAt)).limit(50),
		db
			.select()
			.from(contactSubmissions)
			.orderBy(desc(contactSubmissions.createdAt)),
		db
			.select()
			.from(contactInteractions)
			.orderBy(desc(contactInteractions.createdAt)),
		db
			.select()
			.from(contactAbandonments)
			.orderBy(desc(contactAbandonments.createdAt)),
		db
			.select({
				slug: blogPosts.slug,
				totalViews: blogPosts.totalViews,
				uniqueViews: blogPosts.uniqueViews,
				isDraft: blogPosts.isDraft
			})
			.from(blogPosts),
		db
			.select({ count: count() })
			.from(blogViews)
			.where(gte(blogViews.viewedAt, getStartOfToday())),
		db
			.select({ count: countDistinct(blogViews.geoCountry) })
			.from(blogViews)
	])

	return {
		totalViews: totalViews[0].count,
		uniqueVisitors: uniqueVisitors[0].count,
		viewsByCountry,
		recentViews,
		contactStats,
		interactions,
		abandonments,
		postStats,
		viewsToday: viewsToday[0].count,
		countryCount: countryCount[0].count
	}
}

function getStartOfToday() {
	const date = new Date()
	date.setHours(0, 0, 0, 0)
	return date
}

/**
 * @name getRecentMessageCount
 * @description Counts contact form submissions received in the last 24 hours,
 * used for the unread badge in the admin navigation.
 *
 * @example
 * const unread = await getRecentMessageCount()
 */
export async function getRecentMessageCount() {
	await requireAdmin()
	await connection()

	const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
	const [row] = await db
		.select({ count: count() })
		.from(contactSubmissions)
		.where(gte(contactSubmissions.createdAt, since))

	return row.count
}
