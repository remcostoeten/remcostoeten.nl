'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
	observePerformance,
	observeScroll,
	observeTimeOnPage
} from '@remcostoeten/analytics'
import {
	AnalyticsProvider,
	usePageview
} from '@remcostoeten/analytics-manager/react'
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next'
import { analytics } from './manager'
import { PostHogAnalytics } from './posthog'

export { VercelSpeedInsights }

function Pageviews() {
	usePageview(usePathname())
	return null
}

function RemcoObservers() {
	const ingestUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL

	useEffect(() => {
		if (!ingestUrl) return

		const options = { ingestUrl, projectId: 'remcostoeten.nl' }
		const stop = [
			observePerformance(options),
			observeScroll(options),
			observeTimeOnPage(options)
		]

		return () => stop.forEach(cleanup => cleanup())
	}, [ingestUrl])

	return null
}

export function UnifiedAnalytics() {
	const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

	return (
		<AnalyticsProvider analytics={analytics}>
			<PostHogAnalytics />
			<Pageviews />
			<RemcoObservers />
			{isProduction ? <VercelSpeedInsights /> : null}
		</AnalyticsProvider>
	)
}
