'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { db } from '@/server/db/connection'
import {
	blogPosts,
	blogViews,
	contactSubmissions,
	contactInteractions,
	contactAbandonments
} from '@/server/db/schema'
import { desc, count, sql, eq } from 'drizzle-orm'
import { isAdmin } from '@/utils/is-admin'

export async function getAdminMetrics() {
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
				uniqueViews: blogPosts.uniqueViews
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
		postStats: postStats // Returns array of { slug, totalViews, uniqueViews }
	}
}

/**
 * Toggle the draft status of a blog post by modifying its frontmatter.
 */
export async function toggleBlogDraft(slug: string): Promise<{ success: boolean; draft: boolean }> {
	const admin = await isAdmin()
	if (!admin) {
		throw new Error('Unauthorized')
	}

	const postsDir = path.join(process.cwd(), 'src', 'app', '(marketing)', 'blog', 'posts')
	const filePath = findPostFile(postsDir, slug)

	if (!filePath) {
		throw new Error(`Post not found for slug: ${slug}`)
	}

	const raw = fs.readFileSync(filePath, 'utf-8')
	const frontmatterMatch = /^---\s*\n([\s\S]*?)\n---/.exec(raw)

	if (!frontmatterMatch) {
		throw new Error('Could not parse frontmatter')
	}

	const frontmatter = frontmatterMatch[1]
	const body = raw.slice(frontmatterMatch[0].length)

	const draftMatch = /^draft:\s*(.+?)\s*$/m.exec(frontmatter)
	const currentDraft = draftMatch ? draftMatch[1].toLowerCase() === 'true' : false
	const newDraft = !currentDraft

	let updatedFrontmatter: string
	if (/^draft:\s*/m.test(frontmatter)) {
		updatedFrontmatter = frontmatter.replace(
			/^draft:\s*.+$/m,
			`draft: ${newDraft}`
		)
	} else {
		updatedFrontmatter = frontmatter.trimEnd() + `\ndraft: ${newDraft}`
	}

	fs.writeFileSync(filePath, `---\n${updatedFrontmatter}\n---${body}`, 'utf-8')

	revalidatePath('/admin')
	revalidatePath('/blog')

	return { success: true, draft: newDraft }
}

function findPostFile(dir: string, targetSlug: string): string | null {
	const items = fs.readdirSync(dir)

	for (const item of items) {
		const fullPath = path.join(dir, item)
		const stat = fs.statSync(fullPath)

		if (stat.isDirectory()) {
			const found = findPostFile(fullPath, targetSlug)
			if (found) return found
		} else if (item.endsWith('.md') || item.endsWith('.mdx')) {
			const raw = fs.readFileSync(fullPath, 'utf-8')
			const match = /^---\s*\n([\s\S]*?)\n---/.exec(raw)
			if (!match) continue

			const frontmatter = match[1]
			const slugMatch = /^slug:\s*['"]?(.+?)['"]?\s*$/m.exec(frontmatter)
			const fileSlug = slugMatch
				? slugMatch[1]
				: path.relative(dir, fullPath).replace(/\.(mdx|md)$/, '')

			if (fileSlug === targetSlug) {
				return fullPath
			}
		}
	}

	return null
}
