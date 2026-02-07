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

		const fingerprintInput = `${ip}|${userAgent}`
		const fingerprint = createHash('sha256')
			.update(fingerprintInput)
			.digest('hex')

		// Ensure the blog post exists in the database
		await db
			.insert(blogPosts)
			.values({ slug })
			.onConflictDoNothing()
			.execute()

		const existingView = await db.query.blogViews.findFirst({
			where: and(
				eq(blogViews.slug, slug),
				eq(blogViews.fingerprint, fingerprint)
			)
		})

		if (existingView) {
			await db
				.update(blogPosts)
				.set({ totalViews: sql`${blogPosts.totalViews} + 1` })
				.where(eq(blogPosts.slug, slug))

			return { unique: false }
		}

		const geoInfo = await fetchGeoInfo(ip)

		await db.insert(blogViews).values({
			slug,
			fingerprint,
			ipAddress: ip,
			geoCountry: geoInfo?.country,
			geoCity: geoInfo?.city,
			geoRegion: geoInfo?.region,
			geoLoc: geoInfo?.loc,
			geoOrg: geoInfo?.org,
			geoTimezone: geoInfo?.timezone
		})

		await db
			.update(blogPosts)
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
