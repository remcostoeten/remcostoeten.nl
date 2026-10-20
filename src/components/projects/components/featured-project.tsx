import {
	FeaturedCard,
	type FeaturedLink
} from '@/components/showcase/featured-card'
import { GithubGlyph, GlobeGlyph, NpmGlyph } from '@/components/ui/link-glyphs'
import { ActivityGraph } from '@/components/showcase/activity-graph'
import { LivePreview } from '@/components/showcase/live-preview'
import type { IProject } from '../types'

const downloadFormat = new Intl.NumberFormat('en', { notation: 'compact' })

const roleLabels = new Set(['sdk', 'api', 'ingestion api', 'cli'])

type Props = {
	project: IProject
	isWide?: boolean
}

function getLinks(project: IProject) {
	const links: FeaturedLink[] = []
	if (project.preview.type === 'iframe') {
		links.push({
			label: 'Live',
			href: project.preview.url,
			icon: GlobeGlyph
		})
	}
	if (project.github) {
		links.push({ label: 'GitHub', href: project.github, icon: GithubGlyph })
	}
	if (project.npm) {
		links.push({ label: 'npm', href: project.npm.url, icon: NpmGlyph })
	}
	return links
}

function isRole(label: string) {
	return roleLabels.has(label.toLowerCase())
}

export function FeaturedProject({ project, isWide = false }: Props) {
	const { preview } = project

	return (
		<FeaturedCard
			title={project.name}
			description={project.description}
			tags={project.tech.filter(isRole)}
			tech={project.tech.filter(label => !isRole(label))}
			links={getLinks(project)}
			mediaSide="top"
			isWide={isWide}
			backdrop={
				project.git?.weeklyActivity && (
					<ActivityGraph
						data={project.git.weeklyActivity}
						isWide={isWide}
						className="size-full"
					/>
				)
			}
			meta={
				project.git?.lastUpdated && (
					<p className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums text-muted-foreground">
						<span className="text-foreground/80">
							{project.git.totalCommits}
						</span>
						commits
						{project.git.releaseDownloads > 0 && (
							<>
								<span
									className="text-muted-foreground/40"
									aria-hidden="true"
								>
									/
								</span>
								<span className="text-foreground/80">
									{downloadFormat.format(
										project.git.releaseDownloads
									)}
								</span>
								downloads
							</>
						)}
						{!!project.npm?.weeklyDownloads && (
							<>
								<span
									className="text-muted-foreground/40"
									aria-hidden="true"
								>
									/
								</span>
								<span className="text-foreground/80">
									{downloadFormat.format(
										project.npm.weeklyDownloads
									)}
								</span>
								weekly downloads
							</>
						)}
					</p>
				)
			}
			media={
				preview.type === 'iframe' ? (
					<LivePreview
						poster={preview.poster}
						src={preview.embedUrl ?? preview.url}
						href={preview.url}
						title={project.name}
						isWide={isWide}
					/>
				) : null
			}
		/>
	)
}
