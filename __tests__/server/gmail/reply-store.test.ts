import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StoredReply } from '@/server/gmail/reply-service'

const mocks = vi.hoisted(() => {
	const calls: { op: string; args: unknown[] }[] = []
	const state = { result: [] as unknown[] }

	function chain(op: string) {
		const target: Record<string, unknown> = {}
		const proxy: unknown = new Proxy(target, {
			get: (_, key) => {
				if (key === 'then') {
					return (resolve: (value: unknown) => void) =>
						resolve(state.result)
				}
				return (...args: unknown[]) => {
					calls.push({ op: `${op}.${String(key)}`, args })
					return proxy
				}
			}
		})
		return proxy
	}

	return {
		calls,
		state,
		db: {
			select: (...args: unknown[]) => {
				calls.push({ op: 'select', args })
				return chain('select')
			},
			insert: () => chain('insert'),
			update: () => chain('update'),
			batch: vi.fn(async (statements: unknown[]) => {
				calls.push({ op: 'batch', args: statements })
				return []
			})
		}
	}
})

vi.mock('@/server/db/connection', () => ({ db: mocks.db }))

import { replyStore } from '@/server/gmail/reply-store'

const AT = new Date('2026-10-24T12:00:00Z')

function reply(overrides: Partial<StoredReply> = {}): StoredReply {
	return {
		id: 'r1',
		submissionId: 's1',
		fromEmail: 'remco@gmail.com',
		toEmail: 'visitor@example.com',
		subject: 'Re: Quote',
		body: 'Hello',
		status: 'pending',
		gmailMessageId: null,
		gmailThreadId: null,
		rfcMessageId: '<a@remcostoeten.nl>',
		idempotencyKey: '3b241101-e2bb-4255-8caf-4136c566a962',
		createdAt: AT,
		sentAt: null,
		failedAt: null,
		lastError: null,
		...overrides
	}
}

function called(op: string) {
	return mocks.calls.filter(call => call.op === op)
}

describe('replyStore', () => {
	beforeEach(() => {
		mocks.calls.length = 0
		mocks.state.result = []
		mocks.db.batch.mockClear()
	})

	describe('findSubmission', () => {
		it('selects only id, email and subject so nothing else leaks to the sender', async () => {
			mocks.state.result = [
				{ id: 's1', email: 'visitor@example.com', subject: 'Quote' }
			]

			const row = await replyStore.findSubmission('s1')

			expect(row).toEqual({
				id: 's1',
				email: 'visitor@example.com',
				subject: 'Quote'
			})
			expect(
				Object.keys(mocks.calls[0].args[0] as object).sort()
			).toEqual(['email', 'id', 'subject'])
		})

		it('returns null when the submission does not exist', async () => {
			expect(await replyStore.findSubmission('missing')).toBeNull()
		})
	})

	describe('lookups', () => {
		it('findReplyById and findReplyByKey return null when nothing matches', async () => {
			expect(await replyStore.findReplyById('x')).toBeNull()
			expect(await replyStore.findReplyByKey('x')).toBeNull()
		})

		it('findReplyById and findReplyByKey return the stored row', async () => {
			mocks.state.result = [reply()]

			expect(await replyStore.findReplyById('r1')).toEqual(reply())
			expect(await replyStore.findReplyByKey('k')).toEqual(reply())
		})

		it('findSentReplies returns rows ordered by creation', async () => {
			mocks.state.result = [reply({ status: 'sent' })]

			expect(await replyStore.findSentReplies('s1')).toEqual([
				reply({ status: 'sent' })
			])
			expect(called('select.orderBy')).toHaveLength(1)
		})
	})

	describe('countRecentReplies', () => {
		it('returns the total with and without a submission filter', async () => {
			mocks.state.result = [{ total: 3 }]

			expect(await replyStore.countRecentReplies(AT, null)).toBe(3)
			expect(await replyStore.countRecentReplies(AT, 's1')).toBe(3)
			expect(called('select.where')).toHaveLength(2)
		})
	})

	describe('insertPending', () => {
		it('inserts with conflict handling on the idempotency key', async () => {
			mocks.state.result = [reply()]

			expect(await replyStore.insertPending(reply())).toEqual(reply())
			expect(called('insert.values')[0].args[0]).toEqual(reply())
			expect(called('insert.onConflictDoNothing')).toHaveLength(1)
		})

		it('returns null when the key already exists', async () => {
			mocks.state.result = []

			expect(await replyStore.insertPending(reply())).toBeNull()
		})
	})

	describe('markSent', () => {
		it('updates the reply and the submission in one batch', async () => {
			await replyStore.markSent(
				'r1',
				's1',
				{ messageId: 'gm1', threadId: 'gt1' },
				AT
			)

			expect(mocks.db.batch).toHaveBeenCalledTimes(1)
			const sets = called('update.set').map(
				call => call.args[0]
			) as Record<string, unknown>[]
			expect(sets[0]).toMatchObject({
				status: 'sent',
				sentAt: AT,
				failedAt: null,
				lastError: null,
				gmailMessageId: 'gm1',
				gmailThreadId: 'gt1'
			})
			expect(sets[1].repliedAt).toBe(AT)
			expect(sets[1]).toHaveProperty('readAt')
		})

		it('leaves the Gmail ids untouched when none are known', async () => {
			await replyStore.markSent('r1', 's1', null, AT)

			const first = called('update.set')[0].args[0] as Record<
				string,
				unknown
			>
			expect(first).not.toHaveProperty('gmailMessageId')
			expect(first).not.toHaveProperty('gmailThreadId')
		})
	})

	describe('markUnsent', () => {
		it('sets failedAt only for a failed reply', async () => {
			await replyStore.markUnsent('r1', 'failed', 'boom', AT)
			await replyStore.markUnsent('r2', 'uncertain', 'unsure', AT)

			const sets = called('update.set').map(call => call.args[0])
			expect(sets).toEqual([
				{ status: 'failed', lastError: 'boom', failedAt: AT },
				{ status: 'uncertain', lastError: 'unsure', failedAt: null }
			])
		})
	})
})
