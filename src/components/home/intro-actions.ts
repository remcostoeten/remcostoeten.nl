'use server'

import { isAdmin } from '@/features/auth/guard'
import { db } from '@/server/db/connection'
import { siteIntro } from '@/server/db/schema'
import { revalidatePath } from 'next/cache'
import type { IntroContent } from './intro-queries'

type MutationResult = { success: true } | { success: false; error: string }

export async function saveIntro(input: IntroContent): Promise<MutationResult> {
	if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

	const name = input.name?.trim()
	const role = input.role?.trim()
	const bio = input.bio?.trim()
	if (!name || !role || !bio)
		return { success: false, error: 'Name, role and bio are required.' }

	await db
		.insert(siteIntro)
		.values({ id: 1, name, role, bio })
		.onConflictDoUpdate({ target: siteIntro.id, set: { name, role, bio } })

	revalidatePath('/')
	revalidatePath('/admin/intro')
	return { success: true }
}
