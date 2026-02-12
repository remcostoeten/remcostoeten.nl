import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { asc, eq } from 'drizzle-orm'
import { db } from 'db'
import { projects } from 'schema'
import type { IProject, TPreview } from '@/components/projects/types'

export const revalidate = 300

function mapDbProjectToProject(dbProject: typeof projects.$inferSelect): IProject {
	const preview: TPreview = dbProject.demoUrl
		? {
				type: 'iframe',
				url: dbProject.demoUrl,
				embedUrl: dbProject.demoBox ?? undefined
			}
		: { type: 'none' }

	return {
		name: dbProject.title,
		description: dbProject.desc,
		additionalDescription: dbProject.additionalDesc ?? undefined,
		type: dbProject.native ? 'desktop' : 'utility',
		status: 'active',
		github: dbProject.gitUrl ?? '',
		tech: dbProject.labels,
		preview,
		spotlight: dbProject.featured,
		defaultOpen: dbProject.defaultOpen,
		showIndicatorOnScroll: dbProject.showIndicator
	}
}

const getProjectShowcaseData = unstable_cache(
	async () => {
		const dbProjects = await db
			.select()
			.from(projects)
			.where(eq(projects.hidden, false))
			.orderBy(asc(projects.idx))

		const allProjects = dbProjects.map(mapDbProjectToProject)
		return {
			featured: allProjects.filter(project => project.spotlight),
			other: allProjects.filter(project => !project.spotlight)
		}
	},
	['project-showcase-data'],
	{ revalidate: 300, tags: ['projects'] }
)

export async function GET() {
	try {
		const data = await getProjectShowcaseData()
		return NextResponse.json(data, {
			headers: {
				'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400'
			}
		})
	} catch (error) {
		console.error('[api/projects/showcase] Failed to load projects:', error)
		return NextResponse.json(
			{ error: 'Failed to load project showcase data' },
			{ status: 500 }
		)
	}
}
