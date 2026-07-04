import type { TRadiusCircle } from '../types'

const EARTH_RADIUS_KM = 6371

function toRad(degrees: number): number {
	return (degrees * Math.PI) / 180
}

/**
 * Parse a raw "lat lng" coordinate pair (space, comma or semicolon separated,
 * decimal degrees). Returns null when the input isn't a valid WGS84 pair.
 */
export function parseLatLng(
	input: string
): { lat: number; lng: number } | null {
	const match = input
		.trim()
		.match(/^(-?\d+(?:\.\d+)?)\s*[ ,;]\s*(-?\d+(?:\.\d+)?)$/)
	if (!match) return null
	const lat = Number(match[1])
	const lng = Number(match[2])
	if (Number.isNaN(lat) || Number.isNaN(lng)) return null
	if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
	return { lat, lng }
}

/**
 * Great-circle ("hemelsbreed") distance in kilometres between two points.
 */
export function haversineKm(
	aLat: number,
	aLng: number,
	bLat: number,
	bLng: number
): number {
	const dLat = toRad(bLat - aLat)
	const dLng = toRad(bLng - aLng)
	const lat1 = toRad(aLat)
	const lat2 = toRad(bLat)

	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
	return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/**
 * Two circles overlap when the distance between their centres is less than the
 * sum of their radii — i.e. their coverage areas share ground.
 */
export function circlesOverlap(a: TRadiusCircle, b: TRadiusCircle): boolean {
	const distance = haversineKm(a.lat, a.lng, b.lat, b.lng)
	return distance < a.radiusKm + b.radiusKm
}

/**
 * Whether a lat/lng point falls inside a circle's radius.
 */
export function circleContains(
	circle: TRadiusCircle,
	lat: number,
	lng: number
): boolean {
	return haversineKm(circle.lat, circle.lng, lat, lng) <= circle.radiusKm
}

/**
 * Initial compass bearing (degrees, 0–360) from point A to point B.
 */
export function bearing(
	aLat: number,
	aLng: number,
	bLat: number,
	bLng: number
): number {
	const dLng = toRad(bLng - aLng)
	const lat1 = toRad(aLat)
	const lat2 = toRad(bLat)
	const y = Math.sin(dLng) * Math.cos(lat2)
	const x =
		Math.cos(lat1) * Math.sin(lat2) -
		Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
	return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

/**
 * Nearest 8-point compass label for a bearing in degrees.
 */
export function compass(deg: number): string {
	return COMPASS[Math.round(deg / 45) % 8]
}

/**
 * Human-friendly distance: metres under 1 km, one decimal under 10 km.
 */
export function formatKm(km: number): string {
	if (km < 1) return `${Math.round(km * 1000)} m`
	if (km < 10) return `${km.toFixed(1)} km`
	return `${Math.round(km)} km`
}

export const PALETTE: string[] = [
	'#ef4444',
	'#f97316',
	'#eab308',
	'#22c55e',
	'#06b6d4',
	'#3b82f6',
	'#8b5cf6',
	'#ec4899'
]

export function nextColor(used: string[]): string {
	const free = PALETTE.find(color => !used.includes(color))
	return free ?? PALETTE[used.length % PALETTE.length]
}
