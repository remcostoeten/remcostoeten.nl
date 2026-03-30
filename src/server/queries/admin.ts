import { db } from '@/server/db/connection'
import {
	blogPosts,
	blogViews,
	contactSubmissions,
	contactInteractions,
	contactAbandonments
} from '@/server/db/schema'
import { desc, count } from 'drizzle-orm'
import { requireAdmin } from '@/server/queries/auth'

export async function getAdminMetrics() {
	await requireAdmin()

	const [
		totalViews,
		uniqueVisitors,
		viewsByCountry,
		recentViews,
		contactStats,
		interactions,
		abandonments,
		postStats
	] = await Promise.all([
		db.select({ count: count() }).from(blogViews),
		db.select({ count: count(blogViews.fingerprint) }).from(blogViews),
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
			.from(blogPosts)
	])

	return {
		totalViews: totalViews[0].count,
		uniqueVisitors: uniqueVisitors[0].count,
		viewsByCountry,
		recentViews,
		contactStats,
		interactions,
		abandonments,
		postStats
	}
}
