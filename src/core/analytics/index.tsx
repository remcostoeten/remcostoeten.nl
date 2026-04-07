'use client'

import { lazy, Suspense } from 'react'
import {
	analyticsConfig,
	isProviderEnabled,
	type AnalyticsProvider
} from '@/core/analytics/config'

const VercelAnalytics = lazy(() =>
	import('@vercel/analytics/react').then(m => ({
		default: m.Analytics
	}))
)

const SpeedInsights = lazy(() =>
	import('@vercel/speed-insights/next').then(m => ({
		default: m.SpeedInsights
	}))
)

const RemcoAnalytics = lazy(() =>
	import('@remcostoeten/analytics').then(m => ({
		default: m.Analytics
	}))
)

interface AnalyticsProviderComponentProps {
	provider: AnalyticsProvider
}

function VercelAnalyticsWrapper() {
	if (!isProviderEnabled('vercel')) return null
	return <VercelAnalytics />
}

function SpeedInsightsWrapper() {
	if (!isProviderEnabled('speed-insights')) return null
	return <SpeedInsights />
}

function RemcoAnalyticsWrapper() {
	const config = analyticsConfig.providers.remco
	if (!config.enabled || !config.ingestUrl) return null
	return <RemcoAnalytics ingestUrl={config.ingestUrl} />
}

function AnalyticsProviderComponent({ provider }: AnalyticsProviderComponentProps) {
	switch (provider) {
		case 'vercel':
			return <VercelAnalyticsWrapper />
		case 'speed-insights':
			return <SpeedInsightsWrapper />
		case 'remco':
			return <RemcoAnalyticsWrapper />
		default:
			return null
	}
}

export function UnifiedAnalytics() {
	const allProviders: AnalyticsProvider[] = [
		'vercel',
		'speed-insights',
		'remco'
	]
	const enabledProviders = allProviders.filter(p => isProviderEnabled(p))

	if (enabledProviders.length === 0) {
		return null
	}

	return (
		<Suspense fallback={null}>
			{enabledProviders.map(provider => (
				<AnalyticsProviderComponent
					key={provider}
					provider={provider}
				/>
			))}
		</Suspense>
	)
}

export { analyticsConfig, isProviderEnabled } from '@/core/analytics/config'
