'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut, useSession } from '@/features/auth/client'

function getInitials(label: string) {
	return label
		.split(/[\s@.]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase())
		.join('')
}

export function AdminSessionStatus() {
	const router = useRouter()
	const { data: session, isPending } = useSession()
	const [isSigningOut, setIsSigningOut] = useState(false)

	const name = session?.user?.name || 'Admin'
	const email = session?.user?.email || ''

	async function handleSignOut() {
		setIsSigningOut(true)
		try {
			await signOut()
			router.push('/')
			router.refresh()
		} finally {
			setIsSigningOut(false)
		}
	}

	return (
		<div
			className="flex items-center gap-3 border-t border-border px-1 pt-4"
			aria-live="polite"
		>
			<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-medium">
				{isPending ? '' : getInitials(name)}
			</span>
			<div className="min-w-0 flex-1">
				<p className="truncate text-[13px] font-medium">
					{isPending ? 'Checking session…' : name}
				</p>
				<p className="truncate text-[11px] text-muted-foreground">
					{isPending ? '' : email}
				</p>
			</div>
			<button
				type="button"
				onClick={handleSignOut}
				disabled={isPending || isSigningOut}
				className="admin-icon-btn disabled:opacity-50"
				aria-label="Sign out"
				title={isSigningOut ? 'Signing out…' : 'Sign out'}
			>
				<LogOut className="size-3.5" />
			</button>
		</div>
	)
}
