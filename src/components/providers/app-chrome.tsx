'use client'

import { lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { ThemeSwitch } from '@/components/theme-switch'
import { useSession, signOut } from '@/features/auth/client'
import { UnifiedAnalytics } from '@/core/analytics'

const DevWidget =
	process.env.NODE_ENV === 'development'
		? lazy(() =>
				import('../../../scripts/tools/dev-menu').then(m => ({
					default: m.DevWidget
				}))
			)
		: null

function DevWidgetWrapper() {
	if (!DevWidget) {
		return null
	}

	const { data: session } = useSession()

	return (
		<Suspense fallback={null}>
			<DevWidget
				session={session}
				onSignOut={async () => {
					await signOut()
				}}
				showAuth={true}
				showRoutes={true}
				showSystemInfo={true}
				showSettings={true}
			/>
		</Suspense>
	)
}

export function AppChrome() {
	return (
		<>
			<ThemeSwitch />
			<Toaster />
			<UnifiedAnalytics />
			<DevWidgetWrapper />
			<VimAuthProvider />
		</>
	)
}
