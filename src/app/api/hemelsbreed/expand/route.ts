import { NextResponse } from 'next/server'

const MAX_HOPS = 3
const ALLOWED_HOSTS = /(^|\.)(goo\.gl|google\.[a-z]{2,3}(\.[a-z]{2})?)$|^maps\.app\.goo\.gl$/

function allowedUrl(input: string): URL | null {
	try {
		const url = new URL(input)
		if (url.protocol !== 'https:') return null
		if (!ALLOWED_HOSTS.test(url.hostname)) return null
		return url
	} catch {
		return null
	}
}

export async function POST(request: Request) {
	let body: { url?: unknown }
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
	}

	const initial =
		typeof body.url === 'string' && body.url.length <= 500
			? allowedUrl(body.url)
			: null
	if (!initial) {
		return NextResponse.json(
			{ error: 'Not a Google Maps link' },
			{ status: 400 }
		)
	}

	let current = initial
	for (let hop = 0; hop < MAX_HOPS; hop++) {
		let response: Response
		try {
			response = await fetch(current, {
				method: 'GET',
				redirect: 'manual',
				headers: { 'User-Agent': 'Mozilla/5.0 (compatible; remcostoeten.nl)' },
				signal: AbortSignal.timeout(8000)
			})
		} catch {
			return NextResponse.json(
				{ error: 'Could not resolve link' },
				{ status: 502 }
			)
		}

		const location = response.headers.get('location')
		if (!location) break

		const next = allowedUrl(new URL(location, current).href)
		if (!next) break
		current = next
		if (!/goo\.gl$/.test(current.hostname)) break
	}

	if (current.hostname.startsWith('consent.')) {
		const wrapped = allowedUrl(current.searchParams.get('continue') ?? '')
		if (wrapped) current = wrapped
	}

	return NextResponse.json({ url: current.href })
}
