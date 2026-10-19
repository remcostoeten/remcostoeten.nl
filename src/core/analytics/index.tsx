'use client'

import { Analytics } from '@spoar/sdk/next'
import { AnalyticsProvider } from '@spoar/sdk/react'
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next'
import { analytics } from './spoar'

export function UnifiedAnalytics() {
	const isVercelProduction =
		process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

	return (
		<>
			{analytics ? (
				<AnalyticsProvider client={analytics}>
					<Analytics />
				</AnalyticsProvider>
			) : null}
			{isVercelProduction ? <VercelSpeedInsights /> : null}
		</>
	)
}
