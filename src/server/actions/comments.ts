'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { eq, and, desc } from 'drizzle-orm'
import { db } from 'db'
import { blogComments, user } from '@/server/db/schema'
import { auth } from '@/server/auth'
import { isAdmin } from '@/utils/is-admin'

/**
 * Get the current user session
 */
async function getSession() {
    return auth.api.getSession({
        headers: await headers(),
    })
}

/**
 * Add a new comment to a blog post
 */
export async function addComment(slug: string, content: string, parentId?: string) {
    const session = await getSession()

    if (!session?.user?.id) {
        return { error: 'You must be signed in to comment' }
    }

    if (!content.trim()) {
        return { error: 'Comment cannot be empty' }
    }

    if (content.length > 2000) {
        return { error: 'Comment is too long (max 2000 characters)' }
    }

    try {
        const [comment] = await db.insert(blogComments).values({
            slug,
            userId: session.user.id,
            content: content.trim(),
            parentId: parentId || null,
        }).returning()

        revalidatePath(`/blog/${slug}`)

        return { success: true, comment }
    } catch (error) {
        console.error('[addComment] Error:', error)
        return { error: 'Failed to add comment' }
    }
}

/**
 * Update an existing comment (only by author)
 */
export async function updateComment(commentId: string, content: string) {
    const session = await getSession()

    if (!session?.user?.id) {
        return { error: 'You must be signed in to edit comments' }
    }

    if (!content.trim()) {
        return { error: 'Comment cannot be empty' }
    }

    try {
        // Verify ownership
        const [existing] = await db
            .select()
            .from(blogComments)
            .where(eq(blogComments.id, commentId))
            .limit(1)

        if (!existing) {
            return { error: 'Comment not found' }
        }

        if (existing.userId !== session.user.id) {
            return { error: 'You can only edit your own comments' }
        }

        const [updated] = await db
            .update(blogComments)
            .set({
                content: content.trim(),
                isEdited: true,
                updatedAt: new Date(),
            })
            .where(eq(blogComments.id, commentId))
            .returning()

        revalidatePath(`/blog/${existing.slug}`)

        return { success: true, comment: updated }
    } catch (error) {
        console.error('[updateComment] Error:', error)
        return { error: 'Failed to update comment' }
    }
}

/**
 * Delete a comment (by author or admin)
 */
export async function deleteComment(commentId: string) {
    const session = await getSession()

    if (!session?.user?.id) {
        return { error: 'You must be signed in to delete comments' }
    }

    try {
        // Get the comment
        const [existing] = await db
            .select()
            .from(blogComments)
            .where(eq(blogComments.id, commentId))
            .limit(1)

        if (!existing) {
            return { error: 'Comment not found' }
        }

        // Check authorization: owner or admin
        const userIsAdmin = await isAdmin()
        if (existing.userId !== session.user.id && !userIsAdmin) {
            return { error: 'You can only delete your own comments' }
        }

        await db.delete(blogComments).where(eq(blogComments.id, commentId))

        revalidatePath(`/blog/${existing.slug}`)

        return { success: true }
    } catch (error) {
        console.error('[deleteComment] Error:', error)
        return { error: 'Failed to delete comment' }
    }
}

/**
 * Get all comments for a blog post
 */
export async function getComments(slug: string) {
    try {
        const comments = await db
            .select({
                id: blogComments.id,
                content: blogComments.content,
                parentId: blogComments.parentId,
                isEdited: blogComments.isEdited,
                createdAt: blogComments.createdAt,
                userId: blogComments.userId,
                userName: user.name,
                userImage: user.image,
            })
            .from(blogComments)
            .leftJoin(user, eq(blogComments.userId, user.id))
            .where(eq(blogComments.slug, slug))
            .orderBy(desc(blogComments.createdAt))

        return { comments }
    } catch (error) {
        console.error('[getComments] Error:', error)
        return { comments: [] }
    }
}
