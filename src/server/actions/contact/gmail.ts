'use server'

import { revalidatePath } from 'next/cache'
import { unlinkGmail } from '@/server/gmail/connection'
import { getAdminSessionUser } from '@/utils/is-admin'

/**
 * @name disconnectGmail
 * @description Disconnects the Gmail account used for replies by revoking the
 * send permission and clearing its stored tokens. Needs a real admin session.
 *
 * @example
 * const result = await disconnectGmail()
 */
export async function disconnectGmail(): Promise<
	{ success: true } | { success: false; error: string }
> {
	const adminUser = await getAdminSessionUser()
	if (!adminUser) return { success: false, error: 'Unauthorized' }

	try {
		await unlinkGmail(adminUser.id)
	} catch (error) {
		console.error('[gmail] Disconnect failed:', error)
		return { success: false, error: 'Could not disconnect Gmail' }
	}

	revalidatePath('/admin', 'layout')
	return { success: true }
}
