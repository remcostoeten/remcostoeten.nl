import crypto from 'node:crypto'

const YTM_ORIGIN = 'https://music.youtube.com'
const YTM_API_KEY = 'AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30'

let cachedCookieMap: Map<string, string> | null = null
let cachedAuthUser = '0'
let cachedUserSessionId: string | null = null
let cachedVisitorData: string | null = null
let cachedPageId: string | null = null

export function hasYTMusicCredentials(): boolean {
	const cookie = process.env.YTM_COOKIE
	return !!(
		cookie &&
		cookie !== 'your_ytm_cookie_here' &&
		!cookie.startsWith('#')
	)
}

function parseCookieMap(cookieStr: string): Map<string, string> {
	const map = new Map<string, string>()
	for (const part of cookieStr.split(';')) {
		const eq = part.indexOf('=')
		if (eq > 0) {
			map.set(part.substring(0, eq).trim(), part.substring(eq + 1).trim())
		}
	}
	return map
}

function rebuildCookieHeader(cookieMap: Map<string, string>): string {
	const parts: string[] = []
	cookieMap.forEach((value, key) => parts.push(`${key}=${value}`))
	return parts.join('; ')
}

async function fetchPageConfig(
	cookieMap: Map<string, string>
): Promise<{ userSessionId: string; visitorData: string; pageId: string }> {
	// SOCS=CAI prevents YouTube from showing the GDPR consent page
	const cookieHeader = rebuildCookieHeader(cookieMap) + '; SOCS=CAI'
	const response = await fetch('https://music.youtube.com', {
		headers: {
			accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'accept-language': 'en-US,en;q=0.9',
			cookie: cookieHeader,
			'user-agent':
				'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
		}
	})
	const html = await response.text()

	const datasyncMatch = html.match(/"DATASYNC_ID"\s*:\s*"([^"]+)"/)
	if (!datasyncMatch)
		throw new Error('Could not find DATASYNC_ID in YT Music page')
	const datasyncParts = datasyncMatch[1].split('||')
	const userSessionId = datasyncParts[1] || datasyncParts[0] || ''
	const pageId = datasyncParts[0] || ''

	const visitorMatch = html.match(/"VISITOR_DATA"\s*:\s*"([^"]+)"/)
	const visitorData = visitorMatch
		? visitorMatch[1].replace(/\\u003d/gi, '=')
		: ''

	return { userSessionId, visitorData, pageId }
}

function sapisidHash(
	timestamp: string,
	cookieValue: string,
	userSessionId: string
): string {
	const hash = crypto
		.createHash('sha1')
		.update(`${userSessionId} ${timestamp} ${cookieValue} ${YTM_ORIGIN}`)
		.digest('hex')
	return `${timestamp}_${hash}_u`
}

async function generateAuthHeader(
	cookieMap: Map<string, string>
): Promise<{ authHeader: string; visitorData: string; pageId: string }> {
	const ts = Math.floor(Date.now() / 1000).toString()

	if (!cachedUserSessionId) {
		const config = await fetchPageConfig(cookieMap)
		cachedUserSessionId = config.userSessionId
		cachedVisitorData = config.visitorData
		cachedPageId = config.pageId
	}

	const sapisid =
		cookieMap.get('__Secure-3PAPISID') || cookieMap.get('SAPISID')
	if (!sapisid) throw new Error('Missing __Secure-3PAPISID or SAPISID cookie')

	const sapisid1 =
		cookieMap.get('__Secure-1PAPISID') || cookieMap.get('APISID')
	if (!sapisid1) throw new Error('Missing __Secure-1PAPISID or APISID cookie')

	const sapisid3 = cookieMap.get('__Secure-3PAPISID') || sapisid

	const parts = [
		`SAPISIDHASH ${sapisidHash(ts, sapisid, cachedUserSessionId)}`,
		`SAPISID1PHASH ${sapisidHash(ts, sapisid1, cachedUserSessionId)}`,
		`SAPISID3PHASH ${sapisidHash(ts, sapisid3, cachedUserSessionId)}`
	]

	return {
		authHeader: parts.join(' '),
		visitorData: cachedVisitorData!,
		pageId: cachedPageId!
	}
}

export function invalidateYTMusicClient(): void {
	cachedCookieMap = null
	cachedAuthUser = '0'
	cachedUserSessionId = null
	cachedVisitorData = null
	cachedPageId = null
}

export async function fetchInnertube(
	endpoint: string,
	body: Record<string, unknown>,
	clientVersion?: string
) {
	const cookieStr = process.env.YTM_COOKIE
	if (!cookieStr) throw new Error('YTM_COOKIE not configured')

	if (!cachedCookieMap) {
		cachedCookieMap = parseCookieMap(cookieStr)
	}
	cachedAuthUser = process.env.YTM_AUTH_USER || '0'

	const { authHeader, visitorData, pageId } =
		await generateAuthHeader(cachedCookieMap)
	const cookieHeader = rebuildCookieHeader(cachedCookieMap)

	const payload = {
		...body,
		context: {
			client: {
				hl: 'en',
				gl: 'US',
				clientName: 'WEB_REMIX',
				clientVersion: clientVersion || '1.20260531.05.00',
				...(visitorData && { visitorData })
			},
			user: { lockedSafetyMode: false },
			request: {
				useSsl: true,
				internalExperimentFlags: [],
				consistencyTokenJars: []
			}
		}
	}

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/${endpoint}?alt=json&key=${YTM_API_KEY}`,
		{
			method: 'POST',
			headers: {
				accept: '*/*',
				'accept-language': 'en-US,en;q=0.9',
				'content-type': 'application/json',
				Authorization: authHeader,
				Cookie: cookieHeader,
				origin: YTM_ORIGIN,
				referer: 'https://music.youtube.com/',
				'user-agent':
					'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
				'X-Goog-AuthUser': cachedAuthUser,
				'X-Goog-PageId': pageId,
				'X-Origin': YTM_ORIGIN,
				'X-Youtube-Bootstrap-Logged-In': 'true',
				'X-Youtube-Client-Name': '67',
				...(visitorData && { 'X-Goog-Visitor-Id': visitorData })
			},
			body: JSON.stringify(payload)
		}
	)

	if (!response.ok) {
		throw new Error(`Innertube API error: ${response.status}`)
	}

	return response.json()
}
