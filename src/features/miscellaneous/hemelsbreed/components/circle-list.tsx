'use client'

import { useEffect, useRef } from 'react'
import {
	ChevronDown,
	ChevronUp,
	Copy,
	Crosshair,
	Eye,
	EyeOff,
	Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { bearing, compass, formatKm, haversineKm, PALETTE } from '../utils/geo'
import type { TRadiusCircle } from '../types'

type Props = {
	circles: TRadiusCircle[]
	selectedId: string | null
	editable: boolean
	onSelect: (id: string) => void
	onHover: (id: string | null) => void
	onUpdate: (id: string, patch: Partial<TRadiusCircle>) => void
	onRemove: (id: string) => void
	onDuplicate: (id: string) => void
	onReorder: (id: string, direction: -1 | 1) => void
	onFocus: (id: string) => void
}

export function CircleList({
	circles,
	selectedId,
	editable,
	onSelect,
	onHover,
	onUpdate,
	onRemove,
	onDuplicate,
	onReorder,
	onFocus
}: Props) {
	const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map())

	useEffect(() => {
		if (!selectedId) return
		rowRefs.current
			.get(selectedId)
			?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
	}, [selectedId])

	if (circles.length === 0) {
		return (
			<p className="border border-dashed border-border/60 bg-card/40 px-3 py-6 text-center text-sm text-muted-foreground">
				No circles yet. Search a location or, with editing unlocked,
				click the map to drop your first radius.
			</p>
		)
	}

	const selected = circles.find(circle => circle.id === selectedId) ?? null

	return (
		<ul className="flex flex-col gap-2" role="list">
			{circles.map((circle, index) => {
				const isSelected = circle.id === selectedId
				const distance =
					selected && selected.id !== circle.id
						? haversineKm(
								selected.lat,
								selected.lng,
								circle.lat,
								circle.lng
							)
						: null
				const heading =
					selected && selected.id !== circle.id
						? compass(
								bearing(
									selected.lat,
									selected.lng,
									circle.lat,
									circle.lng
								)
							)
						: null
				return (
					<li
						key={circle.id}
						ref={node => {
							if (node) rowRefs.current.set(circle.id, node)
							else rowRefs.current.delete(circle.id)
						}}
						className={cn(
							'flex flex-col gap-2 border bg-card p-3 transition-colors',
							isSelected ? 'border-border' : 'border-border/50'
						)}
						onClick={() => onSelect(circle.id)}
						onMouseEnter={() => onHover(circle.id)}
						onMouseLeave={() => onHover(null)}
					>
						<div className="flex items-center gap-2">
							<span
								aria-hidden
								className="size-3 shrink-0 rounded-full"
								style={{ backgroundColor: circle.color }}
							/>
							<Input
								value={circle.label}
								readOnly={!editable}
								onChange={event =>
									onUpdate(circle.id, {
										label: event.target.value
									})
								}
								onClick={event => event.stopPropagation()}
								className={cn(
									'h-7 border-transparent bg-transparent px-1 text-sm focus-visible:border-border',
									!editable && 'cursor-default'
								)}
								aria-label="Circle label"
							/>
							{distance !== null && (
								<span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-muted-foreground">
									{formatKm(distance)} {heading}
								</span>
							)}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
								onClick={event => {
									event.stopPropagation()
									onUpdate(circle.id, {
										visible: !circle.visible
									})
								}}
								aria-label={
									circle.visible ? 'Hide circle' : 'Show circle'
								}
							>
								{circle.visible ? (
									<Eye className="size-3.5" />
								) : (
									<EyeOff className="size-3.5" />
								)}
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
								onClick={event => {
									event.stopPropagation()
									onFocus(circle.id)
								}}
								aria-label="Focus circle on map"
							>
								<Crosshair className="size-3.5" />
							</Button>
							{editable && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
									onClick={event => {
										event.stopPropagation()
										onRemove(circle.id)
									}}
									aria-label="Delete circle"
								>
									<Trash2 className="size-3.5" />
								</Button>
							)}
						</div>

						<div className="flex items-center gap-3">
							<input
								type="range"
								min={0.5}
								max={150}
								step={0.5}
								value={circle.radiusKm}
								disabled={!editable}
								onChange={event =>
									onUpdate(circle.id, {
										radiusKm: Number(event.target.value)
									})
								}
								onClick={event => event.stopPropagation()}
								className="h-1.5 flex-1 cursor-pointer accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Radius in kilometres"
								style={{ accentColor: circle.color }}
							/>
							<div className="flex items-center gap-1">
								<Input
									type="number"
									min={0.5}
									step={0.5}
									value={circle.radiusKm}
									readOnly={!editable}
									onChange={event =>
										onUpdate(circle.id, {
											radiusKm: Math.max(
												0.5,
												Number(event.target.value) ||
													0.5
											)
										})
									}
									onClick={event => event.stopPropagation()}
									className="h-7 w-16 px-1 text-right text-sm"
									aria-label="Radius value"
								/>
								<span className="text-xs text-muted-foreground">
									km
								</span>
							</div>
						</div>

						{editable && (
							<div className="flex items-center gap-1.5">
								{PALETTE.map(color => (
									<button
										key={color}
										type="button"
										onClick={event => {
											event.stopPropagation()
											onUpdate(circle.id, { color })
										}}
										className={cn(
											'size-5 rounded-full border transition-transform hover:scale-110',
											circle.color === color
												? 'border-foreground'
												: 'border-transparent'
										)}
										style={{ backgroundColor: color }}
										aria-label={`Set colour ${color}`}
									/>
								))}
								<label
									className="ml-1 flex size-5 cursor-pointer items-center justify-center rounded-full border border-border/60"
									onClick={event => event.stopPropagation()}
									aria-label="Custom colour"
								>
									<input
										type="color"
										value={circle.color}
										onChange={event =>
											onUpdate(circle.id, {
												color: event.target.value
											})
										}
										className="size-4 cursor-pointer border-0 bg-transparent p-0"
									/>
								</label>

								<div className="ml-auto flex items-center gap-0.5">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
										disabled={index === 0}
										onClick={event => {
											event.stopPropagation()
											onReorder(circle.id, -1)
										}}
										aria-label="Move circle up"
									>
										<ChevronUp className="size-3.5" />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
										disabled={index === circles.length - 1}
										onClick={event => {
											event.stopPropagation()
											onReorder(circle.id, 1)
										}}
										aria-label="Move circle down"
									>
										<ChevronDown className="size-3.5" />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
										onClick={event => {
											event.stopPropagation()
											onDuplicate(circle.id)
										}}
										aria-label="Duplicate circle"
									>
										<Copy className="size-3.5" />
									</Button>
								</div>
							</div>
						)}
					</li>
				)
			})}
		</ul>
	)
}
