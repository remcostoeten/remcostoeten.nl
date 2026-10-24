'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { linkGmail } from '@/features/auth/client'

type Props = {
	returnPath: string
	label: string
	primary?: boolean
}

export function ConnectGmailButton({ returnPath, label, primary }: Props) {
	const [pending, setPending] = useState(false)

	async function connect() {
		setPending(true)
		try {
			await linkGmail(returnPath)
		} catch {
			toast.error('Could not start the Google connection')
			setPending(false)
		}
	}

	return (
		<>
			<span role="status" aria-live="polite" className="sr-only">
				{pending ? 'Redirecting to Google' : ''}
			</span>
			<button
				type="button"
				onClick={connect}
				disabled={pending}
				aria-busy={pending}
				className="admin-btn"
				data-variant={primary ? 'primary' : undefined}
			>
				<Mail className="size-4" aria-hidden="true" />
				{pending ? 'Redirecting to Google…' : label}
			</button>
		</>
	)
}
