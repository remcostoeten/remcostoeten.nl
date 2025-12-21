'use server'

import { db } from '@/server/db/connection'
import { blogPosts, blogViews, contactSubmissions, contactInteractions, contactAbandonments } from '@/server/db/schema'
import { desc, count, sql, eq } from 'drizzle-orm'

export async function getAdminMetrics() {
    const [
        totalViews,
        uniqueVisitors,
        viewsByCountry,
        recentViews,
        contactStats,
        interactions,
        abandonments,
        postStats
    ] = await Promise.all([
        // Total Views
        db.select({ count: count() }).from(blogViews),

        // Unique Visitors (distinct fingerprint)
        db.select({ count: count(blogViews.fingerprint) }).from(blogViews),

        // Views by Country
        db.select({
            country: blogViews.geoCountry,
            count: count()
        })
            .from(blogViews)
            .groupBy(blogViews.geoCountry)
            .orderBy(desc(count()))
            .limit(10),

        // Recent Views Log
        db.select()
            .from(blogViews)
            .orderBy(desc(blogViews.viewedAt))
            .limit(50),

        // Contact Submissions
        db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)),

        // Contact Interactions
        db.select().from(contactInteractions).orderBy(desc(contactInteractions.createdAt)),

        // Contact Abandonments
        db.select().from(contactAbandonments).orderBy(desc(contactAbandonments.createdAt)),

        // Per-post view stats
        db.select({
            slug: blogPosts.slug,
            totalViews: blogPosts.totalViews,
            uniqueViews: blogPosts.uniqueViews
        }).from(blogPosts)
    ])

    return {
        totalViews: totalViews[0].count,
        uniqueVisitors: uniqueVisitors[0].count,
        viewsByCountry,
        recentViews,
        contactStats,
        interactions,
        abandonments,
        postStats: postStats // Returns array of { slug, totalViews, uniqueViews }
    }
}
