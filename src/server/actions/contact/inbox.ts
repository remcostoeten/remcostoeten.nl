'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/server/db/connection'
import { contactSubmissions } from '@/server/db/schema'
import {
	getInboxCounts,
	getInboxDetail,
	getInboxPage
} from '@/server/queries/contact-inbox'
import { isAdmin } from '@/utils/is-admin'
import type {
	InboxCounts,
	InboxDetail,
	InboxFlag,
	InboxPage
} from '@/components/admin/inbox/types'

type MutationResult =
	| { success: true; counts: InboxCounts }
	| { success: false; error: string }

const folderSchema = z.enum(['inbox', 'unread', 'starred', 'archived'])
const flagSchema = z.enum(['read', 'starred', 'archived'])
const idsSchema = z.array(z.string().min(1).max(100)).min(1).max(100)

const FLAG_COLUMNS = {
	read: 'readAt',
	starred: 'starredAt',
	archived: 'archivedAt'
} as const satisfies Record<InboxFlag, string>

function failure(error: unknown): MutationResult {
	console.error('[contact inbox] Failed:', error)
	return {
		success: false,
		error: error instanceof Error ? error.message : 'Unknown error'
	}
}

/**
 * @name loadInboxPage
 * @description Loads a page of contact messages for a folder and search
 * query. Only admins may call it.
 *
 * @example
 * const page = await loadInboxPage('unread', 'invoice', 30)
 */
export async function loadInboxPage(
	folder: string,
	query: string,
	offset: number
): Promise<InboxPage> {
	if (!(await isAdmin())) return { items: [], hasMore: false }
	return getInboxPage(folderSchema.parse(folder), query, offset)
}

/**
 * @name openMessage
 * @description Loads a message with its replies and marks it read the first
 * time it is opened. Only admins may call it.
 *
 * @example
 * const result = await openMessage(id)
 */
export async function openMessage(
	id: string
): Promise<{ detail: InboxDetail; counts: InboxCounts } | null> {
	if (!(await isAdmin())) return null

	await db
		.update(contactSubmissions)
		.set({ readAt: new Date() })
		.where(
			and(
				eq(contactSubmissions.id, id),
				isNull(contactSubmissions.readAt)
			)
		)

	const [detail, counts] = await Promise.all([
		getInboxDetail(id),
		getInboxCounts()
	])
	if (!detail) return null

	revalidatePath('/admin', 'layout')
	return { detail, counts }
}

/**
 * @name refreshMessage
 * @description Reloads a message with its replies and the folder counts
 * without marking it read. Used for live status polling. Only admins may
 * call it.
 *
 * @example
 * const result = await refreshMessage(id)
 */
export async function refreshMessage(
	id: string
): Promise<{ detail: InboxDetail; counts: InboxCounts } | null> {
	if (!(await isAdmin())) return null

	const [detail, counts] = await Promise.all([
		getInboxDetail(id),
		getInboxCounts()
	])
	if (!detail) return null

	return { detail, counts }
}

/**
 * @name setMessageFlag
 * @description Sets or clears the read, starred or archived state of a
 * contact message. Only admins may call it.
 *
 * @example
 * await setMessageFlag(message.id, 'starred', true)
 */
export async function setMessageFlag(
	id: string,
	flag: string,
	value: boolean
): Promise<MutationResult> {
	try {
		if (!(await isAdmin())) {
			return { success: false, error: 'Unauthorized' }
		}

		const column = FLAG_COLUMNS[flagSchema.parse(flag)]

		await db
			.update(contactSubmissions)
			.set({ [column]: value ? new Date() : null })
			.where(eq(contactSubmissions.id, id))

		revalidatePath('/admin', 'layout')
		return { success: true, counts: await getInboxCounts() }
	} catch (error) {
		return failure(error)
	}
}

/**
 * @name deleteMessage
 * @description Permanently deletes a contact message and its reply history.
 * Only admins may call it.
 *
 * @example
 * await deleteMessage(message.id)
 */
export async function deleteMessage(id: string): Promise<MutationResult> {
	try {
		if (!(await isAdmin())) {
			return { success: false, error: 'Unauthorized' }
		}

		await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id))

		revalidatePath('/admin', 'layout')
		return { success: true, counts: await getInboxCounts() }
	} catch (error) {
		return failure(error)
	}
}

/**
 * @name setMessagesFlag
 * @description Sets or clears the read, starred or archived state on up to 100
 * contact messages at once. Only admins may call it.
 *
 * @example
 * await setMessagesFlag(ids, 'archived', true)
 */
export async function setMessagesFlag(
	ids: string[],
	flag: string,
	value: boolean
): Promise<MutationResult> {
	try {
		if (!(await isAdmin())) {
			return { success: false, error: 'Unauthorized' }
		}

		const column = FLAG_COLUMNS[flagSchema.parse(flag)]

		await db
			.update(contactSubmissions)
			.set({ [column]: value ? new Date() : null })
			.where(inArray(contactSubmissions.id, idsSchema.parse(ids)))

		revalidatePath('/admin', 'layout')
		return { success: true, counts: await getInboxCounts() }
	} catch (error) {
		return failure(error)
	}
}

/**
 * @name deleteMessages
 * @description Permanently deletes up to 100 contact messages and their reply
 * history. Only admins may call it.
 *
 * @example
 * await deleteMessages(ids)
 */
export async function deleteMessages(ids: string[]): Promise<MutationResult> {
	try {
		if (!(await isAdmin())) {
			return { success: false, error: 'Unauthorized' }
		}

		await db
			.delete(contactSubmissions)
			.where(inArray(contactSubmissions.id, idsSchema.parse(ids)))

		revalidatePath('/admin', 'layout')
		return { success: true, counts: await getInboxCounts() }
	} catch (error) {
		return failure(error)
	}
}
