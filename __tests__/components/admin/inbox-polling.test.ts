import { describe, expect, it } from 'vitest'
import {
	mergeRefreshedDetail,
	mergeReplyStatuses,
	shouldPoll
} from '@/components/admin/inbox/inbox-logic'
import type {
	InboxDetail,
	InboxItem,
	InboxReply
} from '@/components/admin/inbox/types'

function reply(id: string, status: InboxReply['status']): InboxReply {
	return {
		id,
		fromEmail: 'a@b.c',
		toEmail: 'd@e.f',
		subject: 's',
		body: 'b',
		status,
		gmailThreadId: null,
		createdAt: '2026-01-01T00:00:00.000Z',
		sentAt: null,
		failedAt: null,
		lastError: null
	}
}

function item(id: string, status: InboxItem['lastReplyStatus']): InboxItem {
	return {
		id,
		name: 'n',
		email: 'e',
		subject: null,
		preview: 'p',
		createdAt: '2026-01-01T00:00:00.000Z',
		readAt: null,
		starredAt: null,
		archivedAt: null,
		repliedAt: null,
		lastReplyStatus: status
	} as InboxItem
}

function detail(id: string, replies: InboxReply[]): InboxDetail {
	return {
		id,
		name: 'n',
		email: 'e',
		subject: null,
		message: 'm',
		geoCity: null,
		geoCountry: null,
		createdAt: '2026-01-01T00:00:00.000Z',
		readAt: null,
		starredAt: null,
		archivedAt: null,
		repliedAt: null,
		replies
	} as InboxDetail
}

describe('shouldPoll', () => {
	it('polls for pending or uncertain replies in the open thread', () => {
		expect(shouldPoll(detail('1', [reply('r', 'pending')]), [])).toBe(true)
		expect(shouldPoll(detail('1', [reply('r', 'uncertain')]), [])).toBe(
			true
		)
	})

	it('polls for a pending list item', () => {
		expect(shouldPoll(null, [item('1', 'pending')])).toBe(true)
	})

	it('stops when nothing is pending', () => {
		expect(
			shouldPoll(
				detail('1', [reply('r', 'sent'), reply('q', 'failed')]),
				[item('1', 'sent'), item('2', 'uncertain'), item('3', null)]
			)
		).toBe(false)
		expect(shouldPoll(null, [])).toBe(false)
	})
})

describe('mergeRefreshedDetail', () => {
	it('takes replies but keeps current flags', () => {
		const current = {
			...detail('1', [reply('r', 'pending')]),
			starredAt: 'x'
		}
		const fresh = {
			...detail('1', [reply('r', 'sent')]),
			repliedAt: 'y',
			readAt: 'z'
		}
		const merged = mergeRefreshedDetail(current, fresh)
		expect(merged?.replies[0].status).toBe('sent')
		expect(merged?.repliedAt).toBe('y')
		expect(merged?.starredAt).toBe('x')
		expect(merged?.readAt).toBeNull()
	})

	it('ignores a different message or no current detail', () => {
		const current = detail('1', [])
		expect(mergeRefreshedDetail(current, detail('2', []))).toBe(current)
		expect(mergeRefreshedDetail(null, detail('2', []))).toBeNull()
	})
})

describe('mergeReplyStatuses', () => {
	it('updates only reply fields and keeps order and untouched items', () => {
		const a = item('a', 'pending')
		const b = item('b', 'sent')
		const merged = mergeReplyStatuses(
			[a, b],
			[
				{ ...item('b', 'sent') },
				{ ...item('a', 'uncertain'), readAt: 'q' }
			]
		)
		expect(merged.map(i => i.id)).toEqual(['a', 'b'])
		expect(merged[0].lastReplyStatus).toBe('uncertain')
		expect(merged[0].readAt).toBeNull()
		expect(merged[1]).toBe(b)
	})
})
