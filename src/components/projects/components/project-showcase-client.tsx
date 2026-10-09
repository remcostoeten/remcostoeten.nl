'use client'

import { useState, memo, useMemo, lazy, Suspense } from 'react'
import type { IProject } from '../types'
import { FeaturedProject } from './featured-project'
import { ToggleGlyph } from '@/components/ui/micro-glyphs'

const ProjectRow = lazy(() =>
	import('./project-row').then(m => ({ default: m.ProjectRow }))
)

type Props = {
	visibleRowCount: number
	featured: IProject[]
	other: IProject[]
}

const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)'
const ROW_HEIGHT = 40

export const ProjectShowcaseClient = memo(function ProjectShowcaseClient({
	visibleRowCount,
	featured,
	other
}: Props) {
	const [showAll, setShowAll] = useState(false)
	const [openRowName, setOpenRowName] = useState<string | null>(null)
	const collapsedHeight = useMemo(
		() => visibleRowCount * ROW_HEIGHT,
		[visibleRowCount]
	)
	const expandedHeight = useMemo(
		() => other.length * ROW_HEIGHT,
		[other.length]
	)
	const totalCount = useMemo(
		() => other.length + featured.length,
		[other.length, featured.length]
	)

	return (
		<section className="w-full max-w-3xl px-3 sm:px-0">
			<div className="grid border-t border-border sm:grid-cols-2">
				{featured.map(project => (
					<div
						key={project.name}
						className="border-b border-border sm:odd:border-r"
					>
						<FeaturedProject project={project} />
					</div>
				))}
			</div>

			<div className="relative">
				<div
					className="flex flex-col bg-card overflow-hidden transition-all duration-500"
					style={{
						maxHeight: showAll
							? `${expandedHeight}px`
							: `${collapsedHeight}px`,
						transitionTimingFunction: EASE_OUT_EXPO
					}}
				>
					<Suspense fallback={null}>
						{other.map((project, index) => (
							<ProjectRow
								key={project.name}
								project={project}
								index={featured.length + index}
								isOpen={openRowName === project.name}
								onToggle={() =>
									setOpenRowName(current =>
										current === project.name
											? null
											: project.name
									)
								}
							/>
						))}
					</Suspense>
				</div>

				<div
					className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-background to-transparent transition-opacity duration-500"
					style={{
						opacity: showAll ? 0 : 1,
						transitionTimingFunction: EASE_OUT_EXPO
					}}
				/>
			</div>

			<div>
				<button
					onClick={() => setShowAll(!showAll)}
					className="flex w-full items-center gap-2 px-2 py-2 text-xs text-muted-foreground transition-all duration-300 hover:text-foreground sm:px-3 focus-visible:outline-none focus-visible:bg-muted focus-visible:text-foreground"
					style={{ transitionTimingFunction: EASE_OUT_EXPO }}
				>
					<ToggleGlyph isOpen={showAll} />
					{showAll ? 'Show less' : `View all (${totalCount})`}
				</button>
			</div>
		</section>
	)
})
