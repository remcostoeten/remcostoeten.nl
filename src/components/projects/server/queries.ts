import { cacheTag } from 'next/cache'
import { db } from '@/server/db/connection'
import { projects, projectSettings } from '@/server/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function getProjects(includeHidden = false) {
	'use cache'
	cacheTag('projects')

	try {
		const query = includeHidden
			? db.select().from(projects).orderBy(asc(projects.idx))
			: db
					.select()
					.from(projects)
					.where(eq(projects.hidden, false))
					.orderBy(asc(projects.idx))

		return await query
	} catch (error) {
		console.error('[getProjects] Database error:', error)
		return []
	}
}

export async function getProject(id: string) {
	'use cache'
	cacheTag('projects')

	try {
		const [project] = await db
			.select()
			.from(projects)
			.where(eq(projects.id, id))
		return project ?? null
	} catch (error) {
		console.error('[getProject] Database error:', error)
		return null
	}
}

export async function getSettings() {
	'use cache'
	cacheTag('projects')

	try {
		const [settings] = await db
			.select()
			.from(projectSettings)
			.where(eq(projectSettings.id, 'singleton'))

		return settings ?? { id: 'singleton', showN: 6, updatedAt: new Date() }
	} catch (error) {
		console.error('[getSettings] Database error:', error)
		return { id: 'singleton', showN: 6, updatedAt: new Date() }
	}
}
