'use client'

import { analyticsConfig, isProviderEnabled } from '@/core/analytics/config'
import { Settings, Database, Activity } from 'lucide-react'

const providerLabels: Record<string, string> = {
	vercel: 'Vercel Analytics',
	remco: 'Remco Analytics',
	'speed-insights': 'Speed Insights',
	posthog: 'PostHog'
}

const providerDescriptions: Record<string, string> = {
	vercel: 'Vercel-provided page analytics',
	remco: 'Custom privacy-focused analytics',
	'speed-insights': 'Core web vitals monitoring',
	posthog: 'Product analytics & funnels'
}

function ProviderBadge({
	enabled
}: {
	enabled: boolean
}) {
	return (
		<span
			className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
				enabled
					? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
					: 'bg-muted text-muted-foreground border border-border'
			}`}
		>
			{enabled ? 'Active' : 'Disabled'}
		</span>
	)
}

export function AnalyticsConfigPanel() {
	const providers = ['vercel', 'remco', 'speed-insights', 'posthog'] as const

	return (
		<div className="admin-glass-card p-4">
			<div className="flex items-center gap-2 mb-4">
				<Settings className="w-4 h-4 text-[hsl(var(--brand-400))]" />
				<h2 className="text-sm font-semibold">Analytics Configuration</h2>
			</div>

			<div className="space-y-3">
				{providers.map(provider => {
					const enabled = isProviderEnabled(provider)
					return (
						<div
							key={provider}
							className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/30"
						>
							<div className="flex items-center gap-2.5">
								<ProviderBadge enabled={enabled} />
								<div>
									<p className="text-sm font-medium">
										{providerLabels[provider]}
									</p>
									<p className="text-[10px] text-muted-foreground">
										{providerDescriptions[provider]}
									</p>
								</div>
							</div>
						</div>
					)
				})}
			</div>

			<div className="mt-4 pt-3 border-t border-border/30">
				<div className="flex items-center justify-between text-xs">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Activity className="w-3 h-3" />
						<span>Admin Analytics</span>
					</div>
					<ProviderBadge enabled={analyticsConfig.adminAnalytics.enabled} />
				</div>
			</div>

			<div className="mt-3 pt-3 border-t border-border/30">
				<div className="flex items-center gap-2 text-[10px] text-muted-foreground">
					<Database className="w-3 h-3" />
					<span>Environment: {process.env.NODE_ENV}</span>
				</div>
			</div>
		</div>
	)
}
