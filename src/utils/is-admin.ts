import { auth } from '@/server/auth'
import { headers } from 'next/headers'
import { env } from '@/server/env'

const FALLBACK_ADMIN_EMAILS = [
	'remcostoeten@gmail.com',
	'remcostoeten@hotmail.com'
]

function getAdminEmails() {
	const configured = (env.ADMIN_EMAIL || '')
		.split(',')
		.map(email => email.trim().toLowerCase())
		.filter(Boolean)

	return configured.length > 0 ? configured : FALLBACK_ADMIN_EMAILS
}

function isAdminEmail(email?: string | null): boolean {
	if (!email) return false
	const normalizedEmail = email.toLowerCase()
	return getAdminEmails().includes(normalizedEmail)
}

/**
 * Server-side utility to check if the current user is admin
 * Can be used in Server Components and Server Actions
 */
export async function isAdmin(): Promise<boolean> {
	try {
		const session = await auth.api.getSession({
			headers: await headers()
		})

		if (!session?.user) return false

		const isEmailMatch = isAdminEmail(session.user.email)
		const isRoleAdmin = session.user.role === 'admin'

		return isRoleAdmin || isEmailMatch
	} catch {
		return false
	}
}

/**
 * Get the current session (server-side)
 */
export async function getServerSession() {
	try {
		return await auth.api.getSession({
			headers: await headers()
		})
	} catch {
		return null
	}
}
