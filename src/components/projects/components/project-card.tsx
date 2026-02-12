'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { Github, ExternalLink, Eye, Play, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/date'
import type { IProject, TPreview } from '../types'
import { GitInfo } from './git-info'
import { ProjectPreviewRenderer } from './project-preview'

type Props = {
	project: IProject
	forceShowPreview?: boolean
}

const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)'

function getPreviewIcon(type?: string) {
	switch (type) {
		case 'video':
			return Play
		case 'image':
			return ImageIcon
		default:
			return Eye
	}
}

function getExternalUrl(preview?: TPreview) {
	if (preview?.type === 'iframe') return preview.url
	return undefined
}

export const ProjectCard = memo(function ProjectCard({
	project,
	forceShowPreview
}: Props) {
	const [showPreview, setShowPreview] = useState(project.defaultOpen ?? false)
	const [highlightPreview, setHighlightPreview] = useState(false)
	const [highlightTriggered, setHighlightTriggered] = useState(false)
	const cardRef = useRef<HTMLElement>(null)

	const hasPreview = project.preview?.type && project.preview.type !== 'none'
	const externalUrl = getExternalUrl(project.preview)
	const PreviewIcon = getPreviewIcon(project.preview?.type)
	const shouldShowIndicatorOnScroll =
		project.showIndicatorOnScroll && hasPreview

	useEffect(() => {
		if (!shouldShowIndicatorOnScroll || highlightTriggered || showPreview)
			return

		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (
						entry.isIntersecting &&
						entry.intersectionRatio >= 0.6
					) {
						setHighlightPreview(true)
						setHighlightTriggered(true)

						// Stop animation after 10 seconds
						const timer = setTimeout(() => {
							setHighlightPreview(false)
						}, 10000)

						return () => clearTimeout(timer)
					} else if (
						entry.intersectionRatio < 0.3 &&
						highlightPreview
					) {
						// Stop animation when scrolled past
						setHighlightPreview(false)
					}
				})
			},
			{ threshold: [0.3, 0.6] }
		)

		if (cardRef.current) observer.observe(cardRef.current)
		return () => observer.disconnect()
	}, [
		shouldShowIndicatorOnScroll,
		highlightTriggered,
		showPreview,
		highlightPreview
	])

	useEffect(() => {
		if (forceShowPreview !== undefined) {
			setShowPreview(forceShowPreview)
		}
	}, [forceShowPreview])

	const isPreviewVisible = showPreview || forceShowPreview

	return (
		<article
			ref={cardRef}
			className={cn(
				'bg-card relative',
				project.spotlight && 'spotlight-card'
			)}
		>
			<div className="flex flex-col">
				<div className="flex items-start justify-between gap-2 sm:gap-4 p-2 sm:p-3">
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-1 sm:gap-2">
							<h3 className="text-xs font-medium text-foreground">
								{project.name}
							</h3>
							{project.spotlight && (
								<span className="text-[8px] sm:text-[9px] px-1 py-px bg-foreground/10 text-foreground/60">
									featured
								</span>
							)}
							{!project.spotlight &&
								project.preview?.type === 'iframe' && (
									<span className="text-[8px] sm:text-[9px] px-1 py-px bg-foreground/5 text-muted-foreground whitespace-nowrap shrink-0">
										live demo
									</span>
								)}
							<span className="text-[8px] sm:text-[9px] text-muted-foreground/40 inline-flex min-w-[56px] md:min-w-[120px]">
								<span
									className={cn(
										!project.git?.lastUpdated &&
											'invisible'
									)}
									aria-hidden={!project.git?.lastUpdated}
								>
									<span className="hidden md:inline">
										last updated{' '}
									</span>
									{project.git?.lastUpdated
										? formatRelativeDate(
												project.git.lastUpdated
											)
										: '00 days ago'}
								</span>
							</span>
						</div>
						<p className="mt-0.5 text-[10px] sm:text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
							{project.description}
						</p>
						<div className="mt-2 flex gap-1 overflow-x-auto scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
							{project.tech.map(tech => (
								<span
									key={tech}
									className="bg-secondary px-1 py-px text-[9px] text-secondary-foreground whitespace-nowrap shrink-0"
								>
									{tech}
								</span>
							))}
							{project.platforms &&
								project.platforms.length > 0 && (
									<>
										<span className="text-muted-foreground/30 text-[9px] px-0.5 shrink-0">
											·
										</span>
										{project.platforms.map(platform => (
											<span
												key={platform}
												className="bg-secondary/50 px-1 py-px text-[9px] text-muted-foreground whitespace-nowrap shrink-0"
											>
												{platform}
											</span>
										))}
									</>
								)}
						</div>
					</div>

					<div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
						{hasPreview && (
							<button
								onClick={() => {
									setShowPreview(!showPreview)
									setHighlightPreview(false)
								}}
								className={cn(
									'relative p-1.5 transition-all duration-300',
									isPreviewVisible
										? 'text-foreground'
										: 'text-muted-foreground hover:text-foreground',
									highlightPreview &&
										!isPreviewVisible &&
										'text-foreground'
								)}
								style={{
									transitionTimingFunction: EASE_OUT_EXPO
								}}
								aria-label="Toggle preview"
							>
								{highlightPreview && !isPreviewVisible && (
									<>
										<span className="absolute inset-0 border border-foreground/60 animate-ping" />
										<span className="absolute inset-0 border border-foreground/40" />
									</>
								)}
								<PreviewIcon className="h-3.5 w-3.5 relative z-10" />
							</button>
						)}
						<a
							href={project.github}
							target="_blank"
							rel="noopener noreferrer"
							className="p-1 text-muted-foreground transition-all duration-300 hover:text-foreground"
							style={{ transitionTimingFunction: EASE_OUT_EXPO }}
							aria-label={`${project.name} on GitHub`}
						>
							<Github className="h-3 w-3" />
						</a>
						{externalUrl && (
							<a
								href={externalUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="p-1 text-muted-foreground transition-all duration-300 hover:text-foreground"
								style={{
									transitionTimingFunction: EASE_OUT_EXPO
								}}
								aria-label={`${project.name} demo`}
							>
								<ExternalLink className="h-3 w-3" />
							</a>
						)}
					</div>
				</div>

				{hasPreview && (
					<div
						className="grid transition-all duration-500"
						style={{
							gridTemplateRows: isPreviewVisible ? '1fr' : '0fr',
							transitionTimingFunction: EASE_OUT_EXPO
						}}
					>
						<div className="overflow-hidden">
							{isPreviewVisible && (
								<ProjectPreviewRenderer
									preview={project.preview}
									name={project.name}
									isVisible={isPreviewVisible}
								/>
							)}
							{project.git && isPreviewVisible && (
								<div className="px-2 sm:px-3 py-2 border-t border-border">
									<GitInfo git={project.git} expanded />
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</article>
	)
})
