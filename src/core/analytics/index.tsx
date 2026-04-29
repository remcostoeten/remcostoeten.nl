'use client'

import { lazy, Suspense } from 'react'

const RemcoAnalytics = lazy(() =>
	import('@remcostoeten/analytics').then(m => ({
		default: m.Analytics
	}))
)

function Analytics() {
	const ingestUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL
	if (!ingestUrl) return null
	return <RemcoAnalytics ingestUrl={ingestUrl} />
}

export function UnifiedAnalytics() {
	return (
		<Suspense fallback={null}>
			<Analytics />
		</Suspense>
	)
}
