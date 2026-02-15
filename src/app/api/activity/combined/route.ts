import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

// Aggressive caching - 5 minutes for combined activity data
export const revalidate = 300

const GITHUB_API_BASE = 'https://api.github.com'
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const GITHUB_USERNAME = 'remcostoeten'

function getGitHubHeaders(): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github.v3+json',
		'Content-Type': 'application/json'
	}
	const token = process.env.GITHUB_TOKEN
	if (token) {
		headers['Authorization'] = `token ${token.trim()}`
	}
	return headers
}

// Cached GitHub contributions fetch
const getGitHubContributions = unstable_cache(
	async (year: number) => {
		try {
			const startDate = new Date(year, 0, 1)
			const endDate = new Date(year, 11, 31)

			const query = `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  firstDay
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `

			const response = await fetch(`${GITHUB_API_BASE}/graphql`, {
				method: 'POST',
				headers: getGitHubHeaders(),
				body: JSON.stringify({
					query,
					variables: {
						username: GITHUB_USERNAME,
						from: startDate.toISOString(),
						to: endDate.toISOString()
					}
				})
			})

			if (!response.ok) return { totalContributions: 0, weeks: [] }

			const data = await response.json()
			if (data.errors) return { totalContributions: 0, weeks: [] }

			const calendar =
				data.data?.user?.contributionsCollection?.contributionCalendar
			if (!calendar) return { totalContributions: 0, weeks: [] }

			return calendar
		} catch (error) {
			console.error('Error fetching GitHub contributions:', error)
			return { totalContributions: 0, weeks: [] }
		}
	},
	['github-contributions'],
	{ revalidate: 300, tags: ['github'] }
)

// Cached GitHub activity fetch
const getGitHubActivity = unstable_cache(
	async (limit: number) => {
		try {
			// Fetch 100 events to increase chance of finding distinct repos
			const response = await fetch(
				`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/events?per_page=100`,
				{ headers: getGitHubHeaders() }
			)

			if (!response.ok) return []

			const events = await response.json()

			const uniqueRepoEvents: any[] = []
			const seenRepos = new Set<string>()

			for (const event of events) {
				if (!event.repo?.name) continue

				// If we haven't seen this repo yet, add it
				if (!seenRepos.has(event.repo.name)) {
					seenRepos.add(event.repo.name)
					uniqueRepoEvents.push(event)
				}

				if (uniqueRepoEvents.length >= limit) break
			}

			const parsed = uniqueRepoEvents
				.map((event: any) => parseGitHubEvent(event))
				.filter(Boolean)

			return parsed
		} catch (error) {
			console.error('Error fetching GitHub activity:', error)
			return []
		}
	},
	['github-activity-distinct'],
	{ revalidate: 60, tags: ['github'] }
)

function parseGitHubEvent(event: any) {
	const repoName =
		event.repo?.name?.split('/').pop() || event.repo?.name || ''
	const base = {
		id: event.id,
		timestamp: event.created_at,
		repository: event.repo?.name || '',
		url: `https://github.com/${event.repo?.name || ''}`,
		isPrivate: event.public === false
	}

	switch (event.type) {
		case 'PushEvent': {
			const commitCount =
				event.payload?.commits?.length || event.payload?.size || 0
			if (commitCount === 0) return null
			const commitMsg =
				event.payload?.commits?.[0]?.message?.split('\n')[0] ||
				'No commit message'
			const ref = event.payload?.ref?.replace('refs/heads/', '') || ''
			return {
				...base,
				type: 'commit',
				title: `${commitCount} commit${commitCount === 1 ? '' : 's'}${ref ? ` to ${ref}` : ''}`,
				description: commitMsg,
				url: `https://github.com/${event.repo?.name}/commits/${event.payload?.head}`
			}
		}
		case 'CreateEvent': {
			const refType = event.payload?.ref_type || 'repository'
			const ref = event.payload?.ref
			return {
				...base,
				type: 'create',
				title:
					refType === 'repository'
						? `repository ${repoName}`
						: `${refType} ${ref}`,
				description: ref || repoName
			}
		}
		case 'DeleteEvent': {
			const refType = event.payload?.ref_type || 'ref'
			const ref = event.payload?.ref
			return {
				...base,
				type: 'delete',
				title: `${refType} ${ref}`,
				description: `${refType}: ${ref}`,
				url: base.url
			}
		}
		case 'ReleaseEvent': {
			const releaseName =
				event.payload?.release?.name ||
				event.payload?.release?.tag_name ||
				''
			return {
				...base,
				type: 'release',
				title: releaseName,
				description: releaseName,
				url: event.payload?.release?.html_url || base.url
			}
		}
		case 'PullRequestEvent': {
			const prNumber = event.payload?.number
			const prTitle = event.payload?.pull_request?.title?.trim() || ''
			const prBody =
				event.payload?.pull_request?.body?.split('\n')[0]?.trim() || ''
			const branchName = event.payload?.pull_request?.head?.ref || ''

			if (prTitle) {
				return {
					...base,
					type: 'pr',
					title: `"${prTitle}"`,
					description: prBody || prTitle,
					url: event.payload?.pull_request?.html_url || base.url
				}
			}

			const branchLabel = branchName
				.replace(
					/^(feat|feature|fix|chore|refactor|infra|docs|style|test|ci|build|perf)\//i,
					''
				)
				.replace(/[-_]/g, ' ')
				.trim()

			if (branchLabel) {
				return {
					...base,
					type: 'pr',
					title: `"${branchLabel}"`,
					description: `PR #${prNumber} from ${branchName}`,
					url: event.payload?.pull_request?.html_url || base.url
				}
			}

			return {
				...base,
				type: 'pr',
				title: `PR #${prNumber}`,
				description: prBody || `Pull request #${prNumber}`,
				url: event.payload?.pull_request?.html_url || base.url
			}
		}
		case 'IssuesEvent': {
			const issueNumber = event.payload?.issue?.number
			const issueTitle = event.payload?.issue?.title?.trim() || ''
			const issueBody =
				event.payload?.issue?.body?.split('\n')[0]?.trim() || ''

			if (issueTitle) {
				return {
					...base,
					type: 'issue',
					title: `"${issueTitle}"`,
					description: issueBody || issueTitle,
					url: event.payload?.issue?.html_url || base.url
				}
			}

			return {
				...base,
				type: 'issue',
				title: `issue #${issueNumber}`,
				description: issueBody || `Issue #${issueNumber}`,
				url: event.payload?.issue?.html_url || base.url
			}
		}
		case 'IssueCommentEvent': {
			const issueNumber = event.payload?.issue?.number
			const issueTitle = event.payload?.issue?.title?.trim() || ''
			const commentBody =
				event.payload?.comment?.body?.split('\n')[0]?.trim() || ''
			const isPR = !!event.payload?.issue?.pull_request

			if (issueTitle) {
				return {
					...base,
					type: 'issue',
					title: `"${issueTitle}"`,
					description:
						commentBody.substring(0, 100) +
						(commentBody.length > 100 ? '...' : ''),
					url: event.payload?.comment?.html_url || base.url
				}
			}

			return {
				...base,
				type: 'issue',
				title: `${isPR ? 'PR' : 'issue'} #${issueNumber}`,
				description:
					commentBody.substring(0, 100) +
					(commentBody.length > 100 ? '...' : ''),
				url: event.payload?.comment?.html_url || base.url
			}
		}
		case 'WatchEvent':
			return {
				...base,
				type: 'star',
				title: 'starred',
				description: repoName
			}
		case 'ForkEvent':
			return {
				...base,
				type: 'fork',
				title: 'forked',
				description: repoName
			}
		default:
			return {
				...base,
				type: 'unknown',
				title:
					event.type?.replace('Event', '').toLowerCase() ||
					'activity',
				description: repoName
			}
	}
}

// Cached Spotify recent tracks
const getSpotifyTracks = unstable_cache(
	async (limit: number) => {
		try {
			const { getSpotifyAccessToken, hasSpotifyCredentials } =
				await import('@/server/services/spotify-auth')

			if (!hasSpotifyCredentials()) {
				return []
			}

			const accessToken = await getSpotifyAccessToken()
			if (!accessToken) return []

			const response = await fetch(
				`${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`,
				{
					headers: { Authorization: `Bearer ${accessToken}` }
				}
			)

			if (!response.ok) return []

			const data = await response.json()
			return (
				data.items?.map((item: any) => ({
					id: item.track.id,
					name: item.track.name,
					artist: item.track.artists
						.map((a: any) => a.name)
						.join(', '),
					album: item.track.album.name,
					url: item.track.external_urls.spotify,
					image: item.track.album.images[0]?.url || '',
					played_at: item.played_at
				})) || []
			)
		} catch (error) {
			console.error('Error fetching Spotify tracks:', error)
			return []
		}
	},
	['spotify-recent'],
	{ revalidate: 30, tags: ['spotify'] }
)

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const activityLimit = parseInt(searchParams.get('activityLimit') || '5', 10)
	const tracksLimit = parseInt(searchParams.get('tracksLimit') || '10', 10)

	const currentYear = new Date().getFullYear()
	const previousYear = currentYear - 1

	// Fetch all data in parallel
	const [
		currentYearContributions,
		previousYearContributions,
		recentActivity,
		spotifyTracks
	] = await Promise.all([
		getGitHubContributions(currentYear),
		getGitHubContributions(previousYear),
		getGitHubActivity(activityLimit),
		getSpotifyTracks(tracksLimit)
	])

	// Merge contributions
	const contributionsMap: Record<
		string,
		{ date: string; contributionCount: number }
	> = {}

	for (const year of [previousYearContributions, currentYearContributions]) {
		if (year?.weeks) {
			for (const week of year.weeks) {
				for (const day of week.contributionDays || []) {
					contributionsMap[day.date] = {
						date: day.date,
						contributionCount: day.contributionCount
					}
				}
			}
		}
	}

	return NextResponse.json(
		{
			contributions: Object.values(contributionsMap),
			totalContributions:
				(currentYearContributions?.totalContributions || 0) +
				(previousYearContributions?.totalContributions || 0),
			recentActivity,
			spotifyTracks,
			fetchedAt: Date.now()
		},
		{
			headers: {
				'Cache-Control':
					'public, s-maxage=300, stale-while-revalidate=600'
			}
		}
	)
}
