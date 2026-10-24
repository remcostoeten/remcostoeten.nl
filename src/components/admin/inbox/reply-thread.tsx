'use client'

import {
	CheckCheck,
	CircleAlert,
	CircleHelp,
	ExternalLink,
	LoaderCircle
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { resolveReply } from '@/server/actions/contact/reply'
import { cn } from '@/shared/lib/cn'
import { formatFullDate, getEffectiveReplyStatus } from './inbox-format'
import type { InboxReply } from './types'

type Props = {
	replies: InboxReply[]
	onResolved: (reply: InboxReply) => void
}

const STATUS_LABEL = {
	// TODO: handle bounces (read Gmail delivery failure notices via a read scope and mark the reply failed)
	sent: 'Sent',
	failed: 'Not sent',
	uncertain: 'Delivery unconfirmed',
	pending: 'Sending'
} as const

const STATUS_ICON = {
	sent: CheckCheck,
	failed: CircleAlert,
	uncertain: CircleHelp,
	pending: LoaderCircle
} as const

function ReplyItem({
	reply,
	onResolved
}: {
	reply: InboxReply
	onResolved: (reply: InboxReply) => void
}) {
	const [busy, setBusy] = useState(false)
	const now = new Date()
	const status = getEffectiveReplyStatus(reply, now)
	const StatusIcon = STATUS_ICON[status]
	const timestamp = reply.sentAt ?? reply.createdAt

	async function resolve(outcome: 'sent' | 'failed') {
		setBusy(true)
		try {
			const result = await resolveReply(reply.id, outcome)
			if (result.status === 'resolved') onResolved(result.reply)
			else toast.error('This reply can no longer be settled')
		} catch {
			toast.error('Could not update the reply')
		} finally {
			setBusy(false)
		}
	}

	return (
		<article
			aria-busy={busy || status === 'pending'}
			className="admin-card"
		>
			<header className="flex flex-wrap items-center justify-between gap-2 admin-text-xs">
				<p className="min-w-0 truncate">
					<span className="font-medium">You</span>
					<span className="text-muted-foreground">
						{' '}
						from {reply.fromEmail} to {reply.toEmail}
					</span>
				</p>
				<span
					role="status"
					aria-live="polite"
					className={cn(
						'admin-text-xs inline-flex shrink-0 items-center gap-1',
						status === 'sent' && 'admin-text-success',
						status === 'failed' && 'admin-text-danger',
						status === 'uncertain' && 'admin-text-warning',
						status === 'pending' && 'admin-text-muted'
					)}
				>
					<StatusIcon
						aria-hidden="true"
						className={cn(
							'size-3',
							status === 'pending' && 'animate-spin'
						)}
					/>
					{STATUS_LABEL[status]}
					<span aria-hidden="true">·</span>
					<time dateTime={timestamp}>
						{formatFullDate(timestamp, now)}
					</time>
				</span>
			</header>

			<p className="mt-3 whitespace-pre-wrap admin-text-base break-words text-foreground/90">
				{reply.body}
			</p>

			{status === 'sent' && reply.gmailThreadId && (
				<a
					href={`https://mail.google.com/mail/u/${encodeURIComponent(reply.fromEmail)}/#all/${reply.gmailThreadId}`}
					target="_blank"
					rel="noreferrer"
					className="mt-3 admin-text-xs admin-text-muted inline-flex items-center gap-1 hover:text-foreground"
				>
					<ExternalLink aria-hidden="true" className="size-3" />
					Open in Gmail
					<span className="sr-only">(opens in a new tab)</span>
				</a>
			)}

			{status === 'failed' && reply.lastError && (
				<p className="admin-text-xs admin-text-danger mt-3">
					{reply.lastError}
				</p>
			)}

			{status === 'uncertain' && (
				<div className="mt-3 space-y-2 border-t border-border pt-3">
					<p className="admin-text-xs admin-text-muted">
						Gmail did not confirm this email. Look for it in your
						Gmail Sent folder, then record what you found.
					</p>
					<div
						role="group"
						aria-label="Record whether this reply was sent"
						className="flex gap-2"
					>
						<button
							type="button"
							disabled={busy}
							aria-disabled={busy}
							onClick={() => resolve('sent')}
							className="admin-btn"
						>
							It was sent
						</button>
						<button
							type="button"
							disabled={busy}
							aria-disabled={busy}
							onClick={() => resolve('failed')}
							className="admin-btn"
						>
							It was not sent
						</button>
					</div>
				</div>
			)}
		</article>
	)
}

export function ReplyThread({ replies, onResolved }: Props) {
	if (replies.length === 0) return null

	return (
		<section
			aria-labelledby="reply-thread-heading"
			className="mt-8 space-y-3"
		>
			<h2 id="reply-thread-heading" className="sr-only">
				Replies
			</h2>
			{replies.map(reply => (
				<ReplyItem
					key={reply.id}
					reply={reply}
					onResolved={onResolved}
				/>
			))}
		</section>
	)
}
