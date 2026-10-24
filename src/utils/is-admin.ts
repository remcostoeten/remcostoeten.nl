import { auth } from '@/server/auth'
import { headers } from 'next/headers'

import { env } from '@/server/env'

const FALLBACK_ADMIN_EMAILS = [
	'remcostoeten@gmail.com',
	'remcostoeten@hotmail.com'
]

function isDevOpenAdmin(): boolean {
	return (
		process.env.NODE_ENV !== 'production' && env.DEV_OPEN_ADMIN === 'true'
	)
}

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
 * @name getAdminSessionUser
 * @description Returns the signed-in admin from a real Better Auth session, or
 * null. Unlike isAdmin it ignores DEV_OPEN_ADMIN, so it is the gate for
 * operations with external side effects such as sending email.
 *
 * @example
 * const adminUser = await getAdminSessionUser()
 */
export async function getAdminSessionUser() {
	try {
		const session = await getServerSession()
		const sessionUser = session?.user

		if (!sessionUser) return null
		if (sessionUser.banned) return null

		const isEmailMatch = isAdminEmail(sessionUser.email)
		const isRoleAdmin = sessionUser.role === 'admin'

		return isRoleAdmin || isEmailMatch ? sessionUser : null
	} catch (e) {
		console.error('[getAdminSessionUser] Error checking admin status:', e)
		return null
	}
}

/**
 * Server-side utility to check if the current user is admin
 * Can be used in Server Components and Server Actions
 */
export async function isAdmin(): Promise<boolean> {
	if (isDevOpenAdmin()) return true

	try {
		const session = await getServerSession()

		if (!session?.user) {
			return false
		}

		const isEmailMatch = isAdminEmail(session.user.email)
		const isRoleAdmin = session.user.role === 'admin'

		if (!isRoleAdmin && !isEmailMatch) {
			return false
		}

		return true
	} catch (e) {
		console.error('[isAdmin] Error checking admin status:', e)
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
