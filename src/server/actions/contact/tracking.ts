'use server'

import { db } from '@/server/db/connection'
import { contactAbandonments, contactInteractions } from '@/server/db/schema'
import { getClientInfo, getVisitorId } from '@/server/request'
import {
	buildContactAbandonmentValues,
	buildContactInteractionValues
} from './shared'

export async function trackContactButtonClick() {
	try {
		const visitorId = await getVisitorId()
		const clientInfo = await getClientInfo()

		await db.insert(contactInteractions).values({
			...(await buildContactInteractionValues(
				visitorId,
				clientInfo,
				'button_click'
			))
		})

		return { success: true }
	} catch (error) {
		console.error('Failed to track contact button click:', error)
		return { success: false }
	}
}

export async function trackFormStart(sessionId?: string) {
	try {
		const visitorId = await getVisitorId()
		const clientInfo = await getClientInfo()

		const interaction = await db
			.insert(contactInteractions)
			.values({
				...(await buildContactInteractionValues(
					visitorId,
					clientInfo,
					'form_start',
					sessionId
				))
			})
			.returning({ id: contactInteractions.id })

		return { success: true, interactionId: interaction[0].id }
	} catch (error) {
		console.error('Failed to track form start:', error)
		return { success: false }
	}
}

export async function trackFormAbandonment(
	interactionId: string,
	timeToAbandon: number,
	lastFieldTouched?: string,
	formData?: Record<string, any>
) {
	try {
		const visitorId = await getVisitorId()
		const clientInfo = await getClientInfo()

		await db.insert(contactAbandonments).values({
			...(await buildContactAbandonmentValues(
				clientInfo,
				visitorId,
				interactionId,
				timeToAbandon,
				lastFieldTouched,
				formData
			))
		})

		await db.insert(contactInteractions).values({
			...(await buildContactInteractionValues(
				visitorId,
				clientInfo,
				'form_abandon'
			))
		})

		return { success: true }
	} catch (error) {
		console.error('Failed to track form abandonment:', error)
		return { success: false }
	}
}
