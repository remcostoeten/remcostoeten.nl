'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { sendReply } from '@/server/actions/contact/reply'
import { createUuid } from '@/shared/helpers/uuid'
import { REPLY_MAX_LENGTH, buildReplySubject } from '@/shared/lib/contact-reply'
import type { GmailStatus } from '@/server/gmail/connection'
import { ConnectGmailButton } from '../gmail/connect-gmail-button'
import type {
	InboxDetail,
	InboxReply,
	ReplySnippets,
	ReplyTemplate
} from './types'

type Props = {
	detail: InboxDetail
	gmail: GmailStatus
	snippets: ReplySnippets
	onSent: (reply: InboxReply) => void
	onUnconfirmed: (reply: InboxReply) => void
	onClose: () => void
}

const NEEDS_GMAIL_COPY = {
	not_configured:
		'Gmail is not configured for this site. Add the Google OAuth credentials and enable the Gmail API.',
	disconnected:
		'Connect the Gmail account you want to reply from. Only the permission to send email is requested.',
	needs_reauth:
		'Google no longer accepts the saved permission. Connect Gmail again to send replies.',
	connected: ''
} as const

function composeBody(text: string, signature: string | null) {
	return signature ? `${text}\n\n${signature}` : text
}

function readUserText(body: string, signature: string | null) {
	const tail = signature ? `\n\n${signature}` : ''
	return tail && body.endsWith(tail) ? body.slice(0, -tail.length) : body
}

export function ReplyComposer({
	detail,
	gmail,
	snippets,
	onSent,
	onUnconfirmed,
	onClose
}: Props) {
	const signature = snippets.signature
	const baseId = useId()
	const bodyId = `${baseId}-body`
	const helpId = `${baseId}-help`
	const errorId = `${baseId}-error`
	const [body, setBody] = useState(() => composeBody('', signature))
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const [sending, setSending] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [gmailState, setGmailState] = useState(gmail.state)
	const idempotencyKey = useRef(createUuid())
	const inFlight = useRef(false)

	useEffect(() => {
		if (error) textareaRef.current?.focus()
	}, [error])

	useEffect(() => {
		textareaRef.current?.setSelectionRange(0, 0)
	}, [gmailState])

	const firstSent = detail.replies.find(reply => reply.status === 'sent')
	const subject = buildReplySubject(
		detail.subject,
		firstSent?.subject ?? null
	)

	const hasContent = readUserText(body, signature).trim() !== ''

	function insertTemplate(template: ReplyTemplate) {
		const firstName = detail.name.trim().split(/\s+/)[0] || 'there'
		const text = template.body.replaceAll('{name}', firstName)
		const current = readUserText(body, signature).trimEnd()
		setBody(
			composeBody(current ? `${current}\n\n${text}` : text, signature)
		)
	}

	if (gmailState !== 'connected') {
		return (
			<div
				role="group"
				aria-label="Gmail connection required"
				className="admin-card space-y-3"
			>
				<p role="status" className="admin-text-sm admin-text-muted">
					{NEEDS_GMAIL_COPY[gmailState]}
				</p>
				{gmailState !== 'not_configured' && (
					<ConnectGmailButton
						returnPath="/admin/messages"
						label={
							gmailState === 'needs_reauth'
								? 'Reauthorize Gmail'
								: 'Connect Gmail'
						}
						primary
					/>
				)}
			</div>
		)
	}

	async function submit() {
		if (inFlight.current || !hasContent) return
		inFlight.current = true
		setSending(true)
		setError(null)

		try {
			const result = await sendReply(
				detail.id,
				idempotencyKey.current,
				body
			)

			if (result.status === 'sent' || result.status === 'duplicate') {
				if (result.reply.status === 'sent') {
					toast.success(`Reply sent from ${result.reply.fromEmail}`)
					onSent(result.reply)
				} else {
					onUnconfirmed(result.reply)
				}
				idempotencyKey.current = createUuid()
				setBody('')
				onClose()
			} else if (result.status === 'uncertain') {
				toast.warning(result.error)
				onUnconfirmed(result.reply)
				idempotencyKey.current = createUuid()
				setBody('')
				onClose()
			} else if (result.status === 'needs_gmail') {
				setGmailState(result.gmail)
			} else if (result.status === 'unauthorized') {
				setError('Sign in as the admin to send replies.')
			} else if (result.status === 'not_found') {
				setError('This message no longer exists.')
			} else {
				setError(
					result.status === 'failed' ||
						result.status === 'invalid' ||
						result.status === 'rate_limited'
						? result.error
						: 'The reply could not be sent.'
				)
				idempotencyKey.current = createUuid()
			}
		} catch {
			setError(
				'The connection dropped before the server answered. Check the thread before sending again.'
			)
		} finally {
			inFlight.current = false
			setSending(false)
		}
	}

	return (
		<form
			onSubmit={event => {
				event.preventDefault()
				void submit()
			}}
			aria-label={`Reply to ${detail.name}`}
			aria-busy={sending}
			className="admin-card space-y-3"
		>
			<div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 admin-text-xs">
				<label htmlFor={`${baseId}-from`} className="admin-text-muted">
					From
				</label>
				<input
					id={`${baseId}-from`}
					readOnly
					value={gmail.email ?? ''}
					className="truncate bg-transparent"
				/>
				<label htmlFor={`${baseId}-to`} className="admin-text-muted">
					To
				</label>
				<input
					id={`${baseId}-to`}
					readOnly
					value={detail.email}
					className="truncate bg-transparent"
				/>
				<label
					htmlFor={`${baseId}-subject`}
					className="admin-text-muted"
				>
					Subject
				</label>
				<input
					id={`${baseId}-subject`}
					readOnly
					value={subject}
					className="truncate bg-transparent"
				/>
			</div>

			{snippets.templates.length > 0 && (
				<div
					className="flex flex-wrap items-center gap-2"
					role="group"
					aria-labelledby={`${baseId}-templates`}
				>
					<span
						id={`${baseId}-templates`}
						className="admin-text-xs admin-text-muted"
					>
						Insert template
					</span>
					{snippets.templates.map(template => (
						<button
							key={template.id}
							type="button"
							onClick={() => insertTemplate(template)}
							disabled={sending}
							aria-label={`Insert template: ${template.title}`}
							className="admin-btn min-h-6"
							data-size="sm"
						>
							{template.title}
						</button>
					))}
				</div>
			)}

			<div className="space-y-2">
				<label htmlFor={bodyId} className="sr-only">
					Reply message
				</label>
				<textarea
					id={bodyId}
					ref={textareaRef}
					value={body}
					onChange={event => setBody(event.target.value)}
					onKeyDown={event => {
						if (
							event.key === 'Enter' &&
							(event.metaKey || event.ctrlKey)
						) {
							event.preventDefault()
							void submit()
						}
					}}
					maxLength={REPLY_MAX_LENGTH}
					rows={8}
					autoFocus
					readOnly={sending}
					aria-describedby={error ? `${helpId} ${errorId}` : helpId}
					aria-invalid={error ? true : undefined}
					placeholder={`Reply to ${detail.name}`}
					className="admin-field admin-text-base resize-y read-only:opacity-60"
				/>
				<p
					id={helpId}
					className="admin-text-xs admin-text-muted tabular-nums"
				>
					{body.length} of {REPLY_MAX_LENGTH} characters. Press Ctrl
					or Cmd and Enter to send.
				</p>
			</div>

			<p
				role="status"
				aria-live="polite"
				className={
					sending ? 'admin-text-xs admin-text-muted' : 'sr-only'
				}
			>
				{sending ? 'Sending reply…' : ''}
			</p>

			{error && (
				<p
					id={errorId}
					role="alert"
					className="admin-text-xs admin-text-danger"
				>
					{error}
				</p>
			)}

			<div className="flex items-center justify-end gap-2">
				<button
					type="button"
					onClick={onClose}
					disabled={sending}
					className="admin-btn"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={sending || !hasContent}
					aria-busy={sending}
					aria-label={sending ? 'Sending reply' : 'Send reply'}
					className="admin-btn"
					data-variant="primary"
				>
					<Send className="size-4" aria-hidden="true" />
					{sending ? 'Sending…' : 'Send'}
				</button>
			</div>
		</form>
	)
}
