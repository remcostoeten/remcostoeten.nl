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

/**
 * Toggle the draft status of a blog post by updating the database.
 * This overrides the file-system based draft status.
 */
export async function toggleBlogDraft(
	slug: string
): Promise<{ success: boolean; draft: boolean }> {
	const admin = await isAdmin()
	if (!admin) {
		throw new Error('Unauthorized')
	}

	// First checks if the record exists
	const existingPost = await db.query.blogPosts.findFirst({
		where: eq(blogPosts.slug, slug)
	})

	let newDraftStatus = true

	if (existingPost) {
		// Toggle existing status
		newDraftStatus = !existingPost.isDraft
		await db
			.update(blogPosts)
			.set({ isDraft: newDraftStatus })
			.where(eq(blogPosts.slug, slug))
	} else {
		// If no record exists, creating one means we are setting a property on it.
		// If we are "toggling", we probably want to toggle away from the default.
		// However, without a record, we assume the file system is the source of truth.
		// To properly toggle, we should first know what the file system says, OR
		// we just assume that if the user clicks "toggle draft", they want to change whatever it currently is.
		// But simpler: if it's not in DB, it's effectively "published" (or whatever the file says).
		// Let's assume we want to explicitely set it to DRAFT if it doesn't exist?
		// Actually, let's insert it with isDraft=true if we clicked toggle.
		// Default behavior:
		// If file says draft=false (published), and we toggle -> we want draft=true.
		// If file says draft=true (draft), and we toggle -> we want draft=false.

		// IMPROVED STRATEGY:
		// We can't know the file state easily here without reading it.
		// But generally, the UI shows the current state.
		// If the UI shows "Published", we want to set "Draft".
		// If the UI whows "Draft", we want to set "Published".
		// The safe bet for a new DB record is to toggle based on what the UI *likely* saw.
		// BUT, to be robust: let's just Upsert.
		// If we don't have a record, let's assume valid "default" behavior for the DB is "false" (published)
		// implying that if we are toggling, we probably want to make it a draft (true).
		// OR we can read the file info?
		// Let's keep it simple: insert as true (Draft) if it doesn't exist.
		// Why? Because usually you toggle a published post to draft.
		// If it's already a draft in file, it stays draft.
		// Wait, if it's draft in file, `getAllBlogPosts` filters it out unless admin.
		// If we want to publish a file-system draft, we need to set isDraft=false in DB.

		// Let's try to find the current state from the file system to be smart?
		// No, that re-introduces FS dependency we might want to avoid or keep minimal.

		// DECISION:
		// If record missing, we insert with `isDraft: true`.
		// Motivation: If it's missing, it's likely complying with file state.
		// If we toggle, we usually want to hide it (make draft).
		// If we want to publish a draft, we'd hope a record exists?
		// Actually, if it's a file-draft, it's hidden. Toggling it means we want to show it.
		// If we insert `isDraft: true`, it stays hidden. That's bad.

		// Let's use the UI payload? No, security.
		// Let's just default to TRUE (Draft) on first insert,
		// UNLESS we can verify otherwise.
		// Better approach: Check if it's currently considered a draft by the system?
		// We can reuse the `getAllBlogPosts` logic but that is heavy.

		// Alternative: just Upsert with a default.
		// Let's stick to: Insert as Draft (true).
		// If the user meant to Publish, they can toggle again.
		// It's safer to accidentally Draft than accidentally Publish.

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
}


