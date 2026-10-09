'use client'

import { cn } from '@/shared/lib/cn'
import { useInViewOnce } from '@/hooks/use-in-view-once'
import * as m from 'motion/react-m'
import {
	AnimatePresence,
	useReducedMotion,
	useMotionValueEvent,
	useScroll,
	useSpring,
	useTransform
} from 'motion/react'
import { ChevronDownIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export type ExperiencePositionItemType = {
	id: string
	title: string
	employmentPeriod: string
	employmentType?: string
	location?: string
	description?: string
	skills?: string[]
	isExpanded?: boolean
}

export type ExperienceItemType = {
	id: string
	companyName: string
	companyLogo?: string
	tagline?: React.ReactNode
	taglineArrowTo?: string
	taglineArrowLabel?: string
	positions: ExperiencePositionItemType[]
	isCurrentEmployer?: boolean
}

export function WorkExperience({
	className,
	experiences
}: {
	className?: string
	experiences: ExperienceItemType[]
}) {
	const ref = React.useRef<HTMLDivElement>(null)
	const activeId = useActivePosition(ref)

	return (
		<div
			ref={ref}
			className={cn('relative space-y-5 px-4 md:px-5', className)}
			id="work-experience"
		>
			<HandDrawnArrows containerRef={ref} />
			{experiences.map((experience, order) => (
				<ExperienceItem
					key={experience.id}
					experience={experience}
					hasNext={order < experiences.length - 1}
					activeId={activeId}
				/>
			))}
		</div>
	)
}

type ArrowGeometry = {
	key: string
	label?: string
	labelX: number
	labelY: number
	labelWidth: number
	body: string
	head: string
}

const ARROW_EDGE_INSET = 8
const ARROW_TEXT_CLEARANCE = 28
const LABEL_CHAR_WIDTH = 5.9

function measureArrow(container: HTMLElement, source: HTMLElement) {
	const target = container.querySelector<HTMLElement>(
		`#experience-${source.dataset.arrowTo} h3`
	)
	if (!target) return null

	const box = container.getBoundingClientRect()
	const from = source.getBoundingClientRect()
	const to = target.getBoundingClientRect()
	const sx = from.right - box.left + 8
	const sy = from.top + from.height / 2 - box.top
	const ex = to.right - box.left + 10
	const ey = to.top + to.height / 2 - box.top
	const edge = box.width - ARROW_EDGE_INSET
	const textRight = Array.from(
		container.querySelectorAll<HTMLElement>('h3, p, span, a')
	)
		.filter(
			line =>
				line.childElementCount === 0 &&
				line.textContent.trim() !== '' &&
				!line.closest('button')
		)
		.reduce((right, line) => {
			const range = document.createRange()
			range.selectNodeContents(line)
			const rect = range.getBoundingClientRect()
			const overlaps = rect.bottom > to.top && rect.top < from.bottom
			return overlaps ? Math.max(right, rect.right - box.left) : right
		}, 0)
	const bulge = Math.min(textRight + ARROW_TEXT_CLEARANCE, edge)
	const rise = sy - ey
	const label = source.dataset.arrowLabel
	const labelWidth = (label?.length ?? 0) * LABEL_CHAR_WIDTH
	const labelFitsBeside = bulge + 14 + labelWidth <= edge

	return {
		key: source.dataset.arrowTo ?? '',
		label,
		labelX: labelFitsBeside ? bulge + 14 : ex + 16,
		labelY: labelFitsBeside ? (sy + ey) / 2 : ey - 14,
		labelWidth,
		body: [
			`M${sx} ${sy}`,
			`C${sx + (bulge - sx) * 0.7} ${sy + 4}`,
			`${bulge + 4} ${sy - 10}`,
			`${bulge + 2} ${sy - rise * 0.6}`,
			`C${bulge} ${ey + 2}`,
			`${ex + 30} ${ey - 3}`,
			`${ex} ${ey}`
		].join(' '),
		head: `M${ex + 9} ${ey - 6} L${ex} ${ey} L${ex + 8} ${ey + 7}`
	}
}

function scribblePath(x: number, y: number, width: number) {
	const w = width
	return [
		`M${x - 2} ${y + 5}`,
		`C${x + w * 0.2} ${y + 2} ${x + w * 0.45} ${y + 9} ${x + w * 0.7} ${y + 5}`,
		`S${x + w * 0.95} ${y + 2} ${x + w + 4} ${y + 6}`,
		`C${x + w * 0.9} ${y + 10} ${x + w * 0.55} ${y + 8} ${x + w * 0.4} ${y + 11}`
	].join(' ')
}

function HandDrawnArrows({
	containerRef
}: {
	containerRef: React.RefObject<HTMLDivElement | null>
}) {
	const shouldReduceMotion = useReducedMotion()
	const [firstSource, setFirstSource] = React.useState<HTMLElement | null>(
		null
	)
	const sourceRef = React.useMemo(
		() => ({ current: firstSource }),
		[firstSource]
	)
	const [arrows, setArrows] = React.useState<ArrowGeometry[]>([])
	const isInView = useInViewOnce(sourceRef, '0px 0px -20% 0px')

	React.useEffect(() => {
		const container = containerRef.current
		if (!container) return
		let sources: HTMLElement[] = []

		function measure() {
			if (!container) return
			setArrows(
				sources
					.map(source => measureArrow(container, source))
					.filter(arrow => arrow !== null)
			)
		}

		const resizeObserver = new ResizeObserver(measure)

		function collect() {
			if (!container) return
			const next = Array.from(
				container.querySelectorAll<HTMLElement>('[data-arrow-to]')
			)
			for (const source of next) {
				if (!sources.includes(source)) resizeObserver.observe(source)
			}
			sources = next
			setFirstSource(sources[0] ?? null)
			measure()
		}

		resizeObserver.observe(container)
		collect()
		const mutationObserver = new MutationObserver(collect)
		mutationObserver.observe(container, { childList: true, subtree: true })
		return () => {
			resizeObserver.disconnect()
			mutationObserver.disconnect()
		}
	}, [containerRef])

	if (arrows.length === 0) return null

	const isDrawn = shouldReduceMotion || isInView

	return (
		<svg
			className="pointer-events-none absolute inset-0 size-full overflow-visible text-muted-foreground/70"
			fill="none"
			aria-hidden="true"
		>
			{arrows.map(arrow => (
				<g
					key={arrow.key}
					stroke="currentColor"
					strokeWidth={1.25}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<mask
						id={`arrow-mask-${arrow.key}`}
						maskUnits="userSpaceOnUse"
						x="-50%"
						y="-50%"
						width="200%"
						height="200%"
					>
						<m.path
							d={arrow.body}
							stroke="white"
							strokeWidth={6}
							initial={false}
							animate={{ pathLength: isDrawn ? 1 : 0 }}
							transition={
								shouldReduceMotion
									? { duration: 0 }
									: {
											duration: 1.1,
											ease: [0.65, 0, 0.35, 1]
										}
							}
						/>
					</mask>
					<path
						className="arrow-dash"
						d={arrow.body}
						strokeDasharray="5 5"
						mask={`url(#arrow-mask-${arrow.key})`}
					/>
					{arrow.label && (
						<m.text
							x={arrow.labelX}
							y={arrow.labelY}
							fill="currentColor"
							stroke="none"
							className="font-hand text-[17px] font-medium"
							initial={false}
							animate={{
								clipPath: isDrawn
									? 'inset(-20% -5% -20% 0)'
									: 'inset(-20% 105% -20% 0)'
							}}
							transition={
								shouldReduceMotion
									? { duration: 0 }
									: {
											duration:
												arrow.label.length * 0.045,
											delay: 0.5,
											ease: 'linear'
										}
							}
						>
							{arrow.label}
						</m.text>
					)}
					{arrow.label && (
						<m.path
							d={scribblePath(
								arrow.labelX,
								arrow.labelY,
								arrow.labelWidth
							)}
							strokeWidth={1}
							initial={false}
							animate={{ pathLength: isDrawn ? 1 : 0 }}
							transition={
								shouldReduceMotion
									? { duration: 0 }
									: {
											duration: 0.4,
											delay:
												0.55 +
												arrow.label.length * 0.045,
											ease: 'easeInOut'
										}
							}
						/>
					)}
					<m.path
						d={arrow.head}
						initial={false}
						animate={{ pathLength: isDrawn ? 1 : 0 }}
						transition={
							shouldReduceMotion
								? { duration: 0 }
								: {
										duration: 0.25,
										delay: 1.05,
										ease: 'easeOut'
									}
						}
					/>
				</g>
			))}
		</svg>
	)
}

function useActivePosition(ref: React.RefObject<HTMLElement | null>) {
	const { scrollY } = useScroll()
	const [activeId, setActiveId] = React.useState<string | null>(null)

	function update() {
		const container = ref.current
		if (!container) return
		const line = window.innerHeight * READING_LINE
		const items =
			container.querySelectorAll<HTMLElement>('[data-position-id]')
		let next: string | null = null
		if (container.getBoundingClientRect().bottom > line) {
			for (const item of items) {
				if (item.getBoundingClientRect().top > line) break
				next = item.dataset.positionId ?? null
			}
		}
		setActiveId(next)
	}

	useMotionValueEvent(scrollY, 'change', update)
	React.useEffect(update, [])

	return activeId
}

export function Term({
	children,
	explanation
}: {
	children: React.ReactNode
	explanation: string
}) {
	const tooltipId = React.useId()

	return (
		<span
			tabIndex={0}
			aria-describedby={tooltipId}
			className="group/term relative cursor-help underline decoration-muted-foreground/60 decoration-wavy decoration-1 underline-offset-[3px] outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
		>
			{children}
			<span
				id={tooltipId}
				role="tooltip"
				className="pointer-events-auto absolute bottom-full left-1/2 z-10 w-max max-w-64 -translate-x-1/2 translate-y-0.5 select-text rounded-sm border border-border bg-popover px-2 py-1 font-sans text-xs tracking-normal text-popover-foreground opacity-0 shadow-sm transition-[opacity,translate] duration-150 ease-out group-hover/term:translate-y-0 group-hover/term:opacity-100 group-focus-visible/term:translate-y-0 group-focus-visible/term:opacity-100"
			>
				{explanation}
			</span>
		</span>
	)
}

function CompanyAvatar({ experience }: { experience: ExperienceItemType }) {
	return (
		<div className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
			{experience.companyLogo ? (
				<Image
					src={experience.companyLogo}
					alt=""
					width={24}
					height={24}
					className="size-full object-cover"
				/>
			) : (
				<span className="font-mono text-[10px] font-medium text-muted-foreground">
					{experience.companyName.charAt(0).toUpperCase()}
				</span>
			)}
		</div>
	)
}

const RAIL_DASHES =
	'absolute inset-0 bg-[linear-gradient(to_bottom,currentColor_50%,transparent_50%)] bg-size-[1px_8px]'
const DASH_PERIOD = 8
const DASH_SPEED = 0.15
const DASH_SPRING = { stiffness: 40, damping: 18, mass: 0.6 }

function useDashFlow() {
	const { scrollY } = useScroll()
	const distance = useSpring(
		useTransform(scrollY, value => value * DASH_SPEED),
		DASH_SPRING
	)

	return useTransform(distance, value => value % DASH_PERIOD)
}

const READING_LINE = 0.7
const GLOW_RADIUS = 48

function useReadingGlow(ref: React.RefObject<Element | null>) {
	const { scrollY } = useScroll()

	return useTransform(scrollY, () => {
		const top = ref.current?.getBoundingClientRect().top
		if (top === undefined)
			return 'linear-gradient(transparent, transparent)'
		const line = window.innerHeight * READING_LINE - top

		return `linear-gradient(to bottom, transparent ${line - GLOW_RADIUS}px, black ${line}px, transparent ${line + GLOW_RADIUS}px)`
	})
}

function useDrawProgress(
	ref: React.RefObject<HTMLElement | null>,
	end: `end ${number}%` = 'end 70%'
) {
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ['start 70%', end]
	})
	const tipOpacity = useTransform(
		scrollYProgress,
		[0, 0.05, 0.9, 1],
		[0, 1, 1, 0]
	)

	return { progress: scrollYProgress, tipOpacity }
}

function Rail({ className }: { className: string }) {
	const ref = React.useRef<HTMLSpanElement>(null)
	const shouldReduceMotion = useReducedMotion()
	const { progress, tipOpacity } = useDrawProgress(ref)
	const tipTop = useTransform(progress, value => `${value * 100}%`)
	const dashFlow = useDashFlow()
	const backgroundPositionY = useTransform(dashFlow, value => `${value}px`)
	const maskImage = useReadingGlow(ref)

	return (
		<span
			ref={ref}
			className={cn('absolute left-3 w-px', className)}
			aria-hidden="true"
		>
			<m.span
				className={cn(RAIL_DASHES, 'text-border')}
				style={shouldReduceMotion ? undefined : { backgroundPositionY }}
			/>
			{!shouldReduceMotion && (
				<>
					<m.span
						className={cn(RAIL_DASHES, 'text-foreground/70')}
						style={{ backgroundPositionY, maskImage }}
					/>
					<m.span
						className="absolute -left-px size-[3px] -translate-y-1/2 rounded-full bg-foreground/70"
						style={{ top: tipTop, opacity: tipOpacity }}
					/>
				</>
			)}
		</span>
	)
}

export function ExperienceItem({
	experience,
	hasNext = false,
	activeId = null
}: {
	experience: ExperienceItemType
	hasNext?: boolean
	activeId?: string | null
}) {
	return (
		<div
			id={`experience-${experience.id}`}
			className="relative scroll-mt-24"
		>
			{hasNext && <Rail className="-bottom-5 top-6" />}
			<div className="flex items-center gap-3">
				<CompanyAvatar experience={experience} />
				<h3 className="text-sm font-medium tracking-tight text-foreground">
					{experience.companyName}
				</h3>
				{experience.isCurrentEmployer && (
					<span className="relative flex size-1.5" title="Current">
						<span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
						<span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
						<span className="sr-only">Current employer</span>
					</span>
				)}
			</div>
			{experience.tagline && (
				<div className="relative pl-9 pt-0.5">
					{!hasNext && <Rail className="bottom-0 top-0" />}
					<p className="font-mono text-[11px] tracking-tight text-muted-foreground">
						<span
							data-arrow-to={experience.taglineArrowTo}
							data-arrow-label={experience.taglineArrowLabel}
						>
							{experience.tagline}
						</span>
					</p>
				</div>
			)}

			<ul>
				{experience.positions.map((position, index) => (
					<ExperiencePositionItem
						key={position.id}
						position={position}
						hasRail={
							!hasNext && index < experience.positions.length - 1
						}
						isCurrent={experience.isCurrentEmployer}
						isActive={position.id === activeId}
					/>
				))}
			</ul>
		</div>
	)
}

const ELBOW_PATH = 'M0.5 0 V20 Q0.5 25.5 6 25.5 H28'

function Connector({
	hasRail,
	isCurrent,
	isActive
}: {
	hasRail: boolean
	isCurrent: boolean
	isActive: boolean
}) {
	const ref = React.useRef<HTMLSpanElement>(null)
	const shouldReduceMotion = useReducedMotion()
	const { progress, tipOpacity } = useDrawProgress(ref, 'end 60%')
	const tipDistance = useTransform(progress, value => `${value * 100}%`)
	const dashFlow = useDashFlow()
	const strokeDashoffset = useTransform(dashFlow, value => -value)
	const maskImage = useReadingGlow(ref)

	return (
		<>
			<span
				ref={ref}
				className="pointer-events-none absolute left-3 top-0 h-[26px] w-7"
				aria-hidden="true"
			>
				<svg
					className="size-full overflow-visible"
					viewBox="0 0 28 26"
					fill="none"
				>
					<m.path
						d={ELBOW_PATH}
						style={
							shouldReduceMotion
								? undefined
								: { strokeDashoffset }
						}
						className={cn(
							'transition-[stroke] duration-200 ease-out',
							isActive ? 'stroke-foreground/50' : 'stroke-border',
							'group-has-[[role=button]:hover]/position:stroke-foreground/50 group-has-[[role=button]:focus-visible]/position:stroke-foreground/50'
						)}
						strokeWidth={1}
						strokeDasharray="4 4"
					/>
					{!shouldReduceMotion && (
						<>
							<m.circle
								r={1.5}
								className={
									isCurrent
										? 'fill-emerald-500'
										: 'fill-foreground/70'
								}
								style={{
									offsetPath: `path('${ELBOW_PATH}')`,
									offsetDistance: tipDistance,
									opacity: tipOpacity
								}}
							/>
						</>
					)}
				</svg>
				{!shouldReduceMotion && (
					<m.svg
						className="absolute inset-0 size-full overflow-visible"
						viewBox="0 0 28 26"
						fill="none"
						style={{ maskImage }}
					>
						<m.path
							d={ELBOW_PATH}
							style={{ strokeDashoffset }}
							className="stroke-foreground/70"
							strokeWidth={1}
							strokeDasharray="4 4"
						/>
					</m.svg>
				)}
			</span>
			{hasRail && <Rail className="bottom-0 top-0" />}
		</>
	)
}

export function ExperiencePositionItem({
	position,
	hasRail = false,
	isCurrent = false,
	isActive = false
}: {
	position: ExperiencePositionItemType
	hasRail?: boolean
	isCurrent?: boolean
	isActive?: boolean
}) {
	const hasContent =
		Boolean(position.description?.trim()) ||
		(position.skills?.length ?? 0) > 0
	const [isOpen, setIsOpen] = React.useState(position.isExpanded ?? false)
	const contentId = React.useId()

	const meta = [
		position.employmentPeriod,
		position.location,
		position.employmentType
	].filter(Boolean)

	const header = (
		<div className="min-w-0">
			<h4 className="text-sm text-foreground">{position.title}</h4>
			<p
				className={cn(
					'mt-0.5 font-mono text-[11px] tracking-tight transition-colors duration-150 ease-out group-hover/header:text-foreground/80 group-focus-visible/header:text-foreground/80',
					isActive ? 'text-foreground/80' : 'text-muted-foreground'
				)}
			>
				{meta.join(' · ')}
			</p>
		</div>
	)

	return (
		<li
			data-position-id={position.id}
			className="group/position relative pl-9 pt-2.5"
		>
			<Connector
				hasRail={hasRail}
				isCurrent={isCurrent}
				isActive={isActive}
			/>

			{hasContent ? (
				<div
					role="button"
					tabIndex={0}
					className="group/header block w-full cursor-pointer rounded-sm px-3 py-1.5 text-left outline-none"
					aria-expanded={isOpen}
					aria-controls={contentId}
					onClick={() => setIsOpen(!isOpen)}
					onKeyDown={event => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault()
							setIsOpen(!isOpen)
						}
					}}
				>
					<span className="flex items-start justify-between gap-3">
						{header}
						<ChevronDownIcon
							className={cn(
								'mt-0.5 size-3.5 shrink-0 text-muted-foreground/60 transition-[rotate,color] duration-200 ease-out group-hover/header:text-foreground group-focus-visible/header:text-foreground',
								isOpen && 'rotate-180'
							)}
							aria-hidden="true"
						/>
					</span>
					<AnimatePresence initial={false}>
						{isOpen && (
							<m.div
								id={contentId}
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: 'auto', opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{
									duration: 0.2,
									ease: [0.16, 1, 0.3, 1]
								}}
								className="block overflow-hidden"
							>
								<div className="pb-1 pt-3">
									{position.description && (
										<Prose>
											<Description
												text={position.description}
											/>
										</Prose>
									)}
									{position.skills &&
										position.skills.length > 0 && (
											<SkillsList
												skills={position.skills}
											/>
										)}
								</div>
							</m.div>
						)}
					</AnimatePresence>
				</div>
			) : (
				<div className="px-3 py-1.5">{header}</div>
			)}
		</li>
	)
}

function SkillsList({ skills }: { skills: string[] }) {
	return (
		<div className="flex flex-wrap gap-1.5 pt-2">
			{skills.map(skill => (
				<Skill key={skill}>{skill}</Skill>
			))}
		</div>
	)
}

function Description({ text }: { text: string }) {
	const lines = text
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
	const bullets = lines.filter(line => line.startsWith('- '))
	const paragraphs = lines.filter(line => !line.startsWith('- '))

	return (
		<>
			{paragraphs.map(paragraph => (
				<p key={paragraph}>{paragraph}</p>
			))}
			{bullets.length > 0 && (
				<ul>
					{bullets.map(bullet => (
						<li key={bullet}>{bullet.slice(2)}</li>
					))}
				</ul>
			)}
		</>
	)
}

function Prose({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'prose prose-sm max-w-none text-muted-foreground prose-zinc dark:prose-invert',
				'prose-p:leading-6 prose-p:my-1.5',
				'prose-ul:m-0 prose-ul:p-0 prose-ul:list-none',
				"prose-li:relative prose-li:pl-4 prose-li:my-0 prose-li:leading-6 prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[9px] prose-li:before:text-[9px] prose-li:before:leading-none prose-li:before:font-mono prose-li:before:text-muted-foreground/40 prose-li:before:content-['+']",
				'prose-a:font-medium prose-a:text-foreground prose-a:underline prose-a:underline-offset-4',
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}

function Skill({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			className={cn(
				'inline-flex items-center border border-foreground/10 px-2 py-0.5 text-[11px] text-foreground/80 transition-colors hover:border-foreground/20 hover:text-foreground',
				className
			)}
			style={{
				backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 2px, hsl(var(--foreground) / 0.05) 2px, hsl(var(--foreground) / 0.05) 3px)`
			}}
			{...props}
		/>
	)
}
