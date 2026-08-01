import crypto from 'node:crypto'

const YTM_ORIGIN = 'https://music.youtube.com'
const FALLBACK_API_KEY = 'AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30'
const FALLBACK_CLIENT_VERSION = '1.20260531.05.00'
const REQUEST_TIMEOUT_MS = 10_000
const USER_AGENT =
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'

interface PageConfig {
	apiKey: string
	clientVersion: string
	pageId: string
	userSessionId: string
	visitorData: string
}

let cachedCookie = ''
let cachedCookieMap: Map<string, string> | null = null
let cachedPageConfig: PageConfig | null = null

export function hasYTMusicCredentials(): boolean {
	const cookie = process.env.YTM_COOKIE?.trim()
	return Boolean(
		cookie && cookie !== 'your_ytm_cookie_here' && !cookie.startsWith('#')
	)
}

function parseCookieMap(cookie: string): Map<string, string> {
	const map = new Map<string, string>()
	for (const part of cookie.split(';')) {
		const separator = part.indexOf('=')
		if (separator <= 0) continue
		map.set(
			part.slice(0, separator).trim(),
			part.slice(separator + 1).trim()
		)
	}
	return map
}

function rebuildCookieHeader(cookieMap: Map<string, string>): string {
	return Array.from(cookieMap, ([key, value]) => `${key}=${value}`).join('; ')
}

function readConfigValue(html: string, key: string): string {
	const match = html.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`))
	return match?.[1]?.replace(/\\u003d/gi, '=') ?? ''
}

async function fetchPageConfig(
	cookieMap: Map<string, string>
): Promise<PageConfig> {
	const cookieHeader = `${rebuildCookieHeader(cookieMap)}; SOCS=CAI`
	const response = await fetch(YTM_ORIGIN, {
		cache: 'no-store',
		headers: {
			accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'accept-language': 'en-US,en;q=0.9',
			cookie: cookieHeader,
			'user-agent': USER_AGENT
		},
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	})
	if (!response.ok) {
		throw new Error(`YouTube Music bootstrap failed (${response.status})`)
	}

	const html = await response.text()
	const datasyncId = readConfigValue(html, 'DATASYNC_ID')
	if (!datasyncId) {
		throw new Error('YouTube Music bootstrap did not return a session ID')
	}

	const [pageId = '', userSessionId = pageId] = datasyncId.split('||')
	return {
		apiKey: readConfigValue(html, 'INNERTUBE_API_KEY') || FALLBACK_API_KEY,
		clientVersion:
			readConfigValue(html, 'INNERTUBE_CLIENT_VERSION') ||
			FALLBACK_CLIENT_VERSION,
		pageId,
		userSessionId,
		visitorData: readConfigValue(html, 'VISITOR_DATA')
	}
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
	cookieMap: Map<string, string>,
	pageConfig: PageConfig
): Promise<string> {
	const timestamp = Math.floor(Date.now() / 1000).toString()
	const sapisid =
		cookieMap.get('__Secure-3PAPISID') || cookieMap.get('SAPISID')
	const sapisid1 =
		cookieMap.get('__Secure-1PAPISID') || cookieMap.get('APISID')

	if (!sapisid || !sapisid1) {
		throw new Error(
			'The YouTube Music cookie is missing its SAPISID credentials'
		)
	}

	return [
		`SAPISIDHASH ${sapisidHash(timestamp, sapisid, pageConfig.userSessionId)}`,
		`SAPISID1PHASH ${sapisidHash(timestamp, sapisid1, pageConfig.userSessionId)}`,
		`SAPISID3PHASH ${sapisidHash(timestamp, sapisid, pageConfig.userSessionId)}`
	].join(' ')
}

export function invalidateYTMusicClient(): void {
	cachedCookie = ''
	cachedCookieMap = null
	cachedPageConfig = null
}

export async function fetchInnertube(
	endpoint: string,
	body: Record<string, unknown>
): Promise<unknown> {
	const cookie = process.env.YTM_COOKIE?.trim()
	if (!cookie) throw new Error('YTM_COOKIE is not configured')

	if (!cachedCookieMap || cachedCookie !== cookie) {
		invalidateYTMusicClient()
		cachedCookie = cookie
		cachedCookieMap = parseCookieMap(cookie)
	}
	if (!cachedPageConfig) {
		cachedPageConfig = await fetchPageConfig(cachedCookieMap)
	}

	const pageConfig = cachedPageConfig
	const authorization = await generateAuthHeader(cachedCookieMap, pageConfig)
	const payload = {
		...body,
		context: {
			client: {
				hl: 'en',
				gl: 'US',
				clientName: 'WEB_REMIX',
				clientVersion: pageConfig.clientVersion,
				...(pageConfig.visitorData && {
					visitorData: pageConfig.visitorData
				})
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
		`${YTM_ORIGIN}/youtubei/v1/${endpoint}?alt=json&key=${pageConfig.apiKey}`,
		{
			method: 'POST',
			headers: {
				accept: '*/*',
				'accept-language': 'en-US,en;q=0.9',
				'content-type': 'application/json',
				Authorization: authorization,
				Cookie: rebuildCookieHeader(cachedCookieMap),
				origin: YTM_ORIGIN,
				referer: `${YTM_ORIGIN}/`,
				'user-agent': USER_AGENT,
				'X-Goog-AuthUser': process.env.YTM_AUTH_USER || '0',
				'X-Goog-PageId': pageConfig.pageId,
				'X-Origin': YTM_ORIGIN,
				'X-Youtube-Bootstrap-Logged-In': 'true',
				'X-Youtube-Client-Name': '67',
				...(pageConfig.visitorData && {
					'X-Goog-Visitor-Id': pageConfig.visitorData
				})
			},
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		}
	)

	if (!response.ok) {
		throw new Error(`YouTube Music API failed (${response.status})`)
	}
	return response.json()
}
