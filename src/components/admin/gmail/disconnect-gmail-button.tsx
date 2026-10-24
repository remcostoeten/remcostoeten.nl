'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Unlink } from 'lucide-react'
import { toast } from 'sonner'
import { disconnectGmail } from '@/server/actions/contact/gmail'

const CONFIRM_WINDOW_MS = 4000

export function DisconnectGmailButton() {
	const router = useRouter()
	const [confirming, setConfirming] = useState(false)
	const [pending, setPending] = useState(false)

	useEffect(() => {
		if (!confirming) return
		const timer = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS)
		return () => clearTimeout(timer)
	}, [confirming])

	async function disconnect() {
		if (!confirming) {
			setConfirming(true)
			return
		}

		setPending(true)
		try {
			const result = await disconnectGmail()
			if (result.success) {
				toast.success('Gmail disconnected')
				router.refresh()
			} else {
				toast.error(result.error)
			}
		} catch {
			toast.error('Could not disconnect Gmail')
		} finally {
			setPending(false)
			setConfirming(false)
		}
	}

	const label = pending
		? 'Disconnecting…'
		: confirming
			? 'Confirm disconnect'
			: 'Disconnect'

	return (
		<>
			<span role="status" aria-live="polite" className="sr-only">
				{pending
					? 'Disconnecting Gmail'
					: confirming
						? 'Press again within 4 seconds to disconnect Gmail. Replies will stop sending.'
						: ''}
			</span>
			<button
				type="button"
				onClick={disconnect}
				disabled={pending}
				aria-busy={pending}
				aria-label={
					confirming && !pending
						? 'Confirm disconnect Gmail'
						: undefined
				}
				className="admin-btn"
				data-variant={confirming ? 'danger' : undefined}
				data-confirming={confirming}
			>
				<Unlink className="size-4" aria-hidden="true" />
				{label}
			</button>
		</>
	)
}
