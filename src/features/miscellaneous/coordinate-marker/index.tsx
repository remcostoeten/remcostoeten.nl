'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
	MapPin,
	Trash2,
	Layers,
	Loader2,
	LocateFixed,
	Search,
	Check
} from 'lucide-react'
import { toast } from 'sonner'
import { noop } from '@/shared/lib/noop'
import 'leaflet/dist/leaflet.css'
import type * as L from 'leaflet'
import { SendToTool } from '../components/send-to-tool'
import { geolocationErrorMessage, locate } from '../utils/geolocation'
import {
	consumeLocations,
	type TLocationPoint
} from '../utils/location-handoff'
import {
	SAVED_LOCATIONS_KEY,
	loadSavedLocations,
	newLocationId,
	saveLocations,
	toLocationPoints,
	type TSavedLocation
} from '../utils/locations'
import { reverseGeocode } from '../utils/reverse-geocode'

type SearchResult = {
	place_id: number
	lat: string
	lon: string
	display_name: string
}

type SavedPoint = TSavedLocation & {
	loading?: boolean
}

function savePoints(points: SavedPoint[]) {
	saveLocations(points.map(({ loading: _l, ...rest }) => rest))
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

function createPinIcon(leaflet: typeof L, selected?: boolean) {
	return leaflet.divIcon({
		className: '',
		iconSize: [30, 42],
		iconAnchor: [15, 40],
		popupAnchor: [0, -36],
		html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42" fill="none">
      <path d="M15 41s13-14.5 13-26A13 13 0 1 0 2 15c0 11.5 13 26 13 26z" fill="${selected ? '#f8fafc' : '#e5e5e5'}" stroke="${selected ? '#94a3b8' : '#171717'}" stroke-width="1.5"/>
      <circle cx="15" cy="15" r="5" fill="${selected ? '#818cf8' : '#0a0a0a'}"/>
    </svg>`
	})
}

function popupHtml(p: SavedPoint): string {
	if (p.loading) {
		return `<div style="font-family:inherit;min-width:180px;padding:4px 0">
      <div style="display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:12px">
        <span style="display:inline-block;width:12px;height:12px;border:2px solid #475569;border-top-color:transparent;border-radius:9999px;animation:crds-spin 0.7s linear infinite"></span>
        Looking up address…
      </div>
    </div>`
	}

	const streetLine = [p.street, p.houseNumber].filter(Boolean).join(' ')
	const cityLine = [p.postcode, p.city].filter(Boolean).join(' ')

	const rows: string[] = []

	if (p.city) {
		const headerValue = [p.city, p.country].filter(Boolean).join(', ')
		rows.push(
			`<button type="button" class="crds-copy crds-copy-title" data-copy="${escapeHtml(headerValue)}" title="Click to copy">
        <span>${escapeHtml(p.city)}${p.country ? `<span style="color:#94a3b8;font-weight:400">, ${escapeHtml(p.country)}</span>` : ''}</span>
        <span class="crds-copy-ind" aria-hidden="true"></span>
      </button>`
		)
	}

	const fieldRow = (label: string, value: string) =>
		`<div style="display:flex;gap:8px;align-items:baseline;font-size:11px;line-height:1.5">
      <span style="color:#737373;min-width:44px;text-transform:uppercase;letter-spacing:0.04em;font-size:10px">${label}</span>
      <button type="button" class="crds-copy" data-copy="${escapeHtml(value)}" title="Click to copy">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(value)}</span>
        <span class="crds-copy-ind" aria-hidden="true"></span>
      </button>
    </div>`

	if (streetLine) rows.push(fieldRow('Street', streetLine))
	if (cityLine) rows.push(fieldRow('City', cityLine))
	if (p.region) rows.push(fieldRow('Region', p.region ?? ''))
	rows.push(fieldRow('Lat', p.lat.toFixed(6)))
	rows.push(fieldRow('Lng', p.lng.toFixed(6)))

	const hasHeader = !!p.city

	return `<div style="font-family:inherit;min-width:200px">
    ${rows[0] ?? ''}
    <div style="display:flex;flex-direction:column;gap:3px;margin-top:${hasHeader ? '6px' : '0'};padding-top:${hasHeader ? '6px' : '0'};${hasHeader ? 'border-top:1px solid rgba(148,163,184,0.15)' : ''}">
      ${rows.slice(1).join('')}
    </div>
  </div>`
}

function handlePopupCopyClick(event: Event) {
	const trigger = (event.target as HTMLElement).closest?.(
		'[data-copy]'
	) as HTMLElement | null
	if (!trigger) return
	const value = trigger.getAttribute('data-copy')
	if (!value) return
	navigator.clipboard.writeText(value).then(() => {
		trigger.setAttribute('data-copied', '')
		window.setTimeout(() => trigger.removeAttribute('data-copied'), 1200)
	}, noop)
}

export default function CoordinateMarkerTool() {
	const containerRef = useRef<HTMLDivElement>(null)
	const mapRef = useRef<L.Map | null>(null)
	const leafletRef = useRef<typeof L | null>(null)
	const markersRef = useRef<Map<string, L.Marker>>(new Map())
	const [ready, setReady] = useState(false)
	const [points, setPoints] = useState<SavedPoint[]>([])
	const [addMode, setAddMode] = useState(false)
	const addModeRef = useRef(false)
	const [query, setQuery] = useState('')
	const [suggestions, setSuggestions] = useState<SearchResult[]>([])
	const [searching, setSearching] = useState(false)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [copied, setCopied] = useState<string | null>(null)
	const [locating, setLocating] = useState(false)

	addModeRef.current = addMode

	const resolveAddress = useCallback(
		(id: string, lat: number, lng: number) => {
			reverseGeocode(lat, lng).then(info => {
				setPoints(prev => {
					const next = prev.map(pt =>
						pt.id === id ? { ...pt, ...info, loading: false } : pt
					)
					savePoints(next)
					return next
				})
			})
		},
		[]
	)

	const addPoint = useCallback(
		(lat: number, lng: number) => {
			const id = newLocationId()
			const point: SavedPoint = {
				id,
				lat,
				lng,
				createdAt: Date.now(),
				loading: true
			}
			setPoints(prev => {
				const next = [point, ...prev]
				savePoints(next)
				return next
			})
			resolveAddress(id, lat, lng)
			return id
		},
		[resolveAddress]
	)

	useEffect(() => {
		const stored = loadSavedLocations()
		const incoming = consumeLocations('coordinate-marker').filter(
			point =>
				!stored.some(
					saved =>
						Math.abs(saved.lat - point.lat) < 1e-4 &&
						Math.abs(saved.lng - point.lng) < 1e-4
				)
		)
		const added: SavedPoint[] = incoming.map(point => ({
			id: newLocationId(),
			lat: point.lat,
			lng: point.lng,
			createdAt: Date.now(),
			loading: true
		}))

		const next = [...added, ...stored]
		setPoints(next)
		setReady(true)

		if (added.length > 0) {
			savePoints(next)
			added.forEach(point =>
				resolveAddress(point.id, point.lat, point.lng)
			)
			toast.success(
				`Added ${added.length} ${added.length === 1 ? 'pin' : 'pins'}`
			)
		}
	}, [resolveAddress])

	const copyToClipboard = useCallback(
		async (value: string, key: string) => {
			try {
				await navigator.clipboard.writeText(value)
				setCopied(key)
				window.setTimeout(() => {
					setCopied(prev => (prev === key ? null : prev))
				}, 1200)
			} catch {
				/* ignore */
			}
		},
		[]
	)

	const addMyLocation = useCallback(async () => {
		setLocating(true)
		try {
			const fix = await locate()
			addPoint(fix.lat, fix.lng)
			mapRef.current?.setView([fix.lat, fix.lng], 15, { animate: true })
			toast.success(`Pinned your location (± ${Math.round(fix.accuracy)} m)`)
		} catch (cause) {
			toast.error(geolocationErrorMessage(cause))
		} finally {
			setLocating(false)
		}
	}, [addPoint])

	// Init map
	useEffect(() => {
		if (!ready || !containerRef.current || mapRef.current) return

		let cancelled = false

		import('leaflet').then(mod => {
			if (cancelled || !containerRef.current || mapRef.current) return
			const leaflet = mod.default ?? mod
			leafletRef.current = leaflet

			const map = leaflet.map(containerRef.current, {
				center: [52.1326, 5.2913],
				zoom: 7,
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

			map.on('click', (e: L.LeafletMouseEvent) => {
				if (!addModeRef.current) return
				addPoint(e.latlng.lat, e.latlng.lng)
			})

			map.on('popupopen', (e: L.PopupEvent) => {
				e.popup
					.getElement()
					?.addEventListener('click', handlePopupCopyClick)
			})

			mapRef.current = map
			syncMarkers(leaflet, map)
		})

		return () => {
			cancelled = true
			mapRef.current?.remove()
			mapRef.current = null
			leafletRef.current = null
			markersRef.current.clear()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ready])

	// Sync markers when points change
	useEffect(() => {
		const leaflet = leafletRef.current
		const map = mapRef.current
		if (!leaflet || !map) return
		syncMarkers(leaflet, map)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [points])

	function syncMarkers(leaflet: typeof L, map: L.Map) {
		const store = markersRef.current
		const activeIds = new Set(points.map(p => p.id))

		for (const [id, marker] of Array.from(store.entries())) {
			if (!activeIds.has(id)) {
				map.removeLayer(marker)
				store.delete(id)
			}
		}

		for (const p of points) {
			const existing = store.get(p.id)
			if (existing) {
				existing.setLatLng([p.lat, p.lng])
				existing.setPopupContent(popupHtml(p))
			} else {
				const marker = leaflet
					.marker([p.lat, p.lng], { icon: createPinIcon(leaflet) })
					.addTo(map)
					.bindPopup(popupHtml(p), {
						className: 'crds-popup',
						closeButton: true,
						offset: leaflet.point(0, -36)
					})
				store.set(p.id, marker)
			}
		}
	}

	const removePoint = useCallback((id: string) => {
		setPoints(prev => {
			const next = prev.filter(p => p.id !== id)
			savePoints(next)
			return next
		})
	}, [])

	const clearAll = useCallback(() => {
		if (points.length === 0) return
		setPoints([])
		savePoints([])
	}, [points.length])

	const flyTo = useCallback((p: SavedPoint) => {
		const map = mapRef.current
		const store = markersRef.current
		if (!map) return
		map.setView([p.lat, p.lng], 14, { animate: true })
		const marker = store.get(p.id)
		marker?.openPopup()
	}, [])

	// Debounced search
	useEffect(() => {
		const q = query.trim()
		if (q.length < 3) {
			setSuggestions([])
			setSearching(false)
			return
		}
		setSearching(true)
		const ctrl = new AbortController()
		const t = window.setTimeout(async () => {
			try {
				const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&q=${encodeURIComponent(q)}`
				const res = await fetch(url, {
					headers: { Accept: 'application/json' },
					signal: ctrl.signal
				})
				if (!res.ok) return
				const data: SearchResult[] = await res.json()
				setSuggestions(data)
			} catch {
				/* ignore */
			} finally {
				setSearching(false)
			}
		}, 350)
		return () => {
			ctrl.abort()
			window.clearTimeout(t)
		}
	}, [query])

	const pickSuggestion = useCallback(
		(s: SearchResult) => {
			const lat = parseFloat(s.lat)
			const lng = parseFloat(s.lon)
			addPoint(lat, lng)
			mapRef.current?.setView([lat, lng], 14, { animate: true })
			setQuery('')
			setSuggestions([])
			setShowSuggestions(false)
		},
		[addPoint]
	)

	if (!ready) {
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
		<>
			<style>{`
				@keyframes crds-spin {
					to { transform: rotate(360deg); }
				}
				.crds-popup .leaflet-popup-content-wrapper {
					background: #111113;
					color: #e5e5e5;
					border: 1px solid rgba(148, 163, 184, 0.18);
					border-radius: 10px;
					box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
				}
				.crds-popup .leaflet-popup-content {
					margin: 12px 14px;
					line-height: 1.5;
				}
				.crds-popup .leaflet-popup-tip {
					background: #111113;
					border: 1px solid rgba(148, 163, 184, 0.18);
					box-shadow: none;
				}
				.crds-popup .leaflet-popup-close-button {
					color: #a3a3a3;
				}
				.crds-popup .leaflet-popup-close-button:hover {
					color: #fff;
				}
				.crds-popup .crds-copy {
					cursor: pointer;
					background: transparent;
					border: 0;
					padding: 1px 4px;
					margin: -1px -4px;
					border-radius: 4px;
					font-family: ui-monospace, monospace;
					font-size: 11px;
					color: #e2e8f0;
					display: inline-flex;
					align-items: center;
					gap: 6px;
					max-width: 100%;
					min-width: 0;
				}
				.crds-popup .crds-copy:hover {
					background: rgba(148, 163, 184, 0.14);
				}
				.crds-popup .crds-copy-title {
					font-family: inherit;
					font-size: 13px;
					font-weight: 600;
					color: #f8fafc;
				}
				.crds-popup .crds-copy .crds-copy-ind::after {
					content: '⧉';
					opacity: 0;
					transition: opacity 0.15s;
				}
				.crds-popup .crds-copy:hover .crds-copy-ind::after {
					opacity: 0.55;
				}
				.crds-popup .crds-copy[data-copied] {
					color: #86efac;
				}
				.crds-popup .crds-copy[data-copied] .crds-copy-ind::after {
					content: '✓';
					opacity: 1;
				}
			`}</style>
			<div className="grid gap-4 lg:grid-cols-[1fr_360px]">
				<div className="flex flex-col gap-3">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
						<input
							type="text"
							value={query}
							onChange={e => {
								setQuery(e.target.value)
								setShowSuggestions(true)
							}}
							onFocus={() => setShowSuggestions(true)}
							onBlur={() =>
								window.setTimeout(() => setShowSuggestions(false), 150)
							}
							placeholder="Search for an address, city or place…"
							className="w-full h-10 rounded-md border border-border bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:border-border focus-visible:outline-none focus:ring-1 focus:ring-muted-foreground/30"
						/>
						{searching ? (
							<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
						) : null}
						{showSuggestions && query.trim().length >= 3 ? (
							<div className="absolute z-[2000] mt-1.5 left-0 right-0 rounded-md border border-border bg-popover shadow-2xl shadow-black/60 overflow-hidden">
								<div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground">
									<span>
										{searching
											? 'Searching…'
											: `${suggestions.length} result${suggestions.length === 1 ? '' : 's'}`}
									</span>
								</div>
								{suggestions.length === 0 && !searching ? (
									<div className="px-3 py-4 text-xs text-muted-foreground italic">
										No matches for "{query}".
									</div>
								) : (
									<ul className="max-h-[360px] overflow-y-auto divide-y divide-border/40">
										{suggestions.map(s => {
											const parts = s.display_name
												.split(',')
												.map(p => p.trim())
											const primary = parts[0] ?? s.display_name
											const secondary = parts.slice(1).join(', ')
											return (
												<li key={s.place_id}>
													<button
														type="button"
														onMouseDown={e => {
															e.preventDefault()
															pickSuggestion(s)
														}}
														className="w-full text-left px-3 py-2.5 hover:bg-secondary/60 flex items-start gap-2.5 transition-colors"
													>
														<MapPin className="size-3.5 mt-0.5 text-foreground/70 shrink-0" />
														<div className="min-w-0 flex-1">
															<div className="text-xs font-medium text-foreground truncate">
																{primary}
															</div>
															{secondary ? (
																<div className="text-[11px] text-muted-foreground truncate mt-0.5">
																	{secondary}
																</div>
															) : null}
														</div>
														<span className="font-mono text-[10px] text-muted-foreground/70 shrink-0 pt-0.5">
															{parseFloat(s.lat).toFixed(3)},{' '}
															{parseFloat(s.lon).toFixed(3)}
														</span>
													</button>
												</li>
											)
										})}
									</ul>
								)}
							</div>
						) : null}
					</div>

					{/* Map */}
					<div className="relative">
						<div
							ref={containerRef}
							className={`h-[420px] w-full rounded-md border overflow-hidden transition-colors md:h-[560px] ${
								addMode
									? 'border-foreground/40 ring-1 ring-foreground/20'
									: 'border-border'
							}`}
							style={{ cursor: addMode ? 'crosshair' : '' }}
							role="application"
							aria-label="Interactive map — click to drop a coordinate marker"
						/>
						<div className="absolute top-2 right-2 z-[900] flex items-center gap-2 rounded-md border border-border bg-popover/90 backdrop-blur px-2 py-1.5 shadow-lg shadow-black/40">
							<button
								type="button"
								onClick={addMyLocation}
								disabled={locating}
								className="inline-flex items-center gap-1.5 rounded bg-secondary/60 px-2 py-1 text-xs text-foreground/80 transition-colors hover:bg-secondary disabled:opacity-50"
								title="Pin your current position"
							>
								{locating ? (
									<Loader2 className="size-3.5 animate-spin" />
								) : (
									<LocateFixed className="size-3.5" />
								)}
								{locating ? 'Locating…' : 'My location'}
							</button>
							<button
								type="button"
								onClick={() => setAddMode(v => !v)}
								aria-pressed={addMode}
								className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
									addMode
										? 'bg-foreground text-background'
										: 'bg-secondary/60 text-foreground/80 hover:bg-secondary'
								}`}
							>
								<MapPin className="size-3.5" />
								{addMode ? 'Add mode on' : 'Add mode'}
							</button>
						</div>
					</div>

					<p className="text-xs text-muted-foreground">
						Toggle <span className="text-foreground">Add mode</span>,
						then click the map to drop a pin. Search for an address, or click
						any coordinate or city to copy. Works worldwide.
					</p>
				</div>

				{/* Sidebar */}
				<aside className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm">
							<Layers className="size-4 text-muted-foreground" />
							<span>
								{points.length} pin{points.length === 1 ? '' : 's'}
							</span>
						</div>
						<button
							onClick={clearAll}
							disabled={points.length === 0}
							className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							<Trash2 className="size-3.5" /> Clear
						</button>
					</div>

					{points.length > 0 && (
						<SendToTool
							from="coordinate-marker"
							points={() => toLocationPoints(points)}
							label="Send all pins to"
							className="w-full justify-center"
						/>
					)}

					{points.length === 0 ? (
						<div className="rounded-md border border-border/60 p-4 text-sm text-muted-foreground">
							No pins yet. Toggle <strong>Add mode</strong> and click
							anywhere on the map to save a coordinate.
						</div>
					) : (
						<ul className="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
							{points.map(p => {
								const street = [p.street, p.houseNumber]
									.filter(Boolean)
									.join(' ')
								const cityLine = [p.postcode, p.city]
									.filter(Boolean)
									.join(' ')
								return (
									<li
										key={p.id}
										className="group rounded-md border border-border/60 bg-card overflow-hidden hover:border-border/90 transition-colors"
									>
										<div className="flex items-start gap-2 px-3 py-2 border-b border-border/50 bg-secondary/30">
											<MapPin className="size-3.5 mt-0.5 text-foreground/70 shrink-0" />
											<button
												onClick={() => flyTo(p)}
												className="flex-1 text-left min-w-0"
											>
												{p.loading ? (
													<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
														<Loader2 className="size-3 animate-spin" />{' '}
														Resolving…
													</div>
												) : p.city ? (
													<div className="text-sm font-medium truncate leading-tight">
														{p.city}
														{p.country ? (
															<span className="text-muted-foreground font-normal">
																, {p.country}
															</span>
														) : null}
													</div>
												) : (
													<div className="text-xs text-muted-foreground italic">
														Unknown location
													</div>
												)}
											</button>
											<button
												onClick={() => removePoint(p.id)}
												className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
												aria-label="Remove pin"
											>
												<Trash2 className="size-3.5" />
											</button>
										</div>

										<dl className="px-3 py-2 grid grid-cols-[52px_1fr] gap-x-3 gap-y-1 text-[11px]">
											{street ? (
												<>
													<dt className="text-muted-foreground uppercase tracking-wider text-[10px] pt-0.5">
														Street
													</dt>
													<dd className="text-foreground/90 truncate">
														{street}
													</dd>
												</>
											) : null}
											{cityLine ? (
												<>
													<dt className="text-muted-foreground uppercase tracking-wider text-[10px] pt-0.5">
														City
													</dt>
													<dd>
														<CopyValue
															value={cityLine}
															copied={copied === `${p.id}:city`}
															onCopy={() =>
																copyToClipboard(cityLine, `${p.id}:city`)
															}
														/>
													</dd>
												</>
											) : null}
											{p.region ? (
												<>
													<dt className="text-muted-foreground uppercase tracking-wider text-[10px] pt-0.5">
														Region
													</dt>
													<dd className="text-foreground/90 truncate">
														{p.region}
													</dd>
												</>
											) : null}
											<dt className="text-muted-foreground uppercase tracking-wider text-[10px] pt-0.5">
												Lat
											</dt>
											<dd>
												<CopyValue
													value={p.lat.toFixed(6)}
													mono
													copied={copied === `${p.id}:lat`}
													onCopy={() =>
														copyToClipboard(
															p.lat.toFixed(6),
															`${p.id}:lat`
														)
													}
												/>
											</dd>
											<dt className="text-muted-foreground uppercase tracking-wider text-[10px] pt-0.5">
												Lng
											</dt>
											<dd>
												<CopyValue
													value={p.lng.toFixed(6)}
													mono
													copied={copied === `${p.id}:lng`}
													onCopy={() =>
														copyToClipboard(
															p.lng.toFixed(6),
															`${p.id}:lng`
														)
													}
												/>
											</dd>
										</dl>
									</li>
								)
							})}
						</ul>
					)}

					<p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/50">
						Reverse geocoding by OpenStreetMap Nominatim. Pins are shared
						with the other map tools, stored under{' '}
						<code className="text-foreground">{SAVED_LOCATIONS_KEY}</code>.
					</p>
				</aside>
			</div>
		</>
	)
}

function CopyValue({
	value,
	onCopy,
	copied,
	mono
}: {
	value: string
	onCopy: () => void
	copied: boolean
	mono?: boolean
}) {
	return (
		<button
			type="button"
			onClick={onCopy}
			title={copied ? 'Copied!' : 'Click to copy'}
			className={`group/copy inline-flex items-center gap-1.5 max-w-full text-left truncate rounded px-1 -mx-1 py-0.5 hover:bg-secondary/60 transition-colors ${
				mono ? 'font-mono' : ''
			} ${copied ? 'text-foreground/70' : 'text-foreground/90'}`}
		>
			<span className="truncate">{value}</span>
			{copied ? (
				<Check className="size-3 shrink-0" />
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="size-3 shrink-0 opacity-0 group-hover/copy:opacity-60 transition-opacity"
				>
					<rect width="14" height="14" x="8" y="8" rx="2" />
					<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
				</svg>
			)}
		</button>
	)
}
