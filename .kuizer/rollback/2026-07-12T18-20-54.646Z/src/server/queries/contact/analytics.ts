import { db } from '@/server/db/connection'
import {
	contactAbandonments,
	contactInteractions,
	contactSubmissions
} from '@/server/db/schema'
import { count, eq } from 'drizzle-orm'
import { requireAdmin } from '@/server/queries/auth'

export async function getContactAnalytics() {
	await requireAdmin()

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

	const abandonmentRanges = {
		under5s: abandonmentTimes.filter(t => (t.timeToAbandon || 0) < 5000)
			.length,
		under15s: abandonmentTimes.filter(
			t =>
				(t.timeToAbandon || 0) >= 5000 && (t.timeToAbandon || 0) < 15000
		).length,
		under30s: abandonmentTimes.filter(
			t =>
				(t.timeToAbandon || 0) >= 15000 &&
				(t.timeToAbandon || 0) < 30000
		).length,
		over30s: abandonmentTimes.filter(t => (t.timeToAbandon || 0) >= 30000)
			.length
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
							(totalFormStarts[0].count / totalClicks[0].count) *
								100
						)
					: 0
		}
	}
}
