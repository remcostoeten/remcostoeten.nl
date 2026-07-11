'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import type * as L from 'leaflet'
import { cn } from '@/shared/lib/cn'
import { bearing, circleContains, compass, formatKm, haversineKm } from '../utils/geo'
import type { TTrilaterationEstimate } from '../utils/trilateration'
import type { TRadiusCircle, TSpot } from '../types'

type TFocus = { lat: number; lng: number; radiusKm: number; nonce: number }

type Props = {
	circles: TRadiusCircle[]
	selectedId: string | null
	hoveredId: string | null
	focus: TFocus | null
	measuring: boolean
	editable: boolean
	expanded: boolean
	estimate: TTrilaterationEstimate | null
	spots: TSpot[]
	onAddAt: (lat: number, lng: number) => void
	onSelect: (id: string) => void
	onDeselect: () => void
	onMove: (id: string, lat: number, lng: number) => void
}

type TLayers = { circle: L.Circle; marker: L.Marker }

type TMeasure = {
	points: L.LatLng[]
	line: L.Polyline | null
	label: L.Marker | null
	pins: L.CircleMarker[]
}

const NL_CENTER: [number, number] = [52.1326, 5.2913]
const HEAT_STEP = 5
const HEAT_RGB = '56,189,248'

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

function setDraggable(marker: L.Marker, draggable: boolean) {
	if (draggable) marker.dragging?.enable()
	else marker.dragging?.disable()
}

function markerIcon(leaflet: typeof L, color: string, selected: boolean) {
	return leaflet.divIcon({
		className: '',
		iconSize: [16, 16],
		iconAnchor: [8, 8],
		html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid ${selected ? '#ffffff' : 'rgba(255,255,255,0.6)'};box-shadow:0 0 0 1px rgba(0,0,0,0.4)"></span>`
	})
}

export function MapCanvas({
	circles,
	selectedId,
	hoveredId,
	focus,
	measuring,
	editable,
	expanded,
	estimate,
	spots,
	onAddAt,
	onSelect,
	onDeselect,
	onMove
}: Props) {
	const containerRef = useRef<HTMLDivElement>(null)
	const heatRef = useRef<HTMLCanvasElement>(null)
	const mapRef = useRef<L.Map | null>(null)
	const leafletRef = useRef<typeof L | null>(null)
	const layersRef = useRef<Map<string, TLayers>>(new Map())
	const estimateRef = useRef<{ marker: L.Marker; ring: L.Circle } | null>(
		null
	)
	const spotsRef = useRef<L.LayerGroup | null>(null)
	const readyRef = useRef(false)
	const rafRef = useRef<number | null>(null)

	const circlesRef = useRef(circles)
	circlesRef.current = circles

	const measuringRef = useRef(measuring)
	measuringRef.current = measuring
	const editableRef = useRef(editable)
	editableRef.current = editable
	const measureRef = useRef<TMeasure>({
		points: [],
		line: null,
		label: null,
		pins: []
	})

	const onAddRef = useRef(onAddAt)
	const onSelectRef = useRef(onSelect)
	const onDeselectRef = useRef(onDeselect)
	const onMoveRef = useRef(onMove)
	onAddRef.current = onAddAt
	onSelectRef.current = onSelect
	onDeselectRef.current = onDeselect
	onMoveRef.current = onMove

	useEffect(() => {
		let cancelled = false

		import('leaflet').then(mod => {
			if (cancelled || !containerRef.current || mapRef.current) return
			const leaflet = mod.default ?? mod
			leafletRef.current = leaflet

			const map = leaflet.map(containerRef.current, {
				center: NL_CENTER,
				zoom: 8,
				zoomControl: true
			})
			leaflet
				.tileLayer(
					'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
					{
						attribution: '&copy; OpenStreetMap &copy; CARTO',
						maxZoom: 19
					}
				)
				.addTo(map)

			map.on('click', (event: L.LeafletMouseEvent) => {
				if (measuringRef.current) {
					handleMeasureClick(event.latlng)
					return
				}
				if (!editableRef.current) {
					onDeselectRef.current()
					return
				}
				onAddRef.current(event.latlng.lat, event.latlng.lng)
			})

			map.on('move zoom moveend zoomend resize', requestHeat)

			mapRef.current = map
			readyRef.current = true
			syncLayers()
			syncEstimate()
			syncSpots()
			requestHeat()
		})

		return () => {
			cancelled = true
			if (rafRef.current) cancelAnimationFrame(rafRef.current)
			mapRef.current?.remove()
			mapRef.current = null
			layersRef.current.clear()
			estimateRef.current = null
			spotsRef.current = null
			readyRef.current = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		syncLayers()
		requestHeat()
	}, [circles, selectedId, hoveredId, editable])

	useEffect(() => {
		syncEstimate()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [estimate])

	useEffect(() => {
		syncSpots()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [spots])

	useEffect(() => {
		const map = mapRef.current
		if (!map || !focus) return
		const meters = Math.max(focus.radiusKm, 1) * 1000
		map.flyToBounds(
			[
				[focus.lat - meters / 111000, focus.lng - meters / 70000],
				[focus.lat + meters / 111000, focus.lng + meters / 70000]
			],
			{ padding: [40, 40], duration: 0.6 }
		)
	}, [focus])

	useEffect(() => {
		const container = containerRef.current
		if (container) container.style.cursor = measuring ? 'crosshair' : ''
		if (!measuring) clearMeasure()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [measuring])

	useEffect(() => {
		const map = mapRef.current
		if (!map) return
		const timeout = setTimeout(() => map.invalidateSize(), 220)
		return () => clearTimeout(timeout)
	}, [expanded])

	function requestHeat() {
		if (rafRef.current) return
		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = null
			paintHeat()
		})
	}

	function paintHeat() {
		const map = mapRef.current
		const leaflet = leafletRef.current
		const canvas = heatRef.current
		if (!map || !leaflet || !canvas || !readyRef.current) return

		const size = map.getSize()
		const dpr = window.devicePixelRatio || 1
		if (canvas.width !== size.x * dpr || canvas.height !== size.y * dpr) {
			canvas.width = size.x * dpr
			canvas.height = size.y * dpr
			canvas.style.width = `${size.x}px`
			canvas.style.height = `${size.y}px`
		}
		const ctx = canvas.getContext('2d')
		if (!ctx) return
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
		ctx.clearRect(0, 0, size.x, size.y)

		const visible = circlesRef.current.filter(circle => circle.visible)
		if (visible.length < 2) return

		for (let py = 0; py < size.y; py += HEAT_STEP) {
			for (let px = 0; px < size.x; px += HEAT_STEP) {
				const point = leaflet.point(px + HEAT_STEP / 2, py + HEAT_STEP / 2)
				const ll = map.containerPointToLatLng(point)
				let count = 0
				for (const circle of visible) {
					if (circleContains(circle, ll.lat, ll.lng)) count++
				}
				if (count < 2) continue
				const alpha = Math.min(0.07 * (count - 1) + 0.05, 0.45)
				ctx.fillStyle = `rgba(${HEAT_RGB},${alpha})`
				ctx.fillRect(px, py, HEAT_STEP, HEAT_STEP)
			}
		}
	}

	function handleMeasureClick(latlng: L.LatLng) {
		const leaflet = leafletRef.current
		const map = mapRef.current
		if (!leaflet || !map) return
		const state = measureRef.current

		if (state.points.length >= 2) clearMeasure()
		state.points.push(latlng)

		const pin = leaflet
			.circleMarker(latlng, {
				radius: 4,
				color: '#ffffff',
				weight: 2,
				fillColor: `rgb(${HEAT_RGB})`,
				fillOpacity: 1
			})
			.addTo(map)
		state.pins.push(pin)

		if (state.points.length === 2) drawMeasure()
	}

	function drawMeasure() {
		const leaflet = leafletRef.current
		const map = mapRef.current
		if (!leaflet || !map) return
		const state = measureRef.current
		const [a, b] = state.points

		state.line = leaflet
			.polyline([a, b], {
				color: `rgb(${HEAT_RGB})`,
				weight: 2,
				dashArray: '6 6'
			})
			.addTo(map)

		const km = haversineKm(a.lat, a.lng, b.lat, b.lng)
		const deg = bearing(a.lat, a.lng, b.lat, b.lng)
		const mid = leaflet.latLng((a.lat + b.lat) / 2, (a.lng + b.lng) / 2)
		state.label = leaflet
			.marker(mid, {
				interactive: false,
				icon: leaflet.divIcon({
					className: '',
					iconSize: [0, 0],
					html: `<span style="display:inline-block;transform:translate(-50%,-50%);white-space:nowrap;padding:2px 8px;border-radius:9999px;background:rgba(15,23,42,0.92);color:#e2e8f0;font-size:12px;font-weight:500;border:1px solid rgba(${HEAT_RGB},0.5)">${formatKm(km)} · ${compass(deg)}</span>`
				})
			})
			.addTo(map)
	}

	function clearMeasure() {
		const state = measureRef.current
		state.line?.remove()
		state.label?.remove()
		state.pins.forEach(pin => pin.remove())
		measureRef.current = { points: [], line: null, label: null, pins: [] }
	}

	function syncEstimate() {
		const map = mapRef.current
		const leaflet = leafletRef.current
		if (!map || !leaflet || !readyRef.current) return

		if (!estimate) {
			estimateRef.current?.marker.remove()
			estimateRef.current?.ring.remove()
			estimateRef.current = null
			return
		}

		const position: [number, number] = [estimate.lat, estimate.lng]
		const ringMeters = Math.max(estimate.errorKm, 0.05) * 1000
		const icon = leaflet.divIcon({
			className: '',
			iconSize: [22, 22],
			iconAnchor: [11, 11],
			html: '<span style="display:grid;place-items:center;width:22px;height:22px;border-radius:9999px;background:rgba(251,191,36,0.15);border:2px solid #fbbf24;box-shadow:0 0 0 1px rgba(0,0,0,0.4)"><span style="width:4px;height:4px;border-radius:9999px;background:#fbbf24"></span></span>'
		})

		if (estimateRef.current) {
			estimateRef.current.marker.setLatLng(position)
			estimateRef.current.ring
				.setLatLng(position)
				.setRadius(ringMeters)
			return
		}

		const marker = leaflet
			.marker(position, { icon, interactive: false, keyboard: false })
			.addTo(map)
		const ring = leaflet
			.circle(position, {
				radius: ringMeters,
				color: '#fbbf24',
				weight: 1.5,
				dashArray: '4 6',
				fill: false,
				interactive: false
			})
			.addTo(map)
		estimateRef.current = { marker, ring }
	}

	function syncSpots() {
		const map = mapRef.current
		const leaflet = leafletRef.current
		if (!map || !leaflet || !readyRef.current) return

		spotsRef.current?.remove()
		spotsRef.current = null
		if (spots.length === 0) return

		const group = leaflet.layerGroup()
		for (const spot of spots) {
			leaflet
				.circleMarker([spot.lat, spot.lng], {
					radius: 5,
					color: '#ffffff',
					weight: 1.5,
					fillColor: '#f97316',
					fillOpacity: 0.9
				})
				.bindPopup(
					`<strong>${escapeHtml(spot.name)}</strong><br/>${escapeHtml(spot.kind)}${spot.address ? `<br/>${escapeHtml(spot.address)}` : ''}<br/><a href="https://www.google.com/maps/search/?api=1&amp;query=${spot.lat}%2C${spot.lng}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>`
				)
				.addTo(group)
		}
		group.addTo(map)
		spotsRef.current = group
	}

	function syncLayers() {
		const map = mapRef.current
		const leaflet = leafletRef.current
		if (!map || !leaflet || !readyRef.current) return

		const layers = layersRef.current
		const seen = new Set<string>()

		for (const circle of circles) {
			seen.add(circle.id)
			const isSelected = circle.id === selectedId
			const isHovered = circle.id === hoveredId
			const emphasis = isSelected || isHovered
			const weight = isSelected ? 3 : isHovered ? 2.5 : 1.5
			const fillOpacity = emphasis ? 0.22 : 0.15
			const existing = layers.get(circle.id)

			if (!circle.visible) {
				if (existing) {
					existing.circle.remove()
					existing.marker.remove()
					layers.delete(circle.id)
				}
				continue
			}

			if (existing) {
				existing.circle
					.setLatLng([circle.lat, circle.lng])
					.setRadius(circle.radiusKm * 1000)
					.setStyle({
						color: circle.color,
						fillColor: circle.color,
						weight,
						fillOpacity
					})
				existing.marker
					.setLatLng([circle.lat, circle.lng])
					.setIcon(markerIcon(leaflet, circle.color, emphasis))
				setDraggable(existing.marker, editable)
				continue
			}

			const circleLayer = leaflet
				.circle([circle.lat, circle.lng], {
					radius: circle.radiusKm * 1000,
					color: circle.color,
					fillColor: circle.color,
					weight,
					fillOpacity
				})
				.addTo(map)

			const marker = leaflet
				.marker([circle.lat, circle.lng], {
					icon: markerIcon(leaflet, circle.color, emphasis),
					draggable: editable,
					keyboard: false
				})
				.addTo(map)

			marker.on('click', () => onSelectRef.current(circle.id))
			circleLayer.on('click', () => onSelectRef.current(circle.id))
			marker.on('drag', () => {
				const pos = marker.getLatLng()
				circleLayer.setLatLng(pos)
				requestHeat()
			})
			marker.on('dragend', () => {
				const pos = marker.getLatLng()
				onMoveRef.current(circle.id, pos.lat, pos.lng)
			})

			layers.set(circle.id, { circle: circleLayer, marker })
		}

		for (const [id, layer] of Array.from(layers.entries())) {
			if (seen.has(id)) continue
			layer.circle.remove()
			layer.marker.remove()
			layers.delete(id)
		}
	}

	return (
		<div
			ref={containerRef}
			className={cn(
				'relative w-full overflow-hidden rounded-none border border-border/50 bg-muted/40 transition-[height] duration-200',
				expanded ? 'h-[560px] md:h-[80vh]' : 'h-[420px] md:h-[560px]'
			)}
			role="application"
			aria-label="Interactive radius map of the Netherlands"
		>
			<canvas
				ref={heatRef}
				aria-hidden
				className="pointer-events-none absolute inset-0 z-[350]"
			/>
		</div>
	)
}
