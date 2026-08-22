'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

let posthogInitialized = false

export function PostHogAnalytics() {
	useEffect(() => {
		const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
		if (!key || posthogInitialized) return

		posthogInitialized = true
		const configuredHost =
			process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
		const uiHost = configuredHost.replace('.i.posthog.com', '.posthog.com')

		posthog.init(key, {
			api_host: '/ingest',
			ui_host: uiHost,
			defaults: '2025-05-24',
			person_profiles: 'identified_only',
			capture_pageview: false
		})
	}, [])

	return null
}
