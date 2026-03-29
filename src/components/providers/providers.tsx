'use client'

import { ReactNode, lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { CustomQueryClientProvider } from '@/components/providers/query-client-provider'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { ThemeSwitch } from '@/components/theme-switch'

import { StaggerProvider } from '@/components/ui/stagger-system'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { useSession } from '@/features/auth/client'
import { signOut } from '@/features/auth/client'
import { BlogFilterProvider } from '@/hooks/use-blog-filter'

const Analytics = lazy(() =>
	import('@vercel/analytics/react').then(m => ({ default: m.Analytics }))
)
const SpeedInsights = lazy(() =>
	import('@vercel/speed-insights/next').then(m => ({
		default: m.SpeedInsights
	}))
)
const RemcoAnalytics = lazy(() =>
	import('@remcostoeten/analytics').then(m => ({
		default: m.Analytics
	}))
)
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
	const remcoAnalyticsIngestUrl = process.env.NEXT_PUBLIC_REMCO_ANALYTICS_URL

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
								{remcoAnalyticsIngestUrl ? (
									<RemcoAnalytics
										ingestUrl={remcoAnalyticsIngestUrl}
									/>
								) : null}
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
