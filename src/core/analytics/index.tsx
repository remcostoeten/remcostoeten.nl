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

const VercelSpeedInsights = lazy(() =>
	import('@vercel/speed-insights/next').then(m => ({
		default: m.SpeedInsights
	}))
)

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
