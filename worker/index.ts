import type appRouterEntry from 'vinext/server/app-router-entry'
import handler from 'vinext/server/fetch-handler'

export * from 'vinext/server/fetch-handler'

type Fetch = (typeof appRouterEntry)['fetch']
type Env = Parameters<Fetch>[1]
type Context = Parameters<Fetch>[2]
type ScheduledEvent = {
	cron: string
	scheduledTime: number
}

const SPOTIFY_SYNC_URL = 'https://www.remcostoeten.nl/api/spotify/sync'

async function syncSpotifyListens(env: Env, context: Context) {
	const request = new Request(SPOTIFY_SYNC_URL, {
		headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }
	})
	const response: Response = await handler.fetch(request, env, context)

	if (!response.ok) {
		throw new Error(
			`Spotify sync answered ${response.status}: ${await response.text()}`
		)
	}
}

export default {
	...handler,
	scheduled(_event: ScheduledEvent, env: Env, context: Context) {
		return syncSpotifyListens(env, context)
	}
}
