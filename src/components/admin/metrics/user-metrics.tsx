'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import {
	Globe,
	Activity,
	TrendingUp,
	Users,
	Eye,
	ChevronDown,
	ChevronUp,
	MapPin
} from 'lucide-react'

type MetricsProps = {
	totalViews: number
	uniqueVisitors: number
	viewsByCountry: Array<{ country: string | null; count: number }>
	recentViews: Array<{
		ipAddress: string | null
		geoCountry: string | null
		geoCity: string | null
		viewedAt: Date
		slug: string
	}>
}

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

function getCountryFlag(country: string | null): string {
	if (!country) return '❓'
	if (country.startsWith('Unknown')) return '❓'
	return countryFlags[country] || '🌍'
}

function getCountryLabel(country: string | null): string {
	if (!country) return 'Unknown'
	if (country === 'Local') return 'Local (Dev)'
	if (country.startsWith('Unknown')) return country
	return country
}

function StatCard({
	icon: Icon,
	label,
	value,
	trend
}: {
	icon: typeof Eye
	label: string
	value: number
	trend?: number
}) {
	return (
		<Card className="relative overflow-hidden">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-lg bg-primary/10">
							<Icon className="w-4 h-4 text-primary" />
						</div>
						<span className="text-sm text-muted-foreground">
							{label}
						</span>
					</div>
					{trend !== undefined && trend > 0 && (
						<Badge
							variant="secondary"
							className="text-xs text-green-600 bg-green-50"
						>
							<TrendingUp className="w-3 h-3 mr-1" />+{trend}%
						</Badge>
					)}
				</div>
				<div className="mt-3 text-3xl font-bold tracking-tight">
					{value.toLocaleString()}
				</div>
			</CardContent>
		</Card>
	)
}

function CountryBar({
	country,
	count,
	total,
	rank
}: {
	country: string | null
	count: number
	total: number
	rank: number
}) {
	const percentage = Math.round((count / total) * 100)

	return (
		<div className="flex items-center gap-3 py-2">
			<span className="text-lg shrink-0">{getCountryFlag(country)}</span>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between mb-1">
					<span className="text-sm font-medium truncate">
						{getCountryLabel(country)}
					</span>
					<span className="text-xs text-muted-foreground ml-2">
						{count} ({percentage}%)
					</span>
				</div>
				<div className="h-2 bg-secondary rounded-full overflow-hidden">
					<div
						className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
						style={{ width: `${percentage}%` }}
					/>
				</div>
			</div>
		</div>
	)
}

export function UserMetrics({ data }: { data: MetricsProps }) {
	const [showAllCountries, setShowAllCountries] = useState(false)
	const [visitorLogExpanded, setVisitorLogExpanded] = useState(true)

	const visibleCountries = showAllCountries
		? data.viewsByCountry
		: data.viewsByCountry.slice(0, 5)

	const todayViews = data.recentViews.filter(view => {
		const viewDate = new Date(view.viewedAt)
		const today = new Date()
		return viewDate.toDateString() === today.toDateString()
	})

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-3">
				<StatCard
					icon={Eye}
					label="Total Views"
					value={data.totalViews}
				/>
				<StatCard
					icon={Users}
					label="Unique Visitors"
					value={data.uniqueVisitors}
				/>
			</div>

			{todayViews.length > 0 && (
				<Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
							<span className="text-sm font-medium text-green-700 dark:text-green-400">
								{todayViews.length} views today
							</span>
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base">
						<Globe className="w-4 h-4" />
						Traffic by Country
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-2">
					<div className="space-y-1">
						{visibleCountries.map((item, i) => (
							<CountryBar
								key={item.country || 'unknown'}
								country={item.country}
								count={item.count}
								total={data.totalViews}
								rank={i + 1}
							/>
						))}
					</div>
					{data.viewsByCountry.length > 5 && (
						<button
							onClick={() =>
								setShowAllCountries(!showAllCountries)
							}
							className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
						>
							{showAllCountries ? (
								<>
									Show less <ChevronUp className="w-3 h-3" />
								</>
							) : (
								<>
									Show all {data.viewsByCountry.length}{' '}
									countries{' '}
									<ChevronDown className="w-3 h-3" />
								</>
							)}
						</button>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<button
						onClick={() =>
							setVisitorLogExpanded(!visitorLogExpanded)
						}
						className="w-full flex items-center justify-between"
					>
						<CardTitle className="flex items-center gap-2 text-base">
							<Activity className="w-4 h-4" />
							Live Visitor Log
						</CardTitle>
						{visitorLogExpanded ? (
							<ChevronUp className="w-4 h-4 text-muted-foreground" />
						) : (
							<ChevronDown className="w-4 h-4 text-muted-foreground" />
						)}
					</button>
				</CardHeader>
				{visitorLogExpanded && (
					<CardContent className="pt-0">
						<ScrollArea className="h-[300px] md:h-[400px]">
							<div className="space-y-3">
								{data.recentViews.map((view, i) => {
									const isToday =
										new Date(
											view.viewedAt
										).toDateString() ===
										new Date().toDateString()
									return (
										<div
											key={i}
											className={`p-3 rounded-lg border transition-colors ${
												isToday
													? 'bg-primary/5 border-primary/20'
													: 'bg-muted/30'
											}`}
										>
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">
														{view.slug.replace(
															'/blog/',
															''
														)}
													</p>
													<div className="flex items-center gap-2 mt-1 flex-wrap">
														<span className="text-lg">
															{getCountryFlag(
																view.geoCountry
															)}
														</span>
														<Badge
															variant="outline"
															className="text-[10px] py-0 h-5"
														>
															{getCountryLabel(
																view.geoCountry
															)}
														</Badge>
														{view.geoCity &&
															view.geoCity !==
																'Development' && (
																<span className="text-xs text-muted-foreground flex items-center gap-1">
																	<MapPin className="w-3 h-3" />
																	{
																		view.geoCity
																	}
																</span>
															)}
													</div>
												</div>
												<div className="text-right shrink-0">
													<span className="text-xs text-muted-foreground">
														{new Date(
															view.viewedAt
														).toLocaleTimeString(
															[],
															{
																hour: '2-digit',
																minute: '2-digit'
															}
														)}
													</span>
													{isToday && (
														<div className="mt-1">
															<Badge
																variant="secondary"
																className="text-[10px] bg-green-100 text-green-700"
															>
																Today
															</Badge>
														</div>
													)}
												</div>
											</div>
										</div>
									)
								})}
							</div>
						</ScrollArea>
					</CardContent>
				)}
			</Card>
		</div>
	)
}
