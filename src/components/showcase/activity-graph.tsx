import { useId } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = {
	data: number[]
	className?: string
}

const WIDTH = 100
const HEIGHT = 32

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

export function ActivityGraph({ data, className }: Props) {
	const id = useId()
	const total = data.reduce((sum, value) => sum + value, 0)

	if (data.length < 2 || total === 0) return null

	const fillId = `${id}-fill`
	const strokeId = `${id}-stroke`
	const line = getLinePath(getPoints(smooth(data).map(Math.sqrt)))
	const area = `${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`

	return (
		<div
			className={cn(
				'pointer-events-none text-brand-500 opacity-70 transition-opacity duration-300 ease-out [mask-image:linear-gradient(to_right,transparent,black_45%)] group-hover:opacity-100',
				className
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
			<span className="sr-only">
				{total} commits in the past {data.length} weeks
			</span>
		</div>
	)
}
