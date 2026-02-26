'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut, useSession } from '@/lib/auth-client'

export function AdminSessionStatus() {
	const router = useRouter()
	const { data: session, isPending } = useSession()
	const [isSigningOut, setIsSigningOut] = useState(false)

	const userLabel = session?.user?.email || session?.user?.name || 'Unknown user'

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
		<div className="flex items-center gap-2">
			<div
				className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
				aria-live="polite"
			>
				<span
					className={`size-1.5 rounded-full ${isPending ? 'bg-amber-500' : 'bg-emerald-500'}`}
					aria-hidden="true"
				/>
				<span className="hidden md:inline">
					{isPending ? 'Checking session...' : `Session active: ${userLabel}`}
				</span>
				<span className="md:hidden">
					{isPending ? 'Checking...' : 'Session active'}
				</span>
			</div>

			<button
				type="button"
				onClick={handleSignOut}
				disabled={isPending || isSigningOut}
				className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
			>
				<LogOut className="w-3.5 h-3.5" />
				<span className="hidden md:inline">
					{isSigningOut ? 'Signing out...' : 'Sign out'}
				</span>
			</button>
		</div>
	)
}
