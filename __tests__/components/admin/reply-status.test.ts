import { describe, expect, it } from 'vitest'
import { getEffectiveReplyStatus } from '@/components/admin/inbox/inbox-format'

const now = new Date('2026-10-24T12:00:00Z')

function at(secondsAgo: number) {
	return new Date(now.getTime() - secondsAgo * 1000).toISOString()
}

describe('getEffectiveReplyStatus', () => {
	it('keeps a fresh pending reply pending', () => {
		expect(
			getEffectiveReplyStatus(
				{ status: 'pending', createdAt: at(30) },
				now
			)
		).toBe('pending')
	})

	it('keeps a reply pending at exactly two minutes', () => {
		expect(
			getEffectiveReplyStatus(
				{ status: 'pending', createdAt: at(120) },
				now
			)
		).toBe('pending')
	})

	it('treats a pending reply older than two minutes as uncertain', () => {
		expect(
			getEffectiveReplyStatus(
				{ status: 'pending', createdAt: at(121) },
				now
			)
		).toBe('uncertain')
	})

	it('never changes settled statuses', () => {
		for (const status of ['sent', 'failed', 'uncertain'] as const) {
			expect(
				getEffectiveReplyStatus({ status, createdAt: at(9999) }, now)
			).toBe(status)
		}
	})
})
