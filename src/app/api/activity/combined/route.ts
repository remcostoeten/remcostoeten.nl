import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

// Aggressive caching - 5 minutes for combined activity data
export const revalidate = 300

const GITHUB_API_BASE = 'https://api.github.com'
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const GITHUB_USERNAME = 'remcostoeten'

function getGitHubHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
    }
    // Check both env vars to match the main GitHubService
    const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN
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

            const calendar = data.data?.user?.contributionsCollection?.contributionCalendar
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
// Cached GitHub activity fetch
const getGitHubActivity = unstable_cache(
    async (limit: number) => {
        try {
            // If limit is small, just do one request
            if (limit <= 100) {
                const response = await fetch(
                    `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/events?per_page=${limit}`,
                    { headers: getGitHubHeaders() }
                )
                if (!response.ok) return []
                const events = await response.json()
                return events.map((event: any) => parseGitHubEvent(event)).filter(Boolean)
            }

            // For larger limits, fetch pages (max 3 pages = 300 events)
            const pagesToFetch = Math.min(Math.ceil(limit / 100), 3)
            const allEvents: any[] = []

            for (let page = 1; page <= pagesToFetch; page++) {
                const response = await fetch(
                    `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/events?per_page=100&page=${page}`,
                    { headers: getGitHubHeaders() }
                )
                
                if (!response.ok) break
                
                const events = await response.json()
                if (!Array.isArray(events) || events.length === 0) break
                
                allEvents.push(...events)
                
                if (allEvents.length >= limit) break
            }

            return allEvents
                .slice(0, limit)
                .map((event: any) => parseGitHubEvent(event))
                .filter(Boolean)
        } catch (error) {
            console.error('Error fetching GitHub activity:', error)
            return []
        }
    },
    ['github-activity'],
    { revalidate: 60, tags: ['github'] }
)

function parseGitHubEvent(event: any) {
    const repoName = event.repo?.name?.split('/').pop() || event.repo?.name || ''
    const base = {
        id: event.id,
        timestamp: event.created_at,
        repository: event.repo?.name || '',
        url: `https://github.com/${event.repo?.name || ''}`,
        isPrivate: event.public === false,
    }

    switch (event.type) {
        case 'PushEvent': {
            const commitCount = event.payload?.commits?.length || event.payload?.size || 0
            if (commitCount === 0) return null
            const commitMsg = event.payload?.commits?.[0]?.message?.split('\n')[0] || 'No commit message'
            const ref = event.payload?.ref?.replace('refs/heads/', '') || ''
            return {
                ...base,
                type: 'commit',
                title: `pushed ${commitCount} commit${commitCount === 1 ? '' : 's'}${ref ? ` to ${ref}` : ''}`,
                description: commitMsg,
                url: `https://github.com/${event.repo?.name}/commits/${event.payload?.head}`,
            }
        }
        case 'CreateEvent': {
            const refType = event.payload?.ref_type || 'repository'
            const ref = event.payload?.ref
            return {
                ...base,
                type: 'create',
                title: refType === 'repository' ? `created repository ${repoName}` : `created ${refType} ${ref}`,
                description: ref || repoName,
            }
        }
        case 'PullRequestEvent': {
            const action = event.payload?.action
            const prNumber = event.payload?.number
            const prTitle = event.payload?.pull_request?.title || ''

            let verb = action
            if (action === 'closed' && event.payload?.pull_request?.merged) {
                verb = 'merged'
            } else if (action === 'synchronize') {
                verb = 'updated'
            }

            return {
                ...base,
                type: 'pr',
                title: `${verb} PR #${prNumber}${prTitle ? `: ${prTitle}` : ''}`,
                description: prTitle,
                url: event.payload?.pull_request?.html_url || base.url,
            }
        }
        case 'IssuesEvent': {
            const action = event.payload?.action
            const issueNumber = event.payload?.issue?.number
            const issueTitle = event.payload?.issue?.title || ''
            return {
                ...base,
                type: 'issue',
                title: `${action} issue #${issueNumber}${issueTitle ? `: ${issueTitle}` : ''}`,
                description: issueTitle,
                url: event.payload?.issue?.html_url || base.url,
            }
        }
        case 'WatchEvent':
            return { ...base, type: 'star', title: 'starred it', description: repoName }
        case 'ForkEvent':
            return { ...base, type: 'fork', title: 'forked it', description: repoName }
        default:
            return {
                ...base,
                type: 'unknown',
                title: event.type?.replace('Event', '').toLowerCase() || 'activity',
                description: repoName,
            }
    }
}

// Cached Spotify recent tracks
const getSpotifyTracks = unstable_cache(
    async (limit: number) => {
        try {
            const { getSpotifyAccessToken, hasSpotifyCredentials } = await import('@/server/services/spotify-auth')

            if (!hasSpotifyCredentials()) {
                return []
            }

            const accessToken = await getSpotifyAccessToken()
            if (!accessToken) return []

            const response = await fetch(`${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            })

            if (!response.ok) return []

            const data = await response.json()
            return data.items?.map((item: any) => ({
                id: item.track.id,
                name: item.track.name,
                artist: item.track.artists.map((a: any) => a.name).join(', '),
                album: item.track.album.name,
                url: item.track.external_urls.spotify,
                image: item.track.album.images[0]?.url || '',
                played_at: item.played_at,
            })) || []
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
    const [currentYearContributions, previousYearContributions, recentActivity, spotifyTracks] = await Promise.all([
        getGitHubContributions(currentYear),
        getGitHubContributions(previousYear),
        getGitHubActivity(activityLimit),
        getSpotifyTracks(tracksLimit),
    ])

    // Merge contributions
    const contributionsMap: Record<string, { date: string; contributionCount: number }> = {}

    for (const year of [previousYearContributions, currentYearContributions]) {
        if (year?.weeks) {
            for (const week of year.weeks) {
                for (const day of week.contributionDays || []) {
                    contributionsMap[day.date] = { date: day.date, contributionCount: day.contributionCount }
                }
            }
        }
    }

    return NextResponse.json({
        contributions: Object.values(contributionsMap),
        totalContributions: (currentYearContributions?.totalContributions || 0) + (previousYearContributions?.totalContributions || 0),
        recentActivity,
        spotifyTracks,
        fetchedAt: Date.now(),
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        }
    })
}
