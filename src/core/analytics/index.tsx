'use client'

import { Analytics } from '@spoar/sdk/next'
import { AnalyticsProvider } from '@spoar/sdk/react'
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next'
import { PostHogAnalytics } from './posthog'
import { analytics } from './spoar'

export { VercelSpeedInsights }

export function UnifiedAnalytics() {
	const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

	return (
		<>
			<PostHogAnalytics />
			{analytics ? (
				<AnalyticsProvider client={analytics}>
					<Analytics />
				</AnalyticsProvider>
			) : null}
			{isProduction ? <VercelSpeedInsights /> : null}
		</>
	)
}
