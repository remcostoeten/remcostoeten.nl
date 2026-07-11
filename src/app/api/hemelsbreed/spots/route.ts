import { NextResponse } from 'next/server'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'
const OVERPASS_URLS = [
	'https://overpass-api.de/api/interpreter',
	'https://overpass.kumi.systems/api/interpreter'
]
const MAX_RESULTS = 40
const MAX_RADIUS_KM = 50
const SELECTOR_PATTERN = /^[a-z_:]{1,40}=[a-z0-9_;.-]{1,40}$/i

type TSelector = string

type TOverpassElement = {
	type: string
	id: number
	lat?: number
	lon?: number
	center?: { lat: number; lon: number }
	tags?: Record<string, string>
}

const KEYWORD_SELECTORS: [RegExp, TSelector[]][] = [
	[/tattoo/i, ['shop=tattoo']],
	[/restaurant|eten|dinner/i, ['amenity=restaurant']],
	[/cafe|café|koffie|coffee/i, ['amenity=cafe']],
	[/\bbar\b|pub|kroeg/i, ['amenity=bar', 'amenity=pub']],
	[/supermark|grocery/i, ['shop=supermarket']],
	[/hotel|hostel/i, ['tourism=hotel', 'tourism=hostel']],
	[/apotheek|pharmac/i, ['amenity=pharmacy']],
	[/gym|sportschool|fitness/i, ['leisure=fitness_centre']],
	[/kapper|hairdress|barber/i, ['shop=hairdresser']],
	[/bakker|bakery/i, ['shop=bakery']],
	[/tankstation|gas station|fuel/i, ['amenity=fuel']],
	[/ziekenhuis|hospital/i, ['amenity=hospital']],
	[/school/i, ['amenity=school']],
	[/kerk|church/i, ['amenity=place_of_worship']],
	[/station|trein/i, ['railway=station']],
	[/parkeer|parking/i, ['amenity=parking']],
	[/pizza/i, ['cuisine=pizza']],
	[/snackbar|friet|frituur/i, ['amenity=fast_food']],
	[/museum/i, ['tourism=museum']],
	[/camping|campsite/i, ['tourism=camp_site']]
]

function keywordSelectors(query: string): TSelector[] {
	for (const [pattern, selectors] of KEYWORD_SELECTORS) {
		if (pattern.test(query)) return selectors
	}
	return []
}

async function groqSelectors(query: string): Promise<TSelector[] | null> {
	const key = process.env.GROQ_API_KEY
	if (!key) return null

	const response = await fetch(GROQ_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: GROQ_MODEL,
			temperature: 0,
			response_format: { type: 'json_object' },
			messages: [
				{
					role: 'system',
					content:
						'You translate a free-text place search (Dutch or English) into OpenStreetMap tag selectors for an Overpass query. Respond with JSON: {"selectors": ["key=value", ...]}. Use standard OSM tags like shop=tattoo, amenity=restaurant, cuisine=sushi, tourism=hotel, leisure=fitness_centre. Selectors are combined with OR, so only include a selector when EVERYTHING it matches satisfies the request — for "sushi restaurant" answer ["cuisine=sushi"], never add the broader amenity=restaurant. Prefer the single most specific tag; add alternatives only for true synonyms (e.g. amenity=bar and amenity=pub). Only key=value pairs, no regex, no spaces.'
				},
				{ role: 'user', content: query }
			]
		}),
		signal: AbortSignal.timeout(8000)
	})
	if (!response.ok) return null

	const data = await response.json()
	const content = data?.choices?.[0]?.message?.content
	if (typeof content !== 'string') return null

	const parsed = JSON.parse(content) as { selectors?: unknown }
	if (!Array.isArray(parsed.selectors)) return null

	const valid = parsed.selectors.filter(
		(selector): selector is string =>
			typeof selector === 'string' && SELECTOR_PATTERN.test(selector)
	)
	return valid.length > 0 ? valid.slice(0, 3) : null
}

function buildOverpassQuery(
	selectors: TSelector[],
	nameQuery: string | null,
	lat: number,
	lng: number,
	radiusMeters: number
): string {
	const around = `(around:${Math.round(radiusMeters)},${lat},${lng})`
	const clauses = selectors.map(selector => {
		const [key, value] = selector.split('=')
		return `nwr["${key}"="${value}"]${around};`
	})
	if (clauses.length === 0 && nameQuery) {
		const escaped = nameQuery.replace(/["\\]/g, '')
		clauses.push(`nwr["name"~"${escaped}",i]${around};`)
	}
	return `[out:json][timeout:20];(${clauses.join('')});out tags center ${MAX_RESULTS};`
}

function elementAddress(tags: Record<string, string>): string | null {
	const street = tags['addr:street']
	if (!street) return tags['addr:city'] ?? null
	const number = tags['addr:housenumber']
	const city = tags['addr:city']
	const line = number ? `${street} ${number}` : street
	return city ? `${line}, ${city}` : line
}

function elementKind(tags: Record<string, string>): string {
	return (
		tags.cuisine ??
		tags.shop ??
		tags.amenity ??
		tags.tourism ??
		tags.leisure ??
		tags.railway ??
		'place'
	)
}

export async function POST(request: Request) {
	let body: { query?: unknown; lat?: unknown; lng?: unknown; radiusKm?: unknown }
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
	}

	const query = typeof body.query === 'string' ? body.query.trim() : ''
	const lat = Number(body.lat)
	const lng = Number(body.lng)
	const radiusKm = Math.min(
		Math.max(Number(body.radiusKm) || 5, 0.1),
		MAX_RADIUS_KM
	)

	if (!query || query.length > 200) {
		return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
	}
	if (
		!Number.isFinite(lat) ||
		!Number.isFinite(lng) ||
		lat < -90 ||
		lat > 90 ||
		lng < -180 ||
		lng > 180
	) {
		return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
	}

	let selectors: TSelector[] = []
	let source: 'ai' | 'keyword' | 'name' = 'name'
	try {
		const fromGroq = await groqSelectors(query)
		if (fromGroq) {
			selectors = fromGroq
			source = 'ai'
		}
	} catch {
		selectors = []
	}
	if (selectors.length === 0) {
		selectors = keywordSelectors(query)
		if (selectors.length > 0) source = 'keyword'
	}

	const overpassQuery = buildOverpassQuery(
		selectors,
		selectors.length === 0 ? query : null,
		lat,
		lng,
		radiusKm * 1000
	)

	let elements: TOverpassElement[] | null = null
	for (const url of OVERPASS_URLS) {
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent':
						'remcostoeten.nl hemelsbreed tool (contact: remcostoeten@hotmail.com)'
				},
				body: `data=${encodeURIComponent(overpassQuery)}`,
				signal: AbortSignal.timeout(25000)
			})
			if (!response.ok) continue
			const data = await response.json()
			elements = Array.isArray(data?.elements) ? data.elements : []
			break
		} catch {
			continue
		}
	}
	if (elements === null) {
		return NextResponse.json(
			{ error: 'Map data service is busy, try again shortly' },
			{ status: 502 }
		)
	}

	const spots = elements
		.map(element => {
			const spotLat = element.lat ?? element.center?.lat
			const spotLng = element.lon ?? element.center?.lon
			if (spotLat === undefined || spotLng === undefined) return null
			const tags = element.tags ?? {}
			return {
				id: `${element.type}-${element.id}`,
				name: tags.name ?? tags.brand ?? 'Unnamed',
				lat: spotLat,
				lng: spotLng,
				kind: elementKind(tags),
				address: elementAddress(tags)
			}
		})
		.filter(Boolean)
		.slice(0, MAX_RESULTS)

	return NextResponse.json({ spots, source, selectors })
}
