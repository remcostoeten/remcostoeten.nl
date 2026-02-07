'use server'

import { db } from 'db'
import { projects, projectSettings } from 'schema'
import { eq, asc } from 'drizzle-orm'

export async function getProjects(includeHidden = false) {
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
	try {
		const [settings] = await db
			.select()
			.from(projectSettings)
			.where(eq(projectSettings.id, 'singleton'))

		if (!settings) {
			const [newSettings] = await db
				.insert(projectSettings)
				.values({ id: 'singleton', showN: 6 })
				.returning()
			return newSettings
		}

		return settings
	} catch (error) {
		console.error('[getSettings] Database error:', error)
		return { id: 'singleton', showN: 6, updatedAt: new Date() }
	}
}
