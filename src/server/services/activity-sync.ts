'use server'

import { db, schema } from '../db/connection'
import { eq, desc, and, gte, lte, sql, inArray } from 'drizzle-orm'
import { githubService } from './github'
import { getSpotifyAccessToken, hasSpotifyCredentials } from './spotify-auth'

// ============================================
// Activity Sync Service
// Syncs GitHub events and Spotify listening history
// 
// Performance optimizations:
// - Batch existence checks (single query instead of N queries)
// - Bulk inserts where possible
// - Uses shared token cache for Spotify
// ============================================

export interface SyncResult {
    service: 'github' | 'spotify'
    newItems: number
    totalItems: number
    lastSyncAt: Date
    error?: string
}

// ============================================
// GitHub Sync (Batch Optimized)
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

        // Flatten all events and collect their IDs
        const allEvents = events.flatMap(day => day.events)

        if (allEvents.length === 0) {
            return {
                service: 'github',
                newItems: 0,
                totalItems: 0,
                lastSyncAt: now,
            }
        }

        const allEventIds = allEvents.map(e => e.id)

        // BATCH: Check which events already exist (single query instead of N)
        const existingEvents = await db.query.githubActivities.findMany({
            where: inArray(schema.githubActivities.eventId, allEventIds),
            columns: { eventId: true }
        })
        const existingIds = new Set(existingEvents.map(e => e.eventId))

        // Filter to only new events
        const newEvents = allEvents.filter(e => !existingIds.has(e.id))

        let newItems = 0

        // Insert new events (could be further optimized with bulk insert)
        for (const event of newEvents) {
            try {
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
            } catch (insertError) {
                // Skip duplicates (unique constraint violation - race condition)
                console.log(`Skipping duplicate event: ${event.id}`)
            }
        }

        // Update sync metadata
        await db.insert(schema.syncMetadata)
            .values({
                service: 'github',
                lastSyncAt: now,
                lastEventId: allEvents[allEvents.length - 1]?.id || null,
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
// Spotify Sync (Batch Optimized + Token Cache)
// ============================================

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
        // Use shared token cache (avoids redundant refresh)
        const accessToken = await getSpotifyAccessToken()

        if (!accessToken) {
            return {
                service: 'spotify',
                newItems: 0,
                totalItems: 0,
                lastSyncAt: new Date(),
                error: hasSpotifyCredentials() ? 'Token refresh failed' : 'No credentials configured',
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

        if (items.length === 0) {
            return {
                service: 'spotify',
                newItems: 0,
                totalItems: 0,
                lastSyncAt: new Date(),
            }
        }

        const now = new Date()

        // Convert all played_at timestamps
        const playedAtDates = items.map(item => new Date(item.played_at))

        // BATCH: Check which listens already exist (single query instead of N)
        const existingListens = await db.query.spotifyListens.findMany({
            where: inArray(schema.spotifyListens.playedAt, playedAtDates),
            columns: { playedAt: true }
        })
        const existingTimestamps = new Set(
            existingListens.map(e => e.playedAt.getTime())
        )

        // Filter to only new items
        const newItems: { item: SpotifyRecentlyPlayedItem; playedAt: Date }[] = []
        for (const item of items) {
            const playedAt = new Date(item.played_at)
            if (!existingTimestamps.has(playedAt.getTime())) {
                newItems.push({ item, playedAt })
            }
        }

        if (newItems.length === 0) {
            // Get total count
            const totalResult = await db.select({ count: sql<number>`count(*)` })
                .from(schema.spotifyListens)

            return {
                service: 'spotify',
                newItems: 0,
                totalItems: Number(totalResult[0]?.count || 0),
                lastSyncAt: now,
            }
        }

        // Get date range for nearby activity lookup
        const minDate = new Date(Math.min(...playedAtDates.map(d => d.getTime())) - 5 * 60 * 1000)
        const maxDate = new Date(Math.max(...playedAtDates.map(d => d.getTime())) + 5 * 60 * 1000)

        // BATCH: Get all potentially linked GitHub activities in one query
        const nearbyActivities = await db.query.githubActivities.findMany({
            where: and(
                gte(schema.githubActivities.eventDate, minDate),
                lte(schema.githubActivities.eventDate, maxDate)
            ),
            orderBy: desc(schema.githubActivities.eventDate),
        })

        let insertedCount = 0

        for (const { item, playedAt } of newItems) {
            try {
                // Find nearest activity within 5 minutes
                const fiveMinutesBefore = playedAt.getTime() - 5 * 60 * 1000
                const fiveMinutesAfter = playedAt.getTime() + 5 * 60 * 1000

                const linkedActivity = nearbyActivities.find(a => {
                    const activityTime = a.eventDate.getTime()
                    return activityTime >= fiveMinutesBefore && activityTime <= fiveMinutesAfter
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
                    linkedActivityId: linkedActivity?.id || null,
                })
                insertedCount++
            } catch (insertError) {
                // Skip duplicates (race condition)
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
            newItems: insertedCount,
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
