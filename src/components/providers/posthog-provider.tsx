'use client'

import { usePathname } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { usePostHog } from 'posthog-js/react'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

function PostHogPageView() {
	const pathname = usePathname()
	const posthog = usePostHog()

	useEffect(() => {
		if (pathname && posthog) {
			const url = window.origin + pathname
			posthog.capture('$pageview', {
				$current_url: url
			})
		}
	}, [pathname, posthog])

	return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
			api_host:
				process.env.NEXT_PUBLIC_POSTHOG_HOST ||
				'https://us.i.posthog.com',
			person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
			defaults: '2025-11-30',
			capture_pageview: false // Disable auto capture to prevent duplicate events on first load + verify SPA tracking
		})
	}, [])

	return (
		<PHProvider client={posthog}>
			<Suspense fallback={null}>
				<PostHogPageView />
			</Suspense>
			{children}
		</PHProvider>
	)
}
