import type appRouterEntry from 'vinext/server/app-router-entry'
import handler from 'vinext/server/fetch-handler'
import { localizeResponse } from './localize'

export * from 'vinext/server/fetch-handler'

type Fetch = (typeof appRouterEntry)['fetch']
type Env = Parameters<Fetch>[1]
type Context = Parameters<Fetch>[2]
type ScheduledEvent = {
	cron: string
	scheduledTime: number
}

const SITE_ORIGIN = 'https://www.remcostoeten.nl'
const WARM_PATHS = ['/']

async function syncSpotifyListens(env: Env, context: Context) {
	const request = new Request(`${SITE_ORIGIN}/api/spotify/sync`, {
		headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }
	})
	const response: Response = await handler.fetch(request, env, context)

	if (!response.ok) {
		throw new Error(
			`Spotify sync answered ${response.status}: ${await response.text()}`
		)
	}
}

async function warmPage(path: string, env: Env, context: Context) {
	const request = new Request(`${SITE_ORIGIN}${path}`)
	const response: Response = await handler.fetch(request, env, context)
	await response.arrayBuffer()

	if (!response.ok) {
		throw new Error(`Warming ${path} answered ${response.status}`)
	}
}

async function runHourlyJobs(env: Env, context: Context) {
	const results = await Promise.allSettled([
		syncSpotifyListens(env, context),
		...WARM_PATHS.map(path => warmPage(path, env, context))
	])
	const failures = results.flatMap(result =>
		result.status === 'rejected' ? [String(result.reason)] : []
	)

	if (failures.length > 0) {
		throw new Error(failures.join('; '))
	}
}

export default {
	...handler,
	async fetch(request: Request, env: Env, context: Context) {
		const response: Response = await handler.fetch(request, env, context)
		return localizeResponse(request, response)
	},
	scheduled(_event: ScheduledEvent, env: Env, context: Context) {
		return runHourlyJobs(env, context)
	}
}
