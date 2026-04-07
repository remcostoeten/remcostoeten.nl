import { NextResponse } from 'next/server'
import {
	getSpotifyAccessToken,
	hasSpotifyCredentials,
	invalidateSpotifyTokenCache
} from '@/server/spotify/auth'
import { getStoredSpotifyTracks } from '@/server/spotify'
import { parseBoundedIntParam } from '@/shared/lib/request-params'

// Use ISR with 30 second revalidation for recent tracks
// (Recently played doesn't change that frequently)
export const revalidate = 30
export const dynamic = 'force-dynamic'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const limit = parseBoundedIntParam(searchParams.get('limit'), {
			defaultValue: 10,
			min: 1,
			max: 50
		})

		if (!hasSpotifyCredentials()) {
			return fallbackRecentTracks(limit)
		}

		const accessToken = await getSpotifyAccessToken()

		if (!accessToken) {
			return fallbackRecentTracks(limit)
		}

		const recentResponse = await fetch(
			`${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}
		)

		// Handle 401 by invalidating cache and retrying once
		if (recentResponse.status === 401) {
			invalidateSpotifyTokenCache()
			const retryToken = await getSpotifyAccessToken()
			if (!retryToken) {
				return NextResponse.json(
					{ error: 'Authentication failed' },
					{ status: 401 }
				)
			}

			const retryResponse = await fetch(
				`${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`,
				{
					headers: {
						Authorization: `Bearer ${retryToken}`
					}
				}
			)

			if (!retryResponse.ok) {
				return fallbackRecentTracks(limit)
			}

			const retryData = await retryResponse.json()
			return formatResponse(retryData)
		}

		if (!recentResponse.ok) {
			return fallbackRecentTracks(limit)
		}

		const recentData = await recentResponse.json()
		return formatResponse(recentData)
	} catch (error) {
		console.error('Error in Spotify recent tracks API:', error)
		return fallbackRecentTracks(
			parseBoundedIntParam(
				new URL(request.url).searchParams.get('limit'),
				{
					defaultValue: 10,
					min: 1,
					max: 50
				}
			)
		)
	}
}

async function fallbackRecentTracks(limit: number) {
	const tracks = await getStoredSpotifyTracks(limit)
	return NextResponse.json({ items: [], tracks })
}

function formatResponse(data: any) {
	const items = Array.isArray(data.items) ? data.items : []
	const tracks = items.map((item: any) => ({
		id: item.track.id,
		name: item.track.name,
		artist: item.track.artists.map((artist: any) => artist.name).join(', '),
		album: item.track.album.name,
		url: item.track.external_urls.spotify,
		image: item.track.album.images[0]?.url || '',
		played_at: item.played_at
	}))

	return NextResponse.json({ items, tracks })
}
