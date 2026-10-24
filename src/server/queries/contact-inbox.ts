import {
	and,
	asc,
	desc,
	eq,
	ilike,
	isNotNull,
	isNull,
	or,
	sql
} from 'drizzle-orm'
import { connection } from 'next/server'
import { db } from '@/server/db/connection'
import { contactReplies, contactSubmissions } from '@/server/db/schema'
import { STALE_PENDING_MS, toInboxReply } from '@/server/gmail/reply-service'
import { requireAdmin } from '@/server/queries/auth'
import type {
	InboxCounts,
	InboxDetail,
	InboxFolder,
	InboxItem,
	InboxPage,
	InboxReplyStatus
} from '@/components/admin/inbox/types'

export const INBOX_PAGE_SIZE = 30

const PREVIEW_LENGTH = 200

function toIso(value: Date | null) {
	return value ? value.toISOString() : null
}

/**
 * @name toListReplyStatus
 * @description Reports a pending reply older than the stale window as
 * uncertain, matching how the thread reports it.
 *
 * @example
 * toListReplyStatus('pending', oldDate, new Date()) // 'uncertain'
 */
export function toListReplyStatus(
	status: InboxReplyStatus | null,
	createdAt: Date | string | null,
	now: Date
): InboxReplyStatus | null {
	if (status !== 'pending' || !createdAt) return status
	const age = now.getTime() - new Date(createdAt).getTime()
	return age > STALE_PENDING_MS ? 'uncertain' : status
}

function folderCondition(folder: InboxFolder) {
	if (folder === 'archived') return isNotNull(contactSubmissions.archivedAt)
	if (folder === 'unread') {
		return and(
			isNull(contactSubmissions.archivedAt),
			isNull(contactSubmissions.readAt)
		)
	}
	if (folder === 'starred') {
		return and(
			isNull(contactSubmissions.archivedAt),
			isNotNull(contactSubmissions.starredAt)
		)
	}
	return isNull(contactSubmissions.archivedAt)
}

function searchCondition(query: string) {
	const needle = query.trim().slice(0, 100)
	if (!needle) return undefined

	// Escapes LIKE wildcards so the query is matched literally.
	const pattern = `%${needle.replace(/[\\%_]/g, character => `\\${character}`)}%`

	return or(
		ilike(contactSubmissions.name, pattern),
		ilike(contactSubmissions.email, pattern),
		ilike(contactSubmissions.subject, pattern),
		ilike(contactSubmissions.message, pattern)
	)
}

/**
 * @name getInboxCounts
 * @description Counts the messages in every inbox folder in one query.
 *
 * @example
 * const counts = await getInboxCounts()
 */
export async function getInboxCounts(): Promise<InboxCounts> {
	await requireAdmin()
	await connection()

	const [row] = await db
		.select({
			inbox: sql<number>`count(*) filter (where ${contactSubmissions.archivedAt} is null)`,
			unread: sql<number>`count(*) filter (where ${contactSubmissions.archivedAt} is null and ${contactSubmissions.readAt} is null)`,
			starred: sql<number>`count(*) filter (where ${contactSubmissions.archivedAt} is null and ${contactSubmissions.starredAt} is not null)`,
			archived: sql<number>`count(*) filter (where ${contactSubmissions.archivedAt} is not null)`
		})
		.from(contactSubmissions)

	return {
		inbox: Number(row.inbox),
		unread: Number(row.unread),
		starred: Number(row.starred),
		archived: Number(row.archived)
	}
}

/**
 * @name getInboxPage
 * @description Loads one page of contact messages for a folder and search
 * query, newest first, with a short preview instead of the full body.
 *
 * @example
 * const { items, hasMore } = await getInboxPage('unread', '', 0)
 */
export async function getInboxPage(
	folder: InboxFolder,
	query: string,
	offset: number
): Promise<InboxPage> {
	await requireAdmin()
	await connection()

	const lastReplyStatus = sql<InboxReplyStatus | null>`(
		select ${contactReplies.status} from ${contactReplies}
		where ${contactReplies.submissionId} = ${contactSubmissions.id}
		order by ${contactReplies.createdAt} desc limit 1
	)`

	const lastReplyAt = sql<Date | string | null>`(
		select ${contactReplies.createdAt} from ${contactReplies}
		where ${contactReplies.submissionId} = ${contactSubmissions.id}
		order by ${contactReplies.createdAt} desc limit 1
	)`

	const rows = await db
		.select({
			id: contactSubmissions.id,
			name: contactSubmissions.name,
			email: contactSubmissions.email,
			subject: contactSubmissions.subject,
			preview: sql<string>`left(${contactSubmissions.message}, ${PREVIEW_LENGTH})`,
			createdAt: contactSubmissions.createdAt,
			readAt: contactSubmissions.readAt,
			starredAt: contactSubmissions.starredAt,
			archivedAt: contactSubmissions.archivedAt,
			repliedAt: contactSubmissions.repliedAt,
			lastReplyStatus,
			lastReplyAt
		})
		.from(contactSubmissions)
		.where(and(folderCondition(folder), searchCondition(query)))
		.orderBy(
			desc(contactSubmissions.createdAt),
			desc(contactSubmissions.id)
		)
		.limit(INBOX_PAGE_SIZE + 1)
		.offset(Math.max(0, Math.floor(offset)))

	const now = new Date()

	const items: InboxItem[] = rows
		.slice(0, INBOX_PAGE_SIZE)
		.map(({ lastReplyAt: replyAt, ...row }) => ({
			...row,
			lastReplyStatus: toListReplyStatus(
				row.lastReplyStatus,
				replyAt,
				now
			),
			createdAt: row.createdAt.toISOString(),
			readAt: toIso(row.readAt),
			starredAt: toIso(row.starredAt),
			archivedAt: toIso(row.archivedAt),
			repliedAt: toIso(row.repliedAt)
		}))

	return { items, hasMore: rows.length > INBOX_PAGE_SIZE }
}

/**
 * @name getInboxDetail
 * @description Loads one contact message in full with its reply history in
 * chronological order. The visitor's IP address is never selected.
 *
 * @example
 * const detail = await getInboxDetail(id)
 */
export async function getInboxDetail(id: string): Promise<InboxDetail | null> {
	await requireAdmin()
	await connection()

	const [row] = await db
		.select({
			id: contactSubmissions.id,
			name: contactSubmissions.name,
			email: contactSubmissions.email,
			subject: contactSubmissions.subject,
			message: contactSubmissions.message,
			geoCity: contactSubmissions.geoCity,
			geoCountry: contactSubmissions.geoCountry,
			createdAt: contactSubmissions.createdAt,
			readAt: contactSubmissions.readAt,
			starredAt: contactSubmissions.starredAt,
			archivedAt: contactSubmissions.archivedAt,
			repliedAt: contactSubmissions.repliedAt
		})
		.from(contactSubmissions)
		.where(eq(contactSubmissions.id, id))
		.limit(1)

	if (!row) return null

	const replies = await db
		.select()
		.from(contactReplies)
		.where(eq(contactReplies.submissionId, id))
		.orderBy(asc(contactReplies.createdAt))

	const now = new Date()

	return {
		...row,
		createdAt: row.createdAt.toISOString(),
		readAt: toIso(row.readAt),
		starredAt: toIso(row.starredAt),
		archivedAt: toIso(row.archivedAt),
		repliedAt: toIso(row.repliedAt),
		replies: replies.map(reply => toInboxReply(reply, now))
	}
}
