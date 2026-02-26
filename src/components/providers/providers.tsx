'use client'

import { ReactNode, lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { CustomQueryClientProvider } from '@/components/providers/query-client-provider'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { ThemeSwitch } from '@/components/theme-switch'

import { StaggerProvider } from '@/components/ui/stagger-system'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { DevWidget } from '../../../tools/dev-menu'
import { useSession } from '@/lib/auth-client'
import { signOut } from '@/lib/auth-client'
import { Analytics as RemcoAnalytics } from '@remcostoeten/analytics'

import { BlogFilterProvider } from '@/hooks/use-blog-filter'

const Analytics = lazy(() =>
	import('@vercel/analytics/react').then(m => ({ default: m.Analytics }))
)
const SpeedInsights = lazy(() =>
	import('@vercel/speed-insights/next').then(m => ({
		default: m.SpeedInsights
	}))
)

type TProps = {
	children: ReactNode
}

function DevWidgetWrapper() {
	const { data: session } = useSession()

	return (
		<DevWidget
			session={session}
			onSignOut={signOut}
			showAuth={true}
			showRoutes={true}
			showSystemInfo={true}
			showSettings={true}
		/>
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

							<Suspense fallback={null}>
								<Analytics />
								<RemcoAnalytics />
							</Suspense>
							<Suspense fallback={null}>
								<SpeedInsights />
							</Suspense>
							<DevWidgetWrapper />
						</StaggerProvider>
					</VimAuthProvider>
				</BlogFilterProvider>
			</CustomQueryClientProvider>
		</PostHogProvider>
	)
}
