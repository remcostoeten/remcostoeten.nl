import { beforeEach, describe, expect, it } from 'vitest'
import type { GmailSendOutcome } from '@/server/gmail/api'
import type { GmailConnection } from '@/server/gmail/connection'
import {
	HOURLY_SEND_LIMIT_PER_MESSAGE,
	STALE_PENDING_MS,
	resolveUncertainReply,
	sendContactReply,
	toInboxReply,
	type ReplyDeps,
	type ReplyStore,
	type StoredReply
} from '@/server/gmail/reply-service'

const KEY_A = '3b241101-e2bb-4255-8caf-4136c566a962'
const KEY_B = '6f1c2b86-0f5e-4a39-9d73-2d3f6e0a9b11'
const NOW = new Date('2026-10-24T12:00:00Z')

type Harness = {
	deps: ReplyDeps
	rows: StoredReply[]
	submission: { repliedAt: Date | null }
	sends: { token: string; raw: string; threadId: string | null }[]
	state: {
		admin: string | null
		connection: GmailConnection
		outcome: GmailSendOutcome
		failMarkSent: boolean
		clock: Date
	}
}

function createHarness(): Harness {
	const rows: StoredReply[] = []
	const submission = { repliedAt: null as Date | null }
	const sends: Harness['sends'] = []
	const state: Harness['state'] = {
		admin: 'admin-1',
		connection: {
			state: 'connected',
			email: 'remco@gmail.com',
			accessToken: 'token'
		},
		outcome: { kind: 'sent', messageId: 'gm1', threadId: 'gt1' },
		failMarkSent: false,
		clock: NOW
	}

	const store: ReplyStore = {
		findSubmission: async id =>
			id === 's1'
				? { id: 's1', email: 'visitor@example.com', subject: 'Quote' }
				: null,
		findSentReplies: async submissionId =>
			rows.filter(
				row =>
					row.submissionId === submissionId && row.status === 'sent'
			),
		findReplyById: async id => rows.find(row => row.id === id) ?? null,
		findReplyByKey: async key =>
			rows.find(row => row.idempotencyKey === key) ?? null,
		countRecentReplies: async (since, submissionId) =>
			rows.filter(
				row =>
					row.createdAt >= since &&
					row.status !== 'failed' &&
					(submissionId === null || row.submissionId === submissionId)
			).length,
		insertPending: async reply => {
			if (rows.some(row => row.idempotencyKey === reply.idempotencyKey)) {
				return null
			}
			rows.push({ ...reply })
			return { ...reply }
		},
		markSent: async (replyId, _submissionId, ids, sentAt) => {
			if (state.failMarkSent) throw new Error('db down')
			const row = rows.find(item => item.id === replyId)
			if (!row) return
			row.status = 'sent'
			row.sentAt = sentAt
			if (ids) {
				row.gmailMessageId = ids.messageId
				row.gmailThreadId = ids.threadId
			}
			submission.repliedAt = sentAt
		},
		markUnsent: async (replyId, status, error, at) => {
			const row = rows.find(item => item.id === replyId)
			if (!row) return
			row.status = status
			row.lastError = error
			row.failedAt = status === 'failed' ? at : null
		}
	}

	let counter = 0
	const deps: ReplyDeps = {
		store,
		getAdminId: async () => state.admin,
		getConnection: async () => state.connection,
		send: async (token, raw, threadId) => {
			sends.push({ token, raw, threadId })
			return state.outcome
		},
		now: () => state.clock,
		newId: () => `id${++counter}`,
		messageIdDomain: 'remcostoeten.nl'
	}

	return { deps, rows, submission, sends, state }
}

function input(key = KEY_A, body = 'Thanks for reaching out') {
	return { submissionId: 's1', idempotencyKey: key, body }
}

describe('sendContactReply', () => {
	let harness: Harness
	beforeEach(() => {
		harness = createHarness()
	})

	it('sends to the stored recipient from the connected Gmail and records it', async () => {
		const result = await sendContactReply(harness.deps, input())

		expect(result.status).toBe('sent')
		expect(harness.sends).toHaveLength(1)
		expect(harness.sends[0].token).toBe('token')
		expect(harness.sends[0].threadId).toBeNull()
		expect(harness.rows[0]).toMatchObject({
			toEmail: 'visitor@example.com',
			fromEmail: 'remco@gmail.com',
			subject: 'Re: Quote',
			status: 'sent',
			gmailMessageId: 'gm1',
			gmailThreadId: 'gt1'
		})
		expect(harness.submission.repliedAt).toEqual(NOW)
	})

	it('never uses a recipient or sender supplied by the client', async () => {
		await sendContactReply(harness.deps, {
			...input(),
			to: 'attacker@example.com',
			from: 'ceo@example.com'
		} as ReturnType<typeof input>)

		expect(harness.rows[0].toEmail).toBe('visitor@example.com')
		expect(harness.rows[0].fromEmail).toBe('remco@gmail.com')
	})

	it('rejects a caller without an admin session', async () => {
		harness.state.admin = null
		expect((await sendContactReply(harness.deps, input())).status).toBe(
			'unauthorized'
		)
		expect(harness.sends).toHaveLength(0)
		expect(harness.rows).toHaveLength(0)
	})

	it('rejects invalid bodies before touching Gmail', async () => {
		const result = await sendContactReply(harness.deps, input(KEY_A, '   '))
		expect(result.status).toBe('invalid')
		expect(harness.sends).toHaveLength(0)
	})

	it('returns not_found for an unknown submission', async () => {
		const result = await sendContactReply(harness.deps, {
			...input(),
			submissionId: 'missing'
		})
		expect(result.status).toBe('not_found')
	})

	it('does not send when Gmail is not connected', async () => {
		for (const state of [
			'not_configured',
			'disconnected',
			'needs_reauth'
		] as const) {
			harness.state.connection = { state, email: null }
			const result = await sendContactReply(harness.deps, input())
			expect(result).toEqual({ status: 'needs_gmail', gmail: state })
		}
		expect(harness.sends).toHaveLength(0)
		expect(harness.rows).toHaveLength(0)
	})

	it('sends once when the same idempotency key is used twice', async () => {
		const first = await sendContactReply(harness.deps, input())
		const second = await sendContactReply(harness.deps, input())

		expect(first.status).toBe('sent')
		expect(second.status).toBe('duplicate')
		expect(harness.sends).toHaveLength(1)
		expect(harness.rows).toHaveLength(1)
	})

	it('sends once when two requests with the same key run concurrently', async () => {
		const results = await Promise.all([
			sendContactReply(harness.deps, input()),
			sendContactReply(harness.deps, input())
		])

		expect(harness.sends).toHaveLength(1)
		expect(harness.rows).toHaveLength(1)
		expect(results.map(result => result.status).sort()).toEqual([
			'duplicate',
			'sent'
		])
	})

	it('threads follow-up replies with the first subject and Gmail thread', async () => {
		await sendContactReply(harness.deps, input(KEY_A, 'First'))
		harness.state.outcome = {
			kind: 'sent',
			messageId: 'gm2',
			threadId: 'gt1'
		}
		await sendContactReply(harness.deps, input(KEY_B, 'Second'))

		expect(harness.sends[1].threadId).toBe('gt1')
		expect(harness.rows[1].subject).toBe('Re: Quote')

		const raw = harness.sends[1].raw.replace(/-/g, '+').replace(/_/g, '/')
		const mime = atob(raw + '='.repeat((4 - (raw.length % 4)) % 4))
		expect(mime).toContain(`In-Reply-To: ${harness.rows[0].rfcMessageId}`)
		expect(mime).toContain(`References: ${harness.rows[0].rfcMessageId}`)
	})

	it('marks a Gmail rejection as failed and not delivered', async () => {
		harness.state.outcome = {
			kind: 'rejected',
			message: 'Invalid To header'
		}
		const result = await sendContactReply(harness.deps, input())

		expect(result).toMatchObject({
			status: 'failed',
			error: 'Invalid To header'
		})
		expect(harness.rows[0].status).toBe('failed')
		expect(harness.submission.repliedAt).toBeNull()
	})

	it('retries once without the thread when Gmail rejects a stale thread', async () => {
		await sendContactReply(harness.deps, input(KEY_A, 'First'))
		const attempts: (string | null)[] = []
		harness.deps.send = async (_token, _raw, threadId) => {
			attempts.push(threadId)
			return threadId
				? { kind: 'rejected', message: 'Invalid thread' }
				: { kind: 'sent', messageId: 'gm2', threadId: 'gt2' }
		}

		const result = await sendContactReply(
			harness.deps,
			input(KEY_B, 'Second')
		)

		expect(attempts).toEqual(['gt1', null])
		expect(result.status).toBe('sent')
		expect(harness.rows[1].gmailThreadId).toBe('gt2')
	})

	it('asks for reauthorization when Gmail rejects the credentials', async () => {
		harness.state.outcome = { kind: 'auth_error' }
		const result = await sendContactReply(harness.deps, input())

		expect(result).toEqual({ status: 'needs_gmail', gmail: 'needs_reauth' })
		expect(harness.rows[0].status).toBe('failed')
	})

	it('records a rate limit as a failure', async () => {
		harness.state.outcome = { kind: 'rate_limited' }
		const result = await sendContactReply(harness.deps, input())

		expect(result.status).toBe('failed')
		expect(harness.rows[0].status).toBe('failed')
	})

	it('treats a timeout as uncertain and does not retry or mark it replied', async () => {
		harness.state.outcome = { kind: 'uncertain', message: 'timed out' }
		const result = await sendContactReply(harness.deps, input())

		expect(result.status).toBe('uncertain')
		expect(harness.sends).toHaveLength(1)
		expect(harness.rows[0].status).toBe('uncertain')
		expect(harness.submission.repliedAt).toBeNull()
	})

	it('reports an uncertain state when Gmail accepted but the database write failed', async () => {
		harness.state.failMarkSent = true
		const result = await sendContactReply(harness.deps, input())

		expect(result.status).toBe('uncertain')
		expect(harness.sends).toHaveLength(1)
		expect(harness.rows[0].status).toBe('pending')

		const again = await sendContactReply(harness.deps, input())
		expect(again.status).toBe('duplicate')
		expect(harness.sends).toHaveLength(1)
	})

	it('limits replies per message per hour', async () => {
		for (let index = 0; index < HOURLY_SEND_LIMIT_PER_MESSAGE; index += 1) {
			const key = `00000000-0000-4000-8000-00000000000${index}`
			expect(
				(await sendContactReply(harness.deps, input(key))).status
			).toBe('sent')
		}

		const result = await sendContactReply(harness.deps, input())
		expect(result.status).toBe('rate_limited')
		expect(harness.sends).toHaveLength(HOURLY_SEND_LIMIT_PER_MESSAGE)
	})

	it('replays an idempotency key only for its own submission', async () => {
		await sendContactReply(harness.deps, input())
		harness.rows[0].submissionId = 'other'

		const result = await sendContactReply(harness.deps, input())
		expect(result.status).toBe('invalid')
	})
})

describe('toInboxReply', () => {
	it('reports a long-pending reply as uncertain', () => {
		const harness = createHarness()
		const row: StoredReply = {
			id: 'r1',
			submissionId: 's1',
			fromEmail: 'a@b.c',
			toEmail: 'd@e.f',
			subject: 'Re: x',
			body: 'hi',
			status: 'pending',
			gmailMessageId: null,
			gmailThreadId: null,
			rfcMessageId: '<x@y>',
			idempotencyKey: KEY_A,
			createdAt: NOW,
			sentAt: null,
			failedAt: null,
			lastError: null
		}
		void harness

		expect(toInboxReply(row, new Date(NOW.getTime() + 1000)).status).toBe(
			'pending'
		)
		expect(
			toInboxReply(row, new Date(NOW.getTime() + STALE_PENDING_MS + 1))
				.status
		).toBe('uncertain')
	})
})

describe('resolveUncertainReply', () => {
	it('settles an uncertain reply as sent and marks the message replied', async () => {
		const harness = createHarness()
		harness.state.outcome = { kind: 'uncertain', message: 'timed out' }
		const sent = await sendContactReply(harness.deps, input())
		if (sent.status !== 'uncertain') throw new Error('expected uncertain')

		const result = await resolveUncertainReply(
			harness.deps,
			sent.reply.id,
			'sent'
		)

		expect(result.status).toBe('resolved')
		expect(harness.rows[0].status).toBe('sent')
		expect(harness.submission.repliedAt).toEqual(NOW)
	})

	it('settles an uncertain reply as failed', async () => {
		const harness = createHarness()
		harness.state.outcome = { kind: 'uncertain', message: 'timed out' }
		const sent = await sendContactReply(harness.deps, input())
		if (sent.status !== 'uncertain') throw new Error('expected uncertain')

		await resolveUncertainReply(harness.deps, sent.reply.id, 'failed')
		expect(harness.rows[0].status).toBe('failed')
	})

	it('refuses to change a reply that is already sent or fails auth', async () => {
		const harness = createHarness()
		const sent = await sendContactReply(harness.deps, input())
		if (sent.status !== 'sent') throw new Error('expected sent')

		expect(
			(await resolveUncertainReply(harness.deps, sent.reply.id, 'failed'))
				.status
		).toBe('not_uncertain')

		harness.state.admin = null
		expect(
			(await resolveUncertainReply(harness.deps, sent.reply.id, 'failed'))
				.status
		).toBe('unauthorized')
	})
})
