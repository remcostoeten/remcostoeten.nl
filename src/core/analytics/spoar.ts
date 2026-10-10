import { createAnalytics } from '@spoar/sdk'
import {
	botSignals,
	errors,
	outboundLinks,
	speedInsights
} from '@spoar/sdk/plugins'

export const analytics = process.env.NEXT_PUBLIC_RA_CONFIG
	? createAnalytics({
			pageviews: false,
			plugins: [botSignals(), errors(), outboundLinks(), speedInsights()]
		})
	: null
