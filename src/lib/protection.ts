import { db } from '@/server/db/connection'
import { and, eq, gt, count } from 'drizzle-orm'
import { headers } from 'next/headers'
import { PgTable, PgColumn } from 'drizzle-orm/pg-core'

export const getClientIp = async () => {
	const headersList = await headers()
	// x-forwarded-for can be comma separated, take the first one
	const forwardedFor = headersList.get('x-forwarded-for')
	if (forwardedFor) {
		return forwardedFor.split(',')[0].trim()
	}
	return headersList.get('x-real-ip') || 'unknown'
}

/**
 * Checks if a honeypot field has a value.
 * @param honeyPotValue The value of the honeypot field.
 * @returns true if the honeypot is filled (spam), false otherwise.
 */
export const checkHoneypot = (honeyPotValue?: string | null) => {
	return !!honeyPotValue
}

interface RateLimitConfig {
	limit: number
	windowMs: number
}

/**
 * Checks if a specific action is rate limited based on DB records.
 * @param table The Drizzle table to check against.
 * @param ipColumn The column in the table storing the IP address.
 * @param timeColumn The column in the table storing the timestamp.
 * @param ip The IP address to check.
 * @param config Rate limit configuration (limit and window).
 * @returns Object indicating if allowed and optional message.
 */
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
		// Fail open to avoid blocking legitimate users on DB errors
		return { allowed: true }
	}
}
