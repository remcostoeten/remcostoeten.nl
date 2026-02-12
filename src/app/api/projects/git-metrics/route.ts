import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { asc, eq } from 'drizzle-orm'
import { db } from 'db'
import { projects } from 'schema'
import type { IGitMetrics } from '@/components/projects/types'
import { fetchGitMetrics } from '@/components/projects/server/github'

export const revalidate = 3600

const getProjectGitMetrics = unstable_cache(
	async () => {
		const dbProjects = await db
			.select({
				title: projects.title,
				gitUrl: projects.gitUrl
			})
			.from(projects)
			.where(eq(projects.hidden, false))
			.orderBy(asc(projects.idx))

		const metricsByProject: Record<string, IGitMetrics> = {}

		await Promise.all(
			dbProjects.map(async project => {
				if (!project.gitUrl) return
				const metrics = await fetchGitMetrics(project.gitUrl)
				if (metrics) {
					metricsByProject[project.title] = metrics
				}
			})
		)

		return metricsByProject
	},
	['project-git-metrics'],
	{ revalidate: 3600, tags: ['projects', 'github'] }
)

export async function GET() {
	try {
		const data = await getProjectGitMetrics()
		return NextResponse.json(data, {
			headers: {
				'Cache-Control':
					'public, s-maxage=3600, stale-while-revalidate=86400'
			}
		})
	} catch (error) {
		console.error(
			'[api/projects/git-metrics] Failed to load project git metrics:',
			error
		)
		return NextResponse.json(
			{ error: 'Failed to load git metrics' },
			{ status: 500 }
		)
	}
}
