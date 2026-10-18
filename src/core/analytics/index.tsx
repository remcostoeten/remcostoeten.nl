'use client'

import { Analytics } from '@spoar/sdk/next'
import { AnalyticsProvider } from '@spoar/sdk/react'
import { analytics } from './spoar'

export function UnifiedAnalytics() {
	if (!analytics) return null

	return (
		<AnalyticsProvider client={analytics}>
			<Analytics />
		</AnalyticsProvider>
	)
}
