'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Crosshair, Loader2, MapPin, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { parseLatLng } from '../utils/geo'
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

	const coords = useMemo(() => parseLatLng(query), [query])

	useEffect(() => {
		const trimmed = query.trim()
		if (coords || trimmed.length < 2) {
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
	}, [query, coords])

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
		if (coords) {
			if (event.key === 'Enter') {
				event.preventDefault()
				pickCoords()
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
						(coords || suggestions.length > 0) && setOpen(true)
					}
					onKeyDown={onKeyDown}
					placeholder="Address, postcode or place — e.g. 1012 AB or Utrecht"
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

			{open && !coords && suggestions.length > 0 && (
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
