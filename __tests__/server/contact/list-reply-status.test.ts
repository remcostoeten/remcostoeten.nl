import { describe, expect, it, vi } from 'vitest'

vi.mock('next/server', () => ({ connection: vi.fn() }))
vi.mock('@/server/db/connection', () => ({ db: {} }))
vi.mock('@/server/queries/auth', () => ({ requireAdmin: vi.fn() }))

import { toListReplyStatus } from '@/server/queries/contact-inbox'
import { STALE_PENDING_MS } from '@/server/gmail/reply-service'

const NOW = new Date('2026-01-01T12:00:00.000Z')

describe('toListReplyStatus', () => {
	it('keeps a fresh pending reply pending', () => {
		const createdAt = new Date(NOW.getTime() - STALE_PENDING_MS + 1000)
		expect(toListReplyStatus('pending', createdAt, NOW)).toBe('pending')
	})

	it('reports a stale pending reply as uncertain', () => {
		const createdAt = new Date(NOW.getTime() - STALE_PENDING_MS - 1000)
		expect(toListReplyStatus('pending', createdAt, NOW)).toBe('uncertain')
		expect(toListReplyStatus('pending', createdAt.toISOString(), NOW)).toBe(
			'uncertain'
		)
	})

	it('leaves other statuses alone', () => {
		const old = new Date(0)
		expect(toListReplyStatus('sent', old, NOW)).toBe('sent')
		expect(toListReplyStatus('failed', old, NOW)).toBe('failed')
		expect(toListReplyStatus(null, null, NOW)).toBeNull()
	})
})
