import type { TPdokLocation, TPdokSuggestion } from '../types'

const BASE = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1'
const TYPE_FILTER =
	'fq=type:(gemeente OR woonplaats OR weg OR postcode OR adres)'

type TSuggestResponse = {
	response?: {
		docs?: Array<{ id: string; weergavenaam: string; type: string }>
	}
}

type TLookupResponse = {
	response?: {
		docs?: Array<{ weergavenaam: string; centroide_ll: string }>
	}
}

/**
 * Autocomplete Dutch addresses, postcodes, streets and places via the free
 * PDOK Locatieserver. No API key required.
 */
export async function suggestLocations(
	query: string,
	signal?: AbortSignal
): Promise<TPdokSuggestion[]> {
	const trimmed = query.trim()
	if (trimmed.length < 2) return []

	const url = `${BASE}/suggest?q=${encodeURIComponent(trimmed)}&rows=8&${TYPE_FILTER}`
	const response = await fetch(url, { signal })
	if (!response.ok)
		throw new Error(`PDOK suggest failed (${response.status})`)

	const data = (await response.json()) as TSuggestResponse
	const docs = data.response?.docs ?? []
	return docs.map(doc => ({
		id: doc.id,
		label: doc.weergavenaam,
		type: doc.type
	}))
}

/**
 * Resolve a suggestion id to a labelled lat/lng centroid.
 */
export async function lookupLocation(
	id: string,
	signal?: AbortSignal
): Promise<TPdokLocation | null> {
	const url = `${BASE}/lookup?id=${encodeURIComponent(id)}&fl=id,weergavenaam,centroide_ll`
	const response = await fetch(url, { signal })
	if (!response.ok) throw new Error(`PDOK lookup failed (${response.status})`)

	const data = (await response.json()) as TLookupResponse
	const doc = data.response?.docs?.[0]
	if (!doc) return null

	const point = parsePoint(doc.centroide_ll)
	if (!point) return null

	return { label: doc.weergavenaam, lat: point.lat, lng: point.lng }
}

function parsePoint(wkt: string): { lat: number; lng: number } | null {
	const match = wkt.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/)
	if (!match) return null
	const lng = Number(match[1])
	const lat = Number(match[2])
	if (Number.isNaN(lat) || Number.isNaN(lng)) return null
	return { lat, lng }
}
