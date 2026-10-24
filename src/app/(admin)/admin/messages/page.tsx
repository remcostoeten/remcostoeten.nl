import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Inbox } from '@/components/admin/inbox/inbox'
import { getGmailStatus } from '@/server/gmail/connection'
import {
	getInboxCounts,
	getInboxDetail,
	getInboxPage
} from '@/server/queries/contact-inbox'
import { getReplySnippets } from '@/server/queries/reply-snippets'

type Props = {
	searchParams: Promise<{ id?: string }>
}

export default async function AdminMessagesPage({ searchParams }: Props) {
	const { id } = await searchParams
	const [page, counts, detail, gmail, snippets] = await Promise.all([
		getInboxPage('inbox', '', 0),
		getInboxCounts(),
		id ? getInboxDetail(id) : null,
		getGmailStatus(),
		getReplySnippets()
	])

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Messages"
				description="Everything sent through the contact form, with replies sent from your Gmail."
			/>
			<Inbox
				initialPage={page}
				initialCounts={counts}
				initialDetail={detail}
				gmail={gmail}
				snippets={snippets}
			/>
		</div>
	)
}
