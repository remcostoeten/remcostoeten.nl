'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

type PostHogClient = {
	init: (key: string, options: Record<string, unknown>) => void
	capture: (event: string, properties?: Record<string, unknown>) => void
}

export function PostHogProvider({ children }: { children: ReactNode }) {
	const posthogEnabled = process.env.NEXT_PUBLIC_ENABLE_POSTHOG === 'true'
	const pathname = usePathname()
	const [posthogClient, setPosthogClient] = useState<PostHogClient | null>(
		null
	)

	useEffect(() => {
		if (!posthogEnabled) return

		let cancelled = false

		async function initPostHog() {
			const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
			if (!posthogKey) return

			const { default: posthog } = await import('posthog-js')
			if (cancelled) return

			posthog.init(posthogKey, {
				api_host:
					process.env.NEXT_PUBLIC_POSTHOG_HOST ||
					'https://us.i.posthog.com',
				person_profiles: 'identified_only',
				defaults: '2025-11-30',
				capture_pageview: false,
				autocapture: false,
				capture_pageleave: false,
				disable_session_recording: true
			})

			setPosthogClient(posthog)
		}

		void initPostHog()

		return () => {
			cancelled = true
		}
	}, [posthogEnabled])

	useEffect(() => {
		if (!posthogEnabled || !posthogClient || !pathname) return

		posthogClient.capture('$pageview', {
			$current_url: window.location.origin + pathname
		})
	}, [posthogEnabled, posthogClient, pathname])

	return <>{children}</>
}
