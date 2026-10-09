'use client'

import { useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

type CountryCount = { country: string | null; count: number }

type RecentView = {
	ipAddress: string | null
	geoCountry: string | null
	geoCity: string | null
	viewedAt: Date
	slug: string
}

const INITIAL_COUNTRIES = 5

const countryFlags: Record<string, string> = {
	Netherlands: '🇳🇱',
	'United States': '🇺🇸',
	Germany: '🇩🇪',
	'United Kingdom': '🇬🇧',
	France: '🇫🇷',
	Canada: '🇨🇦',
	Australia: '🇦🇺',
	India: '🇮🇳',
	Brazil: '🇧🇷',
	Japan: '🇯🇵',
	China: '🇨🇳',
	Spain: '🇪🇸',
	Italy: '🇮🇹',
	Russia: '🇷🇺',
	'South Korea': '🇰🇷',
	Mexico: '🇲🇽',
	Belgium: '🇧🇪',
	Switzerland: '🇨🇭',
	Poland: '🇵🇱',
	Sweden: '🇸🇪',
	Local: '🏠'
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

function isCountryCode(country: string) {
	return /^[A-Z]{2}$/.test(country)
}

function getCountryFlag(country: string | null): string {
	if (!country || country.startsWith('Unknown')) return '❓'
	if (isCountryCode(country)) {
		// Shifts A-Z onto the Unicode regional indicator symbols that form flag emoji
		return String.fromCodePoint(
			...[...country].map(char => 0x1f1a5 + char.charCodeAt(0))
		)
	}
	return countryFlags[country] || '🌍'
}

function getCountryLabel(country: string | null): string {
	if (!country) return 'Unknown'
	if (country === 'Local') return 'Local (dev)'
	if (isCountryCode(country)) return regionNames.of(country) ?? country
	return country
}

function getLocationLabel(view: RecentView) {
	const country = getCountryLabel(view.geoCountry)
	if (!view.geoCity || view.geoCity === 'Development') return country
	return `${country} · ${view.geoCity}`
}

export function CountryTraffic({
	viewsByCountry,
	totalViews
}: {
	viewsByCountry: CountryCount[]
	totalViews: number
}) {
	const [showAll, setShowAll] = useState(false)
	const visible = showAll
		? viewsByCountry
		: viewsByCountry.slice(0, INITIAL_COUNTRIES)

	return (
		<section className="admin-panel">
			<div className="admin-panel-header items-center">
				<h2 className="admin-panel-title">Traffic by country</h2>
				<Globe className="size-4 text-muted-foreground" />
			</div>

			{visible.length === 0 && (
				<p className="px-5 pb-6 text-center text-[13px] text-muted-foreground">
					No views recorded yet
				</p>
			)}

			<ul className="space-y-4 px-5 pb-5">
				{visible.map(item => {
					const percentage =
						totalViews > 0
							? Math.round((item.count / totalViews) * 100)
							: 0
					return (
						<li
							key={item.country || 'unknown'}
							className="flex items-center gap-3"
						>
							<span className="w-5 shrink-0 text-center text-base">
								{getCountryFlag(item.country)}
							</span>
							<div className="min-w-0 flex-1 space-y-1.5">
								<div className="flex items-center justify-between gap-2 text-[12px]">
									<span className="truncate">
										{getCountryLabel(item.country)}
									</span>
									<span className="tabular-nums">
										{item.count}
									</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="admin-bar flex-1">
										<span
											style={{ width: `${percentage}%` }}
										/>
									</div>
									<span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">
										{percentage}%
									</span>
								</div>
							</div>
						</li>
					)
				})}
			</ul>

			{viewsByCountry.length > INITIAL_COUNTRIES && (
				<button
					type="button"
					onClick={() => setShowAll(!showAll)}
					className="flex w-full items-center justify-center gap-1 border-t border-border py-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
				>
					{showAll ? 'Show fewer countries' : 'View all countries'}
					<ChevronDown
						className={`size-3 transition-transform ${showAll ? 'rotate-180' : ''}`}
					/>
				</button>
			)}
		</section>
	)
}

export function VisitorLog({ recentViews }: { recentViews: RecentView[] }) {
	return (
		<section className="admin-panel h-full">
			<div className="admin-panel-header items-center">
				<h2 className="admin-panel-title">Live visitor log</h2>
				<span className="flex items-center gap-2 text-[11px] text-muted-foreground">
					<span className="admin-live-dot" aria-hidden="true" />
					Live
				</span>
			</div>

			{recentViews.length === 0 && (
				<p className="px-5 pb-6 text-center text-[13px] text-muted-foreground">
					No visitors yet
				</p>
			)}

			<ScrollArea className="h-[360px]">
				<ul>
					{recentViews.map((view, i) => {
						const viewedAt = new Date(view.viewedAt)
						const isToday =
							viewedAt.toDateString() ===
							new Date().toDateString()
						return (
							<li
								key={`${view.slug}-${i}`}
								className="flex items-center gap-3 border-t border-border/60 px-5 py-3"
							>
								<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm">
									{getCountryFlag(view.geoCountry)}
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate text-[12px] font-medium">
										{view.slug.replace('/blog/', '')}
									</p>
									<p className="truncate text-[11px] text-muted-foreground">
										{getLocationLabel(view)}
									</p>
								</div>
								<time
									dateTime={viewedAt.toISOString()}
									className="shrink-0 text-[11px] tabular-nums text-muted-foreground"
								>
									{isToday
										? viewedAt.toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit'
											})
										: viewedAt.toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric'
											})}
								</time>
							</li>
						)
					})}
				</ul>
			</ScrollArea>
		</section>
	)
}
