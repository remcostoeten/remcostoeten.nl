'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export function PostHogAnalytics() {
	useEffect(() => {
		const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
		if (!key || posthog.__loaded) return

		posthog.init(key, {
			api_host: '/ingest',
			ui_host: 'https://us.posthog.com',
			defaults: '2025-05-24',
			person_profiles: 'identified_only'
		})
	}, [])

	return null
}
