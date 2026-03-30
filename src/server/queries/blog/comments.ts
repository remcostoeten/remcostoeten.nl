import { desc, eq } from 'drizzle-orm'
import { db } from '@/server/db/connection'
import { blogComments, user, blogPosts } from '@/server/db/schema'
import { requireAdmin } from '@/server/queries/auth'

export async function getComments(slug: string) {
	const comments = await db
		.select({
			id: blogComments.id,
			content: blogComments.content,
			parentId: blogComments.parentId,
			isEdited: blogComments.isEdited,
			createdAt: blogComments.createdAt,
			userId: blogComments.userId,
			userName: user.name,
			userImage: user.image
		})
		.from(blogComments)
		.leftJoin(user, eq(blogComments.userId, user.id))
		.where(eq(blogComments.slug, slug))
		.orderBy(desc(blogComments.createdAt))

	return { comments }
}

export type AdminComment = {
	id: string
	slug: string
	content: string
	createdAt: Date
	userName: string | null
	userImage: string | null
	isEdited: boolean
}

export type AdminCommentsResult = {
	comments: AdminComment[]
	recentCount: number
}

export async function getAllCommentsAdmin(): Promise<AdminCommentsResult> {
	await requireAdmin()

	const rows = await db
		.select({
			id: blogComments.id,
			slug: blogComments.slug,
			content: blogComments.content,
			createdAt: blogComments.createdAt,
			userName: user.name,
			userImage: user.image,
			isEdited: blogComments.isEdited
		})
		.from(blogComments)
		.leftJoin(user, eq(blogComments.userId, user.id))
		.leftJoin(blogPosts, eq(blogComments.slug, blogPosts.slug))
		.orderBy(desc(blogComments.createdAt))

	const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
	const recentCount = rows.filter(row => row.createdAt >= since).length

	return { comments: rows, recentCount }
}
