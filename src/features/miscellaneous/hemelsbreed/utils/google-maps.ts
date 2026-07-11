export type TGoogleMapsPoint = {
	lat: number
	lng: number
	label: string | null
}

const GOOGLE_HOST = /(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/
const SHORT_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl'])

function validPoint(lat: number, lng: number): boolean {
	return (
		Number.isFinite(lat) &&
		Number.isFinite(lng) &&
		lat >= -90 &&
		lat <= 90 &&
		lng >= -180 &&
		lng <= 180
	)
}

function toUrl(input: string): URL | null {
	try {
		return new URL(input.trim())
	} catch {
		return null
	}
}

/**
 * Whether the input is a Google Maps short share link (maps.app.goo.gl),
 * which needs a server-side redirect lookup before it can be parsed.
 */
export function isGoogleMapsShortLink(input: string): boolean {
	const url = toUrl(input)
	if (!url) return false
	if (url.hostname === 'goo.gl') return url.pathname.startsWith('/maps')
	return SHORT_HOSTS.has(url.hostname)
}

function placeLabel(pathname: string): string | null {
	const match = pathname.match(/\/place\/([^/@]+)/)
	if (!match) return null
	const label = decodeURIComponent(match[1].replace(/\+/g, ' ')).trim()
	if (!label || /^-?\d+(\.\d+)?[, ]/.test(label)) return null
	return label
}

/**
 * Extract the pinned coordinate from a full Google Maps URL. Prefers the
 * place pin (!3d…!4d…) over the viewport centre (@lat,lng), and also reads
 * q=/ll=/query= params and /search/lat,lng paths.
 */
export function parseGoogleMapsUrl(input: string): TGoogleMapsPoint | null {
	const url = toUrl(input)
	if (!url) return null
	const isMapsHost =
		GOOGLE_HOST.test(url.hostname) || url.hostname === 'maps.google.com'
	if (!isMapsHost) return null

	const label = placeLabel(url.pathname)
	const raw = decodeURIComponent(url.href)

	const pin = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
	if (pin) {
		const lat = Number(pin[1])
		const lng = Number(pin[2])
		if (validPoint(lat, lng)) return { lat, lng, label }
	}

	for (const key of ['q', 'query', 'll', 'destination', 'center']) {
		const value = url.searchParams.get(key)
		if (!value) continue
		const match = value
			.replace(/^loc:/, '')
			.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
		if (!match) continue
		const lat = Number(match[1])
		const lng = Number(match[2])
		if (validPoint(lat, lng)) return { lat, lng, label }
	}

	const path = raw.match(
		/\/(?:search|dir)\/(-?\d+(?:\.\d+)?),[+\s]*(-?\d+(?:\.\d+)?)/
	)
	if (path) {
		const lat = Number(path[1])
		const lng = Number(path[2])
		if (validPoint(lat, lng)) return { lat, lng, label }
	}

	const viewport = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
	if (viewport) {
		const lat = Number(viewport[1])
		const lng = Number(viewport[2])
		if (validPoint(lat, lng)) return { lat, lng, label }
	}

	return null
}

/**
 * Universal Google Maps search link for a coordinate.
 */
export function googleMapsSearchUrl(lat: number, lng: number): string {
	return `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`
}
