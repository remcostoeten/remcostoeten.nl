import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/connection'
import { blogReactions, EMOJI_TYPES, type EmojiType } from '@/server/db/schema'

export async function getReactions(slug: string, visitorId: string) {
	const counts = await db
		.select({
			emoji: blogReactions.emoji,
			count: sql<number>`count(*)::int`
		})
		.from(blogReactions)
		.where(eq(blogReactions.slug, slug))
		.groupBy(blogReactions.emoji)

	const userReactions = await db
		.select({ emoji: blogReactions.emoji })
		.from(blogReactions)
		.where(
			and(
				eq(blogReactions.slug, slug),
				eq(blogReactions.visitorId, visitorId)
			)
		)

	const reactions = EMOJI_TYPES.reduce(
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

	return { reactions }
}

export function getEmptyReactions() {
	return EMOJI_TYPES.reduce(
		(acc, emoji) => {
			acc[emoji] = { count: 0, hasReacted: false }
			return acc
		},
		{} as Record<EmojiType, { count: number; hasReacted: boolean }>
	)
}
