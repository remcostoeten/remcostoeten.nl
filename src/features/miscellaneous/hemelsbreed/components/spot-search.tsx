'use client'

import { useState } from 'react'
import { ExternalLink, Loader2, MapPin, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { googleMapsSearchUrl } from '../utils/google-maps'
import type { TTrilaterationEstimate } from '../utils/trilateration'
import type { TSpot } from '../types'

type Props = {
	estimate: TTrilaterationEstimate | null
	spots: TSpot[]
	onSpots: (spots: TSpot[]) => void
	onFocusSpot: (spot: TSpot) => void
}

const SOURCE_LABEL: Record<string, string> = {
	ai: 'AI matched',
	keyword: 'keyword matched',
	name: 'name matched'
}

export function SpotSearch({ estimate, spots, onSpots, onFocusSpot }: Props) {
	const [query, setQuery] = useState('')
	const [loading, setLoading] = useState(false)
	const [source, setSource] = useState<string | null>(null)

	async function search() {
		if (!estimate || loading) return
		const trimmed = query.trim()
		if (!trimmed) return

		setLoading(true)
		try {
			const radiusKm = Math.min(Math.max(estimate.errorKm * 2, 2), 25)
			const response = await fetch('/api/hemelsbreed/spots', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query: trimmed,
					lat: estimate.lat,
					lng: estimate.lng,
					radiusKm
				})
			})
			const data = await response.json()
			if (!response.ok) {
				toast.error(data.error ?? 'Search failed')
				return
			}
			onSpots(data.spots)
			setSource(data.source)
			if (data.spots.length === 0) {
				toast.info(`No matches near the crossing point`)
			} else {
				const first = data.spots[0]
				onFocusSpot(first)
			}
		} catch {
			toast.error('Search failed, try again')
		} finally {
			setLoading(false)
		}
	}

	function clear() {
		onSpots([])
		setSource(null)
		setQuery('')
	}

	return (
		<div className="flex flex-col gap-2 border border-border/50 bg-muted/20 p-3">
			<div className="flex items-center gap-2 text-sm font-medium">
				<Sparkles aria-hidden className="size-4 text-muted-foreground" />
				Find spots at the crossing
			</div>

			<form
				className="flex items-center gap-2"
				onSubmit={event => {
					event.preventDefault()
					search()
				}}
			>
				<Input
					value={query}
					onChange={event => setQuery(event.target.value)}
					placeholder="e.g. tattoo shop, sushi restaurant, gym"
					disabled={!estimate}
					className="h-8 text-sm transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-muted/50"
					aria-label="Search for places near the estimated crossing point"
				/>
				<Button
					type="submit"
					size="sm"
					variant="outline"
					className="h-8 shrink-0"
					disabled={!estimate || loading || !query.trim()}
				>
					{loading ? (
						<Loader2 aria-hidden className="size-4 animate-spin" />
					) : (
						'Search'
					)}
				</Button>
			</form>

			{!estimate && (
				<p className="text-xs text-muted-foreground">
					Add at least three circles so the crossing point can be
					pinpointed first.
				</p>
			)}

			{spots.length > 0 && (
				<>
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>
							{spots.length} {spots.length === 1 ? 'spot' : 'spots'}
							{source ? ` · ${SOURCE_LABEL[source] ?? source}` : ''}
						</span>
						<button
							type="button"
							onClick={clear}
							className="flex items-center gap-1 hover:text-foreground"
						>
							<X aria-hidden className="size-3" />
							Clear
						</button>
					</div>
					<ul className="max-h-56 divide-y divide-border/40 overflow-auto">
						{spots.map(spot => (
							<li key={spot.id} className="flex items-stretch gap-1">
								<button
									type="button"
									onClick={() => onFocusSpot(spot)}
									className={cn(
										'flex min-w-0 flex-1 items-start gap-2 px-1 py-2 text-left text-sm',
										'hover:bg-accent hover:text-accent-foreground'
									)}
								>
									<MapPin
										aria-hidden
										className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
									/>
									<span className="min-w-0">
										<span className="block truncate">
											{spot.name}
										</span>
										<span className="block truncate text-xs text-muted-foreground">
											{spot.kind}
											{spot.address ? ` · ${spot.address}` : ''}
										</span>
									</span>
								</button>
								<a
									href={googleMapsSearchUrl(spot.lat, spot.lng)}
									target="_blank"
									rel="noopener noreferrer"
									title={`Open ${spot.name} in Google Maps`}
									aria-label={`Open ${spot.name} in Google Maps`}
									className="flex shrink-0 items-center px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
								>
									<ExternalLink aria-hidden className="size-3.5" />
								</a>
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	)
}
