'use server'

import { db, schema } from '../db/connection'
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'
import { githubService } from './github'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN!

// ============================================
// Activity Sync Service
// Syncs GitHub events and Spotify listening history
// ============================================

export interface SyncResult {
    service: 'github' | 'spotify'
    newItems: number
    totalItems: number
    lastSyncAt: Date
    error?: string
}

// ============================================
// GitHub Sync
// ============================================

export async function syncGitHubActivities(): Promise<SyncResult> {
    try {
        // Get the last 90 days of events (GitHub API limit)
        const now = new Date()
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

        const events = await githubService.getDetailedEvents(
            ninetyDaysAgo.toISOString().split('T')[0],
            now.toISOString().split('T')[0]
        )

        let newItems = 0

        for (const day of events) {
            for (const event of day.events) {
                try {
                    // Check if event already exists (by unique GitHub event ID)
                    const existing = await db.query.githubActivities.findFirst({
                        where: eq(schema.githubActivities.eventId, event.id)
                    })

                    if (!existing) {
                        await db.insert(schema.githubActivities).values({
                            eventId: event.id,
                            type: event.type,
                            title: event.title,
                            description: event.description,
                            repository: event.repository,
                            url: event.url,
                            isPrivate: event.isPrivate,
                            eventDate: new Date(event.timestamp),
                            payload: event.payload ? JSON.stringify(event.payload) : null,
                        })
                        newItems++
                    }
                } catch (insertError) {
                    // Skip duplicates (unique constraint violation)
                    console.log(`Skipping duplicate event: ${event.id}`)
                }
            }
        }

        // Update sync metadata
        await db.insert(schema.syncMetadata)
            .values({
                service: 'github',
                lastSyncAt: now,
                lastEventId: events[0]?.events[0]?.id || null,
                syncCount: 1,
            })
            .onConflictDoUpdate({
                target: schema.syncMetadata.service,
                set: {
                    lastSyncAt: now,
                    syncCount: sql`${schema.syncMetadata.syncCount} + 1`,
                    updatedAt: now,
                }
            })

        // Get total count
        const totalResult = await db.select({ count: sql<number>`count(*)` })
            .from(schema.githubActivities)

        return {
            service: 'github',
            newItems,
            totalItems: Number(totalResult[0]?.count || 0),
            lastSyncAt: now,
        }
    } catch (error) {
        console.error('GitHub sync error:', error)
        return {
            service: 'github',
            newItems: 0,
            totalItems: 0,
            lastSyncAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

// ============================================
// Spotify Sync
// ============================================

async function getSpotifyAccessToken(): Promise<string | null> {
    if (!SPOTIFY_REFRESH_TOKEN) {
        console.warn('No Spotify refresh token configured')
        return null
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: SPOTIFY_REFRESH_TOKEN,
            }),
        })

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.status}`)
        }

        const data = await response.json()
        return data.access_token
    } catch (error) {
        console.error('Failed to get Spotify access token:', error)
        return null
    }
}

interface SpotifyRecentlyPlayedItem {
    track: {
        id: string
        name: string
        artists: Array<{ name: string }>
        album: {
            name: string
            images: Array<{ url: string }>
        }
        duration_ms: number
        external_urls: {
            spotify: string
        }
    }
    played_at: string
}

export async function syncSpotifyListens(): Promise<SyncResult> {
    try {
        const accessToken = await getSpotifyAccessToken()

        if (!accessToken) {
            return {
                service: 'spotify',
                newItems: 0,
                totalItems: 0,
                lastSyncAt: new Date(),
                error: 'No access token available',
            }
        }

        // Fetch recently played tracks (max 50 per request)
        const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`)
        }

        const data = await response.json()
        const items: SpotifyRecentlyPlayedItem[] = data.items || []

        let newItems = 0
        const now = new Date()

        for (const item of items) {
            try {
                const playedAt = new Date(item.played_at)

                // Check if this listen already exists (by played_at timestamp - unique)
                const existing = await db.query.spotifyListens.findFirst({
                    where: eq(schema.spotifyListens.playedAt, playedAt)
                })

                if (!existing) {
                    // Find a GitHub activity that happened within 5 minutes of this track
                    const fiveMinutesBefore = new Date(playedAt.getTime() - 5 * 60 * 1000)
                    const fiveMinutesAfter = new Date(playedAt.getTime() + 5 * 60 * 1000)

                    const nearbyActivity = await db.query.githubActivities.findFirst({
                        where: and(
                            gte(schema.githubActivities.eventDate, fiveMinutesBefore),
                            lte(schema.githubActivities.eventDate, fiveMinutesAfter)
                        ),
                        orderBy: desc(schema.githubActivities.eventDate),
                    })

                    await db.insert(schema.spotifyListens).values({
                        trackId: item.track.id,
                        trackName: item.track.name,
                        artistName: item.track.artists.map(a => a.name).join(', '),
                        albumName: item.track.album?.name,
                        albumImage: item.track.album?.images?.[0]?.url,
                        trackUrl: item.track.external_urls.spotify,
                        durationMs: item.track.duration_ms,
                        playedAt,
                        linkedActivityId: nearbyActivity?.id || null,
                    })
                    newItems++
                }
            } catch (insertError) {
                // Skip duplicates
                console.log(`Skipping duplicate track at: ${item.played_at}`)
            }
        }

        // Update sync metadata
        await db.insert(schema.syncMetadata)
            .values({
                service: 'spotify',
                lastSyncAt: now,
                lastEventId: items[0]?.played_at || null,
                syncCount: 1,
            })
            .onConflictDoUpdate({
                target: schema.syncMetadata.service,
                set: {
                    lastSyncAt: now,
                    lastEventId: items[0]?.played_at || null,
                    syncCount: sql`${schema.syncMetadata.syncCount} + 1`,
                    updatedAt: now,
                }
            })

        // Get total count
        const totalResult = await db.select({ count: sql<number>`count(*)` })
            .from(schema.spotifyListens)

        return {
            service: 'spotify',
            newItems,
            totalItems: Number(totalResult[0]?.count || 0),
            lastSyncAt: now,
        }
    } catch (error) {
        console.error('Spotify sync error:', error)
        return {
            service: 'spotify',
            newItems: 0,
            totalItems: 0,
            lastSyncAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

// ============================================
// Combined Sync
// ============================================

export async function syncAll(): Promise<{ github: SyncResult; spotify: SyncResult }> {
    const [github, spotify] = await Promise.all([
        syncGitHubActivities(),
        syncSpotifyListens(),
    ])

    return { github, spotify }
}

// ============================================
// Query Functions
// ============================================

/**
 * Get GitHub activities for a date range from the database
 */
export async function getStoredGitHubActivities(from: Date, to: Date) {
    return db.query.githubActivities.findMany({
        where: and(
            gte(schema.githubActivities.eventDate, from),
            lte(schema.githubActivities.eventDate, to)
        ),
        orderBy: desc(schema.githubActivities.eventDate),
    })
}

/**
 * Get Spotify listens for a date range from the database
 */
export async function getStoredSpotifyListens(from: Date, to: Date) {
    return db.query.spotifyListens.findMany({
        where: and(
            gte(schema.spotifyListens.playedAt, from),
            lte(schema.spotifyListens.playedAt, to)
        ),
        orderBy: desc(schema.spotifyListens.playedAt),
    })
}

/**
 * Get activities with their linked Spotify tracks (what song was playing during a commit)
 */
export async function getActivitiesWithMusic(from: Date, to: Date) {
    const activities = await db.query.githubActivities.findMany({
        where: and(
            gte(schema.githubActivities.eventDate, from),
            lte(schema.githubActivities.eventDate, to)
        ),
        orderBy: desc(schema.githubActivities.eventDate),
    })

    // Get linked spotify listens
    const linkedListens = await db.query.spotifyListens.findMany({
        where: and(
            gte(schema.spotifyListens.playedAt, from),
            lte(schema.spotifyListens.playedAt, to)
        ),
    })

    // Create a map for quick lookup
    const listensByActivityId = new Map(
        linkedListens
            .filter(l => l.linkedActivityId)
            .map(l => [l.linkedActivityId, l])
    )

    return activities.map(activity => ({
        ...activity,
        linkedTrack: listensByActivityId.get(activity.id) || null,
    }))
}

/**
 * Get sync status for both services
 */
export async function getSyncStatus() {
    const [github, spotify] = await Promise.all([
        db.query.syncMetadata.findFirst({
            where: eq(schema.syncMetadata.service, 'github')
        }),
        db.query.syncMetadata.findFirst({
            where: eq(schema.syncMetadata.service, 'spotify')
        }),
    ])

    const [githubCount, spotifyCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(schema.githubActivities),
        db.select({ count: sql<number>`count(*)` }).from(schema.spotifyListens),
    ])

    return {
        github: {
            lastSyncAt: github?.lastSyncAt || null,
            syncCount: github?.syncCount || 0,
            totalActivities: Number(githubCount[0]?.count || 0),
        },
        spotify: {
            lastSyncAt: spotify?.lastSyncAt || null,
            syncCount: spotify?.syncCount || 0,
            totalListens: Number(spotifyCount[0]?.count || 0),
        },
    }
}
