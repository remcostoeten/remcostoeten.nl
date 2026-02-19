'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { eq, and, sql } from 'drizzle-orm'
import { db } from 'db'
import { blogReactions, EMOJI_TYPES, type EmojiType } from '@/server/db/schema'

/**
 * Get or generate a visitor ID for anonymous reactions
 */
async function getVisitorId(): Promise<string> {
	const cookieStore = await cookies()
	let visitorId = cookieStore.get('visitor_id')?.value

	if (!visitorId) {
		visitorId = crypto.randomUUID()
		// Note: Setting cookies in server actions requires specific handling
		// The cookie will be set on next page load via middleware or client
	}

	return visitorId
}

/**
 * Toggle a reaction on a blog post
 * For authenticated users, uses userId
 * For anonymous users, uses visitorId
 */
export async function toggleReaction(slug: string, emoji: EmojiType) {
	if (!EMOJI_TYPES.includes(emoji)) {
		return { error: 'Invalid emoji type' }
	}

	try {
		const visitorId = await getVisitorId()

		// Check if reaction already exists
		const [existing] = await db
			.select()
			.from(blogReactions)
			.where(
				and(
					eq(blogReactions.slug, slug),
					eq(blogReactions.emoji, emoji),
					eq(blogReactions.visitorId, visitorId)
				)
			)
			.limit(1)

		if (existing) {
			// Remove the reaction
			await db
				.delete(blogReactions)
				.where(
					and(
						eq(blogReactions.slug, slug),
						eq(blogReactions.emoji, emoji),
						eq(blogReactions.visitorId, visitorId)
					)
				)

			revalidatePath(`/blog/${slug}`)
			return { success: true, action: 'removed' }
		} else {
			// Add the reaction
			await db.insert(blogReactions).values({
				slug,
				emoji,
				visitorId,
				userId: null
			})

			revalidatePath(`/blog/${slug}`)
			return { success: true, action: 'added' }
		}
	} catch (error) {
		console.error('[toggleReaction] Error:', error)
		return { error: 'Failed to toggle reaction' }
	}
}

/**
 * Get reaction counts for a blog post
 */
export async function getReactions(slug: string) {
	try {
		const visitorId = await getVisitorId()

		// Get counts per emoji type
		const counts = await db
			.select({
				emoji: blogReactions.emoji,
				count: sql<number>`count(*)::int`
			})
			.from(blogReactions)
			.where(eq(blogReactions.slug, slug))
			.groupBy(blogReactions.emoji)

		// Get user's own reactions
		const userReactions = await db
			.select({ emoji: blogReactions.emoji })
			.from(blogReactions)
			.where(
				and(
					eq(blogReactions.slug, slug),
					eq(blogReactions.visitorId, visitorId)
				)
			)

		// Build reaction data
		const reactionData = EMOJI_TYPES.reduce(
			(acc, emoji) => {
				const countData = counts.find(c => c.emoji === emoji)
				const hasReacted = userReactions.some(r => r.emoji === emoji)

				acc[emoji] = {
					count: countData?.count || 0,
					hasReacted
				}

				return acc
			},
			{} as Record<EmojiType, { count: number; hasReacted: boolean }>
		)

		return { reactions: reactionData }
	} catch (error) {
		console.error('[getReactions] Error:', error)

		// Return empty data on error
		const emptyData = EMOJI_TYPES.reduce(
			(acc, emoji) => {
				acc[emoji] = { count: 0, hasReacted: false }
				return acc
			},
			{} as Record<EmojiType, { count: number; hasReacted: boolean }>
		)

		return { reactions: emptyData }
	}
}
