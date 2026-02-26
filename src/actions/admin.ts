'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db/connection'
import {
	blogPosts,
	blogViews,
	contactSubmissions,
	contactInteractions,
	contactAbandonments
} from '@/server/db/schema'
import { desc, count, eq } from 'drizzle-orm'
import { isAdmin } from '@/utils/is-admin'

export async function getAdminMetrics() {
	const admin = await isAdmin()
	if (!admin) {
		throw new Error('Unauthorized')
	}
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
		// Total Views
		db.select({ count: count() }).from(blogViews),

		// Unique Visitors (distinct fingerprint)
		db.select({ count: count(blogViews.fingerprint) }).from(blogViews),

		// Views by Country
		db
			.select({
				country: blogViews.geoCountry,
				count: count()
			})
			.from(blogViews)
			.groupBy(blogViews.geoCountry)
			.orderBy(desc(count()))
			.limit(10),

		// Recent Views Log
		db.select().from(blogViews).orderBy(desc(blogViews.viewedAt)).limit(50),

		// Contact Submissions
		db
			.select()
			.from(contactSubmissions)
			.orderBy(desc(contactSubmissions.createdAt)),

		// Contact Interactions
		db
			.select()
			.from(contactInteractions)
			.orderBy(desc(contactInteractions.createdAt)),

		// Contact Abandonments
		db
			.select()
			.from(contactAbandonments)
			.orderBy(desc(contactAbandonments.createdAt)),

		// Per-post view stats
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
		postStats: postStats // Returns array of { slug, totalViews, uniqueViews, isDraft }
	}
}

export async function toggleBlogDraft(
	slug: string
): Promise<{ success: boolean; draft: boolean; error?: string }> {
	try {
		const admin = await isAdmin()
		if (!admin) {
			return { success: false, draft: false, error: 'Unauthorized' }
		}

		const existingPost = await db.query.blogPosts.findFirst({
			where: eq(blogPosts.slug, slug)
		})

		let newDraftStatus: boolean

		if (existingPost) {
			newDraftStatus = !existingPost.isDraft
			await db
				.update(blogPosts)
				.set({ isDraft: newDraftStatus })
				.where(eq(blogPosts.slug, slug))
		} else {
			newDraftStatus = true
			await db
				.insert(blogPosts)
				.values({
					slug,
					isDraft: newDraftStatus
				})
				.onConflictDoUpdate({
					target: blogPosts.slug,
					set: { isDraft: newDraftStatus }
				})
		}

		revalidatePath('/admin')
		revalidatePath('/blog')

		return { success: true, draft: newDraftStatus }
	} catch (e) {
		console.error('[toggleBlogDraft] Failed:', e)
		return {
			success: false,
			draft: false,
			error: e instanceof Error ? e.message : 'Unknown error'
		}
	}
}


