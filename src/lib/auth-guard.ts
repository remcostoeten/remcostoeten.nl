import { isAdmin as isAdminUser } from '@/utils/is-admin'

export async function isAdmin(): Promise<boolean> {
	return isAdminUser()
}

export async function requireAdmin() {
	const admin = await isAdmin()
	if (!admin) {
		throw new Error('Unauthorized')
	}

	return true
}
