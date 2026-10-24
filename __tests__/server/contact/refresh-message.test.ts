import { beforeEach, describe, expect, it, vi } from 'vitest'

const COUNTS = { inbox: 1, unread: 1, starred: 0, archived: 0 }

const mocks = vi.hoisted(() => ({
	isAdmin: vi.fn(),
	revalidatePath: vi.fn(),
	getInboxCounts: vi.fn(),
	getInboxDetail: vi.fn(),
	getInboxPage: vi.fn(),
	update: vi.fn(),
	del: vi.fn()
}))

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/server/db/connection', () => ({
	db: { update: mocks.update, delete: mocks.del }
}))
vi.mock('@/utils/is-admin', () => ({ isAdmin: mocks.isAdmin }))
vi.mock('@/server/queries/contact-inbox', () => ({
	getInboxCounts: mocks.getInboxCounts,
	getInboxDetail: mocks.getInboxDetail,
	getInboxPage: mocks.getInboxPage
}))

import { refreshMessage } from '@/server/actions/contact/inbox'

describe('refreshMessage', () => {
	beforeEach(() => {
		mocks.isAdmin.mockReset().mockResolvedValue(true)
		mocks.revalidatePath.mockReset()
		mocks.update.mockReset()
		mocks.del.mockReset()
		mocks.getInboxCounts.mockReset().mockResolvedValue(COUNTS)
		mocks.getInboxDetail.mockReset().mockResolvedValue({ id: 'm1' })
	})

	it('refuses a non admin without loading anything', async () => {
		mocks.isAdmin.mockResolvedValue(false)

		expect(await refreshMessage('m1')).toBeNull()
		expect(mocks.getInboxDetail).not.toHaveBeenCalled()
		expect(mocks.getInboxCounts).not.toHaveBeenCalled()
		expect(mocks.update).not.toHaveBeenCalled()
	})

	it('returns detail and counts without any write or revalidation', async () => {
		const result = await refreshMessage('m1')

		expect(result).toEqual({ detail: { id: 'm1' }, counts: COUNTS })
		expect(mocks.update).not.toHaveBeenCalled()
		expect(mocks.del).not.toHaveBeenCalled()
		expect(mocks.revalidatePath).not.toHaveBeenCalled()
	})

	it('returns null when the message no longer exists', async () => {
		mocks.getInboxDetail.mockResolvedValue(null)
		expect(await refreshMessage('gone')).toBeNull()
	})
})
