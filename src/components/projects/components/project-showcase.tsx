import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import type { IProject, TPreview } from '../types'
import type { Project } from '@/server/db/project-schema'
import { getProjects } from '../server/queries'
import { enrichProjectsWithGitData } from '../server/github'
import { ProjectShowcaseClient } from './project-showcase-client'
import { FeaturedCardSkeleton } from '@/components/showcase/featured-card-skeleton'
import { ProjectRowSkeleton } from './project-row-skeleton'

type Props = {
	visibleRowCount?: number
}

const projectPosters: Record<string, string> = {
	Skriuw: '/projects/skriuw.webp',
	Dora: '/projects/dora.webp'
}

function mapDbProjectToIProject(dbProject: Project): IProject {
	const preview: TPreview = dbProject.demoUrl
		? {
				type: 'iframe',
				url: dbProject.demoUrl,
				embedUrl: dbProject.demoBox ?? undefined,
				poster: projectPosters[dbProject.title]
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

function ShowcaseSkeleton({
	featuredCount = 2,
	rowCount = 6
}: {
	featuredCount?: number
	rowCount?: number
}) {
	return (
		<section className="w-full max-w-3xl px-3 sm:px-0">
			<div className="grid border-t border-border sm:grid-cols-2">
				{Array.from({ length: featuredCount }).map((_, i) => (
					<div
						key={i}
						className="border-b border-border sm:odd:border-r"
					>
						<FeaturedCardSkeleton />
					</div>
				))}
			</div>
			<div className="relative">
				<div
					className="flex flex-col bg-card overflow-hidden"
					style={{ height: `${rowCount * 40}px` }}
				>
					{Array.from({ length: rowCount }).map((_, i) => (
						<ProjectRowSkeleton key={i} />
					))}
				</div>
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-background to-transparent" />
			</div>
			<div className="flex items-center gap-2 px-2 py-2 text-xs sm:px-3">
				<div className="size-2.5 shrink-0 rounded-sm bg-muted/40" />
				<div className="flex h-[1lh] items-center">
					<div className="h-2.5 w-20 rounded bg-muted/40 animate-pulse" />
				</div>
			</div>
		</section>
	)
}

async function getShowcaseProjects() {
	'use cache'
	cacheTag('projects', 'github-metrics')

	const dbProjects = await getProjects()
	const allProjects = dbProjects.map(mapDbProjectToIProject)
	let enrichedProjects = allProjects

	try {
		enrichedProjects = await enrichProjectsWithGitData(allProjects)
	} catch (error) {
		console.error(
			'[ProjectShowcase] Git enrichment failed, using static data:',
			error
		)
	}

	const hasGitData = enrichedProjects.some(project => project.git)
	// The build skips GitHub enrichment, so refresh soon instead of keeping bare data for hours.
	if (enrichedProjects.length > 0 && !hasGitData) {
		cacheLife('minutes')
	}

	return {
		featured: enrichedProjects.filter(p => p.spotlight),
		other: enrichedProjects.filter(p => !p.spotlight)
	}
}

async function ProjectShowcaseAsync({
	visibleRowCount
}: {
	visibleRowCount: number
}) {
	const { featured, other } = await getShowcaseProjects()

	return (
		<ProjectShowcaseClient
			visibleRowCount={visibleRowCount}
			featured={featured}
			other={other}
		/>
	)
}

export function ProjectShowcase({ visibleRowCount = 6 }: Props) {
	return (
		<Suspense
			fallback={
				<ShowcaseSkeleton
					featuredCount={2}
					rowCount={visibleRowCount}
				/>
			}
		>
			<ProjectShowcaseAsync visibleRowCount={visibleRowCount} />
		</Suspense>
	)
}
