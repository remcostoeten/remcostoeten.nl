'use server'

import { db } from '@/server/db/connection'
import { contactSubmissions } from '@/server/db/schema'
import { checkHoneypot, checkRateLimit, getClientIp } from '@/server/request'
import { parseContactFormData, contactSubmissionSchema } from './validation'
import { buildContactGeoFields } from './shared'

export async function submitContactForm(formData: FormData) {
	const rawData = parseContactFormData(formData)

	if (checkHoneypot(rawData._gotcha)) {
		return { success: true, message: 'Message sent successfully!' }
	}

	const result = contactSubmissionSchema.safeParse(rawData)

	if (!result.success) {
		return { success: false, errors: result.error.flatten().fieldErrors }
	}

	const ip = await getClientIp()

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
		await db.insert(contactSubmissions).values({
			name: result.data.name,
			email: result.data.email,
			subject: result.data.subject || null,
			message: result.data.message,
			ipAddress: ip,
			...(await buildContactGeoFields(ip))
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
