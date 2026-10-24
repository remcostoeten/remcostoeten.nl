import { describe, expect, it } from 'vitest'
import {
	formatFullDate,
	formatListDate,
	getMessageSubject
} from '@/components/admin/inbox/inbox-format'

describe('getMessageSubject', () => {
	it('falls back to the sender name for blank subjects', () => {
		expect(getMessageSubject({ subject: '   ', name: 'Noe F' })).toBe(
			'Message from Noe F'
		)
		expect(getMessageSubject({ subject: null, name: 'Noe F' })).toBe(
			'Message from Noe F'
		)
		expect(getMessageSubject({ subject: 'Hello', name: 'Noe F' })).toBe(
			'Hello'
		)
	})
})

describe('formatListDate', () => {
	it('shows a time for today and a date for older messages', () => {
		const now = new Date('2026-10-24T12:00:00')
		expect(formatListDate('2026-10-24T09:05:00', now)).toMatch(/9:05/)
		expect(formatListDate('2026-08-26T09:05:00', now)).toBe('Aug 26')
		expect(formatListDate('2025-08-26T09:05:00', now)).toBe('Aug 26, 2025')
	})
})

describe('formatFullDate', () => {
	it('adds a relative hint only within the last week', () => {
		const now = new Date('2026-10-24T12:00:00')
		expect(formatFullDate('2026-10-24T09:00:00', now)).toContain('3 h ago')
		expect(formatFullDate('2026-10-20T09:00:00', now)).toContain('4 d ago')
		expect(formatFullDate('2026-08-26T09:00:00', now)).not.toContain('ago')
	})
})
