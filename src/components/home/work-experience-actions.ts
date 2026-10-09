'use server'

import { isAdmin } from '@/features/auth/guard'
import { db } from '@/server/db/connection'
import { workExperiences } from '@/server/db/schema'
import { revalidatePath } from 'next/cache'

type MutationResult = { success: true } | { success: false; error: string }

export async function saveWorkExperiences(
	serialized: string
): Promise<MutationResult> {
	if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

	let experiences: unknown
	try {
		experiences = JSON.parse(serialized)
	} catch {
		return { success: false, error: 'Enter valid JSON.' }
	}

	if (!Array.isArray(experiences))
		return { success: false, error: 'Experiences must be a JSON array.' }
	if (
		experiences.some(
			item =>
				!item ||
				typeof item.id !== 'string' ||
				typeof item.companyName !== 'string' ||
				!Array.isArray(item.positions)
		)
	)
		return {
			success: false,
			error: 'Each item needs an id, companyName, and positions array.'
		}

	await db.delete(workExperiences)
	if (experiences.length > 0) {
		await db
			.insert(workExperiences)
			.values(experiences.map((data, idx) => ({ idx, data })))
	}

	revalidatePath('/')
	revalidatePath('/admin/experience')
	return { success: true }
}
