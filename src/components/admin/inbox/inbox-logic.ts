import type {
	InboxBulkAction,
	InboxDetail,
	InboxFlag,
	InboxItem,
	InboxReply
} from './types'

export type FlagKey = 'readAt' | 'starredAt' | 'archivedAt'

export const FLAG_KEYS = {
	read: 'readAt',
	starred: 'starredAt',
	archived: 'archivedAt'
} as const satisfies Record<InboxFlag, FlagKey>

export const SEARCH_DEBOUNCE_MS = 250
export const CONFIRM_RESET_MS = 3000
export const POLL_INTERVAL_MS = 5000

/**
 * @name mergeById
 * @description Appends incoming items that are not already in the list.
 *
 * @example
 * mergeById([a], [a, b]) // [a, b]
 */
export function mergeById(current: InboxItem[], incoming: InboxItem[]) {
	const known = new Set(current.map(item => item.id))
	return [...current, ...incoming.filter(item => !known.has(item.id))]
}

/**
 * @name getBulkFlag
 * @description Maps a non-delete bulk action to the flag and value it sets.
 *
 * @example
 * getBulkFlag('unarchive') // { flag: 'archived', value: false }
 */
export function getBulkFlag(action: Exclude<InboxBulkAction, 'delete'>) {
	if (action === 'read' || action === 'unread') {
		return { flag: 'read', value: action === 'read' } as const
	}
	return { flag: 'archived', value: action === 'archive' } as const
}

/**
 * @name getBulkStep
 * @description Decides what a bulk action click does: nothing for an empty
 * selection, ask for confirmation on the first delete click, else run.
 *
 * @example
 * getBulkStep('delete', 2, false) // 'confirm'
 */
export function getBulkStep(
	action: InboxBulkAction,
	selectedCount: number,
	confirmingDelete: boolean
) {
	if (selectedCount === 0) return 'ignore'
	if (action === 'delete' && !confirmingDelete) return 'confirm'
	return 'run'
}

/**
 * @name isReadAction
 * @description True for the bulk actions that only change read state.
 *
 * @example
 * isReadAction('unread') // true
 */
export function isReadAction(action: InboxBulkAction) {
	return action === 'read' || action === 'unread'
}

/**
 * @name applyBulkToItems
 * @description Applies a successful bulk action to the list: read actions
 * stamp readAt on selected items, every other action removes them.
 *
 * @example
 * applyBulkToItems(items, new Set(['1']), 'archive', now) // without item 1
 */
export function applyBulkToItems(
	items: InboxItem[],
	selected: Set<string>,
	action: InboxBulkAction,
	now: string
) {
	if (isReadAction(action)) {
		const readAt = action === 'read' ? now : null
		return items.map(item =>
			selected.has(item.id) ? { ...item, readAt } : item
		)
	}
	return items.filter(item => !selected.has(item.id))
}

/**
 * @name applyReplyToDetail
 * @description Merges a sent, failed or resolved reply into a message detail
 * and returns the patches for the detail and its list row.
 *
 * @example
 * applyReplyToDetail(detail, reply).itemPatch.lastReplyStatus // 'sent'
 */
export function applyReplyToDetail(detail: InboxDetail, reply: InboxReply) {
	const replies = detail.replies.some(item => item.id === reply.id)
		? detail.replies.map(item => (item.id === reply.id ? reply : item))
		: [...detail.replies, reply]
	const repliedAt = reply.status === 'sent' ? reply.sentAt : detail.repliedAt
	const readAt = detail.readAt ?? repliedAt

	return {
		detailPatch: { replies, repliedAt, readAt },
		itemPatch: {
			repliedAt,
			readAt,
			lastReplyStatus: replies.at(-1)?.status ?? null
		}
	}
}

/**
 * @name shouldPoll
 * @description True when the open message has a pending or uncertain reply,
 * or any listed message last had a pending reply.
 *
 * @example
 * shouldPoll(detail, items) // true
 */
export function shouldPoll(detail: InboxDetail | null, items: InboxItem[]) {
	const threadOpen = detail?.replies.some(
		reply => reply.status === 'pending' || reply.status === 'uncertain'
	)
	return (
		Boolean(threadOpen) ||
		items.some(item => item.lastReplyStatus === 'pending')
	)
}

/**
 * @name mergeRefreshedDetail
 * @description Takes the replies and repliedAt from a refreshed detail while
 * keeping the current flags, so an optimistic toggle is not clobbered. Returns
 * the current detail untouched when the ids differ.
 *
 * @example
 * mergeRefreshedDetail(current, fresh).replies // fresh.replies
 */
export function mergeRefreshedDetail(
	current: InboxDetail | null,
	fresh: InboxDetail
) {
	if (!current || current.id !== fresh.id) return current
	return { ...current, replies: fresh.replies, repliedAt: fresh.repliedAt }
}

/**
 * @name mergeReplyStatuses
 * @description Updates lastReplyStatus and repliedAt on listed items from a
 * freshly loaded page, leaving every other field and the list order alone.
 *
 * @example
 * mergeReplyStatuses(items, page.items)
 */
export function mergeReplyStatuses(items: InboxItem[], fresh: InboxItem[]) {
	const byId = new Map(fresh.map(item => [item.id, item]))
	return items.map(item => {
		const next = byId.get(item.id)
		if (!next) return item
		if (
			next.lastReplyStatus === item.lastReplyStatus &&
			next.repliedAt === item.repliedAt
		) {
			return item
		}
		return {
			...item,
			lastReplyStatus: next.lastReplyStatus,
			repliedAt: next.repliedAt
		}
	})
}

/**
 * @name isTyping
 * @description True when the event target is a field the user types into.
 *
 * @example
 * isTyping(document.createElement('input')) // true
 */
export function isTyping(target: EventTarget | null) {
	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		(target instanceof HTMLElement && target.isContentEditable)
	)
}
