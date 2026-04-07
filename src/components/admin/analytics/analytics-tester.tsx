'use client'

import { useState } from 'react'
import {
	isProviderEnabled,
	getProviderConfig
} from '@/core/analytics/config'
import {
	Play,
	CheckCircle2,
	XCircle,
	Loader2,
	Webhook,
	Bug,
	Clock
} from 'lucide-react'

type TestResult = {
	provider: string
	status: 'idle' | 'testing' | 'success' | 'error'
	response?: string
	duration?: number
}

const providerEndpoints: Record<string, string | undefined> = {
	vercel: 'https://www.google-analytics.com/collect',
	remco: getProviderConfig('remco').ingestUrl,
	'speed-insights': undefined,
	posthog: process.env.NEXT_PUBLIC_POSTHOG_HOST
}

async function testEndpoint(
	url: string | undefined,
	provider: string
): Promise<TestResult> {
	if (!url) {
		return {
			provider,
			status: 'error',
			response: 'No endpoint configured',
			duration: 0
		}
	}

	const start = performance.now()
	try {
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), 5000)

		await fetch(url, {
			method: 'HEAD',
			mode: 'no-cors',
			signal: controller.signal
		}).catch(() => ({ ok: true }))

		clearTimeout(timeoutId)
		const duration = Math.round(performance.now() - start)

		return {
			provider,
			status: 'success',
			response: `Connected (${duration}ms)`,
			duration
		}
	} catch (error) {
		return {
			provider,
			status: 'error',
			response: error instanceof Error ? error.message : 'Connection failed',
			duration: Math.round(performance.now() - start)
		}
	}
}

export function AnalyticsTester() {
	const [results, setResults] = useState<TestResult[]>([])
	const [testing, setTesting] = useState(false)

	const providers = [
		{ key: 'vercel', name: 'Vercel Analytics' },
		{ key: 'remco', name: 'Remco Analytics' },
		{ key: 'speed-insights', name: 'Speed Insights' },
		{ key: 'posthog', name: 'PostHog' }
	] as const

	async function runTests() {
		setTesting(true)
		setResults([])

		const tests = providers.map(async ({ key }) => {
			const enabled = isProviderEnabled(key)
			if (!enabled) {
				return {
					provider: key,
					status: 'error' as const,
					response: 'Provider disabled',
					duration: 0
				}
			}

			return testEndpoint(providerEndpoints[key], key)
		})

		const newResults = await Promise.all(tests)
		setResults(newResults)
		setTesting(false)
	}

	return (
		<div className="admin-glass-card p-4">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Bug className="w-4 h-4 text-[hsl(var(--brand-400))]" />
					<h2 className="text-sm font-semibold">Analytics Tester</h2>
				</div>
				<button
					onClick={runTests}
					disabled={testing}
					className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[hsl(var(--brand-500))] text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
				>
					{testing ? (
						<Loader2 className="w-3 h-3 animate-spin" />
					) : (
						<Play className="w-3 h-3" />
					)}
					{testing ? 'Testing...' : 'Run Tests'}
				</button>
			</div>

			<p className="text-xs text-muted-foreground mb-4">
				Test connectivity to analytics providers. Results show response time
				and status.
			</p>

			{results.length > 0 && (
				<div className="space-y-2">
					{results.map(result => (
						<div
							key={result.provider}
							className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/30"
						>
							<div className="flex items-center gap-2.5">
								{result.status === 'success' ? (
									<CheckCircle2 className="w-4 h-4 text-emerald-400" />
								) : result.status === 'testing' ? (
									<Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
								) : (
									<XCircle className="w-4 h-4 text-red-400" />
								)}
								<div>
									<p className="text-sm font-medium capitalize">
										{result.provider.replace('-', ' ')}
									</p>
									<p className="text-[10px] text-muted-foreground font-mono">
										{providerEndpoints[result.provider] || 'N/A'}
									</p>
								</div>
							</div>
							<div className="text-right">
								<p
									className={`text-xs font-medium ${
										result.status === 'success'
											? 'text-emerald-400'
											: result.status === 'error'
												? 'text-red-400'
												: 'text-amber-400'
									}`}
								>
									{result.response}
								</p>
								{result.duration !== undefined && result.duration > 0 && (
									<p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
										<Clock className="w-2.5 h-2.5" />
										{result.duration}ms
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{results.length === 0 && !testing && (
				<div className="text-center py-6 text-muted-foreground text-sm">
					<Webhook className="w-8 h-8 mx-auto mb-2 opacity-50" />
					<p>Click &quot;Run Tests&quot; to check analytics connectivity</p>
				</div>
			)}
		</div>
	)
}
