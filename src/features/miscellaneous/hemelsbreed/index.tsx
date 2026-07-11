'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import nextDynamic from 'next/dynamic'
import {
	Copy,
	Crosshair,
	Layers,
	Loader2,
	Lock,
	LockOpen,
	LocateFixed,
	Maximize2,
	Minimize2,
	Ruler,
	Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useLocalStorage } from '../hooks/use-local-storage'
import { SendToTool } from '../components/send-to-tool'
import { geolocationErrorMessage, locate } from '../utils/geolocation'
import { consumeLocations, type TLocationPoint } from '../utils/location-handoff'
import { appendSavedLocation, locationLabel } from '../utils/locations'
import { reverseGeocode } from '../utils/reverse-geocode'
import { CircleList } from './components/circle-list'
import { ImportCoordinates } from './components/import-coordinates'
import { LocationSearch } from './components/location-search'
import { MapsBar } from './components/maps-bar'
import { SpotSearch } from './components/spot-search'
import { circlesOverlap, formatKm, nextColor } from './utils/geo'
import { googleMapsSearchUrl } from './utils/google-maps'
import { trilaterate } from './utils/trilateration'
import type { TPdokLocation, TRadiusCircle, TSavedMap, TSpot } from './types'

const STORAGE_KEY = 'misc-tools:hemelsbreed:circles'
const MAPS_KEY = 'misc-tools:hemelsbreed:maps'
const ACTIVE_KEY = 'misc-tools:hemelsbreed:active'
const DEFAULT_RADIUS_KM = 10

const MapCanvas = nextDynamic(
	() => import('./components/map-canvas').then(mod => mod.MapCanvas),
	{
		ssr: false,
		loading: () => (
			<div
				role="status"
				aria-label="Loading map"
				className="h-[420px] w-full animate-pulse border border-border/50 bg-muted/40 md:h-[560px]"
			/>
		)
	}
)

type TFocus = { lat: number; lng: number; radiusKm: number; nonce: number }

function newId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID()
	}
	return `c-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

function countOverlaps(circles: TRadiusCircle[]): number {
	const visible = circles.filter(circle => circle.visible)
	let pairs = 0
	for (let i = 0; i < visible.length; i++) {
		for (let j = i + 1; j < visible.length; j++) {
			if (circlesOverlap(visible[i], visible[j])) pairs++
		}
	}
	return pairs
}

export default function HemelsbreedTool() {
	const [circles, setCircles, hydrated] = useLocalStorage<TRadiusCircle[]>(
		STORAGE_KEY,
		[]
	)
	const [maps, setMaps] = useLocalStorage<TSavedMap[]>(MAPS_KEY, [])
	const [activeMapId, setActiveMapId] = useLocalStorage<string | null>(
		ACTIVE_KEY,
		null
	)
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [hoveredId, setHoveredId] = useState<string | null>(null)
	const [focus, setFocus] = useState<TFocus | null>(null)
	const [measuring, setMeasuring] = useState(false)
	const [editing, setEditing] = useState(false)
	const [expanded, setExpanded] = useState(false)
	const [eHeld, setEHeld] = useState(false)
	const [spots, setSpots] = useState<TSpot[]>([])
	const [locating, setLocating] = useState(false)
	const nonceRef = useRef(0)
	const nameRef = useRef(0)
	const handoffRef = useRef(false)

	const canEdit = editing || eHeld
	const overlaps = useMemo(() => countOverlaps(circles), [circles])
	const estimate = useMemo(() => trilaterate(circles), [circles])
	const activeMap = useMemo(
		() => maps.find(map => map.id === activeMapId) ?? null,
		[maps, activeMapId]
	)
	const dirty = useMemo(() => {
		if (!activeMap) return circles.length > 0
		return JSON.stringify(activeMap.circles) !== JSON.stringify(circles)
	}, [activeMap, circles])

	useEffect(() => {
		function isTyping(target: EventTarget | null): boolean {
			const el = target as HTMLElement | null
			return (
				!!el &&
				(el.tagName === 'INPUT' ||
					el.tagName === 'TEXTAREA' ||
					el.isContentEditable)
			)
		}
		function onDown(event: KeyboardEvent) {
			if (
				event.key.toLowerCase() === 'e' &&
				!event.repeat &&
				!event.metaKey &&
				!event.ctrlKey &&
				!isTyping(event.target)
			) {
				setEHeld(true)
			}
		}
		function onUp(event: KeyboardEvent) {
			if (event.key.toLowerCase() === 'e') setEHeld(false)
		}
		window.addEventListener('keydown', onDown)
		window.addEventListener('keyup', onUp)
		return () => {
			window.removeEventListener('keydown', onDown)
			window.removeEventListener('keyup', onUp)
		}
	}, [])

	function focusOn(lat: number, lng: number, radiusKm: number) {
		nonceRef.current += 1
		setFocus({ lat, lng, radiusKm, nonce: nonceRef.current })
	}

	function addCircle(lat: number, lng: number, label: string) {
		const id = newId()
		setCircles(current => [
			...current,
			{
				id,
				label,
				lat,
				lng,
				radiusKm: DEFAULT_RADIUS_KM,
				color: nextColor(current.map(c => c.color)),
				visible: true
			}
		])
		setSelectedId(id)
		focusOn(lat, lng, DEFAULT_RADIUS_KM)
		return id
	}

	function onPickLocation(location: TPdokLocation) {
		addCircle(location.lat, location.lng, location.label)
		toast.success(`Added ${location.label}`)
	}

	function onAddAt(lat: number, lng: number) {
		nameRef.current += 1
		addCircle(lat, lng, `Point ${nameRef.current}`)
	}

	function circleExistsAt(lat: number, lng: number): boolean {
		const epsilon = 1e-4
		return circles.some(
			circle =>
				Math.abs(circle.lat - lat) < epsilon &&
				Math.abs(circle.lng - lng) < epsilon
		)
	}

	function importPoints(points: TLocationPoint[]) {
		if (points.length === 0) return
		setCircles(current => {
			const used = current.map(circle => circle.color)
			const additions = points.map(point => {
				const color = nextColor(used)
				used.push(color)
				return {
					id: newId(),
					label: point.label,
					lat: point.lat,
					lng: point.lng,
					radiusKm: DEFAULT_RADIUS_KM,
					color,
					visible: true
				}
			})
			return [...current, ...additions]
		})
		const first = points[0]
		focusOn(first.lat, first.lng, DEFAULT_RADIUS_KM)
		toast.success(
			`Imported ${points.length} ${points.length === 1 ? 'pin' : 'pins'}`
		)
	}

	useEffect(() => {
		if (!hydrated || handoffRef.current) return
		handoffRef.current = true
		importPoints(consumeLocations('hemelsbreed'))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hydrated])

	async function addMyLocation() {
		setLocating(true)
		try {
			const fix = await locate()
			if (circleExistsAt(fix.lat, fix.lng)) {
				focusOn(fix.lat, fix.lng, DEFAULT_RADIUS_KM)
				toast.info('Your location is already on the map')
				return
			}

			const id = addCircle(fix.lat, fix.lng, 'My location')
			toast.success(`Added your location (± ${Math.round(fix.accuracy)} m)`)

			const address = await reverseGeocode(fix.lat, fix.lng)
			const label = locationLabel({ ...address, lat: fix.lat, lng: fix.lng })
			updateCircle(id, { label })
			appendSavedLocation({ ...address, lat: fix.lat, lng: fix.lng })
		} catch (cause) {
			toast.error(geolocationErrorMessage(cause))
		} finally {
			setLocating(false)
		}
	}

	function circlesAsPoints(): TLocationPoint[] {
		return circles.map(circle => ({
			id: circle.id,
			lat: circle.lat,
			lng: circle.lng,
			label: circle.label
		}))
	}

	function updateCircle(id: string, patch: Partial<TRadiusCircle>) {
		setCircles(current =>
			current.map(circle =>
				circle.id === id ? { ...circle, ...patch } : circle
			)
		)
	}

	function duplicateCircle(id: string) {
		setCircles(current => {
			const source = current.find(circle => circle.id === id)
			if (!source) return current
			const copy: TRadiusCircle = {
				...source,
				id: newId(),
				label: `${source.label} copy`,
				lat: source.lat + 0.01,
				lng: source.lng + 0.01,
				color: nextColor(current.map(c => c.color))
			}
			const index = current.findIndex(circle => circle.id === id)
			const next = [...current]
			next.splice(index + 1, 0, copy)
			return next
		})
	}

	function reorderCircle(id: string, direction: -1 | 1) {
		setCircles(current => {
			const index = current.findIndex(circle => circle.id === id)
			const target = index + direction
			if (index < 0 || target < 0 || target >= current.length)
				return current
			const next = [...current]
			;[next[index], next[target]] = [next[target], next[index]]
			return next
		})
	}

	function removeCircle(id: string) {
		setCircles(current => current.filter(circle => circle.id !== id))
		if (selectedId === id) setSelectedId(null)
	}

	function clearAll() {
		if (circles.length === 0) return
		if (!window.confirm('Remove all circles?')) return
		setCircles([])
		setSelectedId(null)
		toast.success('Cleared')
	}

	function focusCircle(id: string) {
		const circle = circles.find(c => c.id === id)
		if (circle) focusOn(circle.lat, circle.lng, circle.radiusKm)
	}

	function focusEstimate() {
		if (!estimate) return
		focusOn(estimate.lat, estimate.lng, Math.max(estimate.errorKm * 3, 1))
	}

	async function copyEstimate() {
		if (!estimate) return
		const text = `${estimate.lat.toFixed(5)}, ${estimate.lng.toFixed(5)}`
		try {
			await navigator.clipboard.writeText(text)
			toast.success(`Copied ${text}`)
		} catch {
			toast.error('Copy failed')
		}
	}

	function focusSpot(spot: TSpot) {
		focusOn(spot.lat, spot.lng, 0.5)
	}

	function saveAsNewMap() {
		const name = window.prompt('Name this map', `Map ${maps.length + 1}`)
		const trimmed = name?.trim()
		if (!trimmed) return
		const id = newId()
		setMaps(current => [
			...current,
			{ id, name: trimmed, circles, updatedAt: Date.now() }
		])
		setActiveMapId(id)
		toast.success(`Saved ${trimmed}`)
	}

	function saveMap() {
		if (!activeMap) {
			saveAsNewMap()
			return
		}
		const target = activeMap
		setMaps(current =>
			current.map(map =>
				map.id === target.id
					? { ...map, circles, updatedAt: Date.now() }
					: map
			)
		)
		toast.success(`Saved ${target.name}`)
	}

	function confirmDiscard() {
		return (
			!dirty ||
			window.confirm('Discard unsaved changes to the current map?')
		)
	}

	function newMap() {
		if (!confirmDiscard()) return
		setCircles([])
		setActiveMapId(null)
		setSelectedId(null)
		toast.success('New map')
	}

	function openMap(id: string) {
		if (id === activeMapId) return
		if (!confirmDiscard()) return
		const map = maps.find(m => m.id === id)
		if (!map) return
		setCircles(map.circles)
		setActiveMapId(id)
		setSelectedId(null)
		toast.success(`Opened ${map.name}`)
	}

	function renameMap(id: string, name: string) {
		setMaps(current =>
			current.map(map => (map.id === id ? { ...map, name } : map))
		)
	}

	function deleteMap(id: string) {
		const map = maps.find(m => m.id === id)
		if (map && !window.confirm(`Delete "${map.name}"?`)) return
		setMaps(current => current.filter(m => m.id !== id))
		if (activeMapId === id) setActiveMapId(null)
		toast.success('Deleted')
	}

	if (!hydrated) {
		return (
			<div
				role="status"
				aria-label="Loading tool"
				className="grid gap-4 lg:grid-cols-[1fr_360px]"
			>
				<div className="h-[420px] animate-pulse bg-muted/60 md:h-[560px]" />
				<div className="h-96 animate-pulse bg-muted/60" />
			</div>
		)
	}

	return (
		<div
			className={cn(
				'grid gap-4',
				expanded ? 'lg:grid-cols-1' : 'lg:grid-cols-[1fr_360px]'
			)}
		>
			<div className="flex flex-col gap-3">
				<MapsBar
					maps={maps}
					activeMapId={activeMapId}
					dirty={dirty}
					onSave={saveMap}
					onSaveAsNew={saveAsNewMap}
					onNew={newMap}
					onOpen={openMap}
					onRename={renameMap}
					onDelete={deleteMap}
				/>
				<div className="flex flex-wrap items-center gap-2">
					<div className="min-w-[16rem] flex-1">
						<LocationSearch onPick={onPickLocation} />
					</div>
					<ImportCoordinates
						existsAt={circleExistsAt}
						onImport={importPoints}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="h-9 shrink-0 gap-1.5"
						onClick={addMyLocation}
						disabled={locating}
						title="Drop a circle on your current position"
					>
						{locating ? (
							<Loader2 aria-hidden className="size-4 animate-spin" />
						) : (
							<LocateFixed aria-hidden className="size-4" />
						)}
						{locating ? 'Locating…' : 'My location'}
					</Button>
					<SendToTool
						from="hemelsbreed"
						points={circlesAsPoints}
						label="Send circles to"
						className="h-9"
						disabled={circles.length === 0}
					/>
					<Button
						type="button"
						variant={measuring ? 'default' : 'outline'}
						size="sm"
						className="h-9 shrink-0 gap-1.5"
						onClick={() => setMeasuring(value => !value)}
						aria-pressed={measuring}
						title="Measure straight-line distance between two points"
					>
						<Ruler aria-hidden className="size-4" />
						Measure
					</Button>
					<Button
						type="button"
						variant={canEdit ? 'default' : 'outline'}
						size="sm"
						className="h-9 shrink-0 gap-1.5"
						onClick={() => setEditing(value => !value)}
						aria-pressed={canEdit}
						title="Unlock to move, edit and delete circles (or hold E)"
					>
						{canEdit ? (
							<LockOpen aria-hidden className="size-4" />
						) : (
							<Lock aria-hidden className="size-4" />
						)}
						{canEdit ? 'Editing' : 'Locked'}
					</Button>
					<Button
						type="button"
						variant={expanded ? 'default' : 'outline'}
						size="sm"
						className="h-9 shrink-0 gap-1.5"
						onClick={() => setExpanded(value => !value)}
						aria-pressed={expanded}
						title="Toggle a bigger map"
					>
						{expanded ? (
							<Minimize2 aria-hidden className="size-4" />
						) : (
							<Maximize2 aria-hidden className="size-4" />
						)}
						{expanded ? 'Collapse' : 'Expand'}
					</Button>
				</div>
				<MapCanvas
					circles={circles}
					selectedId={selectedId}
					hoveredId={hoveredId}
					focus={focus}
					measuring={measuring}
					editable={canEdit}
					expanded={expanded}
					estimate={estimate}
					spots={spots}
					onAddAt={onAddAt}
					onSelect={setSelectedId}
					onDeselect={() => setSelectedId(null)}
					onMove={(id, lat, lng) => updateCircle(id, { lat, lng })}
				/>
				<p className="text-xs text-muted-foreground">
					{measuring
						? 'Measure mode: click two points to read the hemelsbreed distance and bearing between them.'
						: canEdit
							? 'Editing: click the map to drop a circle, drag markers to move them. Circles stay put while the map is locked.'
							: 'Locked: pan and zoom freely without nudging your circles. Toggle Editing or hold E to move, edit or delete them.'}
				</p>
			</div>

			<aside className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-2">
					<div
						className="flex items-center gap-2 text-sm text-muted-foreground"
						aria-live="polite"
					>
						<Layers aria-hidden className="size-4" />
						<span>
							{circles.length}{' '}
							{circles.length === 1 ? 'circle' : 'circles'}
						</span>
						{overlaps > 0 && (
							<span className="text-foreground">
								· {overlaps} overlap{overlaps === 1 ? '' : 's'}
							</span>
						)}
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className={cn(
							'h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive',
							!canEdit && 'pointer-events-none opacity-40'
						)}
						onClick={clearAll}
						disabled={circles.length === 0 || !canEdit}
					>
						<Trash2 aria-hidden className="size-3.5" />
						Clear
					</Button>
				</div>

				<CircleList
					circles={circles}
					selectedId={selectedId}
					editable={canEdit}
					onSelect={setSelectedId}
					onHover={setHoveredId}
					onUpdate={updateCircle}
					onRemove={removeCircle}
					onDuplicate={duplicateCircle}
					onReorder={reorderCircle}
					onFocus={focusCircle}
				/>

				{estimate && (
					<div className="flex flex-col gap-2 border border-amber-400/40 bg-amber-400/5 p-3">
						<div className="flex items-center gap-2 text-sm font-medium">
							<Crosshair
								aria-hidden
								className="size-4 text-amber-400"
							/>
							Most likely crossing point
						</div>
						<p className="font-mono text-xs text-muted-foreground">
							{estimate.lat.toFixed(5)}, {estimate.lng.toFixed(5)}{' '}
							<span className="text-foreground">
								± {formatKm(estimate.errorKm)}
							</span>
						</p>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7 gap-1.5 px-2 text-xs"
								onClick={focusEstimate}
							>
								<Crosshair aria-hidden className="size-3.5" />
								Focus
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
								onClick={copyEstimate}
							>
								<Copy aria-hidden className="size-3.5" />
								Copy coords
							</Button>
							<a
								href={googleMapsSearchUrl(
									estimate.lat,
									estimate.lng
								)}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
							>
								Open in Maps
							</a>
						</div>
					</div>
				)}

				<SpotSearch
					estimate={estimate}
					spots={spots}
					onSpots={setSpots}
					onFocusSpot={focusSpot}
				/>

				<p className="text-xs text-muted-foreground">
					Cyan shading marks where circles overlap — the brighter the
					patch, the more radii agree. With three or more circles the
					amber crosshair pins the point that best matches every
					radius; the dashed ring shows how far off the distances are.
					Search that spot for real places, or measure the
					straight-line distance between any two points.
				</p>
			</aside>
		</div>
	)
}
