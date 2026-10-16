import { createAnalytics } from '@spoar/sdk'
import {
	botSignals,
	errors,
	outboundLinks,
	speedInsights
} from '@spoar/sdk/plugins'

const config = process.env.NEXT_PUBLIC_RA_CONFIG

export const analytics = config
	? createAnalytics({
			...(JSON.parse(config) as {
				project: string
				key: string
				endpoint: string
			}),
			pageviews: false,
			plugins: [botSignals(), errors(), outboundLinks(), speedInsights()]
		})
	: null
