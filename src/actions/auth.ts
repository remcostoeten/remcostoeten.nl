'use server'

import { isAdmin } from '@/utils/is-admin'

export async function checkAdminStatus(): Promise<boolean> {
	return isAdmin()
}
