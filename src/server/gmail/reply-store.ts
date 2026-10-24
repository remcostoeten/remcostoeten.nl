import { and, asc, count, eq, gte, inArray, sql } from 'drizzle-orm'
import { db } from '@/server/db/connection'
import { contactReplies, contactSubmissions } from '@/server/db/schema'
import type { ReplyStore, StoredReply } from './reply-service'

function toStored(row: typeof contactReplies.$inferSelect): StoredReply {
	return row
}

export const replyStore: ReplyStore = {
	async findSubmission(id) {
		const [row] = await db
			.select({
				id: contactSubmissions.id,
				email: contactSubmissions.email,
				subject: contactSubmissions.subject
			})
			.from(contactSubmissions)
			.where(eq(contactSubmissions.id, id))
			.limit(1)

		return row ?? null
	},

	async findSentReplies(submissionId) {
		const rows = await db
			.select()
			.from(contactReplies)
			.where(
				and(
					eq(contactReplies.submissionId, submissionId),
					eq(contactReplies.status, 'sent')
				)
			)
			.orderBy(asc(contactReplies.createdAt))

		return rows.map(toStored)
	},

	async findReplyById(id) {
		const [row] = await db
			.select()
			.from(contactReplies)
			.where(eq(contactReplies.id, id))
			.limit(1)

		return row ? toStored(row) : null
	},

	async findReplyByKey(key) {
		const [row] = await db
			.select()
			.from(contactReplies)
			.where(eq(contactReplies.idempotencyKey, key))
			.limit(1)

		return row ? toStored(row) : null
	},

	async countRecentReplies(since, submissionId) {
		const [row] = await db
			.select({ total: count() })
			.from(contactReplies)
			.where(
				and(
					gte(contactReplies.createdAt, since),
					inArray(contactReplies.status, [
						'pending',
						'sent',
						'uncertain'
					]),
					submissionId
						? eq(contactReplies.submissionId, submissionId)
						: undefined
				)
			)

		return row.total
	},

	async insertPending(reply) {
		const [row] = await db
			.insert(contactReplies)
			.values(reply)
			.onConflictDoNothing({ target: contactReplies.idempotencyKey })
			.returning()

		return row ? toStored(row) : null
	},

	async markSent(replyId, submissionId, ids, sentAt) {
		await db.batch([
			db
				.update(contactReplies)
				.set({
					status: 'sent',
					sentAt,
					failedAt: null,
					lastError: null,
					...(ids
						? {
								gmailMessageId: ids.messageId,
								gmailThreadId: ids.threadId
							}
						: {})
				})
				.where(eq(contactReplies.id, replyId)),
			db
				.update(contactSubmissions)
				.set({
					repliedAt: sentAt,
					readAt: sql`coalesce(${contactSubmissions.readAt}, ${sentAt.toISOString()}::timestamp)`
				})
				.where(eq(contactSubmissions.id, submissionId))
		])
	},

	async markUnsent(replyId, status, error, at) {
		await db
			.update(contactReplies)
			.set({
				status,
				lastError: error,
				failedAt: status === 'failed' ? at : null
			})
			.where(eq(contactReplies.id, replyId))
	}
}
