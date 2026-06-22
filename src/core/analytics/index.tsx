'use client'

import { lazy, Suspense } from 'react'

const RemcoAnalytics = lazy(() =>
	import('@remcostoeten/analytics').then(m => ({
		default: m.Analytics
	}))
)

const VercelAnalytics = lazy(() =>
	import('@vercel/analytics/react').then(m => ({
		default: m.Analytics
	}))
)

export { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next'

function Analytics() {
	const ingestUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL
	if (!ingestUrl) return null
	return <RemcoAnalytics ingestUrl={ingestUrl} />
}

export function UnifiedAnalytics() {
	const isProduction = process.env.NODE_ENV === 'production'

	return (
		<Suspense fallback={null}>
			<Analytics />
			{isProduction ? (
				<>
					<VercelAnalytics />
					<VercelSpeedInsights />
				</>
			) : null}
		</Suspense>
	)
}
