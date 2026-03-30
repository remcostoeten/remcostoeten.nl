'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/server/db/connection'
import { blogPosts } from '@/server/db/schema'
import { isAdmin } from '@/utils/is-admin'

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
