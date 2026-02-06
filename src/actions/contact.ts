'use server'

import { db } from '@/server/db/connection'
import {
	contactSubmissions,
	contactInteractions,
	contactAbandonments
} from '@/server/db/schema'
import { z } from 'zod'
import { headers } from 'next/headers'
import { gt, and, eq, count, desc } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { getClientIp, checkHoneypot, checkRateLimit } from '@/lib/protection'
import { fetchGeoInfo } from '@/lib/geo'

const validation = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	subject: z.string().optional(),
	message: z.string().min(10, 'Message must be at least 10 characters'),
	_gotcha: z.string().optional() // Honeypot field
})

export async function submitContactForm(formData: FormData) {
	const rawData = {
		name: formData.get('name'),
		email: formData.get('email'),
		subject: formData.get('subject'),
		message: formData.get('message'),
		_gotcha: formData.get('_gotcha')
	} as any

	// Spam check: Honeypot
	if (checkHoneypot(rawData._gotcha)) {
		// Silently fail (pretend success) to confuse bots
		return { success: true, message: 'Message sent successfully!' }
	}

	const result = validation.safeParse(rawData)

	if (!result.success) {
		return { success: false, errors: result.error.flatten().fieldErrors }
	}

	const ip = await getClientIp()

	// Rate limit check: 3 submissions per hour
	// Passing the table and columns to our reusable service
	const rateLimit = await checkRateLimit(
		contactSubmissions,
		contactSubmissions.ipAddress,
		contactSubmissions.createdAt,
		ip,
		{ limit: 3, windowMs: 60 * 60 * 1000 }
	)

	if (!rateLimit.allowed) {
		return { success: false, message: rateLimit.message }
	}

	try {
		const geoInfo = await fetchGeoInfo(ip)

		await db.insert(contactSubmissions).values({
			name: result.data.name,
			email: result.data.email,
			subject: result.data.subject || null,
			message: result.data.message,
			ipAddress: ip,
			geoCountry: geoInfo?.country,
			geoCity: geoInfo?.city,
			geoRegion: geoInfo?.region,
			geoLoc: geoInfo?.loc,
			geoOrg: geoInfo?.org,
			geoTimezone: geoInfo?.timezone
		})

		return { success: true, message: 'Message sent successfully!' }
	} catch (error) {
		console.error('Failed to submit contact form:', error)
		return {
			success: false,
			message: 'Something went wrong. Please try again.'
		}
	}
}

// Helper function to get or generate a visitor ID
async function getVisitorId(): Promise<string> {
	const cookieStore = await cookies()
	const existingId = cookieStore.get('visitor_id')?.value

	if (existingId) {
		return existingId
	}

	const newVisitorId = uuidv4()
	cookieStore.set('visitor_id', newVisitorId, {
		maxAge: 60 * 60 * 24 * 365, // 1 year
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax'
	})

	return newVisitorId
}

async function getClientInfo() {
	const headersList = await headers()
	return {
		ip:
			headersList.get('x-forwarded-for') ||
			headersList.get('x-real-ip') ||
			'unknown',
		userAgent: headersList.get('user-agent') || 'unknown',
		referrer: headersList.get('referer') || null
	}
}

// Track contact button click
export async function trackContactButtonClick() {
	try {
		const visitorId = await getVisitorId()
		const clientInfo = await getClientInfo()

		const geoInfo = await fetchGeoInfo(clientInfo.ip)

		await db.insert(contactInteractions).values({
			visitorId,
			interactionType: 'button_click',
			ipAddress: clientInfo.ip,
			userAgent: clientInfo.userAgent,
			referrer: clientInfo.referrer,
			geoCountry: geoInfo?.country,
			geoCity: geoInfo?.city,
			geoRegion: geoInfo?.region,
			geoLoc: geoInfo?.loc,
			geoOrg: geoInfo?.org,
			geoTimezone: geoInfo?.timezone
		})

		return { success: true }
	} catch (error) {
		console.error('Failed to track contact button click:', error)
		return { success: false }
	}
}

// Track form start (when user starts typing)
export async function trackFormStart(sessionId?: string) {
	try {
		const visitorId = await getVisitorId()
		const clientInfo = await getClientInfo()

		const geoInfo = await fetchGeoInfo(clientInfo.ip)

		const interaction = await db
			.insert(contactInteractions)
			.values({
				visitorId,
				interactionType: 'form_start',
				ipAddress: clientInfo.ip,
				userAgent: clientInfo.userAgent,
				referrer: clientInfo.referrer,
				sessionId: sessionId || null,
				geoCountry: geoInfo?.country,
				geoCity: geoInfo?.city,
				geoRegion: geoInfo?.region,
				geoLoc: geoInfo?.loc,
				geoOrg: geoInfo?.org,
				geoTimezone: geoInfo?.timezone
			})
			.returning({ id: contactInteractions.id })

		return { success: true, interactionId: interaction[0].id }
	} catch (error) {
		console.error('Failed to track form start:', error)
		return { success: false }
	}
}

// Track form abandonment (when user leaves form without submitting)
export async function trackFormAbandonment(
	interactionId: string,
	timeToAbandon: number,
	lastFieldTouched?: string,
	formData?: Record<string, any>
) {
	try {
		const visitorId = await getVisitorId()
		const clientInfo = await getClientInfo()

		const geoInfo = await fetchGeoInfo(clientInfo.ip)

		// Record the abandonment details
		await db.insert(contactAbandonments).values({
			visitorId,
			interactionId,
			timeToAbandon,
			lastFieldTouched: lastFieldTouched || null,
			formData: formData ? JSON.stringify(formData) : null,
			ipAddress: clientInfo.ip,
			geoCountry: geoInfo?.country,
			geoCity: geoInfo?.city,
			geoRegion: geoInfo?.region,
			geoLoc: geoInfo?.loc,
			geoOrg: geoInfo?.org,
			geoTimezone: geoInfo?.timezone
		})

		// Also record as a general interaction for analytics
		await db.insert(contactInteractions).values({
			visitorId,
			interactionType: 'form_abandon',
			ipAddress: clientInfo.ip,
			userAgent: clientInfo.userAgent,
			referrer: clientInfo.referrer,
			geoCountry: geoInfo?.country,
			geoCity: geoInfo?.city,
			geoRegion: geoInfo?.region,
			geoLoc: geoInfo?.loc,
			geoOrg: geoInfo?.org,
			geoTimezone: geoInfo?.timezone
		})

		return { success: true }
	} catch (error) {
		console.error('Failed to track form abandonment:', error)
		return { success: false }
	}
}

// Get contact form analytics
export async function getContactAnalytics() {
	try {
		const totalClicks = await db
			.select({ count: count() })
			.from(contactInteractions)
			.where(eq(contactInteractions.interactionType, 'button_click'))

		const totalFormStarts = await db
			.select({ count: count() })
			.from(contactInteractions)
			.where(eq(contactInteractions.interactionType, 'form_start'))

		const totalSubmissions = await db
			.select({ count: count() })
			.from(contactSubmissions)

		const totalAbandonments = await db
			.select({ count: count() })
			.from(contactInteractions)
			.where(eq(contactInteractions.interactionType, 'form_abandon'))

		// Calculate average time to abandon
		const abandonmentTimes = await db
			.select({ timeToAbandon: contactAbandonments.timeToAbandon })
			.from(contactAbandonments)

		const avgTimeToAbandon =
			abandonmentTimes.length > 0
				? Math.round(
						abandonmentTimes.reduce(
							(sum, record) => sum + (record.timeToAbandon || 0),
							0
						) / abandonmentTimes.length
					)
				: 0

		// Get abandonment by time ranges
		const abandonmentRanges = {
			under5s: abandonmentTimes.filter(t => (t.timeToAbandon || 0) < 5000)
				.length,
			under15s: abandonmentTimes.filter(
				t =>
					(t.timeToAbandon || 0) >= 5000 &&
					(t.timeToAbandon || 0) < 15000
			).length,
			under30s: abandonmentTimes.filter(
				t =>
					(t.timeToAbandon || 0) >= 15000 &&
					(t.timeToAbandon || 0) < 30000
			).length,
			over30s: abandonmentTimes.filter(
				t => (t.timeToAbandon || 0) >= 30000
			).length
		}

		return {
			success: true,
			data: {
				totalClicks: totalClicks[0].count,
				totalFormStarts: totalFormStarts[0].count,
				totalSubmissions: totalSubmissions[0].count,
				totalAbandonments: totalAbandonments[0].count,
				avgTimeToAbandon,
				abandonmentRanges,
				conversionRate:
					totalFormStarts[0].count > 0
						? Math.round(
								(totalSubmissions[0].count /
									totalFormStarts[0].count) *
									100
							)
						: 0,
				clickToStartRate:
					totalClicks[0].count > 0
						? Math.round(
								(totalFormStarts[0].count /
									totalClicks[0].count) *
									100
							)
						: 0
			}
		}
	} catch (error) {
		console.error('Failed to get contact analytics:', error)
		return { success: false, message: 'Failed to retrieve analytics' }
	}
}
