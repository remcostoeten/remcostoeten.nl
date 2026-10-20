'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import NumberFlow, { NumberFlowGroup } from '@number-flow/react'
import { cn } from '@/shared/lib/cn'
import { useInViewOnce } from '@/hooks/use-in-view-once'

type Props = {
	data: number[]
	isWide?: boolean
	className?: string
}

type Hover = {
	index: number
	rect: DOMRect
	isActive: boolean
	isFresh: boolean
}

const WIDTH = 100
const HEIGHT = 32
const MIN_WEEKS = 12

const numberTiming = {
	duration: 450,
	easing: 'cubic-bezier(0.23, 1, 0.32, 1)'
}

const EASE =
	'duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity'

function trimLeadingQuietWeeks(data: number[]) {
	const firstActive = data.findIndex(value => value > 0)
	const start = Math.max(
		0,
		Math.min(firstActive - 1, data.length - MIN_WEEKS)
	)
	return data.slice(start)
}

function smooth(data: number[]) {
	return data.map((_, index) => {
		const window = data.slice(Math.max(0, index - 1), index + 2)
		return window.reduce((sum, value) => sum + value, 0) / window.length
	})
}

function getPoints(data: number[]) {
	const max = Math.max(...data, 1)
	const step = WIDTH / (data.length - 1)
	return data.map((value, index) => ({
		x: index * step,
		y: HEIGHT - (value / max) * (HEIGHT - 2) - 1
	}))
}

function getLinePath(points: { x: number; y: number }[]) {
	return points.reduce((path, point, index) => {
		if (index === 0) return `M${point.x} ${point.y}`
		const previous = points[index - 1]
		const midX = (previous.x + point.x) / 2
		return `${path} C${midX} ${previous.y} ${midX} ${point.y} ${point.x} ${point.y}`
	}, '')
}

export function ActivityGraph({
	data: allWeeks,
	isWide = false,
	className
}: Props) {
	const id = useId()
	const ref = useRef<HTMLDivElement>(null)
	const isDrawn = useInViewOnce(ref, '0px 0px -15% 0px')
	const [hover, setHover] = useState<Hover | null>(null)
	const data = trimLeadingQuietWeeks(allWeeks)
	const total = data.reduce((sum, value) => sum + value, 0)
	const weekCount = data.length

	useEffect(() => {
		const host = ref.current?.closest<HTMLElement>('.group')
		if (!host || weekCount < 2) return

		function clear() {
			setHover(current =>
				current?.isActive ? { ...current, isActive: false } : current
			)
		}

		function track(event: PointerEvent) {
			const rect = ref.current?.getBoundingClientRect()
			if (!rect || event.pointerType === 'touch') return
			const isInside =
				event.clientX >= rect.left &&
				event.clientX <= rect.right &&
				event.clientY >= rect.top &&
				event.clientY <= rect.bottom
			if (!isInside) {
				clear()
				return
			}
			const ratio = (event.clientX - rect.left) / rect.width
			const index = Math.round(ratio * (weekCount - 1))
			setHover(current =>
				current?.isActive && current.index === index
					? current
					: {
							index,
							rect,
							isActive: true,
							isFresh: !current?.isActive
						}
			)
		}

		host.addEventListener('pointermove', track, { passive: true })
		host.addEventListener('pointerleave', clear)
		window.addEventListener('scroll', clear, {
			passive: true,
			capture: true
		})
		return () => {
			host.removeEventListener('pointermove', track)
			host.removeEventListener('pointerleave', clear)
			window.removeEventListener('scroll', clear, { capture: true })
		}
	}, [weekCount])

	if (data.length < 2 || total === 0) return null

	const fillId = `${id}-fill`
	const strokeId = `${id}-stroke`
	const points = getPoints(smooth(data).map(Math.sqrt))
	const line = getLinePath(points)
	const area = `${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`
	const point = hover ? points[hover.index] : undefined
	const ratio = point ? point.x / WIDTH : 0
	const x = hover ? ratio * hover.rect.width : 0
	const y = hover && point ? (point.y / HEIGHT) * hover.rect.height : 0
	const commits = hover ? (data[hover.index] ?? 0) : 0
	const weeksAgo = hover ? data.length - 1 - hover.index : 0
	const recentLabel = weeksAgo === 0 ? 'this week' : 'last week'
	const glide = hover?.isFresh
		? 'transition-opacity'
		: 'transition-[opacity,translate]'

	return (
		<div
			ref={ref}
			className={cn(
				'pointer-events-none relative text-brand-500',
				className
			)}
		>
			<div
				data-drawn={isDrawn || undefined}
				className={cn(
					'size-full opacity-70 [clip-path:inset(0_100%_0_0)] [mask-image:linear-gradient(to_right,transparent,black_45%)] [transition:opacity_300ms_ease-out,clip-path_1200ms_cubic-bezier(0.65,0,0.35,1)] group-hover:opacity-100 data-drawn:[clip-path:inset(0)] motion-reduce:[clip-path:none]',
					isWide &&
						'sm:[mask-image:linear-gradient(to_right,transparent,black_12%)]'
				)}
			>
				<svg
					viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
					preserveAspectRatio="none"
					className="size-full overflow-visible"
					aria-hidden="true"
				>
					<defs>
						<linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
							<stop
								offset="0%"
								stopColor="currentColor"
								stopOpacity={0.22}
							/>
							<stop
								offset="100%"
								stopColor="currentColor"
								stopOpacity={0}
							/>
						</linearGradient>
						<linearGradient
							id={strokeId}
							gradientUnits="userSpaceOnUse"
							x1="0"
							x2={WIDTH}
							y1="0"
							y2="0"
						>
							<stop
								offset="0%"
								stopColor="currentColor"
								stopOpacity={0.15}
							/>
							<stop
								offset="100%"
								stopColor="currentColor"
								stopOpacity={0.9}
							/>
						</linearGradient>
					</defs>
					<path d={area} fill={`url(#${fillId})`} />
					<path
						d={line}
						fill="none"
						stroke={`url(#${strokeId})`}
						strokeWidth={1.25}
						strokeLinecap="round"
						vectorEffect="non-scaling-stroke"
						className="[filter:drop-shadow(0_0_3px_hsl(var(--brand-500)/0.55))]"
					/>
				</svg>
			</div>
			{hover && point && (
				<>
					<span
						className={cn(
							'absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent to-current',
							glide,
							EASE,
							hover.isActive ? 'opacity-50' : 'opacity-0'
						)}
						style={{ translate: `${x}px 0` }}
					/>
					<span
						className={cn(
							'absolute left-0 top-0 -ml-0.75 -mt-0.75 size-1.5 rounded-full bg-current shadow-[0_0_6px_hsl(var(--brand-500)/0.7)] ring-2 ring-card',
							glide,
							EASE,
							hover.isActive ? 'opacity-100' : 'opacity-0'
						)}
						style={{ translate: `${x}px ${y}px` }}
					/>
					{createPortal(
						<div
							aria-hidden="true"
							className={cn(
								'pointer-events-none fixed left-0 top-0 z-50',
								!hover.isFresh && 'transition-[translate]',
								EASE
							)}
							style={{
								translate: `${hover.rect.left + x}px ${hover.rect.top}px`
							}}
						>
							<div
								className={cn(
									'w-max whitespace-nowrap rounded-sm border border-border bg-popover px-2 py-1 font-mono text-[10px] tabular-nums text-muted-foreground shadow-sm',
									hover.isFresh
										? 'transition-[opacity,scale]'
										: 'transition-[opacity,scale,translate]',
									EASE,
									hover.isActive
										? 'scale-100 opacity-100'
										: 'scale-95 opacity-0'
								)}
								style={{
									translate: `${-ratio * 100}% calc(-100% - 6px)`,
									transformOrigin: `${ratio * 100}% 100%`
								}}
							>
								<NumberFlowGroup>
									<span className="text-popover-foreground">
										<NumberFlow
											value={commits}
											transformTiming={numberTiming}
											spinTiming={numberTiming}
											willChange
										/>
									</span>{' '}
									{commits === 1 ? 'commit' : 'commits'}
									<span className="text-muted-foreground/40">
										{' / '}
									</span>
									{weeksAgo > 1 ? (
										<>
											<NumberFlow
												value={weeksAgo}
												transformTiming={numberTiming}
												spinTiming={numberTiming}
												willChange
											/>{' '}
											weeks ago
										</>
									) : (
										recentLabel
									)}
								</NumberFlowGroup>
							</div>
						</div>,
						document.body
					)}
				</>
			)}
			<span className="sr-only">
				{total} commits in the past {data.length} weeks
			</span>
		</div>
	)
}
