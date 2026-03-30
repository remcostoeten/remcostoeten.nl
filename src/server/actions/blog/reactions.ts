'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db } from '@/server/db/connection'
import { blogReactions, EMOJI_TYPES, type EmojiType } from '@/server/db/schema'
import { auth } from '@/server/auth'
import { getVisitorId } from '@/server/request'

/**
 * Get the current user session
 */
async function getSession() {
	try {
		return await auth.api.getSession({
			headers: await headers()
		})
	} catch {
		return null
	}
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
		const session = await getSession()
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
				userId: session?.user?.id || null
			})

			revalidatePath(`/blog/${slug}`)
			return { success: true, action: 'added' }
		}
	} catch (error) {
		console.error('[toggleReaction] Error:', error)
		return { error: 'Failed to toggle reaction' }
	}
}
