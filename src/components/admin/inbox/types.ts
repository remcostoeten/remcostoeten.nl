export type InboxFolder = 'inbox' | 'unread' | 'starred' | 'archived'

export type InboxFlag = 'read' | 'starred' | 'archived'

export type InboxReplyStatus = 'pending' | 'sent' | 'failed' | 'uncertain'

export type InboxCounts = Record<InboxFolder, number>

export type InboxItem = {
	id: string
	name: string
	email: string
	subject: string | null
	preview: string
	createdAt: string
	readAt: string | null
	starredAt: string | null
	archivedAt: string | null
	repliedAt: string | null
	lastReplyStatus: InboxReplyStatus | null
}

export type InboxReply = {
	id: string
	fromEmail: string
	toEmail: string
	subject: string
	body: string
	status: InboxReplyStatus
	gmailThreadId: string | null
	createdAt: string
	sentAt: string | null
	failedAt: string | null
	lastError: string | null
}

export type InboxDetail = Omit<InboxItem, 'preview' | 'lastReplyStatus'> & {
	message: string
	geoCity: string | null
	geoCountry: string | null
	replies: InboxReply[]
}

export type InboxPage = {
	items: InboxItem[]
	hasMore: boolean
}

export type ReplyTemplate = {
	id: string
	title: string
	body: string
}

export type ReplySnippets = {
	signature: string | null
	templates: ReplyTemplate[]
}

export type SnippetResult =
	| { success: true; snippets: ReplySnippets }
	| { success: false; error: string }

export type InboxBulkAction =
	| 'read'
	| 'unread'
	| 'archive'
	| 'unarchive'
	| 'delete'
