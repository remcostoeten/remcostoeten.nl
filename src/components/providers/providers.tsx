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

function getSafeAnalyticsIngestUrl(rawUrl?: string) {
	if (!rawUrl) return null

	try {
		const url = new URL(rawUrl)
		const hostname = url.hostname.toLowerCase()
		const isLocalHost =
			hostname === 'localhost' ||
			hostname === '127.0.0.1' ||
			hostname === '0.0.0.0'

		if (isLocalHost) return null
		if (
			process.env.NODE_ENV === 'production' &&
			url.protocol !== 'https:'
		) {
			return null
		}

		return url.toString()
	} catch {
		return null
	}
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
	const isProduction = process.env.NODE_ENV === 'production'
	const remcoAnalyticsIngestUrl = getSafeAnalyticsIngestUrl(
		process.env.NEXT_PUBLIC_REMCO_ANALYTICS_URL
	)

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
								{isProduction ? <Analytics /> : null}
								{remcoAnalyticsIngestUrl ? (
									<RemcoAnalytics
										ingestUrl={remcoAnalyticsIngestUrl}
									/>
								) : null}
							</Suspense>
							<Suspense fallback={null}>
								{isProduction ? <SpeedInsights /> : null}
							</Suspense>
							<DevWidgetWrapper />
						</StaggerProvider>
					</VimAuthProvider>
				</BlogFilterProvider>
			</CustomQueryClientProvider>
		</PostHogProvider>
	)
}
