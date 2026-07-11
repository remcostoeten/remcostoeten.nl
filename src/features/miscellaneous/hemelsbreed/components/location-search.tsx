'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Crosshair, Loader2, MapPin, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { parseLatLng } from '../utils/geo'
import {
	isGoogleMapsShortLink,
	parseGoogleMapsUrl
} from '../utils/google-maps'
import { lookupLocation, suggestLocations } from '../utils/pdok'
import type { TPdokLocation, TPdokSuggestion } from '../types'

type Props = {
	onPick: (location: TPdokLocation) => void
}

export function LocationSearch({ onPick }: Props) {
	const [query, setQuery] = useState('')
	const [suggestions, setSuggestions] = useState<TPdokSuggestion[]>([])
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [active, setActive] = useState(0)
	const wrapRef = useRef<HTMLDivElement>(null)

	const gmaps = useMemo(() => parseGoogleMapsUrl(query), [query])
	const shortLink = useMemo(() => isGoogleMapsShortLink(query), [query])
	const coords = useMemo(
		() => (gmaps ? null : parseLatLng(query)),
		[query, gmaps]
	)

	useEffect(() => {
		const trimmed = query.trim()
		if (coords || gmaps || shortLink || trimmed.length < 2) {
			setSuggestions([])
			return
		}

		const controller = new AbortController()
		const timer = setTimeout(async () => {
			setLoading(true)
			try {
				const results = await suggestLocations(
					trimmed,
					controller.signal
				)
				setSuggestions(results)
				setActive(0)
				setOpen(true)
			} catch (error) {
				if (!controller.signal.aborted) console.warn(error)
			} finally {
				setLoading(false)
			}
		}, 250)

		return () => {
			controller.abort()
			clearTimeout(timer)
		}
	}, [query, coords, gmaps, shortLink])

	useEffect(() => {
		function onDocClick(event: MouseEvent) {
			if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', onDocClick)
		return () => document.removeEventListener('mousedown', onDocClick)
	}, [])

	function pickCoords() {
		if (!coords) return
		setOpen(false)
		onPick({
			label: `${coords.lat}, ${coords.lng}`,
			lat: coords.lat,
			lng: coords.lng
		})
		setQuery('')
	}

	function pickGmaps() {
		if (!gmaps) return
		setOpen(false)
		onPick({
			label: gmaps.label ?? `${gmaps.lat}, ${gmaps.lng}`,
			lat: gmaps.lat,
			lng: gmaps.lng
		})
		setQuery('')
	}

	async function resolveShortLink() {
		if (loading) return
		setLoading(true)
		try {
			const response = await fetch('/api/hemelsbreed/expand', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: query.trim() })
			})
			const data = await response.json()
			const point =
				response.ok && typeof data.url === 'string'
					? parseGoogleMapsUrl(data.url)
					: null
			if (!point) {
				toast.error('Could not read a location from that link')
				return
			}
			setOpen(false)
			onPick({
				label: point.label ?? `${point.lat}, ${point.lng}`,
				lat: point.lat,
				lng: point.lng
			})
			setQuery('')
		} catch {
			toast.error('Could not resolve the Google Maps link')
		} finally {
			setLoading(false)
		}
	}

	async function pick(suggestion: TPdokSuggestion) {
		setOpen(false)
		setQuery(suggestion.label)
		try {
			const location = await lookupLocation(suggestion.id)
			if (location) {
				onPick(location)
				setQuery('')
			}
		} catch (error) {
			console.warn(error)
		}
	}

	function onKeyDown(event: React.KeyboardEvent) {
		if (coords || gmaps || shortLink) {
			if (event.key === 'Enter') {
				event.preventDefault()
				if (coords) pickCoords()
				else if (gmaps) pickGmaps()
				else resolveShortLink()
			} else if (event.key === 'Escape') {
				setOpen(false)
			}
			return
		}
		if (!open || suggestions.length === 0) return
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			setActive(i => Math.min(i + 1, suggestions.length - 1))
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			setActive(i => Math.max(i - 1, 0))
		} else if (event.key === 'Enter') {
			event.preventDefault()
			const chosen = suggestions[active]
			if (chosen) pick(chosen)
		} else if (event.key === 'Escape') {
			setOpen(false)
		}
	}

	return (
		<div ref={wrapRef} className="relative">
			<div className="relative">
				<Search
					aria-hidden
					className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					value={query}
					onChange={event => setQuery(event.target.value)}
					onFocus={() =>
						(coords || gmaps || shortLink || suggestions.length > 0) &&
						setOpen(true)
					}
					onKeyDown={onKeyDown}
					placeholder="Address, postcode, place or Google Maps link"
					className="pl-8 pr-8 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-muted/50"
					aria-label="Search a location in the Netherlands"
					autoComplete="off"
				/>
				{loading && (
					<Loader2
						aria-hidden
						className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
					/>
				)}
			</div>

			{coords && (
				<ul
					role="listbox"
					className="absolute z-[500] mt-1 w-full overflow-auto border border-border/60 bg-popover shadow-lg"
				>
					<li role="option" aria-selected>
						<button
							type="button"
							onClick={pickCoords}
							className="flex w-full items-center gap-2 bg-accent px-3 py-2 text-left text-sm text-accent-foreground"
						>
							<Crosshair
								aria-hidden
								className="size-3.5 shrink-0 text-muted-foreground"
							/>
							<span className="truncate">
								Drop pin at {coords.lat}, {coords.lng}
							</span>
							<span className="ml-auto shrink-0 text-xs text-muted-foreground">
								lat lng
							</span>
						</button>
					</li>
				</ul>
			)}

			{gmaps && (
				<ul
					role="listbox"
					className="absolute z-[500] mt-1 w-full overflow-auto border border-border/60 bg-popover shadow-lg"
				>
					<li role="option" aria-selected>
						<button
							type="button"
							onClick={pickGmaps}
							className="flex w-full items-center gap-2 bg-accent px-3 py-2 text-left text-sm text-accent-foreground"
						>
							<MapPin
								aria-hidden
								className="size-3.5 shrink-0 text-muted-foreground"
							/>
							<span className="truncate">
								Drop pin at{' '}
								{gmaps.label ??
									`${gmaps.lat.toFixed(5)}, ${gmaps.lng.toFixed(5)}`}
							</span>
							<span className="ml-auto shrink-0 text-xs text-muted-foreground">
								Google Maps
							</span>
						</button>
					</li>
				</ul>
			)}

			{shortLink && !gmaps && (
				<ul
					role="listbox"
					className="absolute z-[500] mt-1 w-full overflow-auto border border-border/60 bg-popover shadow-lg"
				>
					<li role="option" aria-selected>
						<button
							type="button"
							onClick={resolveShortLink}
							disabled={loading}
							className="flex w-full items-center gap-2 bg-accent px-3 py-2 text-left text-sm text-accent-foreground disabled:opacity-60"
						>
							{loading ? (
								<Loader2
									aria-hidden
									className="size-3.5 shrink-0 animate-spin text-muted-foreground"
								/>
							) : (
								<MapPin
									aria-hidden
									className="size-3.5 shrink-0 text-muted-foreground"
								/>
							)}
							<span className="truncate">
								{loading
									? 'Resolving shared link…'
									: 'Drop pin from this shared link'}
							</span>
							<span className="ml-auto shrink-0 text-xs text-muted-foreground">
								Google Maps
							</span>
						</button>
					</li>
				</ul>
			)}

			{open && !coords && !gmaps && !shortLink && suggestions.length > 0 && (
				<ul
					role="listbox"
					className="absolute z-[500] mt-1 max-h-72 w-full overflow-auto border border-border/60 bg-popover shadow-lg"
				>
					{suggestions.map((suggestion, index) => (
						<li
							key={suggestion.id}
							role="option"
							aria-selected={index === active}
						>
							<button
								type="button"
								onMouseEnter={() => setActive(index)}
								onClick={() => pick(suggestion)}
								className={cn(
									'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
									index === active
										? 'bg-accent text-accent-foreground'
										: 'text-foreground'
								)}
							>
								<MapPin
									aria-hidden
									className="size-3.5 shrink-0 text-muted-foreground"
								/>
								<span className="truncate">
									{suggestion.label}
								</span>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
