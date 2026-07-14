import { NextResponse } from 'next/server'
import { isAdmin } from '@/utils/is-admin'
import { noop } from '@/shared/lib/noop'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'
const OVERPASS_URLS = [
	'https://overpass-api.de/api/interpreter',
	'https://overpass.kumi.systems/api/interpreter'
]
const MAX_RESULTS = 500
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

type TSpotEvent =
	| { type: 'phase'; phase: 'interpreting' | 'searching' }
	| {
			type: 'interpretation'
			selectors: TSelector[]
			source: 'ai' | 'keyword' | 'name'
			aiAllowed: boolean
	  }
	| { type: 'spots'; spots: unknown[] }
	| { type: 'error'; message: string }

const KEYWORD_SELECTORS: [RegExp, TSelector[]][] = [
	[/tattoo/i, ['shop=tattoo']],
	[/piercing/i, ['shop=piercing']],
	[/restaurant|eten|dinner|diner\b/i, ['amenity=restaurant']],
	[/cafe|café|koffie|coffee/i, ['amenity=cafe']],
	[/\bbar\b|pub|kroeg/i, ['amenity=bar', 'amenity=pub']],
	[/nightclub|club\b|disco/i, ['amenity=nightclub']],
	[/supermark|grocery/i, ['shop=supermarket']],
	[/hotel|hostel/i, ['tourism=hotel', 'tourism=hostel']],
	[/apotheek|pharmac/i, ['amenity=pharmacy']],
	[/gym|sportschool|fitness/i, ['leisure=fitness_centre']],
	[/kapper|hairdress|barber/i, ['shop=hairdresser']],
	[/nagel|nail salon/i, ['shop=beauty']],
	[/spa|massage|sauna|wellness/i, ['leisure=spa', 'shop=massage']],
	[/bakker|bakery/i, ['shop=bakery']],
	[/tankstation|gas station|fuel/i, ['amenity=fuel']],
	[/ev charg|laadpaal|charging station/i, ['amenity=charging_station']],
	[/ziekenhuis|hospital/i, ['amenity=hospital']],
	[/tandarts|dentist/i, ['amenity=dentist']],
	[/dierenarts|\bvet\b|veterinar/i, ['amenity=veterinary']],
	[/school/i, ['amenity=school']],
	[/kinderdagverblijf|daycare|kindergarten|creche/i, ['amenity=kindergarten']],
	[/university|universiteit/i, ['amenity=university']],
	[/library|bibliotheek/i, ['amenity=library']],
	[/bookstore|boekhandel|book shop/i, ['shop=books']],
	[/kerk|church/i, ['amenity=place_of_worship']],
	[/mosque|moskee/i, ['amenity=place_of_worship', 'religion=muslim']],
	[/synagogue|synagoge/i, ['amenity=place_of_worship', 'religion=jewish']],
	[/temple|tempel/i, ['amenity=place_of_worship', 'religion=buddhist']],
	[/station|trein/i, ['railway=station']],
	[/bus stop|bushalte/i, ['highway=bus_stop']],
	[/taxi/i, ['amenity=taxi']],
	[/car rental|autoverhuur/i, ['amenity=car_rental']],
	[/car wash|autowasstraat/i, ['shop=car_wash']],
	[/garage|car repair|autogarage/i, ['shop=car_repair']],
	[/driving school|rijschool/i, ['amenity=driving_school']],
	[/bike rental|fietsverhuur/i, ['amenity=bicycle_rental']],
	[/bike repair|fietsenmaker|bike shop/i, ['shop=bicycle']],
	[/parkeer|parking/i, ['amenity=parking']],
	[/pizza/i, ['cuisine=pizza']],
	[/sushi/i, ['cuisine=sushi']],
	[/snackbar|friet|frituur|fast ?food/i, ['amenity=fast_food']],
	[/museum/i, ['tourism=museum']],
	[/cinema|bioscoop|movie theater/i, ['amenity=cinema']],
	[/theatre|theater|schouwburg/i, ['amenity=theatre']],
	[/casino/i, ['amenity=casino']],
	[/arcade|speelhal/i, ['leisure=amusement_arcade']],
	[/bowling/i, ['leisure=bowling_alley']],
	[/camping|campsite/i, ['tourism=camp_site']],
	[/zoo|dierentuin/i, ['tourism=zoo']],
	[/aquarium/i, ['tourism=aquarium']],
	[/park\b|speeltuin|playground/i, ['leisure=park', 'leisure=playground']],
	[/dog park|hondenpark/i, ['leisure=dog_park']],
	[/beach|strand/i, ['natural=beach']],
	[/swimming pool|zwembad/i, ['leisure=swimming_pool']],
	[/ice rink|schaatsbaan/i, ['leisure=ice_rink']],
	[/golf/i, ['leisure=golf_course']],
	[/tennis/i, ['leisure=pitch', 'sport=tennis']],
	[/football|voetbal|soccer/i, ['leisure=pitch', 'sport=soccer']],
	[/basketball/i, ['leisure=pitch', 'sport=basketball']],
	[/skate ?park/i, ['leisure=pitch', 'sport=skateboard']],
	[/climbing|klimhal/i, ['sport=climbing']],
	[/horse|paard|equestrian|stable|manege/i, [
		'leisure=horse_riding',
		'sport=equestrian',
		'amenity=stable'
	]],
	[/marina|jachthaven/i, ['leisure=marina']],
	[/yoga/i, ['sport=yoga']],
	[/bank\b|geldautomaat|\batm\b/i, ['amenity=bank', 'amenity=atm']],
	[/post office|postkantoor/i, ['amenity=post_office']],
	[/laundry|wasserette|dry clean/i, ['shop=laundry', 'shop=dry_cleaning']],
	[/locksmith|slotenmaker/i, ['shop=locksmith']],
	[/florist|bloemist/i, ['shop=florist']],
	[/hardware store|bouwmarkt/i, ['shop=hardware']],
	[/furniture|meubel/i, ['shop=furniture']],
	[/electronics|elektronica/i, ['shop=electronics']],
	[/shopping mall|winkelcentrum/i, ['shop=mall']],
	[/market\b|markt\b/i, ['amenity=marketplace']],
	[/town ?hall|gemeentehuis|stadhuis/i, ['amenity=townhall']],
	[/city center|city centre|stadscentrum|\bcentrum\b|downtown/i, [
		'landuse=commercial',
		'place=square',
		'amenity=townhall'
	]],
	[/apartment|flats?\b|appartement/i, ['building=apartments']],
	[/housing|woonwijk|\bhuizen\b|houses?\b|residential/i, [
		'building=residential',
		'building=house',
		'landuse=residential'
	]]
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
						'You translate a free-text place search (Dutch or English) into OpenStreetMap tag selectors for an Overpass query. Respond with JSON: {"selectors": ["key=value", ...]}. The examples below (shop=tattoo, amenity=restaurant, cuisine=sushi, tourism=hotel, leisure=fitness_centre) illustrate the tagging style only, do not limit yourself to them. OpenStreetMap has thousands of tags across amenity, shop, leisure, tourism, sport, natural, landuse and craft; pick whatever real OSM tags best fit the query, however niche (e.g. "horse range" maps to leisure=horse_riding, sport=equestrian, amenity=stable; "climbing spot" maps to sport=climbing, leisure=climbing). Selectors are combined with OR. Cast a WIDE net: include the most specific tag, plus broader parent categories, synonyms and adjacent tags a user might mean. Return up to 8 selectors, most specific first. Only key=value pairs, no regex, no spaces.'
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
	return valid.length > 0 ? valid.slice(0, 8) : null
}

function buildOverpassQuery(
	selectors: TSelector[],
	lat: number,
	lng: number,
	radiusMeters: number
): string {
	const around = `(around:${Math.round(radiusMeters)},${lat},${lng})`
	const clauses = selectors.map(selector => {
		const [key, value] = selector.split('=')
		return `nwr["${key}"="${value}"]${around};`
	})
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
		tags.sport ??
		tags.natural ??
		tags.railway ??
		tags.building ??
		tags.landuse ??
		tags.place ??
		'place'
	)
}

type TSpotResult = {
	id: string
	name: string
	lat: number
	lng: number
	kind: string
	address: string | null
}

function overpassSpots(elements: TOverpassElement[]): TSpotResult[] {
	return elements.flatMap(element => {
		const lat = element.lat ?? element.center?.lat
		const lng = element.lon ?? element.center?.lon
		if (lat === undefined || lng === undefined) return []
		const tags = element.tags ?? {}
		return [
			{
				id: `${element.type}-${element.id}`,
				name: tags.name ?? tags.brand ?? 'Unnamed',
				lat,
				lng,
				kind: elementKind(tags),
				address: elementAddress(tags)
			}
		]
	})
}

async function nominatimSpots(
	query: string,
	lat: number,
	lng: number,
	radiusKm: number
): Promise<TSpotResult[] | null> {
	const latDeg = radiusKm / 111.32
	const lonDeg = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))
	const params = new URLSearchParams({
		q: query,
		format: 'jsonv2',
		limit: '40',
		bounded: '1',
		viewbox: `${lng - lonDeg},${lat + latDeg},${lng + lonDeg},${lat - latDeg}`
	})
	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/search?${params}`,
			{
				headers: {
					'User-Agent':
						'remcostoeten.nl hemelsbreed tool (contact: remcostoeten@hotmail.com)'
				},
				signal: AbortSignal.timeout(10000)
			}
		)
		if (!response.ok) return null
		const data = await response.json()
		if (!Array.isArray(data)) return null
		return data.flatMap(item => {
			const spotLat = Number(item?.lat)
			const spotLng = Number(item?.lon)
			if (!Number.isFinite(spotLat) || !Number.isFinite(spotLng)) return []
			const displayName =
				typeof item?.display_name === 'string' ? item.display_name : ''
			return [
				{
					id: `${item.osm_type}-${item.osm_id}`,
					name: item?.name || displayName.split(',')[0] || 'Unnamed',
					lat: spotLat,
					lng: spotLng,
					kind: typeof item?.type === 'string' ? item.type : 'place',
					address:
						displayName.split(',').slice(1, 3).join(',').trim() || null
				}
			]
		})
	} catch {
		return null
	}
}

async function fetchOverpassElements(
	overpassQuery: string
): Promise<TOverpassElement[] | null> {
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
			return Array.isArray(data?.elements) ? data.elements : []
		} catch {
			continue
		}
	}
	return null
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

	const aiAllowed = await isAdmin()
	const encoder = new TextEncoder()

	const stream = new ReadableStream({
		async start(controller) {
			function send(event: TSpotEvent) {
				controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
			}

			let selectors: TSelector[] = []
			let source: 'ai' | 'keyword' | 'name' = 'name'

			if (aiAllowed && process.env.GROQ_API_KEY) {
				send({ type: 'phase', phase: 'interpreting' })
				try {
					const fromGroq = await groqSelectors(query)
					if (fromGroq) {
						selectors = fromGroq
						source = 'ai'
					}
				} catch {
					noop()
				}
			}
			if (selectors.length === 0) {
				selectors = keywordSelectors(query)
				if (selectors.length > 0) source = 'keyword'
			}
			send({ type: 'interpretation', selectors, source, aiAllowed })

			send({ type: 'phase', phase: 'searching' })
			const [elements, named] = await Promise.all([
				selectors.length > 0
					? fetchOverpassElements(
							buildOverpassQuery(selectors, lat, lng, radiusKm * 1000)
						)
					: Promise.resolve<TOverpassElement[]>([]),
				nominatimSpots(query, lat, lng, radiusKm)
			])
			if (elements === null && named === null) {
				send({
					type: 'error',
					message: 'Map data service is busy, try again shortly'
				})
				controller.close()
				return
			}

			const merged = new Map<string, TSpotResult>()
			for (const spot of [
				...overpassSpots(elements ?? []),
				...(named ?? [])
			]) {
				if (!merged.has(spot.id)) merged.set(spot.id, spot)
			}

			send({ type: 'spots', spots: [...merged.values()].slice(0, MAX_RESULTS) })
			controller.close()
		}
	})

	return new Response(stream, {
		headers: {
			'Content-Type': 'application/x-ndjson',
			'Cache-Control': 'no-store'
		}
	})
}
