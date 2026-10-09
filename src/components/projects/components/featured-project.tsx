import {
	FeaturedCard,
	type FeaturedLink
} from '@/components/showcase/featured-card'
import { GithubGlyph, GlobeGlyph } from '@/components/ui/link-glyphs'
import { ActivityGraph } from '@/components/showcase/activity-graph'
import { LivePreview } from '@/components/showcase/live-preview'
import type { IProject } from '../types'

const downloadFormat = new Intl.NumberFormat('en', { notation: 'compact' })

type Props = {
	project: IProject
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
	return links
}

export function FeaturedProject({ project }: Props) {
	const { preview } = project

	return (
		<FeaturedCard
			title={project.name}
			description={project.description}
			tech={project.tech}
			links={getLinks(project)}
			mediaSide="top"
			backdrop={
				project.git?.weeklyActivity && (
					<ActivityGraph
						data={project.git.weeklyActivity}
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
					/>
				) : null
			}
		/>
	)
}
