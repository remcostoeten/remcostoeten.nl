import { describe, expect, it } from 'vitest'
import {
	applyBulkToItems,
	applyReplyToDetail,
	getBulkFlag,
	getBulkStep,
	mergeById
} from '@/components/admin/inbox/inbox-logic'
import type {
	InboxDetail,
	InboxItem,
	InboxReply
} from '@/components/admin/inbox/types'

function makeItem(id: string, patch: Partial<InboxItem> = {}): InboxItem {
	return {
		id,
		name: 'Noe F',
		email: 'noe@example.com',
		subject: null,
		preview: '',
		createdAt: '2026-10-24T09:00:00.000Z',
		readAt: null,
		starredAt: null,
		archivedAt: null,
		repliedAt: null,
		lastReplyStatus: null,
		...patch
	}
}

function makeReply(id: string, patch: Partial<InboxReply> = {}): InboxReply {
	return {
		id,
		fromEmail: 'me@example.com',
		toEmail: 'noe@example.com',
		subject: 'Re: Hi',
		body: 'Thanks',
		status: 'uncertain',
		gmailThreadId: null,
		createdAt: '2026-10-24T10:00:00.000Z',
		sentAt: null,
		failedAt: null,
		lastError: null,
		...patch
	}
}

function makeDetail(patch: Partial<InboxDetail> = {}): InboxDetail {
	const base = makeItem('m1') as Partial<InboxItem>
	delete base.preview
	delete base.lastReplyStatus
	return {
		...(base as Omit<
			InboxDetail,
			'message' | 'geoCity' | 'geoCountry' | 'replies'
		>),
		message: 'Hello',
		geoCity: null,
		geoCountry: null,
		replies: [],
		...patch
	}
}

const NOW = '2026-10-24T12:00:00.000Z'

describe('getBulkFlag', () => {
	it('maps each action to a flag and value', () => {
		expect(getBulkFlag('read')).toEqual({ flag: 'read', value: true })
		expect(getBulkFlag('unread')).toEqual({ flag: 'read', value: false })
		expect(getBulkFlag('archive')).toEqual({
			flag: 'archived',
			value: true
		})
		expect(getBulkFlag('unarchive')).toEqual({
			flag: 'archived',
			value: false
		})
	})
})

describe('getBulkStep', () => {
	it('ignores an empty selection', () => {
		expect(getBulkStep('delete', 0, true)).toBe('ignore')
		expect(getBulkStep('read', 0, false)).toBe('ignore')
	})

	it('requires a second click to delete', () => {
		expect(getBulkStep('delete', 2, false)).toBe('confirm')
		expect(getBulkStep('delete', 2, true)).toBe('run')
	})

	it('runs non-delete actions immediately', () => {
		expect(getBulkStep('archive', 2, false)).toBe('run')
		expect(getBulkStep('unread', 1, false)).toBe('run')
	})
})

describe('applyBulkToItems', () => {
	const items = [makeItem('a'), makeItem('b', { readAt: NOW }), makeItem('c')]
	const selected = new Set(['a', 'b'])

	it('marks selected items read', () => {
		const result = applyBulkToItems(items, selected, 'read', NOW)
		expect(result.map(item => item.readAt)).toEqual([NOW, NOW, null])
	})

	it('marks selected items unread', () => {
		const result = applyBulkToItems(items, selected, 'unread', NOW)
		expect(result.map(item => item.readAt)).toEqual([null, null, null])
	})

	it.each(['archive', 'unarchive', 'delete'] as const)(
		'removes selected items on %s',
		action => {
			const result = applyBulkToItems(items, selected, action, NOW)
			expect(result.map(item => item.id)).toEqual(['c'])
		}
	)
})

describe('mergeById', () => {
	it('appends only unseen items', () => {
		const result = mergeById(
			[makeItem('a')],
			[makeItem('a'), makeItem('b')]
		)
		expect(result.map(item => item.id)).toEqual(['a', 'b'])
	})
})

describe('applyReplyToDetail', () => {
	it('appends a new uncertain reply without setting repliedAt', () => {
		const { detailPatch, itemPatch } = applyReplyToDetail(
			makeDetail(),
			makeReply('r1')
		)
		expect(detailPatch.replies).toHaveLength(1)
		expect(detailPatch.repliedAt).toBeNull()
		expect(itemPatch.lastReplyStatus).toBe('uncertain')
	})

	it('replaces an uncertain reply resolved as sent', () => {
		const detail = makeDetail({ replies: [makeReply('r1')] })
		const resolved = makeReply('r1', { status: 'sent', sentAt: NOW })
		const { detailPatch, itemPatch } = applyReplyToDetail(detail, resolved)
		expect(detailPatch.replies).toEqual([resolved])
		expect(detailPatch.repliedAt).toBe(NOW)
		expect(detailPatch.readAt).toBe(NOW)
		expect(itemPatch.lastReplyStatus).toBe('sent')
	})

	it('keeps repliedAt when resolved as failed', () => {
		const detail = makeDetail({
			readAt: '2026-10-24T09:30:00.000Z',
			replies: [makeReply('r1')]
		})
		const resolved = makeReply('r1', { status: 'failed', failedAt: NOW })
		const { detailPatch, itemPatch } = applyReplyToDetail(detail, resolved)
		expect(detailPatch.repliedAt).toBeNull()
		expect(detailPatch.readAt).toBe('2026-10-24T09:30:00.000Z')
		expect(itemPatch.lastReplyStatus).toBe('failed')
	})
})
