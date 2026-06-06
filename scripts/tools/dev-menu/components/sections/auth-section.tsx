'use client'

import { LogOut } from 'lucide-react'
import { Session } from '../types'
import { useState, useEffect } from 'react'

type Props = {
	session?: Session | null
	onSignOut?: () => void | Promise<void>
}

export function AuthSection({ session, onSignOut }: Props) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!session || !mounted) return null

	return (
		<div className="p-2 m-2 bg-background border border-border">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-[11px] font-medium text-foreground">
						{session?.user?.name || 'anonymous'}
					</div>
					{session?.user?.email && (
						<div className="text-[10px] text-muted-foreground">
							{session.user.email}
						</div>
					)}
				</div>
				{onSignOut && (
					<button
						onClick={() => {
							void onSignOut()
						}}
						className="flex items-center gap-1 px-2 py-1 text-[10px] bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors"
						title="Sign out"
					>
						<LogOut className="w-3 h-3" />
						<span>logout</span>
					</button>
				)}
			</div>
		</div>
	)
}
