import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { GmailStatusCard } from '@/components/admin/gmail/gmail-status-card'
import { ReplySnippetsCard } from '@/components/admin/gmail/reply-snippets-card'
import { getGmailStatus } from '@/server/gmail/connection'
import { requireAdmin } from '@/server/queries/auth'
import { getReplySnippets } from '@/server/queries/reply-snippets'

type Props = {
	searchParams: Promise<{ gmail?: string }>
}

export default async function AdminSettingsPage({ searchParams }: Props) {
	await requireAdmin()
	const [{ gmail }, status, snippets] = await Promise.all([
		searchParams,
		getGmailStatus(),
		getReplySnippets()
	])

	return (
		<div className="space-y-8">
			<AdminPageHeader
				title="Settings"
				description="Configure your site preferences."
			/>
			<div className="max-w-2xl space-y-6">
				<GmailStatusCard
					status={status}
					notice={
						gmail === 'linked' || gmail === 'error' ? gmail : null
					}
				/>
				<ReplySnippetsCard initial={snippets} />
			</div>
		</div>
	)
}
