'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useInViewOnce } from '@/hooks/use-in-view-once'
import { cn } from '@/shared/lib/cn'

type Tab = 'logs' | 'visitors' | 'speed'

type LogRow = {
	id: number
	time: string
	name: string
	detail: string
	own?: boolean
}

type ScriptStep = {
	name: string
	detail: string
	online?: number
	delay: number
}

const tabs: Tab[] = ['logs', 'visitors', 'speed']

const script: ScriptStep[] = [
	{ name: 'pageview', detail: '/packages/[slug]', delay: 1400 },
	{ name: 'web_vital', detail: 'LCP 1.1s', delay: 500 },
	{ name: 'web_vital', detail: 'CLS 0.01', delay: 300 },
	{ name: 'scroll_depth', detail: '50%', delay: 2600 },
	{ name: 'session_start', detail: 'DE · Firefox', online: 1, delay: 1800 },
	{ name: 'pageview', detail: '/blog/gh-select', delay: 400 },
	{ name: 'web_vital', detail: 'INP 48ms', delay: 900 },
	{ name: 'outbound_click', detail: 'github.com', delay: 2200 },
	{ name: 'session_end', detail: '3m 12s', online: -1, delay: 1600 },
	{ name: 'engagement', detail: '42s visible', delay: 1200 },
	{ name: 'scroll_depth', detail: '75%', delay: 2800 },
	{ name: 'pageview', detail: '/', delay: 700 },
	{ name: 'session_start', detail: 'US · Chrome', online: 1, delay: 2000 },
	{ name: 'web_vital', detail: 'TTFB 120ms', delay: 400 }
]

const visitors = [
	{ country: 'NL', path: '/', time: '3m 12s' },
	{ country: 'DE', path: '/blog/gh-select', time: '1m 48s' },
	{ country: 'US', path: '/packages/analytics', time: '52s' },
	{ country: 'GB', path: '/projects', time: '14s' },
	{ country: 'FR', path: '/blog', time: '6s' }
]

const vitals = [
	{ name: 'LCP', value: '1.1s', score: 0.86 },
	{ name: 'INP', value: '48ms', score: 0.94 },
	{ name: 'CLS', value: '0.01', score: 0.97 },
	{ name: 'TTFB', value: '120ms', score: 0.9 }
]

const MAX_ROWS = 7
const MIN_ONLINE = 1
const MAX_ONLINE = visitors.length
const START_SECONDS = 14 * 3600 + 2 * 60 + 8

const seed: LogRow[] = [
	{ id: 0, time: formatTime(START_SECONDS), name: 'pageview', detail: '/' },
	{
		id: 1,
		time: formatTime(START_SECONDS - 4),
		name: 'web_vital',
		detail: 'LCP 0.9s'
	},
	{
		id: 2,
		time: formatTime(START_SECONDS - 11),
		name: 'session_start',
		detail: 'NL · Safari'
	}
]

function formatTime(seconds: number) {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [h, m, s].map(part => String(part).padStart(2, '0')).join(':')
}

function clampOnline(value: number) {
	return Math.min(MAX_ONLINE, Math.max(MIN_ONLINE, value))
}

export function SpoarPreview() {
	const ref = useRef<HTMLDivElement>(null)
	const isInView = useInViewOnce(ref, '0px 0px -20% 0px')
	const [tab, setTab] = useState<Tab>('logs')
	const [rows, setRows] = useState(seed)
	const [online, setOnline] = useState(3)
	const clock = useRef({ id: seed.length, seconds: START_SECONDS, step: 0 })

	function push(name: string, detail: string, own = false) {
		clock.current.id += 1
		clock.current.seconds += 1 + Math.floor(Math.random() * 3)
		const row = {
			id: clock.current.id,
			time: formatTime(clock.current.seconds),
			name,
			detail,
			own
		}
		setRows(current => [row, ...current].slice(0, MAX_ROWS))
	}

	useEffect(() => {
		if (!isInView) return
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return
		}

		let timer = 0

		function schedule(delay: number) {
			timer = window.setTimeout(() => {
				const step = script[clock.current.step % script.length]
				clock.current.step += 1
				if (!document.hidden) {
					push(step.name, step.detail)
					if (step.online) {
						setOnline(current =>
							clampOnline(current + (step.online ?? 0))
						)
					}
				}
				schedule(step.delay)
			}, delay)
		}

		schedule(900)
		return () => window.clearTimeout(timer)
	}, [isInView])

	function trackClick() {
		setTab('logs')
		push('hello', "{ from: 'you' }", true)
	}

	const counts: Record<Tab, number> = {
		logs: rows.length,
		visitors: online,
		speed: vitals.length
	}

	return (
		<div ref={ref} className="absolute inset-0 overflow-hidden">
			<div
				className={cn(
					'absolute inset-x-[6%] bottom-0 top-[10%] flex flex-col border-x border-t border-border/50 bg-background-secondary font-mono text-[10px] transition-[translate] duration-500 ease-drawer motion-reduce:transition-[opacity] motion-reduce:duration-200 motion-reduce:ease-[ease]',
					isInView
						? 'translate-y-0 opacity-100'
						: 'translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0'
				)}
			>
				<div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
					<span className="relative flex size-1.5">
						<span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60 motion-reduce:animate-none" />
						<span className="relative size-1.5 rounded-full bg-emerald-500" />
					</span>
					<span className="font-medium text-foreground">spoar</span>
					<span className="text-muted-foreground">
						~/
						<span className="text-foreground/80">
							remcostoeten.nl
						</span>
					</span>
					<span
						key={online}
						className="ml-auto tabular-nums text-muted-foreground transition-colors duration-700 ease-out starting:text-foreground"
					>
						{online} online
					</span>
				</div>
				<div
					role="tablist"
					aria-label="Spoar devtools preview"
					className="flex border-b border-border/50 px-1.5"
				>
					{tabs.map(name => (
						<button
							key={name}
							type="button"
							role="tab"
							aria-selected={tab === name}
							onClick={() => setTab(name)}
							className={cn(
								'relative flex items-center gap-1.5 px-1.5 py-1.5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:text-foreground',
								tab === name
									? 'text-foreground'
									: 'text-muted-foreground hover:text-foreground'
							)}
						>
							{name}
							<span className="tabular-nums text-muted-foreground/70">
								{counts[name]}
							</span>
							{tab === name && (
								<span className="absolute inset-x-1.5 -bottom-px h-px bg-foreground" />
							)}
						</button>
					))}
				</div>
				<div className="relative min-h-0 flex-1 overflow-hidden">
					{tab === 'logs' && (
						<ul>
							{rows.map(row => (
								<li
									key={row.id}
									className={cn(
										'flex h-7 items-center gap-3 overflow-hidden border-b border-border/30 px-3 transition-[height,opacity,background-color] [transition-duration:400ms,400ms,1600ms] ease-drawer starting:h-0 starting:opacity-0 motion-reduce:transition-none',
										row.own
											? 'bg-emerald-500/10'
											: 'bg-transparent starting:bg-foreground/10 '
									)}
								>
									<span className="tabular-nums text-muted-foreground/70">
										{row.time}
									</span>
									<span
										className={cn(
											'w-24 shrink-0 truncate',
											row.own
												? 'text-emerald-400'
												: 'text-foreground'
										)}
									>
										{row.name}
									</span>
									<span className="truncate text-muted-foreground">
										{row.detail}
									</span>
								</li>
							))}
						</ul>
					)}
					{tab === 'visitors' && (
						<ul>
							{visitors.slice(0, online).map((visitor, index) => (
								<li
									key={visitor.path}
									style={
										{
											'--row-delay': `${index * 40}ms`
										} as CSSProperties
									}
									className="flex h-7 items-center gap-3 border-b border-border/30 px-3 transition-[opacity,translate] delay-[var(--row-delay)] duration-300 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-none"
								>
									<span className="w-5 text-muted-foreground">
										{visitor.country}
									</span>
									<span className="flex-1 truncate text-foreground">
										{visitor.path}
									</span>
									<span className="tabular-nums text-muted-foreground">
										{visitor.time}
									</span>
								</li>
							))}
						</ul>
					)}
					{tab === 'speed' && (
						<ul>
							{vitals.map((vital, index) => (
								<li
									key={vital.name}
									className="flex h-7 items-center gap-3 border-b border-border/30 px-3"
								>
									<span className="w-8 text-foreground">
										{vital.name}
									</span>
									<span className="h-1 flex-1 bg-border/60">
										<span
											style={
												{
													'--score': vital.score,
													'--bar-delay': `${index * 80}ms`
												} as CSSProperties
											}
											className="block h-full w-[calc(var(--score)*100%)] bg-emerald-500/70 transition-[width] delay-[var(--bar-delay)] duration-700 ease-drawer starting:w-0 motion-reduce:transition-none"
										/>
									</span>
									<span className="w-12 text-right tabular-nums text-muted-foreground">
										{vital.value}
									</span>
								</li>
							))}
						</ul>
					)}
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background-secondary to-transparent" />
				</div>
				<div className="flex items-center gap-2 border-t border-border/50 px-3 py-1.5">
					<span className="select-none text-muted-foreground/50">
						›
					</span>
					<button
						type="button"
						onClick={trackClick}
						className="text-muted-foreground transition-[color,scale] duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:text-foreground active:scale-[0.98]"
					>
						<span className="text-foreground">analytics</span>
						.track(
						<span className="text-emerald-400">'hello'</span>)
					</button>
					<span className="ml-auto text-muted-foreground/50">
						click to send
					</span>
				</div>
			</div>
		</div>
	)
}
