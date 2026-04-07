'use client'

import { memo, useState, lazy, Suspense } from 'react'
import { Github, ExternalLink, Eye, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { formatShortDate } from '@/shared/lib/date'
import type { IProject, TPreview } from '../types'

const ProjectPreviewRenderer = lazy(() =>
	import('./project-preview').then(m => ({
		default: m.ProjectPreviewRenderer
	}))
)

type Props = {
	project: IProject
}

const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)'

function getExternalUrl(preview?: TPreview) {
	if (preview?.type === 'iframe') return preview.url
	return undefined
}

export const ProjectRow = memo(function ProjectRow({ project }: Props) {
	const [showPreview, setShowPreview] = useState(false)
	const [showDesc, setShowDesc] = useState(false)
	const externalUrl = getExternalUrl(project.preview)
	const hasPreview = project.preview?.type === 'iframe'
	const hasDesc = !!project.additionalDescription
	const isOpen = showPreview || showDesc
	const primaryTech = project.tech[0]
	const techSummary = project.tech.join(', ')

	const toggle = () => {
		if (hasPreview) setShowPreview(!showPreview)
		else if (hasDesc) setShowDesc(!showDesc)
	}

	return (
		<div className="flex flex-col border-b border-border">
			<div className="group flex items-center justify-between bg-card px-2 sm:px-3 py-2">
				<div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
					<span className="min-w-0 flex-1 text-sm font-medium text-foreground truncate md:flex-none md:max-w-[40%] md:transition-[max-width] md:duration-300 md:ease-out md:group-hover:max-w-[55%] lg:max-w-[32%] lg:group-hover:max-w-[45%]">
						{project.name}
					</span>
					<span className="hidden min-w-0 flex-1 text-sm text-muted-foreground md:inline truncate">
						— {project.description}
					</span>
				</div>

				<div className="ml-2 flex shrink-0 items-center gap-1 sm:gap-2">
					{project.git?.lastUpdated && (
						<span className="hidden text-xs text-muted-foreground lg:inline">
							{formatShortDate(project.git.lastUpdated)}
						</span>
					)}
					{primaryTech && (
						<div
							className="hidden items-center overflow-hidden md:flex"
							title={techSummary}
						>
							<span
								className="bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground whitespace-nowrap shrink-0"
								aria-label={`Tech stack: ${techSummary}`}
							>
								{primaryTech}
							</span>
						</div>
					)}
					<div className="flex items-center">
						{(hasPreview || hasDesc) && (
							<button
								onClick={toggle}
								className={cn(
									'min-h-9 min-w-9 inline-flex items-center justify-center p-2 transition-colors',
									isOpen
										? 'text-foreground'
										: 'text-muted-foreground hover:text-foreground'
								)}
								aria-label={
									hasPreview
										? `Toggle ${project.name} preview`
										: `Toggle ${project.name} details`
								}
							>
								{hasPreview ? (
									<Eye className="h-3 w-3" />
								) : (
									<ChevronDown
										className={cn(
											'h-3 w-3 transition-transform duration-300',
											isOpen && 'rotate-180'
										)}
									/>
								)}
							</button>
						)}
						<a
							href={project.github}
							target="_blank"
							rel="noopener noreferrer"
							className="min-h-9 min-w-9 inline-flex items-center justify-center p-2 text-muted-foreground transition-colors hover:text-foreground"
							aria-label={`View ${project.name} on GitHub`}
						>
							<Github className="h-3 w-3" />
						</a>
						{externalUrl && (
							<a
								href={externalUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="min-h-9 min-w-9 inline-flex items-center justify-center p-2 text-muted-foreground transition-colors hover:text-foreground"
								aria-label={`View ${project.name} demo`}
							>
								<ExternalLink className="h-3 w-3" />
							</a>
						)}
					</div>
				</div>
			</div>

			<div
				className="grid transition-[grid-template-rows] duration-500"
				style={{
					gridTemplateRows: isOpen ? '1fr' : '0fr',
					transitionTimingFunction: EASE_OUT_EXPO
				}}
			>
				<div className="overflow-hidden">
					{showPreview && (
						<Suspense
							fallback={
								<div className="h-[150px] flex items-center justify-center text-xs text-muted-foreground">
									Loading…
								</div>
							}
						>
							<ProjectPreviewRenderer
								preview={project.preview}
								name={project.name}
								isVisible={showPreview}
							/>
						</Suspense>
					)}
					{showDesc && !showPreview && (
						<div className="px-3 py-3 text-xs text-muted-foreground/80 leading-relaxed border-t border-border bg-muted/20">
							{project.additionalDescription}
						</div>
					)}
				</div>
			</div>
		</div>
	)
})
