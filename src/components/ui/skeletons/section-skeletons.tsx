import type { ReactNode } from 'react'
import { Skeleton } from './skeleton'
import { Section } from '@/components/ui/section'
import { Prose, Skill } from '@/components/ui/work-experience'
import type { ExperiencePositionItemType } from '@/components/ui/work-experience'
import { WORK_EXPERIENCE } from '@/components/home/work-experience-section'

import { AnimatedPlusIcon } from '@/components/animated-icons/icons/plus'

export function TechStackSkeleton() {
	const CARD_STYLES = [
		{
			className:
				'relative border-r border-b bg-secondary dark:bg-secondary/30',
			hasDecorator: true
		},
		{
			className: 'border-b md:border-r',
			hasDecorator: false
		},
		{
			className:
				'relative border-r border-b md:bg-secondary dark:md:bg-secondary/30',
			hasDecorator: true
		},
		{
			className:
				'relative border-b bg-secondary md:bg-background dark:bg-secondary/30 md:dark:bg-background',
			hasDecorator: false
		},
		{
			className:
				'relative border-r border-b bg-secondary md:border-b-0 md:bg-background dark:bg-secondary/30 md:dark:bg-background',
			hasDecorator: true
		},
		{
			className:
				'border-b bg-background md:border-r md:border-b-0 md:bg-secondary dark:md:bg-secondary/30',
			hasDecorator: false
		},
		{
			className: 'border-r border-b md:border-b-0',
			hasDecorator: false
		},
		{
			className:
				'bg-secondary dark:bg-secondary/30 border-b md:border-b-0',
			hasDecorator: false
		}
	]

	return (
		<div className="relative grid grid-cols-2 md:grid-cols-4">
			<div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-dvw border-t" />
			{Array.from({ length: 8 }).map((_, i) => {
				const style = CARD_STYLES[i] || {
					className: 'border-r border-b',
					hasDecorator: false
				}
				return (
					<div
						key={i}
						className={`flex items-center justify-center bg-background px-4 py-8 md:p-8 relative group min-h-[120px] ${style.className}`}
					>
						<div className="relative flex flex-col items-center gap-2 h-16 justify-end">
							<div className="relative h-10 w-10 flex items-center justify-center mb-1">
								<div className="w-8 h-8 md:w-10 md:h-10 bg-muted/20 rounded-sm animate-pulse will-change-opacity" />
							</div>
							<div className="h-4 flex items-center">
								<div className="h-2 w-14 bg-muted/20 rounded-sm animate-pulse will-change-opacity" />
							</div>
						</div>

						{style.hasDecorator && (
							<AnimatedPlusIcon
								className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-muted-foreground/50"
								strokeWidth={1}
								aria-hidden="true"
							/>
						)}
						{i === 2 && (
							<AnimatedPlusIcon
								className="-bottom-[12.5px] -left-[12.5px] absolute z-10 hidden size-6 md:block text-muted-foreground/50"
								strokeWidth={1}
								aria-hidden="true"
							/>
						)}
						{i === 4 && (
							<AnimatedPlusIcon
								className="-right-[12.5px] -bottom-[12.5px] md:-left-[12.5px] absolute z-10 size-6 md:hidden text-muted-foreground/50"
								strokeWidth={1}
								aria-hidden="true"
							/>
						)}
					</div>
				)
			})}
			<div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-dvw border-b" />
		</div>
	)
}

// Static arrays moved before functions that use them
const MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
] as const
const WEEKS = Array.from({ length: 53 }, (_, i) => i)
const DAYS = Array.from({ length: 7 }, (_, i) => i)
const LEGEND_OPACITIES = [0.2, 0.3, 0.5, 0.75, 1] as const

// LanguageStats skeleton matching actual structure
export function LanguageStatsSkeleton() {
	return (
		<section
			className="relative py-4 space-y-4"
			aria-busy="true"
			aria-label="Loading language stats"
		>
			{/* Header */}
			<div className="flex items-center justify-between gap-2 px-4">
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-5 w-24" />
			</div>

			{/* Skeleton rows */}
			{[1, 2, 3].map(i => (
				<div
					key={i}
					className="flex items-start gap-3 px-4 py-3 border border-border/30 bg-background/50 hover:bg-muted/30"
				>
					{/* Icon */}
					<div className="shrink-0">
						<div className="w-8 h-8 bg-muted/20 rounded-lg animate-pulse will-change-opacity" />
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0 space-y-2">
						<div className="flex items-center justify-between">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-12" />
						</div>

						<Skeleton className="h-3 w-16" />

						{/* Repos */}
						<div className="flex flex-wrap gap-1.5 mt-1.5">
							<Skeleton className="h-6 w-20 rounded-full will-change-opacity" />
							<Skeleton className="h-6 w-24 rounded-full will-change-opacity" />
							<Skeleton className="h-6 w-16 rounded-full will-change-opacity" />
						</div>
					</div>
				</div>
			))}
		</section>
	)
}

// Standalone contribution graph skeleton for comparison testing
export function ContributionGraphSkeleton() {
	return (
		<div
			className="space-y-2 w-full"
			role="img"
			aria-label="Loading contribution graph"
		>
			{/* Month labels row - evenly distributed, hidden from screen readers */}
			<div
				className="flex w-full text-[10px] text-muted-foreground/50 h-[15px]"
				aria-hidden="true"
			>
				{MONTHS.map(month => (
					<span key={month} className="flex-1">
						{month}
					</span>
				))}
			</div>

			{/* Grid - 53 weeks x 7 days, uses CSS grid for better performance */}
			<div
				className="grid w-full gap-[3px]"
				style={{ gridTemplateColumns: 'repeat(53, 1fr)' }}
				aria-hidden="true"
			>
				{WEEKS.map(weekIndex => (
					<div key={weekIndex} className="flex flex-col gap-[3px]">
						{DAYS.map(dayIndex => (
							<div
								key={dayIndex}
								className="w-full aspect-square rounded-[2px] bg-neutral-800/20 dark:bg-white/5"
							/>
						))}
					</div>
				))}
			</div>

			{/* Legend row */}
			<div
				className="flex items-center justify-between text-[10px] text-muted-foreground/50"
				aria-hidden="true"
			>
				<div className="flex items-center gap-[2px]">
					{LEGEND_OPACITIES.map((opacity, i) => (
						<div
							key={i}
							className="w-[10px] h-[10px] rounded-sm bg-brand-500"
							style={{ opacity }}
						/>
					))}
				</div>
				<Skeleton className="h-3 w-32" />
			</div>
		</div>
	)
}

export function BlogPostsSkeleton() {
	return (
		<section
			className="relative"
			aria-busy="true"
			aria-label="Loading blog posts"
		>
			<div className="full-width-header">
				<div className="header-content-container flex items-center justify-between header-content-container--with-padding">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-5 w-16" />
				</div>
			</div>

			<div className="px-4 md:px-5 pt-3 space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 justify-between py-3 border-b border-border/30 last:border-0"
					>
						<div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 min-w-0 flex-1">
							{/* Date placeholder */}
							<Skeleton className="h-4 w-24 shrink-0" />

							<div className="min-w-0 flex-1 space-y-2">
								{/* Title */}
								<Skeleton className="h-5 w-48" />
								{/* Summary */}
								<Skeleton className="h-4 w-full max-w-md hidden sm:block" />
							</div>
						</div>

						{/* Right side stats */}
						<div className="hidden sm:flex items-center gap-4">
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-3 w-12" />
						</div>
					</div>
				))}
			</div>
		</section>
	)
}

const RAIL_DASHES =
	'absolute left-3 w-px bg-[linear-gradient(to_bottom,currentColor_50%,transparent_50%)] bg-size-[1px_8px] text-border'

function TextBar({ children }: { children: ReactNode }) {
	return (
		<span className="animate-pulse rounded-sm bg-muted/30 text-transparent box-decoration-clone">
			{children}
		</span>
	)
}

function PositionSkeleton({
	position
}: {
	position: ExperiencePositionItemType
}) {
	const meta = [
		position.employmentPeriod,
		position.location,
		position.employmentType
	].filter(Boolean)
	const lines = (position.description ?? '')
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
	const bullets = lines.filter(line => line.startsWith('- '))
	const paragraphs = lines.filter(line => !line.startsWith('- '))

	return (
		<li className="relative pl-9 pt-2.5">
			<div className="block w-full px-3 py-1.5">
				<span className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h4 className="text-sm">
							<TextBar>{position.title}</TextBar>
						</h4>
						<p className="mt-0.5 font-mono text-[11px] tracking-tight">
							<TextBar>{meta.join(' · ')}</TextBar>
						</p>
					</div>
					<span className="mt-0.5 size-3.5 shrink-0" />
				</span>
				{position.isExpanded && (
					<div className="pb-1 pt-3">
						{position.description && (
							<Prose className="prose-li:before:text-muted-foreground/20">
								{paragraphs.map(paragraph => (
									<p key={paragraph}>
										<TextBar>{paragraph}</TextBar>
									</p>
								))}
								{bullets.length > 0 && (
									<ul>
										{bullets.map(bullet => (
											<li key={bullet}>
												<TextBar>
													{bullet.slice(2)}
												</TextBar>
											</li>
										))}
									</ul>
								)}
							</Prose>
						)}
						{position.skills && position.skills.length > 0 && (
							<div className="flex flex-wrap gap-1.5 pt-2">
								{position.skills.map(skill => (
									<Skill
										key={skill}
										className="animate-pulse border-transparent bg-muted/30 text-transparent hover:border-transparent hover:text-transparent"
									>
										{skill}
									</Skill>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</li>
	)
}

export function WorkExperienceSkeleton() {
	return (
		<Section animatedStripes title="Professional Experience">
			<div
				className="relative space-y-5 px-4 md:px-5 select-none"
				aria-busy="true"
				aria-label="Loading work experience"
			>
				{WORK_EXPERIENCE.map((experience, order) => {
					const hasNext = order < WORK_EXPERIENCE.length - 1

					return (
						<div
							key={experience.id}
							className="relative"
							aria-hidden="true"
						>
							{hasNext && (
								<span
									className={`${RAIL_DASHES} -bottom-5 top-6`}
								/>
							)}
							<div className="flex items-center gap-3">
								<div className="size-6 shrink-0 rounded-md border border-border bg-muted/20" />
								<h3 className="text-sm font-medium tracking-tight">
									<TextBar>{experience.companyName}</TextBar>
								</h3>
							</div>
							{experience.tagline && (
								<div className="relative pl-9 pt-0.5">
									{!hasNext && (
										<span
											className={`${RAIL_DASHES} bottom-0 top-0`}
										/>
									)}
									<p className="font-mono text-[11px] tracking-tight">
										<TextBar>{experience.tagline}</TextBar>
									</p>
								</div>
							)}
							<ul>
								{experience.positions.map(position => (
									<PositionSkeleton
										key={position.id}
										position={position}
									/>
								))}
							</ul>
						</div>
					)
				})}
			</div>
		</Section>
	)
}
