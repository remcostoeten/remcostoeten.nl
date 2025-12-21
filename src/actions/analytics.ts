'use server'

import { db } from '@/server/db/connection'
import { blogPosts, blogViews } from '@/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { getClientIp } from '@/lib/protection'
import { fetchGeoInfo } from '@/lib/geo'
import { createHash } from 'crypto'

/**
 * Tracks a blog post view with robust unique visitor detection.
 * Uses a fingerprint of (IP + UserAgent + DailySalt) to detect uniqueness across Incognito.
 */
export async function trackBlogView(slug: string) {
    try {
        const ip = await getClientIp()
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || 'unknown'

        // Create a daily salt to rotate privacy but allow daily uniqueness
        // Or strictly unique forever? User asked for "ACCURATE UNIQUE VISITORS".
        // Let's make it unique per post per visitor forever (or until IP/UA changes).
        // To be robust against Incognito, we rely on IP+UA.

        const fingerprintInput = `${ip}|${userAgent}`
        const fingerprint = createHash('sha256').update(fingerprintInput).digest('hex')

        // 0. Ensure the blog post exists in the database
        // This is crucial for new MDX files to be tracked automatically without manual sync
        await db.insert(blogPosts)
            .values({ slug })
            .onConflictDoNothing()
            .execute()

        // 1. Check if this specific fingerprint has already viewed this post
        const existingView = await db.query.blogViews.findFirst({
            where: and(
                eq(blogViews.slug, slug),
                eq(blogViews.fingerprint, fingerprint)
            ),
        })

        if (existingView) {
            // Not a unique view, just increment total views on the post?
            // Or maybe just do nothing if we only care about unique?
            // Let's stick to "Unique is Key", but usually we want "Total Views" to increment on every page load?
            // "Accurate Unique Visitors" implies we separate the two.

            // Increment total views anyway
            await db.update(blogPosts)
                .set({ totalViews: sql`${blogPosts.totalViews} + 1` })
                .where(eq(blogPosts.slug, slug))

            return { unique: false }
        }

        // 2. This IS a unique view!

        // Fetch Geo Data for this unique visitor
        // We only pay the API cost for UNIQUE visitors to save quota/time!
        const geoInfo = await fetchGeoInfo(ip)

        // Insert into blog_views
        await db.insert(blogViews).values({
            slug,
            fingerprint,
            ipAddress: ip, // Storing raw IP as requested for Admin
            geoCountry: geoInfo?.country,
            geoCity: geoInfo?.city,
            geoRegion: geoInfo?.region,
            geoLoc: geoInfo?.loc,
            geoOrg: geoInfo?.org,
            geoTimezone: geoInfo?.timezone,
        })

        // Increment BOTH counters on the post
        await db.update(blogPosts)
            .set({
                uniqueViews: sql`${blogPosts.uniqueViews} + 1`,
                totalViews: sql`${blogPosts.totalViews} + 1`
            })
            .where(eq(blogPosts.slug, slug))

        return { unique: true }

    } catch (error) {
        console.error('Failed to track blog view:', error)
        return { success: false }
    }
}
