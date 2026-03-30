import { db } from '@/server/db/connection'
import { and, eq, gt, count } from 'drizzle-orm'
import { cookies, headers } from 'next/headers'

export type RequestClientInfo = {
	ip: string
	userAgent: string
	referrer: string | null
}

export const getClientIp = async () => {
	const headersList = await headers()
	const forwardedFor = headersList.get('x-forwarded-for')
	if (forwardedFor) {
		return forwardedFor.split(',')[0].trim()
	}
	return headersList.get('x-real-ip') || 'unknown'
}

export async function getVisitorId(): Promise<string> {
	const cookieStore = await cookies()
	const existingId = cookieStore.get('visitor_id')?.value

	if (existingId) {
		return existingId
	}

	const visitorId = crypto.randomUUID()
	cookieStore.set('visitor_id', visitorId, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 60 * 60 * 24 * 365
	})

	return visitorId
}

export async function getClientInfo(): Promise<RequestClientInfo> {
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

export const checkHoneypot = (honeyPotValue?: string | null) => {
	return !!honeyPotValue
}

interface RateLimitConfig {
	limit: number
	windowMs: number
}

export async function checkRateLimit(
	table: any,
	ipColumn: any,
	timeColumn: any,
	ip: string,
	config: RateLimitConfig
): Promise<{ allowed: boolean; message?: string }> {
	const limitWindow = new Date(Date.now() - config.windowMs)

	try {
		const result = await db
			.select({ count: count() })
			.from(table)
			.where(and(eq(ipColumn, ip), gt(timeColumn, limitWindow)))

		if (result[0].count >= config.limit) {
			return {
				allowed: false,
				message: 'Too many requests. Please try again later.'
			}
		}

		return { allowed: true }
	} catch (error) {
		console.error('Rate limit check failed:', error)
		return { allowed: true }
	}
}

type GeoInfo = {
	country?: string
	city?: string
	region?: string
	loc?: string
	org?: string
	timezone?: string
}

export async function fetchGeoInfo(ip: string): Promise<GeoInfo | null> {
	const isLocalhost =
		ip === 'unknown' ||
		ip === '127.0.0.1' ||
		ip === '::1' ||
		ip.startsWith('192.168.') ||
		ip.startsWith('10.')

	if (isLocalhost) {
		return { country: 'Local', city: 'Development' }
	}

	try {
		const token = process.env.IP_INFO_TOKEN
		if (!token) return { country: 'Unknown (no token)' }

		const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`)
		if (!response.ok) return { country: 'Unknown (API error)' }

		return await response.json()
	} catch (error) {
		console.error('Failed to fetch geo info:', error)
		return { country: 'Unknown (fetch failed)' }
	}
}
