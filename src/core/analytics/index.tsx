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

const PostHogAnalytics = lazy(() =>
	import('./posthog').then(m => ({
		default: m.PostHogAnalytics
	}))
)

import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next'

export { VercelSpeedInsights }

function Analytics() {
	const ingestUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL
	if (!ingestUrl) return null
	return <RemcoAnalytics ingestUrl={ingestUrl} />
}

export function UnifiedAnalytics() {
	const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

	return (
		<Suspense fallback={null}>
			<Analytics />
			<PostHogAnalytics />
			{isProduction ? (
				<>
					<VercelAnalytics />
					<VercelSpeedInsights />
				</>
			) : null}
		</Suspense>
	)
}
