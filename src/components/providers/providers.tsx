'use client'

import { lazy, Suspense, type ReactNode } from 'react'
import { Toaster } from 'sonner'
import { CustomQueryClientProvider } from '@/components/providers/query-client-provider'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { ThemeSwitch } from '@/components/theme-switch'

import { StaggerProvider } from '@/components/ui/stagger-system'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { useSession } from '@/features/auth/client'
import { signOut } from '@/features/auth/client'
import { BlogFilterProvider } from '@/hooks/use-blog-filter'
import { UnifiedAnalytics } from '@/core/analytics'

const DevWidget =
	process.env.NODE_ENV === 'development'
		? lazy(() =>
				import('../../../tools/dev-menu').then(m => ({
					default: m.DevWidget
				}))
			)
		: null

type TProps = {
	children: ReactNode
}

function DevWidgetWrapper() {
	if (!DevWidget) {
		return null
	}

	const { data: session } = useSession()

	return (
		<Suspense fallback={null}>
			<DevWidget
				session={session}
				onSignOut={signOut}
				showAuth={true}
				showRoutes={true}
				showSystemInfo={true}
				showSettings={true}
			/>
		</Suspense>
	)
}

export function AppProviders({ children }: TProps) {
	return (
		<PostHogProvider>
			<CustomQueryClientProvider>
				<BlogFilterProvider>
					<VimAuthProvider>
						<StaggerProvider
							config={{
								baseDelay: 80,
								initialDelay: 0,
								strategy: 'mount-order'
							}}
						>
							<ThemeSwitch />
							{children}
							<Toaster />
							<UnifiedAnalytics />
							<DevWidgetWrapper />
						</StaggerProvider>
					</VimAuthProvider>
				</BlogFilterProvider>
			</CustomQueryClientProvider>
		</PostHogProvider>
	)
}
