/**
 * A subtle visual overlay that provides authentication status indicators
 * without interfering with the main UI. Shows small corner indicators
 * and a barely visible border glow when the user is authenticated.
 */

'use client'

import { isAuthenticated } from '@/lib/auth-client'

export function AuthOverlay({ children }: { children: React.ReactNode }) {
	if (!isAuthenticated()) console.warn('no session')

	return (
		<>
			{isAuthenticated() && (
				<div className='fixed inset-0 pointer-events-none'>
					<div className='absolute top-2 right-2 w-3 h-3 bg-green-500/20 rounded-full border border-green-500/40' />
					<div className='absolute bottom-2 left-2 w-3 h-3 bg-green-500/20 rounded-full border border-green-500/40' />

					<div className='absolute inset-0 rounded-lg shadow-[inset_0_0_0_1px_rgba(34,197,94,0.1)] pointer-events-none' />
				</div>
			)}
			{children}
		</>
	)
}
