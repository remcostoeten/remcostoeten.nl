import { cacheLife, cacheTag } from 'next/cache'
import { asc } from 'drizzle-orm'
import { db } from '@/server/db/connection'
import { workExperiences } from '@/server/db/schema'
import { WORK_EXPERIENCE } from './work-experience-section'
import type { ExperienceItemType } from '@/components/ui/work-experience'

export async function getWorkExperiences(): Promise<ExperienceItemType[]> {
	'use cache'
	cacheTag('work-experience')

	try {
		const rows = await db
			.select()
			.from(workExperiences)
			.orderBy(asc(workExperiences.idx))
		cacheLife('hours')
		if (rows.length === 0) return WORK_EXPERIENCE
		return rows.map(row => row.data as unknown as ExperienceItemType)
	} catch (error) {
		console.error('[getWorkExperiences] Database error:', error)
		cacheLife('minutes')
		return WORK_EXPERIENCE
	}
}
