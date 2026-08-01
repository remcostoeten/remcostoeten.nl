'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'
import {
	AlertTriangle,
	Check,
	Clock3,
	Database,
	ExternalLink,
	Music2,
	Radio,
	RefreshCw,
	ShieldCheck,
	WifiOff
} from 'lucide-react'
import type {
	YTMusicResult,
	YTMusicStatus,
	YTMusicTrack
} from '@/features/ytmusic/types'

interface YTMusicDiagnosticsProps {
	initialResult: YTMusicResult
}

const IMAGE_HOSTS = new Set([
	'lh3.googleusercontent.com',
	'yt3.googleusercontent.com',
	'i.ytimg.com'
])

const STATUS_PRESENTATION: Record<
	YTMusicStatus,
	{ label: string; tone: string; dot: string }
> = {
	ok: {
		label: 'Signal locked',
		tone: 'text-emerald-600 dark:text-emerald-400',
		dot: 'bg-emerald-500'
	},
	stale: {
		label: 'Fallback signal',
		tone: 'text-amber-600 dark:text-amber-400',
		dot: 'bg-amber-500'
	},
	empty: {
		label: 'No history',
		tone: 'text-muted-foreground',
		dot: 'bg-muted-foreground'
	},
	unconfigured: {
		label: 'Not connected',
		tone: 'text-muted-foreground',
		dot: 'bg-muted-foreground'
	},
	unauthorized: {
		label: 'Session rejected',
		tone: 'text-red-600 dark:text-red-400',
		dot: 'bg-red-500'
	},
	error: {
		label: 'Signal lost',
		tone: 'text-red-600 dark:text-red-400',
		dot: 'bg-red-500'
	}
}

export function YTMusicDiagnostics({ initialResult }: YTMusicDiagnosticsProps) {
	const [result, setResult] = useState(initialResult)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [latency, setLatency] = useState<number | null>(null)
	const status = STATUS_PRESENTATION[result.status]

	async function refresh() {
		setIsRefreshing(true)
		const startedAt = performance.now()

		try {
			const response = await fetch(
				'/api/ytmusic/recent?limit=20&refresh=1',
				{
					cache: 'no-store'
				}
			)
			const payload = (await response.json()) as YTMusicResult
			setResult(payload)
			setLatency(Math.round(performance.now() - startedAt))
		} catch {
			setResult(current => ({
				...current,
				status: 'error',
				message:
					'The diagnostic request could not reach the API endpoint.',
				fetchedAt: new Date().toISOString()
			}))
			setLatency(null)
		} finally {
			setIsRefreshing(false)
		}
	}

	return (
		<div className="px-4 pb-16 md:px-5">
			<header className="relative overflow-hidden border-y border-border py-8 sm:py-10">
				<div
					className="absolute inset-y-0 right-0 hidden w-2/5 items-center opacity-25 sm:flex"
					aria-hidden="true"
				>
					<SignalTrace active={result.status === 'ok'} />
				</div>
				<div className="relative max-w-lg">
					<div className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
						<Radio className="size-3.5" />
						YT Music / signal check
					</div>
					<h1 className="max-w-md text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl">
						Is the listening wire alive?
					</h1>
					<p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
						A direct read on authentication, persistent fallback and
						the latest tracks. Refresh forces a real YouTube Music
						request.
					</p>
				</div>
			</header>

			<section className="mt-6" aria-labelledby="signal-status">
				<div className="flex flex-col gap-4 border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<span
							className={`mt-1.5 size-2 shrink-0 rounded-full ${status.dot} ${result.status === 'ok' ? 'animate-pulse motion-reduce:animate-none' : ''}`}
						/>
						<div>
							<h2
								id="signal-status"
								className={`font-mono text-sm font-medium uppercase tracking-wider ${status.tone}`}
							>
								{status.label}
							</h2>
							<p className="mt-1 text-sm leading-5 text-muted-foreground">
								{result.message}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={refresh}
						disabled={isRefreshing}
						className="inline-flex h-9 shrink-0 items-center justify-center gap-2 border border-foreground bg-foreground px-3 font-mono text-xs font-medium uppercase tracking-wider text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
					>
						<RefreshCw
							className={`size-3.5 ${isRefreshing ? 'animate-spin motion-reduce:animate-none' : ''}`}
						/>
						{isRefreshing ? 'Checking' : 'Force live check'}
					</button>
				</div>

				<div className="grid grid-cols-2 gap-px border-x border-b border-border bg-border sm:grid-cols-4">
					<Metric
						label="Source"
						value={formatSource(result)}
						icon={<Database className="size-3.5" />}
					/>
					<Metric
						label="Credentials"
						value={
							result.credentialsConfigured ? 'Present' : 'Missing'
						}
						icon={
							result.credentialsConfigured ? (
								<ShieldCheck className="size-3.5" />
							) : (
								<WifiOff className="size-3.5" />
							)
						}
					/>
					<Metric
						label="Tracks"
						value={String(result.tracks.length)}
						icon={<Music2 className="size-3.5" />}
					/>
					<Metric
						label="Round trip"
						value={latency === null ? '—' : `${latency} ms`}
						icon={<Clock3 className="size-3.5" />}
					/>
				</div>
			</section>

			<section className="mt-10" aria-labelledby="recent-tracks">
				<div className="mb-3 flex items-end justify-between gap-4">
					<div>
						<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
							Payload preview
						</p>
						<h2
							id="recent-tracks"
							className="mt-1 text-xl font-semibold tracking-tight"
						>
							Recent history
						</h2>
					</div>
					<time
						className="text-right font-mono text-[10px] text-muted-foreground"
						dateTime={result.fetchedAt}
					>
						Checked {formatTimestamp(result.fetchedAt)}
					</time>
				</div>

				{result.tracks.length > 0 ? (
					<ol className="border-t border-border">
						{result.tracks.map((track, index) => (
							<TrackRow
								key={`${track.id}:${index}`}
								track={track}
								index={index}
							/>
						))}
					</ol>
				) : (
					<EmptyState status={result.status} />
				)}
			</section>

			<footer className="mt-8 grid gap-2 border-t border-border pt-4 font-mono text-[10px] leading-5 text-muted-foreground sm:grid-cols-2">
				<p>
					Cache:{' '}
					{result.cacheUpdatedAt
						? formatTimestamp(result.cacheUpdatedAt)
						: 'No saved response'}
				</p>
				<p className="sm:text-right">
					Times marked approximate are inferred because YouTube does
					not provide exact play times.
				</p>
			</footer>
		</div>
	)
}

function Metric({
	label,
	value,
	icon
}: {
	label: string
	value: string
	icon: ReactNode
}) {
	return (
		<div className="bg-background p-3.5">
			<div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
				{icon}
				{label}
			</div>
			<p className="mt-2 truncate text-sm font-medium text-foreground">
				{value}
			</p>
		</div>
	)
}

function TrackRow({ track, index }: { track: YTMusicTrack; index: number }) {
	const image = getSafeImage(track.image)
	return (
		<li className="group grid grid-cols-[2rem_3rem_1fr_auto] items-center gap-3 border-b border-border py-3">
			<span className="font-mono text-[10px] text-muted-foreground">
				{String(index + 1).padStart(2, '0')}
			</span>
			<div className="relative size-12 overflow-hidden bg-muted">
				{image ? (
					<Image
						src={image}
						alt=""
						fill
						sizes="48px"
						className="object-cover"
					/>
				) : (
					<div className="grid size-full place-items-center text-muted-foreground">
						<Music2 className="size-4" />
					</div>
				)}
			</div>
			<div className="min-w-0">
				<a
					href={track.url}
					target="_blank"
					rel="noreferrer"
					className="inline-flex max-w-full items-center gap-1.5 font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<span className="truncate">{track.name}</span>
					<ExternalLink className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
				</a>
				<p className="truncate text-xs text-muted-foreground">
					{track.artist}
					{track.album ? ` · ${track.album}` : ''}
				</p>
			</div>
			<div className="text-right font-mono text-[10px] text-muted-foreground">
				<p>
					{track.played_at_label || formatTimestamp(track.played_at)}
				</p>
				{track.played_at_estimated ? (
					<p className="mt-0.5 uppercase tracking-wider">Approx.</p>
				) : null}
			</div>
		</li>
	)
}

function EmptyState({ status }: { status: YTMusicStatus }) {
	const needsAttention =
		status === 'error' ||
		status === 'unauthorized' ||
		status === 'unconfigured'
	return (
		<div className="flex min-h-40 items-center gap-4 border-y border-border px-4 py-8">
			{needsAttention ? (
				<AlertTriangle className="size-5 text-red-500" />
			) : (
				<Check className="size-5 text-muted-foreground" />
			)}
			<div>
				<p className="text-sm font-medium">
					{needsAttention
						? 'Configuration needs attention'
						: 'The response is valid but contains no tracks'}
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					Use the status message above for the next action.
				</p>
			</div>
		</div>
	)
}

function SignalTrace({ active }: { active: boolean }) {
	return (
		<svg
			viewBox="0 0 320 80"
			className={active ? 'text-red-500' : 'text-muted-foreground'}
			fill="none"
		>
			<path
				d="M0 40h86l10-24 16 48 16-40 15 30 13-14h164"
				stroke="currentColor"
				strokeWidth="2"
				vectorEffect="non-scaling-stroke"
			/>
			<path
				d="M0 40h320"
				stroke="currentColor"
				strokeWidth="1"
				strokeDasharray="2 8"
				opacity=".35"
			/>
		</svg>
	)
}

function getSafeImage(value: string): string | null {
	try {
		const url = new URL(value)
		return url.protocol === 'https:' && IMAGE_HOSTS.has(url.hostname)
			? value
			: null
	} catch {
		return null
	}
}

function formatSource(result: YTMusicResult): string {
	if (result.source === 'youtube-music') return 'Live API'
	if (result.source === 'database')
		return result.isStale ? 'Stale cache' : 'Fresh cache'
	return 'None'
}

function formatTimestamp(value: string): string {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return 'Unknown'
	return new Intl.DateTimeFormat('en-GB', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'UTC'
	}).format(date)
}
