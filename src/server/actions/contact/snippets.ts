'use server'

import { revalidatePath } from 'next/cache'
import { and, count, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/server/db/connection'
import { replySnippets } from '@/server/db/schema'
import { getReplySnippets } from '@/server/queries/reply-snippets'
import {
	REPLY_MAX_LENGTH,
	SIGNATURE_MAX_LENGTH,
	SNIPPET_TITLE_MAX_LENGTH,
	TEMPLATE_LIMIT
} from '@/shared/lib/contact-reply'
import { isAdmin } from '@/utils/is-admin'
import type { SnippetResult } from '@/components/admin/inbox/types'

const signatureSchema = z.string().trim().max(SIGNATURE_MAX_LENGTH)

const templateSchema = z.object({
	id: z.string().min(1).max(100).nullable(),
	title: z
		.string()
		.trim()
		.min(1, 'Give the template a title')
		.max(SNIPPET_TITLE_MAX_LENGTH),
	body: z
		.string()
		.trim()
		.min(1, 'Write the template text')
		.max(REPLY_MAX_LENGTH)
})

async function finish(): Promise<SnippetResult> {
	revalidatePath('/admin', 'layout')
	return { success: true, snippets: await getReplySnippets() }
}

function failure(error: unknown): SnippetResult {
	console.error('[reply snippets] Failed:', error)
	return { success: false, error: 'Could not save. Try again.' }
}

/**
 * @name saveSignature
 * @description Saves the signature that is prefilled in every reply. An empty
 * value removes it. Only admins may call it.
 *
 * @example
 * await saveSignature('Remco')
 */
export async function saveSignature(value: string): Promise<SnippetResult> {
	if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

	const parsed = signatureSchema.safeParse(value)
	if (!parsed.success) {
		return {
			success: false,
			error: `The signature is limited to ${SIGNATURE_MAX_LENGTH} characters`
		}
	}

	try {
		const removal = db
			.delete(replySnippets)
			.where(eq(replySnippets.kind, 'signature'))
		if (parsed.data) {
			await db.batch([
				removal,
				db
					.insert(replySnippets)
					.values({ kind: 'signature', body: parsed.data })
			])
		} else {
			await removal
		}
		return await finish()
	} catch (error) {
		return failure(error)
	}
}

/**
 * @name saveTemplate
 * @description Creates a reply template, or updates one when an id is given.
 * Only admins may call it.
 *
 * @example
 * await saveTemplate({ id: null, title: 'Thanks', body: 'Hi {name}, thanks!' })
 */
export async function saveTemplate(input: {
	id: string | null
	title: string
	body: string
}): Promise<SnippetResult> {
	if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

	const parsed = templateSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? 'Invalid template'
		}
	}
	const { id, title, body } = parsed.data

	try {
		if (id) {
			await db
				.update(replySnippets)
				.set({ title, body })
				.where(
					and(
						eq(replySnippets.id, id),
						eq(replySnippets.kind, 'template')
					)
				)
		} else {
			const [row] = await db
				.select({ total: count() })
				.from(replySnippets)
				.where(eq(replySnippets.kind, 'template'))
			if (row.total >= TEMPLATE_LIMIT) {
				return {
					success: false,
					error: `You can keep up to ${TEMPLATE_LIMIT} templates`
				}
			}
			await db
				.insert(replySnippets)
				.values({ kind: 'template', title, body })
		}
		return await finish()
	} catch (error) {
		return failure(error)
	}
}

/**
 * @name deleteTemplate
 * @description Deletes a reply template. Only admins may call it.
 *
 * @example
 * await deleteTemplate(template.id)
 */
export async function deleteTemplate(id: string): Promise<SnippetResult> {
	if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

	try {
		await db
			.delete(replySnippets)
			.where(
				and(
					eq(replySnippets.id, id),
					eq(replySnippets.kind, 'template')
				)
			)
		return await finish()
	} catch (error) {
		return failure(error)
	}
}
