import { auth } from '@/server/auth'
import { headers, cookies } from 'next/headers'

import { env } from '@/server/env'

const DEFAULT_ADMIN_EMAIL = 'remcostoeten@gmail.com'
const SECONDARY_ADMIN_EMAIL = 'iremcostoeten@hotmail.com'
const ADMIN_EMAIL = env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL

/**
 * Server-side utility to check if the current user is admin
 * Can be used in Server Components and Server Actions
 */
export async function isAdmin(): Promise<boolean> {
	try {
		const cookieStore = await cookies()
		const cookieHeader = cookieStore
			.getAll()
			.map(cookie => `${cookie.name}=${cookie.value}`)
			.join('; ')

		const session = await auth.api.getSession({
			headers: {
				cookie: cookieHeader
			}
		})

		if (!session?.user) {
			console.log('[isAdmin] No session user found')
			return false
		}

		const userEmail = session.user.email?.toLowerCase()
		const isEmailMatch =
			userEmail === ADMIN_EMAIL.toLowerCase() ||
			userEmail === SECONDARY_ADMIN_EMAIL.toLowerCase()
		const isRoleAdmin = session.user.role === 'admin'

		console.log(
			`[isAdmin] email: ${session.user.email}, isMatch: ${isEmailMatch}, role: ${session.user.role}, isRoleAdmin: ${isRoleAdmin}`
		)

		return isRoleAdmin || isEmailMatch
	} catch (error) {
		console.error('[isAdmin] Error:', error)
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
