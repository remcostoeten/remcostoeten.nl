import { syncGitHubActivities } from './github-sync'
import { syncSpotifyListens } from './spotify-sync'

export async function syncAll() {
	const [github, spotify] = await Promise.all([
		syncGitHubActivities(),
		syncSpotifyListens()
	])

	return { github, spotify }
}
