import { isAdmin as isAdminUser } from '@/utils/is-admin'

export async function isAdmin(): Promise<boolean> {
	return isAdminUser()
}
