import { beforeEach, describe, expect, it, vi } from 'vitest'

const COUNTS = { inbox: 1, unread: 1, starred: 0, archived: 0 }

const mocks = vi.hoisted(() => {
	const calls: { op: string; args: unknown[] }[] = []

	function chain(op: string) {
		const target: Record<string, unknown> = {}
		const proxy: unknown = new Proxy(target, {
			get: (_, key) => {
				if (key === 'then') {
					return (resolve: (value: unknown) => void) => resolve([])
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
		isAdmin: vi.fn(),
		revalidatePath: vi.fn(),
		getInboxCounts: vi.fn(),
		getInboxDetail: vi.fn(),
		getInboxPage: vi.fn(),
		db: {
			update: () => chain('update'),
			delete: () => chain('delete')
		}
	}
})

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/server/db/connection', () => ({ db: mocks.db }))
vi.mock('@/utils/is-admin', () => ({ isAdmin: mocks.isAdmin }))
vi.mock('@/server/queries/contact-inbox', () => ({
	getInboxCounts: mocks.getInboxCounts,
	getInboxDetail: mocks.getInboxDetail,
	getInboxPage: mocks.getInboxPage
}))

import {
	deleteMessage,
	deleteMessages,
	loadInboxPage,
	openMessage,
	setMessageFlag,
	setMessagesFlag
} from '@/server/actions/contact/inbox'

function setValues() {
	return mocks.calls.find(call => call.op === 'update.set')?.args[0] as
		| Record<string, unknown>
		| undefined
}

function writeCount() {
	return mocks.calls.filter(call => call.op.endsWith('.where')).length
}

describe('contact inbox actions', () => {
	beforeEach(() => {
		mocks.calls.length = 0
		mocks.isAdmin.mockReset().mockResolvedValue(true)
		mocks.revalidatePath.mockReset()
		mocks.getInboxCounts.mockReset().mockResolvedValue(COUNTS)
		mocks.getInboxDetail.mockReset().mockResolvedValue({ id: 'm1' })
		mocks.getInboxPage.mockReset().mockResolvedValue({ items: [] })
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	describe('authorization', () => {
		beforeEach(() => {
			mocks.isAdmin.mockResolvedValue(false)
		})

		it('rejects every mutation for a non admin without touching the database', async () => {
			const results = await Promise.all([
				setMessageFlag('m1', 'read', true),
				deleteMessage('m1'),
				setMessagesFlag(['m1'], 'read', true),
				deleteMessages(['m1'])
			])

			for (const result of results) {
				expect(result).toEqual({
					success: false,
					error: 'Unauthorized'
				})
			}
			expect(writeCount()).toBe(0)
			expect(mocks.revalidatePath).not.toHaveBeenCalled()
		})

		it('returns null from openMessage and never marks the message read', async () => {
			expect(await openMessage('m1')).toBeNull()
			expect(writeCount()).toBe(0)
			expect(mocks.getInboxDetail).not.toHaveBeenCalled()
		})

		it('loadInboxPage refuses a non admin instead of loading messages', async () => {
			const page = await loadInboxPage('inbox', '', 0)
			expect(page).toEqual({ items: [], hasMore: false })
			expect(mocks.getInboxPage).not.toHaveBeenCalled()
		})
	})

	describe('loadInboxPage', () => {
		it('passes a valid folder, query and offset through', async () => {
			await loadInboxPage('unread', 'invoice', 30)
			expect(mocks.getInboxPage).toHaveBeenCalledWith(
				'unread',
				'invoice',
				30
			)
		})

		it('rejects an unknown folder', async () => {
			await expect(loadInboxPage('trash', '', 0)).rejects.toThrow()
			expect(mocks.getInboxPage).not.toHaveBeenCalled()
		})
	})

	describe('openMessage', () => {
		it('marks the message read, returns detail and counts and revalidates', async () => {
			const result = await openMessage('m1')

			expect(result).toEqual({ detail: { id: 'm1' }, counts: COUNTS })
			expect(setValues()?.readAt).toBeInstanceOf(Date)
			expect(mocks.revalidatePath).toHaveBeenCalledWith(
				'/admin',
				'layout'
			)
		})

		it('returns null and skips revalidation when the message is gone', async () => {
			mocks.getInboxDetail.mockResolvedValue(null)

			expect(await openMessage('missing')).toBeNull()
			expect(mocks.revalidatePath).not.toHaveBeenCalled()
		})
	})

	describe('setMessageFlag', () => {
		it.each([
			['read', 'readAt'],
			['starred', 'starredAt'],
			['archived', 'archivedAt']
		])('maps %s to the %s column', async (flag, column) => {
			const result = await setMessageFlag('m1', flag, true)

			expect(result).toEqual({ success: true, counts: COUNTS })
			expect(setValues()?.[column]).toBeInstanceOf(Date)
			expect(Object.keys(setValues() ?? {})).toEqual([column])
		})

		it('clears the column when the value is false', async () => {
			await setMessageFlag('m1', 'starred', false)
			expect(setValues()).toEqual({ starredAt: null })
		})

		it('rejects a flag that is not a known column', async () => {
			const result = await setMessageFlag('m1', 'repliedAt', true)

			expect(result.success).toBe(false)
			expect(writeCount()).toBe(0)
		})

		it('reports a database failure as an error result', async () => {
			mocks.getInboxCounts.mockRejectedValue(new Error('db down'))

			expect(await setMessageFlag('m1', 'read', true)).toEqual({
				success: false,
				error: 'db down'
			})
		})
	})

	describe('setMessagesFlag', () => {
		it('updates every id in one statement', async () => {
			const result = await setMessagesFlag(['a', 'b'], 'archived', true)

			expect(result).toEqual({ success: true, counts: COUNTS })
			expect(
				mocks.calls.filter(call => call.op === 'update.where')
			).toHaveLength(1)
			expect(setValues()?.archivedAt).toBeInstanceOf(Date)
		})

		it('rejects an empty list', async () => {
			expect((await setMessagesFlag([], 'read', true)).success).toBe(
				false
			)
			expect(writeCount()).toBe(0)
		})

		it('rejects more than 100 ids', async () => {
			const ids = Array.from({ length: 101 }, (_, index) => `id${index}`)

			expect((await setMessagesFlag(ids, 'read', true)).success).toBe(
				false
			)
			expect(writeCount()).toBe(0)
		})

		it('accepts exactly 100 ids', async () => {
			const ids = Array.from({ length: 100 }, (_, index) => `id${index}`)

			expect((await setMessagesFlag(ids, 'read', true)).success).toBe(
				true
			)
		})

		it('rejects blank ids and unknown flags', async () => {
			expect((await setMessagesFlag([''], 'read', true)).success).toBe(
				false
			)
			expect((await setMessagesFlag(['a'], 'nope', true)).success).toBe(
				false
			)
			expect(writeCount()).toBe(0)
		})
	})

	describe('deleteMessage and deleteMessages', () => {
		it('deletes one message and revalidates', async () => {
			const result = await deleteMessage('m1')

			expect(result).toEqual({ success: true, counts: COUNTS })
			expect(
				mocks.calls.filter(call => call.op === 'delete.where')
			).toHaveLength(1)
			expect(mocks.revalidatePath).toHaveBeenCalledWith(
				'/admin',
				'layout'
			)
		})

		it('deletes a batch and rejects an invalid batch', async () => {
			expect(await deleteMessages(['a', 'b'])).toEqual({
				success: true,
				counts: COUNTS
			})

			mocks.calls.length = 0
			expect((await deleteMessages([])).success).toBe(false)
			expect(writeCount()).toBe(0)
		})
	})
})
