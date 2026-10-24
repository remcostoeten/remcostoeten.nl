import {
	Archive,
	ArchiveRestore,
	ArrowLeft,
	ChevronDown,
	ChevronUp,
	Copy,
	Mail,
	MailOpen,
	MapPin,
	Reply,
	Star,
	Trash2
} from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import type { GmailStatus } from '@/server/gmail/connection'
import { formatFullDate, getMessageSubject } from './inbox-format'
import { ReplyComposer } from './reply-composer'
import { ReplyThread } from './reply-thread'
import type { InboxDetail, InboxFlag, InboxReply, ReplySnippets } from './types'

type ReaderProps = {
	detail: InboxDetail | null
	loading: boolean
	gmail: GmailStatus
	snippets: ReplySnippets
	hasPrevious: boolean
	hasNext: boolean
	confirmingDelete: boolean
	composerOpen: boolean
	onBack: () => void
	onPrevious: () => void
	onNext: () => void
	onToggle: (flag: InboxFlag) => void
	onDelete: () => void
	onComposerChange: (open: boolean) => void
	onReplyChanged: (reply: InboxReply) => void
}

type ToolbarButtonProps = {
	label: string
	onClick: () => void
	disabled?: boolean
	children: ReactNode
}

function ToolbarButton({
	label,
	onClick,
	disabled,
	children
}: ToolbarButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			title={label}
			className={'admin-icon-btn disabled:opacity-40'}
		>
			{children}
		</button>
	)
}

export function MessageReader({
	detail,
	loading,
	gmail,
	snippets,
	hasPrevious,
	hasNext,
	confirmingDelete,
	composerOpen,
	onBack,
	onPrevious,
	onNext,
	onToggle,
	onDelete,
	onComposerChange,
	onReplyChanged
}: ReaderProps) {
	const [copied, setCopied] = useState(false)
	const [announcement, setAnnouncement] = useState('')
	const subjectId = useId()
	const replyButtonRef = useRef<HTMLButtonElement>(null)
	const wasComposerOpen = useRef(composerOpen)

	useEffect(() => {
		if (wasComposerOpen.current && !composerOpen) {
			replyButtonRef.current?.focus()
		}
		wasComposerOpen.current = composerOpen
	}, [composerOpen])

	function handleSent(reply: InboxReply) {
		setAnnouncement(`Reply sent from ${reply.fromEmail}`)
		onReplyChanged(reply)
	}

	function handleUnconfirmed(reply: InboxReply) {
		setAnnouncement('Reply could not be confirmed. Check the thread.')
		onReplyChanged(reply)
	}

	if (!detail) {
		return (
			<div className="flex min-h-0 flex-col" aria-busy={loading}>
				<div className="border-b border-border px-3 py-2 md:hidden">
					<button
						type="button"
						onClick={onBack}
						aria-label="Back to message list"
						className={'admin-icon-btn'}
					>
						<ArrowLeft className="size-4" aria-hidden="true" />
					</button>
				</div>
				<div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-muted-foreground">
					<Mail className="size-6" aria-hidden="true" />
					<p role="status" className="admin-text-sm">
						{loading
							? 'Loading message…'
							: 'Select a message to read it'}
					</p>
					{!loading && (
						<p className="admin-text-xs hidden md:block">
							j / k to move, r to reply, e to archive, s to star,
							u to mark unread
						</p>
					)}
				</div>
			</div>
		)
	}

	const isArchived = detail.archivedAt !== null
	const isStarred = detail.starredAt !== null
	const isRead = detail.readAt !== null
	const location = [detail.geoCity, detail.geoCountry]
		.filter(Boolean)
		.join(', ')

	async function copyEmail() {
		await navigator.clipboard.writeText(detail?.email ?? '')
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	return (
		<div className="flex min-h-0 min-w-0 flex-col">
			<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
				<div
					role="toolbar"
					aria-label="Message actions"
					className="flex items-center gap-0.5"
				>
					<button
						type="button"
						onClick={onBack}
						aria-label="Back to message list"
						className={'admin-icon-btn md:hidden'}
					>
						<ArrowLeft className="size-4" aria-hidden="true" />
					</button>
					<ToolbarButton
						label={isArchived ? 'Move to inbox (e)' : 'Archive (e)'}
						onClick={() => onToggle('archived')}
					>
						{isArchived ? (
							<ArchiveRestore
								className="size-4"
								aria-hidden="true"
							/>
						) : (
							<Archive className="size-4" aria-hidden="true" />
						)}
					</ToolbarButton>
					<ToolbarButton
						label={isStarred ? 'Remove star (s)' : 'Star (s)'}
						onClick={() => onToggle('starred')}
					>
						<Star
							aria-hidden="true"
							className={cn(
								'size-4',
								isStarred && 'admin-text-warning fill-current'
							)}
						/>
					</ToolbarButton>
					<ToolbarButton
						label={isRead ? 'Mark as unread (u)' : 'Mark as read'}
						onClick={() => onToggle('read')}
					>
						{isRead ? (
							<Mail className="size-4" aria-hidden="true" />
						) : (
							<MailOpen className="size-4" aria-hidden="true" />
						)}
					</ToolbarButton>
					<button
						type="button"
						onClick={onDelete}
						aria-label={
							confirmingDelete
								? 'Confirm delete'
								: 'Delete (Delete key)'
						}
						title={
							confirmingDelete
								? 'Confirm delete'
								: 'Delete (Delete key)'
						}
						className={cn(
							'admin-icon-btn',
							confirmingDelete &&
								'admin-text-xs admin-text-danger w-auto gap-2 px-2'
						)}
					>
						<Trash2 className="size-4" aria-hidden="true" />
						{confirmingDelete && 'Confirm delete'}
					</button>
				</div>
				<div
					role="toolbar"
					aria-label="Message navigation"
					className="flex items-center gap-0.5"
				>
					<ToolbarButton
						label="Newer message (k)"
						onClick={onPrevious}
						disabled={!hasPrevious}
					>
						<ChevronUp className="size-4" aria-hidden="true" />
					</ToolbarButton>
					<ToolbarButton
						label="Older message (j)"
						onClick={onNext}
						disabled={!hasNext}
					>
						<ChevronDown className="size-4" aria-hidden="true" />
					</ToolbarButton>
				</div>
			</div>

			<article
				aria-labelledby={subjectId}
				className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-8"
			>
				<h2
					id={subjectId}
					className="admin-display text-xl font-medium leading-snug break-words"
				>
					{getMessageSubject(detail)}
				</h2>

				<header className="mt-5 flex items-start gap-3 border-b border-border pb-5">
					<span
						aria-hidden="true"
						className="flex size-9 shrink-0 items-center justify-center rounded-full admin-text-sm bg-secondary font-medium uppercase"
					>
						{detail.name.trim().charAt(0) || '?'}
					</span>
					<div className="min-w-0 flex-1 space-y-0.5">
						<p className="admin-text-sm flex flex-wrap items-baseline gap-x-2">
							<span className="font-medium">{detail.name}</span>
							<span className="truncate text-muted-foreground">
								{detail.email}
							</span>
						</p>
						<p className="admin-text-xs admin-text-muted">
							<time
								dateTime={new Date(
									detail.createdAt
								).toISOString()}
							>
								{formatFullDate(detail.createdAt, new Date())}
							</time>
						</p>
						{location && (
							<p className="admin-text-xs admin-text-muted flex items-center gap-1">
								<MapPin className="size-3" aria-hidden="true" />
								{location}
							</p>
						)}
					</div>
				</header>

				<div className="mt-6 max-w-[68ch] whitespace-pre-wrap admin-text-base break-words text-foreground/90">
					{detail.message}
				</div>

				<ReplyThread
					replies={detail.replies}
					onResolved={onReplyChanged}
				/>

				<p role="status" aria-live="polite" className="sr-only">
					{confirmingDelete
						? 'Press delete again to confirm. The message will be permanently removed.'
						: announcement}
				</p>

				<div className="mt-8 space-y-3">
					{composerOpen ? (
						<ReplyComposer
							key={detail.id}
							detail={detail}
							gmail={gmail}
							snippets={snippets}
							onSent={handleSent}
							onUnconfirmed={handleUnconfirmed}
							onClose={() => onComposerChange(false)}
						/>
					) : (
						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								ref={replyButtonRef}
								onClick={() => onComposerChange(true)}
								aria-keyshortcuts="r"
								className={'admin-btn'}
								data-variant="primary"
							>
								<Reply className="size-4" aria-hidden="true" />
								Reply
							</button>
							<button
								type="button"
								onClick={copyEmail}
								aria-label={
									copied
										? 'Email address copied'
										: `Copy email address ${detail.email}`
								}
								className={'admin-btn'}
							>
								<Copy className="size-4" aria-hidden="true" />
								{copied ? 'Copied' : 'Copy email'}
							</button>
						</div>
					)}
				</div>
			</article>
		</div>
	)
}
