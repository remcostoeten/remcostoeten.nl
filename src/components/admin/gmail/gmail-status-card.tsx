import { AlertTriangle, CheckCircle2, Circle } from 'lucide-react'
import type { GmailStatus } from '@/server/gmail/connection'
import { ConnectGmailButton } from './connect-gmail-button'
import { DisconnectGmailButton } from './disconnect-gmail-button'

type Props = {
	status: GmailStatus
	notice: 'linked' | 'error' | null
}

const ICONS = {
	not_configured: Circle,
	disconnected: Circle,
	needs_reauth: AlertTriangle,
	connected: CheckCircle2
} as const

const COPY = {
	not_configured: {
		tone: 'plain',
		label: 'Not configured',
		text: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET and enable the Gmail API to send replies.'
	},
	disconnected: {
		tone: 'plain',
		label: 'Not connected',
		text: 'Connect the Gmail account you want replies to be sent from. Only the permission to send email is requested.'
	},
	needs_reauth: {
		tone: 'warning',
		label: 'Needs reauthorization',
		text: 'Google no longer accepts the saved permission. Connect again to keep sending replies.'
	},
	connected: {
		tone: 'success',
		label: 'Connected',
		text: 'Replies from the inbox are sent from this account and appear in its Sent folder.'
	}
} as const

export function GmailStatusCard({ status, notice }: Props) {
	const copy = COPY[status.state]
	const Icon = ICONS[status.state]

	return (
		<section aria-labelledby="gmail-status-title" className="admin-panel">
			<div className="admin-panel-header items-center">
				<h2 id="gmail-status-title" className="admin-panel-title">
					Gmail replies
				</h2>
				<span
					role="status"
					aria-label={`Gmail status: ${copy.label}`}
					className="admin-pill"
					data-tone={copy.tone}
				>
					<Icon className="size-3" aria-hidden="true" />
					{copy.label}
				</span>
			</div>

			<div className="space-y-4 px-5 pb-5">
				{status.email && (
					<p className="admin-text-sm">
						<span className="admin-text-muted">Sender </span>
						{status.email}
					</p>
				)}

				<p className="admin-text-sm admin-text-muted max-w-xl">
					{copy.text}
				</p>

				{notice === 'error' && (
					<p role="alert" className="admin-text-xs admin-text-danger">
						Google did not complete the connection. Try again and
						keep the permission to send email checked.
					</p>
				)}
				{notice === 'linked' && status.state === 'disconnected' && (
					<p
						role="alert"
						className="admin-text-xs admin-text-warning"
					>
						The account was linked without the permission to send
						email. Connect again and leave it checked.
					</p>
				)}

				{status.state !== 'not_configured' && (
					<div className="flex flex-wrap items-center gap-2">
						<ConnectGmailButton
							returnPath="/admin/settings"
							label={
								status.state === 'connected'
									? 'Reconnect Gmail'
									: status.state === 'needs_reauth'
										? 'Reauthorize Gmail'
										: 'Connect Gmail'
							}
							primary={status.state !== 'connected'}
						/>
						{(status.state === 'connected' ||
							status.state === 'needs_reauth') && (
							<DisconnectGmailButton />
						)}
					</div>
				)}
			</div>
		</section>
	)
}
