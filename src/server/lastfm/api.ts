const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/'

type LastfmImage = {
	size: string
	'#text': string
}

export type LastfmScrobble = {
	name: string
	url: string
	artist: { '#text': string }
	album: { '#text': string }
	image: LastfmImage[]
	date?: { uts: string }
	'@attr'?: { nowplaying?: string }
}

type RecentTracksBody = {
	recenttracks?: {
		track: LastfmScrobble | LastfmScrobble[]
		'@attr': { totalPages: string }
	}
	message?: string
}

type TrackInfoBody = {
	track?: { duration?: string }
	message?: string
}

/**
 * @name hasLastfmCredentials
 * @description Checks whether the Last.fm username and API key are set.
 *
 * @example
 * if (!hasLastfmCredentials()) return null
 */
export function hasLastfmCredentials() {
	return !!(process.env.LASTFM_USERNAME && process.env.LASTFM_API_KEY)
}

async function lastfmGet<Body extends { message?: string }>(
	params: Record<string, string>
) {
	const query = new URLSearchParams({
		...params,
		api_key: process.env.LASTFM_API_KEY ?? '',
		format: 'json'
	})
	const response = await fetch(`${LASTFM_API_BASE}?${query}`, {
		headers: { 'User-Agent': 'remcostoeten.nl' }
	})
	const body: Body = await response.json()

	if (!response.ok || body.message) {
		throw new Error(
			`Last.fm ${params.method} answered ${response.status}: ${body.message ?? 'no body'}`
		)
	}

	return body
}

/**
 * @name fetchLastfmScrobbles
 * @description Fetches one page of the user's scrobbles, newest first. The
 * track playing right now comes first and has no date. Pass `from` to only
 * get plays after that moment. Throws with Last.fm's own message when the
 * request fails.
 *
 * @example
 * const { scrobbles, totalPages } = await fetchLastfmScrobbles(200, 1)
 */
export async function fetchLastfmScrobbles(
	limit: number,
	page: number,
	from?: Date
) {
	const params: Record<string, string> = {
		method: 'user.getrecenttracks',
		user: process.env.LASTFM_USERNAME ?? '',
		limit: String(limit),
		page: String(page)
	}
	if (from) params.from = String(Math.floor(from.getTime() / 1000))

	const body = await lastfmGet<RecentTracksBody>(params)
	const tracks = body.recenttracks?.track ?? []

	return {
		scrobbles: Array.isArray(tracks) ? tracks : [tracks],
		totalPages: Number(body.recenttracks?.['@attr'].totalPages ?? 0)
	}
}

/**
 * @name fetchLastfmTrackDuration
 * @description Looks up a track's length in milliseconds. Returns null when
 * Last.fm does not know it.
 *
 * @example
 * const durationMs = await fetchLastfmTrackDuration('The Opposites', 'Oew Oew')
 */
export async function fetchLastfmTrackDuration(artist: string, track: string) {
	const body = await lastfmGet<TrackInfoBody>({
		method: 'track.getInfo',
		artist,
		track,
		autocorrect: '1'
	})
	const durationMs = Number(body.track?.duration ?? 0)

	return durationMs > 0 ? durationMs : null
}
