import { buildReplySubject, replyInputSchema } from '@/shared/lib/contact-reply'
import type {
	InboxReply,
	InboxReplyStatus
} from '@/components/admin/inbox/types'
import type { GmailSendOutcome } from './api'
import type { GmailConnection, GmailState } from './connection'
import { buildMimeMessage, toBase64Url } from './mime'

export const STALE_PENDING_MS = 2 * 60 * 1000
export const HOURLY_SEND_LIMIT = 20
export const HOURLY_SEND_LIMIT_PER_MESSAGE = 5

const HOUR_MS = 60 * 60 * 1000

export type StoredReply = {
	id: string
	submissionId: string
	fromEmail: string
	toEmail: string
	subject: string
	body: string
	status: InboxReplyStatus
	gmailMessageId: string | null
	gmailThreadId: string | null
	rfcMessageId: string | null
	idempotencyKey: string
	createdAt: Date
	sentAt: Date | null
	failedAt: Date | null
	lastError: string | null
}

export type ReplyTarget = {
	id: string
	email: string
	subject: string | null
}

export type SentGmailIds = {
	messageId: string
	threadId: string
}

export type ReplyStore = {
	findSubmission: (id: string) => Promise<ReplyTarget | null>
	findSentReplies: (submissionId: string) => Promise<StoredReply[]>
	findReplyById: (id: string) => Promise<StoredReply | null>
	findReplyByKey: (key: string) => Promise<StoredReply | null>
	countRecentReplies: (
		since: Date,
		submissionId: string | null
	) => Promise<number>
	insertPending: (reply: StoredReply) => Promise<StoredReply | null>
	markSent: (
		replyId: string,
		submissionId: string,
		ids: SentGmailIds | null,
		sentAt: Date
	) => Promise<void>
	markUnsent: (
		replyId: string,
		status: 'failed' | 'uncertain',
		error: string,
		at: Date
	) => Promise<void>
}

export type ReplyDeps = {
	store: ReplyStore
	getAdminId: () => Promise<string | null>
	getConnection: () => Promise<GmailConnection>
	send: (
		accessToken: string,
		raw: string,
		threadId: string | null
	) => Promise<GmailSendOutcome>
	now: () => Date
	newId: () => string
	messageIdDomain: string
}

export type SendReplyResult =
	| { status: 'sent'; reply: InboxReply }
	| { status: 'failed'; error: string; reply: InboxReply | null }
	| { status: 'uncertain'; error: string; reply: InboxReply }
	| { status: 'duplicate'; reply: InboxReply }
	| { status: 'needs_gmail'; gmail: Exclude<GmailState, 'connected'> }
	| { status: 'rate_limited'; error: string }
	| { status: 'invalid'; error: string }
	| { status: 'not_found' }
	| { status: 'unauthorized' }

/**
 * @name toInboxReply
 * @description Converts a stored reply to its client shape. A reply still
 * pending after the stale window is reported as uncertain, because the request
 * that owned it is gone and the outcome is unknown.
 *
 * @example
 * const reply = toInboxReply(row, new Date())
 */
export function toInboxReply(row: StoredReply, now: Date): InboxReply {
	const isStale =
		row.status === 'pending' &&
		now.getTime() - row.createdAt.getTime() > STALE_PENDING_MS

	return {
		id: row.id,
		fromEmail: row.fromEmail,
		toEmail: row.toEmail,
		subject: row.subject,
		body: row.body,
		status: isStale ? 'uncertain' : row.status,
		gmailThreadId: row.gmailThreadId,
		createdAt: row.createdAt.toISOString(),
		sentAt: row.sentAt?.toISOString() ?? null,
		failedAt: row.failedAt?.toISOString() ?? null,
		lastError: row.lastError
	}
}

function failureMessage(outcome: GmailSendOutcome) {
	if (outcome.kind === 'rate_limited') {
		return 'Gmail is rate limiting this account. Try again later.'
	}
	if (outcome.kind === 'rejected') return outcome.message
	return 'Gmail rejected the credentials.'
}

async function recordUnsent(
	deps: ReplyDeps,
	replyId: string,
	status: 'failed' | 'uncertain',
	error: string
) {
	try {
		await deps.store.markUnsent(replyId, status, error, deps.now())
	} catch (cause) {
		console.error('[contact reply] Could not record outcome:', cause)
	}
}

/**
 * @name sendContactReply
 * @description Sends an admin reply to a stored contact submission through
 * Gmail. The recipient comes from the database, the sender from the linked
 * Gmail account, and the idempotency key makes a repeated request return the
 * first attempt instead of sending again.
 *
 * @example
 * const result = await sendContactReply(deps, { submissionId, idempotencyKey, body })
 */
export async function sendContactReply(
	deps: ReplyDeps,
	input: { submissionId: string; idempotencyKey: string; body: string }
): Promise<SendReplyResult> {
	const adminId = await deps.getAdminId()
	if (!adminId) return { status: 'unauthorized' }

	const parsed = replyInputSchema.safeParse(input)
	if (!parsed.success) {
		return {
			status: 'invalid',
			error: parsed.error.issues[0]?.message ?? 'Invalid reply'
		}
	}
	const { submissionId, idempotencyKey, body } = parsed.data

	const submission = await deps.store.findSubmission(submissionId)
	if (!submission) return { status: 'not_found' }

	const replay = await deps.store.findReplyByKey(idempotencyKey)
	if (replay) {
		return replay.submissionId === submission.id
			? { status: 'duplicate', reply: toInboxReply(replay, deps.now()) }
			: { status: 'invalid', error: 'Invalid reply' }
	}

	const connection = await deps.getConnection()
	if (connection.state !== 'connected') {
		return { status: 'needs_gmail', gmail: connection.state }
	}

	const now = deps.now()
	const since = new Date(now.getTime() - HOUR_MS)
	const [recentTotal, recentForMessage] = await Promise.all([
		deps.store.countRecentReplies(since, null),
		deps.store.countRecentReplies(since, submission.id)
	])
	if (
		recentTotal >= HOURLY_SEND_LIMIT ||
		recentForMessage >= HOURLY_SEND_LIMIT_PER_MESSAGE
	) {
		return {
			status: 'rate_limited',
			error: 'Too many replies sent in the last hour. Try again later.'
		}
	}

	const thread = await deps.store.findSentReplies(submission.id)
	const lastInThread = thread.at(-1) ?? null
	const subject = buildReplySubject(
		submission.subject,
		thread[0]?.subject ?? null
	)
	const rfcMessageId = `<${deps.newId()}@${deps.messageIdDomain}>`
	const references = thread
		.map(reply => reply.rfcMessageId)
		.filter((id): id is string => id !== null)

	const pending = await deps.store.insertPending({
		id: deps.newId(),
		submissionId: submission.id,
		fromEmail: connection.email,
		toEmail: submission.email,
		subject,
		body,
		status: 'pending',
		gmailMessageId: null,
		gmailThreadId: null,
		rfcMessageId,
		idempotencyKey,
		createdAt: now,
		sentAt: null,
		failedAt: null,
		lastError: null
	})

	if (!pending) {
		const existing = await deps.store.findReplyByKey(idempotencyKey)
		return existing
			? { status: 'duplicate', reply: toInboxReply(existing, deps.now()) }
			: { status: 'invalid', error: 'Invalid reply' }
	}

	let raw: string
	try {
		raw = toBase64Url(
			buildMimeMessage({
				from: connection.email,
				fromName: connection.name ?? null,
				to: submission.email,
				subject,
				body,
				messageId: rfcMessageId,
				date: now,
				inReplyTo: lastInThread?.rfcMessageId ?? null,
				references
			})
		)
	} catch {
		const error = 'The stored recipient address is not a valid email.'
		await recordUnsent(deps, pending.id, 'failed', error)
		return { status: 'failed', error, reply: null }
	}

	const threadId = lastInThread?.gmailThreadId ?? null
	let outcome = await deps.send(connection.accessToken, raw, threadId)

	// A thread deleted in Gmail is rejected; a rejection proves nothing was sent.
	if (outcome.kind === 'rejected' && threadId) {
		outcome = await deps.send(connection.accessToken, raw, null)
	}

	if (outcome.kind === 'sent') {
		// TODO: handle bounces (read Gmail delivery failure notices via a read scope and mark the reply failed)
		const sentAt = deps.now()
		try {
			await deps.store.markSent(
				pending.id,
				submission.id,
				{ messageId: outcome.messageId, threadId: outcome.threadId },
				sentAt
			)
		} catch (cause) {
			console.error('[contact reply] Sent but not recorded:', cause)
			return {
				status: 'uncertain',
				error: 'The email was sent, but saving it failed. Check your Gmail Sent folder before retrying.',
				reply: toInboxReply(pending, deps.now())
			}
		}

		return {
			status: 'sent',
			reply: toInboxReply(
				{
					...pending,
					status: 'sent',
					gmailMessageId: outcome.messageId,
					gmailThreadId: outcome.threadId,
					sentAt
				},
				sentAt
			)
		}
	}

	if (outcome.kind === 'uncertain') {
		await recordUnsent(deps, pending.id, 'uncertain', outcome.message)
		return {
			status: 'uncertain',
			error: 'Gmail did not confirm the send. Check your Gmail Sent folder before retrying.',
			reply: toInboxReply(
				{ ...pending, status: 'uncertain', lastError: outcome.message },
				deps.now()
			)
		}
	}

	const error = failureMessage(outcome)
	await recordUnsent(deps, pending.id, 'failed', error)

	if (outcome.kind === 'auth_error') {
		return { status: 'needs_gmail', gmail: 'needs_reauth' }
	}

	return { status: 'failed', error, reply: null }
}

/**
 * @name resolveUncertainReply
 * @description Settles a reply whose delivery could not be confirmed, using
 * the admin's own check of the Gmail Sent folder. Only uncertain replies can
 * be settled.
 *
 * @example
 * await resolveUncertainReply(deps, reply.id, 'failed')
 */
export async function resolveUncertainReply(
	deps: ReplyDeps,
	replyId: string,
	outcome: 'sent' | 'failed'
): Promise<
	| { status: 'resolved'; reply: InboxReply }
	| { status: 'unauthorized' | 'not_found' | 'not_uncertain' }
> {
	if (!(await deps.getAdminId())) return { status: 'unauthorized' }

	const row = await deps.store.findReplyById(replyId)
	if (!row) return { status: 'not_found' }

	const now = deps.now()
	if (toInboxReply(row, now).status !== 'uncertain') {
		return { status: 'not_uncertain' }
	}

	if (outcome === 'sent') {
		await deps.store.markSent(
			row.id,
			row.submissionId,
			row.gmailMessageId && row.gmailThreadId
				? { messageId: row.gmailMessageId, threadId: row.gmailThreadId }
				: null,
			now
		)
		return {
			status: 'resolved',
			reply: toInboxReply({ ...row, status: 'sent', sentAt: now }, now)
		}
	}

	await deps.store.markUnsent(
		row.id,
		'failed',
		'Confirmed not sent by admin',
		now
	)
	return {
		status: 'resolved',
		reply: toInboxReply(
			{
				...row,
				status: 'failed',
				failedAt: now,
				lastError: 'Confirmed not sent by admin'
			},
			now
		)
	}
}
