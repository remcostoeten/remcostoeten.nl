export type AnalyticsProvider = 'vercel' | 'remco' | 'posthog' | 'speed-insights'

export interface AnalyticsConfig {
	providers: {
		vercel: {
			enabled: boolean
		}
		remco: {
			enabled: boolean
			ingestUrl?: string
		}
		posthog: {
			enabled: boolean
		}
		'speed-insights': {
			enabled: boolean
		}
	}
	adminAnalytics: {
		enabled: boolean
	}
}

export const analyticsConfig: AnalyticsConfig = {
	providers: {
		vercel: {
			enabled:
				process.env.NODE_ENV === 'production' &&
				process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true'
		},
		remco: {
			enabled: !!process.env.NEXT_PUBLIC_REMCO_ANALYTICS_URL,
			ingestUrl: process.env.NEXT_PUBLIC_REMCO_ANALYTICS_URL
		},
		posthog: {
			enabled:
				process.env.NEXT_PUBLIC_ENABLE_POSTHOG === 'true' &&
				!!process.env.NEXT_PUBLIC_POSTHOG_KEY
		},
		'speed-insights': {
			enabled:
				process.env.NODE_ENV === 'production' &&
				process.env.NEXT_PUBLIC_ENABLE_SPEED_INSIGHTS === 'true'
		}
	},
	adminAnalytics: {
		enabled: process.env.NODE_ENV === 'production'
	}
}

export function isProviderEnabled(provider: AnalyticsProvider): boolean {
	return analyticsConfig.providers[provider]?.enabled ?? false
}

export function getProviderConfig<K extends AnalyticsProvider>(
	provider: K
): AnalyticsConfig['providers'][K] {
	return analyticsConfig.providers[provider] as AnalyticsConfig['providers'][K]
}
