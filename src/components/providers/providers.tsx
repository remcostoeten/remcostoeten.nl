'use client'

import { ReactNode, lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { CustomQueryClientProvider } from '@/components/providers/query-client-provider'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { ThemeSwitch } from '@/components/theme-switch'

import { StaggerProvider } from '@/components/ui/stagger-system'
import { PostHogProvider } from '@/components/providers/posthog-provider'

import { BlogFilterProvider } from '@/hooks/use-blog-filter'

const Analytics = lazy(() =>
	import('@vercel/analytics/react').then(m => ({ default: m.Analytics }))
)
const SpeedInsights = lazy(() =>
	import('@vercel/speed-insights/next').then(m => ({
		default: m.SpeedInsights
	}))
)
const DevWidgetWrapper = lazy(() =>
	import('./dev-widget-wrapper').then(m => ({
		default: m.DevWidgetWrapper
	}))
)

type TProps = {
	children: ReactNode
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
							</Suspense>
							<Suspense fallback={null}>
								<SpeedInsights />
							</Suspense>
							{process.env.NODE_ENV === 'development' && (
								<Suspense fallback={null}>
									<DevWidgetWrapper />
								</Suspense>
							)}
						</StaggerProvider>
					</VimAuthProvider>
				</BlogFilterProvider>
			</CustomQueryClientProvider>
		</PostHogProvider>
	)
}
