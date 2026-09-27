'use client'

import { Analytics as RemcoAnalytics } from '@remcostoeten/analytics'
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next'
import { PostHogAnalytics } from './posthog'

export { VercelSpeedInsights }

export function UnifiedAnalytics() {
	const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
	const ingestUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL

	return (
		<>
			<PostHogAnalytics />
			<RemcoAnalytics
				projectId="remcostoeten.nl"
				ingestUrl={ingestUrl}
				disabled={!ingestUrl}
				trackOutbound
				trackErrors
			/>
			{isProduction ? <VercelSpeedInsights /> : null}
		</>
	)
}
