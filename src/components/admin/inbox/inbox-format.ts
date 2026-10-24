import type { InboxFolder, InboxReply, InboxReplyStatus } from './types'

const MINUTE_MS = 60 * 1000
const DAY_MS = 24 * 60 * MINUTE_MS
const STALE_PENDING_MS = 2 * MINUTE_MS

export const INBOX_FOLDERS = [
	{ key: 'inbox', label: 'Inbox' },
	{ key: 'unread', label: 'Unread' },
	{ key: 'starred', label: 'Starred' },
	{ key: 'archived', label: 'Archived' }
] as const satisfies readonly { key: InboxFolder; label: string }[]

/**
 * @name getMessageSubject
 * @description Returns the subject a visitor typed, or a fallback built from
 * their name when the subject was left empty.
 *
 * @example
 * getMessageSubject(message) // "Project question" or "Message from Noe F"
 */
export function getMessageSubject(message: {
	subject: string | null
	name: string
}) {
	const subject = message.subject?.trim()
	return subject ? subject : `Message from ${message.name}`
}

/**
 * @name formatListDate
 * @description Formats a message date for the list: the time today, the month
 * and day within the year, and the full date before that.
 *
 * @example
 * formatListDate('2026-10-14T16:46:00Z', new Date()) // "Oct 14"
 */
export function formatListDate(iso: string, now: Date) {
	const date = new Date(iso)

	if (date.toDateString() === now.toDateString()) {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	if (date.getFullYear() === now.getFullYear()) {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		})
	}

	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})
}

/**
 * @name formatFullDate
 * @description Formats a message date with weekday, date and time for the
 * reading pane, plus a relative hint for messages from the last week.
 *
 * @example
 * formatFullDate('2026-10-14T16:46:00Z', new Date())
 */
export function formatFullDate(iso: string, now: Date) {
	const date = new Date(iso)
	const absolute = date.toLocaleString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
	const age = now.getTime() - date.getTime()

	if (age < 0 || age >= 7 * DAY_MS) return absolute
	if (age < MINUTE_MS) return `${absolute} (just now)`
	if (age < 60 * MINUTE_MS) {
		return `${absolute} (${Math.floor(age / MINUTE_MS)} min ago)`
	}
	if (age < DAY_MS) {
		return `${absolute} (${Math.floor(age / (60 * MINUTE_MS))} h ago)`
	}
	return `${absolute} (${Math.floor(age / DAY_MS)} d ago)`
}

/**
 * @name getEffectiveReplyStatus
 * @description Returns the status to show for a reply. A reply still pending
 * after two minutes is treated as uncertain, matching the server.
 *
 * @example
 * getEffectiveReplyStatus(reply, new Date()) // "uncertain"
 */
export function getEffectiveReplyStatus(
	reply: Pick<InboxReply, 'status' | 'createdAt'>,
	now: Date
): InboxReplyStatus {
	if (reply.status !== 'pending') return reply.status
	const age = now.getTime() - new Date(reply.createdAt).getTime()
	return age > STALE_PENDING_MS ? 'uncertain' : 'pending'
}
