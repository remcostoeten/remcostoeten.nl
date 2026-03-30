import { isAdmin } from '@/utils/is-admin'

export async function checkAdminStatus(): Promise<boolean> {
	return isAdmin()
}

export async function requireAdmin(): Promise<void> {
	const admin = await isAdmin()

	if (!admin) {
		throw new Error('Unauthorized')
	}
}
