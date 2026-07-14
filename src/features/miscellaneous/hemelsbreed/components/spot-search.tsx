'use client'

import { useState } from 'react'
import {
	Check,
	ExternalLink,
	Loader2,
	Lock,
	MapPin,
	Search,
	Sparkles,
	X
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from '@/features/auth/client'
import { cn } from '@/shared/lib/cn'
import { formatKm } from '../utils/geo'
import { googleMapsSearchUrl } from '../utils/google-maps'
import type { TTrilaterationEstimate } from '../utils/trilateration'
import type { TSpot } from '../types'

type Props = {
	estimate: TTrilaterationEstimate | null
	spots: TSpot[]
	onSpots: (spots: TSpot[]) => void
	onFocusSpot: (spot: TSpot) => void
}

type TPhase = 'interpreting' | 'searching'

type TInterpretation = {
	selectors: string[]
	source: 'ai' | 'keyword' | 'name'
	aiAllowed: boolean
}

type TSpotEvent =
	| { type: 'phase'; phase: TPhase }
	| ({ type: 'interpretation' } & TInterpretation)
	| { type: 'spots'; spots: TSpot[] }
	| { type: 'error'; message: string }

const PHASE_LABEL: Record<TPhase, string> = {
	interpreting: 'Interpreting your query with AI',
	searching: 'Searching OpenStreetMap data'
}

const SOURCE_LABEL: Record<TInterpretation['source'], string> = {
	ai: 'AI matched',
	keyword: 'keyword matched',
	name: 'name matched'
}

const SOURCE_DETAIL: Record<TInterpretation['source'], string> = {
	ai: 'The AI translated your query into these OpenStreetMap tags:',
	keyword: 'A built-in keyword rule mapped your query to these tags:',
	name: 'No tag matched, so places are matched on their name instead.'
}

function PhaseRow({
	phase,
	active,
	done
}: {
	phase: TPhase
	active: boolean
	done: boolean
}) {
	return (
		<li
			className={cn(
				'flex items-center gap-2 text-xs',
				active ? 'text-foreground' : 'text-muted-foreground',
				!active && !done && 'opacity-50'
			)}
		>
			{done ? (
				<Check aria-hidden className="size-3.5 text-emerald-500" />
			) : active ? (
				<Loader2 aria-hidden className="size-3.5 animate-spin" />
			) : (
				<span aria-hidden className="size-3.5" />
			)}
			{PHASE_LABEL[phase]}
			{active && <span className="sr-only">(in progress)</span>}
		</li>
	)
}

const MIN_RADIUS_KM = 0.1
const MAX_RADIUS_KM = 50

function autoRadiusKm(estimate: TTrilaterationEstimate): number {
	return Math.min(Math.max(estimate.errorKm * 3, 5), MAX_RADIUS_KM)
}

export function SpotSearch({ estimate, spots, onSpots, onFocusSpot }: Props) {
	const { data: session } = useSession()
	const [query, setQuery] = useState('')
	const [radiusValue, setRadiusValue] = useState('')
	const [radiusUnit, setRadiusUnit] = useState<'m' | 'km'>('km')
	const [loading, setLoading] = useState(false)
	const [phases, setPhases] = useState<TPhase[]>([])
	const [interpretation, setInterpretation] = useState<TInterpretation | null>(
		null
	)
	const [error, setError] = useState<string | null>(null)
	const [searched, setSearched] = useState(false)
	const [searchedRadiusKm, setSearchedRadiusKm] = useState<number | null>(null)

	const sessionRole = session?.user
		? ((session.user as { role?: string | null }).role ?? null)
		: null
	const aiAvailable = interpretation
		? interpretation.aiAllowed
		: sessionRole === 'admin'

	function customRadiusKm(): number | null {
		const parsed = Number(radiusValue.trim().replace(',', '.'))
		if (!radiusValue.trim() || !Number.isFinite(parsed) || parsed <= 0) {
			return null
		}
		const km = radiusUnit === 'm' ? parsed / 1000 : parsed
		return Math.min(Math.max(km, MIN_RADIUS_KM), MAX_RADIUS_KM)
	}

	const effectiveRadiusKm = estimate
		? (customRadiusKm() ?? autoRadiusKm(estimate))
		: null

	async function search() {
		if (!estimate || loading) return
		const trimmed = query.trim()
		if (!trimmed) return

		setLoading(true)
		setError(null)
		setSearched(false)
		setPhases([])
		setInterpretation(null)
		onSpots([])

		function handleEvent(event: TSpotEvent) {
			if (event.type === 'phase') {
				setPhases(current =>
					current.includes(event.phase)
						? current
						: [...current, event.phase]
				)
				return
			}
			if (event.type === 'interpretation') {
				setInterpretation({
					selectors: event.selectors,
					source: event.source,
					aiAllowed: event.aiAllowed
				})
				return
			}
			if (event.type === 'spots') {
				setSearched(true)
				onSpots(event.spots)
				if (event.spots.length > 0) onFocusSpot(event.spots[0])
				return
			}
			setError(event.message)
		}

		try {
			const radiusKm = customRadiusKm() ?? autoRadiusKm(estimate)
			setSearchedRadiusKm(radiusKm)
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
			if (!response.ok || !response.body) {
				const data = await response.json().catch(() => null)
				setError(data?.error ?? 'Search failed')
				return
			}

			const reader = response.body.getReader()
			const decoder = new TextDecoder()
			let buffer = ''
			for (;;) {
				const { done, value } = await reader.read()
				if (done) break
				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split('\n')
				buffer = lines.pop() ?? ''
				for (const line of lines) {
					if (!line.trim()) continue
					handleEvent(JSON.parse(line) as TSpotEvent)
				}
			}
			if (buffer.trim()) handleEvent(JSON.parse(buffer) as TSpotEvent)
		} catch {
			setError('Search failed, try again')
			toast.error('Search failed, try again')
		} finally {
			setLoading(false)
			setPhases([])
		}
	}

	function clear() {
		onSpots([])
		setInterpretation(null)
		setError(null)
		setSearched(false)
		setQuery('')
	}

	return (
		<div className="flex flex-col gap-2 border border-border/50 bg-muted/20 p-3">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2 text-sm font-medium">
					<Sparkles aria-hidden className="size-4 text-muted-foreground" />
					Find spots at the crossing
				</div>
				<span
					className={cn(
						'flex items-center gap-1 border px-1.5 py-0.5 text-[10px] uppercase tracking-wide',
						aiAvailable
							? 'border-emerald-500/40 text-emerald-500'
							: 'border-border/60 text-muted-foreground'
					)}
					title={
						aiAvailable
							? 'Queries are interpreted by AI into OpenStreetMap tags'
							: 'AI interpretation is reserved for the site owner — searches fall back to keyword and name matching'
					}
				>
					{aiAvailable ? (
						<Sparkles aria-hidden className="size-3" />
					) : (
						<Lock aria-hidden className="size-3" />
					)}
					{aiAvailable ? 'AI on' : 'AI locked'}
				</span>
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

			{estimate && (
				<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					<label htmlFor="spot-search-radius">Radius</label>
					<Input
						id="spot-search-radius"
						value={radiusValue}
						onChange={event => setRadiusValue(event.target.value)}
						placeholder="auto"
						inputMode="decimal"
						disabled={loading}
						className="h-7 w-20 text-xs transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-muted/50"
						aria-label={`Search radius in ${radiusUnit === 'm' ? 'meters' : 'kilometers'}`}
					/>
					<div
						className="flex border border-border/60"
						role="group"
						aria-label="Radius unit"
					>
						{(['m', 'km'] as const).map(unit => (
							<button
								key={unit}
								type="button"
								onClick={() => setRadiusUnit(unit)}
								aria-pressed={radiusUnit === unit}
								className={cn(
									'px-2 py-0.5 text-[10px] uppercase',
									radiusUnit === unit
										? 'bg-accent text-accent-foreground'
										: 'hover:text-foreground'
								)}
							>
								{unit}
							</button>
						))}
					</div>
					<span>
						{customRadiusKm() !== null
							? `searching within ${formatKm(effectiveRadiusKm ?? 0)}`
							: `auto · ${formatKm(autoRadiusKm(estimate))} from crossing accuracy`}
					</span>
				</div>
			)}

			{loading && phases.length > 0 && (
				<ul
					className="flex flex-col gap-1.5 border border-border/40 bg-background/40 p-2"
					aria-live="polite"
				>
					{phases.map((phase, index) => (
						<PhaseRow
							key={phase}
							phase={phase}
							active={index === phases.length - 1}
							done={index < phases.length - 1}
						/>
					))}
				</ul>
			)}

			{error && !loading && (
				<p role="alert" className="text-xs text-destructive">
					{error}
				</p>
			)}

			{interpretation && !loading && !error && (
				<div className="flex flex-col gap-1.5 border border-border/40 bg-background/40 p-2">
					<p className="text-xs text-muted-foreground">
						<span className="font-medium text-foreground">
							{SOURCE_LABEL[interpretation.source]}
						</span>{' '}
						· {SOURCE_DETAIL[interpretation.source]}
					</p>
					{interpretation.selectors.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{interpretation.selectors.map(selector => (
								<code
									key={selector}
									className="border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
								>
									{selector}
								</code>
							))}
						</div>
					)}
					{!interpretation.aiAllowed && (
						<p className="flex items-center gap-1 text-[10px] text-muted-foreground">
							<Lock aria-hidden className="size-3" />
							AI interpretation is reserved for the site owner, so
							this search used the fallback matching.
						</p>
					)}
				</div>
			)}

			{searched && spots.length === 0 && !error && (
				<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Search aria-hidden className="size-3.5" />
					No matches within{' '}
					{searchedRadiusKm ? formatKm(searchedRadiusKm) : 'the radius'}{' '}
					of the crossing point. Try a broader term or a bigger radius.
				</p>
			)}

			{spots.length > 0 && (
				<>
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>
							{spots.length} {spots.length === 1 ? 'spot' : 'spots'}
							{searchedRadiusKm
								? ` · within ${formatKm(searchedRadiusKm)}`
								: ''}
							{interpretation
								? ` · ${SOURCE_LABEL[interpretation.source]}`
								: ''}
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
