import type { TLocationPoint } from './location-handoff'
import type { TGeocodedAddress } from './reverse-geocode'

export const SAVED_LOCATIONS_KEY = 'misc-tools:coordinates'
export const LOCATIONS_CHANGED_EVENT = 'misc-tools:locations-changed'

export type TSavedLocation = TGeocodedAddress & {
	id: string
	lat: number
	lng: number
	createdAt: number
}

type TRawLocation = Partial<Record<keyof TSavedLocation, unknown>>

function asString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function normalise(raw: TRawLocation): TSavedLocation | null {
	const lat = Number(raw?.lat)
	const lng = Number(raw?.lng)
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

	const createdAt = Number(raw?.createdAt)

	return {
		id: asString(raw?.id) ?? `${lat},${lng}`,
		lat,
		lng,
		createdAt: Number.isFinite(createdAt) ? createdAt : 0,
		address: asString(raw?.address),
		street: asString(raw?.street),
		houseNumber: asString(raw?.houseNumber),
		postcode: asString(raw?.postcode),
		city: asString(raw?.city),
		region: asString(raw?.region),
		country: asString(raw?.country)
	}
}

export function newLocationId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID()
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Human-readable name for a location, falling back through address parts down
 * to raw coordinates. Shared so every tool labels the same pin identically.
 */
export function locationLabel(
	location: Omit<TSavedLocation, 'id' | 'createdAt'>
): string {
	const street = [location.street, location.houseNumber]
		.filter(Boolean)
		.join(' ')
	const city = location.city

	if (street && city) return `${street}, ${city}`
	if (city) return location.country ? `${city}, ${location.country}` : city
	if (street) return street
	if (location.address) return location.address.split(',')[0].trim()
	return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
}

/** Strips a saved pin down to the shape other tools consume. */
export function toLocationPoints(locations: TSavedLocation[]): TLocationPoint[] {
	return locations.map(location => ({
		id: location.id,
		lat: location.lat,
		lng: location.lng,
		label: locationLabel(location)
	}))
}

/** Saved pins shared by every geo tool. Written by whichever tool owns the pin. */
export function loadSavedLocations(): TSavedLocation[] {
	if (typeof window === 'undefined') return []
	try {
		const raw = window.localStorage.getItem(SAVED_LOCATIONS_KEY)
		if (!raw) return []
		const parsed: unknown = JSON.parse(raw)
		if (!Array.isArray(parsed)) return []
		return parsed
			.map(normalise)
			.filter((location): location is TSavedLocation => location !== null)
	} catch {
		return []
	}
}

export function saveLocations(locations: TSavedLocation[]) {
	if (typeof window === 'undefined') return
	try {
		window.localStorage.setItem(
			SAVED_LOCATIONS_KEY,
			JSON.stringify(locations)
		)
		window.dispatchEvent(new Event(LOCATIONS_CHANGED_EVENT))
	} catch (error) {
		console.warn('Could not persist saved locations', error)
	}
}

/** Adds a pin to the shared store without clobbering pins written by other tools. */
export function appendSavedLocation(
	location: Omit<TSavedLocation, 'id' | 'createdAt'> &
		Partial<Pick<TSavedLocation, 'id' | 'createdAt'>>
): TSavedLocation {
	const saved: TSavedLocation = {
		...location,
		id: location.id ?? newLocationId(),
		createdAt: location.createdAt ?? Date.now()
	}
	saveLocations([saved, ...loadSavedLocations()])
	return saved
}
