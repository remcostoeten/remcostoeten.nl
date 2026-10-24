import { asc } from 'drizzle-orm'
import { connection } from 'next/server'
import { db } from '@/server/db/connection'
import { replySnippets } from '@/server/db/schema'
import { requireAdmin } from '@/server/queries/auth'
import type { ReplySnippets } from '@/components/admin/inbox/types'

/**
 * @name getReplySnippets
 * @description Loads the saved reply signature and reply templates, oldest
 * template first. Only admins may call it.
 *
 * @example
 * const { signature, templates } = await getReplySnippets()
 */
export async function getReplySnippets(): Promise<ReplySnippets> {
	await requireAdmin()
	await connection()

	const rows = await db
		.select()
		.from(replySnippets)
		.orderBy(asc(replySnippets.createdAt))

	return {
		signature: rows.find(row => row.kind === 'signature')?.body ?? null,
		templates: rows
			.filter(row => row.kind === 'template')
			.map(row => ({ id: row.id, title: row.title, body: row.body }))
	}
}
