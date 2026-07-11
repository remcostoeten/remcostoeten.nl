'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, MapPin, Import } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { TLocationPoint } from '../../utils/location-handoff'
import { loadSavedLocations, toLocationPoints } from '../../utils/locations'

type Props = {
	existsAt: (lat: number, lng: number) => boolean
	onImport: (points: TLocationPoint[]) => void
}

export function ImportCoordinates({ existsAt, onImport }: Props) {
	const [open, setOpen] = useState(false)
	const [points, setPoints] = useState<TLocationPoint[]>([])
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const rootRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const loaded = toLocationPoints(loadSavedLocations())
		setPoints(loaded)
		setSelected(
			new Set(
				loaded
					.filter(point => !existsAt(point.lat, point.lng))
					.map(point => point.id)
			)
		)
	}, [open, existsAt])

	useEffect(() => {
		if (!open) return
		function onClick(event: MouseEvent) {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
		}
		window.addEventListener('mousedown', onClick)
		return () => window.removeEventListener('mousedown', onClick)
	}, [open])

	const selectedCount = selected.size

	const importable = useMemo(
		() => points.filter(point => selected.has(point.id)),
		[points, selected]
	)

	function toggle(id: string) {
		setSelected(current => {
			const next = new Set(current)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	function commit() {
		if (importable.length === 0) return
		onImport(importable)
		setOpen(false)
	}

	return (
		<div ref={rootRef} className="relative shrink-0">
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="h-9 gap-1.5"
				onClick={() => setOpen(value => !value)}
				aria-expanded={open}
				aria-haspopup="menu"
				title="Import saved pins from the long & lat tool"
			>
				<Import aria-hidden className="size-4" />
				Import pins
				<ChevronDown aria-hidden className="size-4 opacity-60" />
			</Button>

			{open && (
				<div
					role="menu"
					className="absolute right-0 top-full z-[1000] mt-1 w-[min(22rem,85vw)] border border-border bg-popover p-1.5 shadow-lg"
				>
					{points.length === 0 ? (
						<p className="px-2 py-4 text-center text-xs text-muted-foreground">
							No saved coordinates found. Drop pins in the long &amp;
							lat tool first, then import them here as circles.
						</p>
					) : (
						<>
							<div className="flex items-center justify-between gap-2 border-b border-border/60 px-2 py-1.5 text-[11px] text-muted-foreground">
								<span>
									{points.length} saved{' '}
									{points.length === 1 ? 'pin' : 'pins'}
								</span>
								<button
									type="button"
									className="text-foreground/70 hover:text-foreground"
									onClick={() =>
										setSelected(current =>
											current.size === points.length
												? new Set()
												: new Set(points.map(p => p.id))
										)
									}
								>
									{selected.size === points.length
										? 'Clear all'
										: 'Select all'}
								</button>
							</div>

							<ul
								className="max-h-72 overflow-y-auto py-1"
								role="list"
							>
								{points.map(point => {
									const isSelected = selected.has(point.id)
									const already = existsAt(point.lat, point.lng)
									return (
										<li key={point.id}>
											<button
												type="button"
												onClick={() => toggle(point.id)}
												className={cn(
													'flex w-full items-center gap-2 rounded-sm px-1.5 py-1.5 text-left',
													isSelected
														? 'bg-accent/60'
														: 'hover:bg-accent/30'
												)}
											>
												<span
													className={cn(
														'flex size-4 shrink-0 items-center justify-center rounded-sm border',
														isSelected
															? 'border-foreground bg-foreground text-background'
															: 'border-border'
													)}
												>
													{isSelected && (
														<Check className="size-3" />
													)}
												</span>
												<MapPin
													aria-hidden
													className="size-3.5 shrink-0 text-muted-foreground"
												/>
												<span className="flex min-w-0 flex-col">
													<span className="truncate text-sm">
														{point.label}
													</span>
													<span className="truncate font-mono text-[11px] text-muted-foreground">
														{point.lat.toFixed(4)},{' '}
														{point.lng.toFixed(4)}
														{already && (
															<span className="ml-1.5 not-italic text-amber-500/80">
																· already on map
															</span>
														)}
													</span>
												</span>
											</button>
										</li>
									)
								})}
							</ul>

							<div className="border-t border-border/60 p-1 pt-2">
								<Button
									type="button"
									size="sm"
									className="h-8 w-full gap-1.5 text-xs"
									onClick={commit}
									disabled={selectedCount === 0}
								>
									<Import aria-hidden className="size-3.5" />
									Import {selectedCount || ''}{' '}
									{selectedCount === 1 ? 'circle' : 'circles'}
								</Button>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	)
}
