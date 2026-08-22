'use client'

import posthogClient from 'posthog-js'
import {
	createAnalytics,
	posthog,
	remco,
	vercel
} from '@remcostoeten/analytics-manager'

const ingestUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

export const analytics = createAnalytics()
	.app('remcostoeten.nl')
	.environment(process.env.NEXT_PUBLIC_VERCEL_ENV)
	.when(Boolean(ingestUrl), remco().ingest(ingestUrl))
	.when(Boolean(posthogKey), posthog().client(posthogClient))
	.when(isProduction, vercel())
	.build()
