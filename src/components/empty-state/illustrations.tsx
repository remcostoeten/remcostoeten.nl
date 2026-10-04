'use client'

import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'

export type IllustrationLoop = 'float' | 'spread' | 'pulse'

export type IllustrationProps = ComponentPropsWithoutRef<'div'> & {
	loop?: boolean | IllustrationLoop
}

const frame =
	'h-30 w-50 text-current [&>svg]:size-full [&>svg]:overflow-visible'
const wave =
	'origin-bottom [transform-box:fill-box] motion-safe:in-data-loop:animate-[esi-bar_3.2s_cubic-bezier(0.77,0,0.175,1)_calc(var(--esi-n)*250ms)_infinite]'
const lift =
	'motion-safe:in-data-loop:animate-[esi-lift_3s_cubic-bezier(0.77,0,0.175,1)_infinite]'
const march =
	'motion-safe:in-data-loop:animate-[esi-march_1.6s_linear_infinite]'
const keyframes =
	'@keyframes esi-scan{0%,15%{translate:0 0}25%,40%{translate:14px 7px}50%,65%{translate:0 14px}75%,90%{translate:-14px 7px}}@keyframes esi-bar{50%{scale:1 0.72}}@keyframes esi-march{to{stroke-dashoffset:-8}}@keyframes esi-lift{50%{translate:0 -3px}}@keyframes esi-stack-float{50%{translate:0 calc(var(--esi-k,1)*-2.5px)}}@keyframes esi-stack-spread{50%{translate:calc((var(--esi-n) - 1)*var(--esi-k,1)*3px) calc((var(--esi-n) - 1)*var(--esi-k,1)*1.33px)}}@keyframes esi-stack-pulse{50%{opacity:1}}@keyframes esi-record-spread{50%{translate:0 calc((var(--esi-n) - 1)*3px)}}@keyframes esi-record-pulse{50%{opacity:0.4}}@keyframes esi-cube-spread{50%{translate:calc((var(--esi-n) - 1)*4px) calc((var(--esi-n) - 1)*-2.3px)}}@keyframes esi-cube-pulse{50%{opacity:0.35}}@keyframes esi-dot{50%{opacity:0.32}}@keyframes esi-insert{50%{translate:6px -3px}}@keyframes esi-swing{25%{rotate:5deg}75%{rotate:-5deg}}@keyframes esi-fade{50%{opacity:0.3}}@keyframes esi-travel{0%{translate:0 -20px;opacity:0}10%,90%{opacity:1}100%{translate:0 60px;opacity:0}}@keyframes esi-ring{0%,60%,100%{rotate:0deg}68%{rotate:8deg}76%{rotate:-6deg}84%{rotate:4deg}92%{rotate:-2deg}}@keyframes esi-type{30%{translate:0 -2.5px}60%{translate:0 0}}@keyframes esi-signal{30%,55%{stroke-opacity:0.75;stroke-dasharray:2 0}}'
const variantLoop =
	'motion-safe:[animation:var(--esi-loop,none)_3.6s_cubic-bezier(0.77,0,0.175,1)_calc(var(--esi-step,0ms)*var(--esi-n))_infinite]'
const stackLoop = `in-data-[loop=float]:[--esi-loop:esi-stack-float] in-data-[loop=float]:[--esi-step:180ms] in-data-[loop=spread]:[--esi-loop:esi-stack-spread] in-data-[loop=pulse]:[--esi-loop:esi-stack-pulse] in-data-[loop=pulse]:[--esi-step:450ms] ${variantLoop}`
const recordLoop = `in-data-[loop=float]:[--esi-loop:esi-lift] in-data-[loop=float]:[--esi-step:200ms] in-data-[loop=spread]:[--esi-loop:esi-record-spread] ${variantLoop}`
const recordLine =
	'fill-[color-mix(in_srgb,var(--es-border)_65%,var(--es-surface))] motion-safe:in-data-[loop=pulse]:animate-[esi-record-pulse_2.4s_cubic-bezier(0.77,0,0.175,1)_calc(var(--esi-n)*300ms)_infinite]'
const cubeVariants =
	'in-data-[loop=float]:[--esi-loop:esi-lift] in-data-[loop=float]:[--esi-step:200ms] in-data-[loop=spread]:[--esi-loop:esi-cube-spread] in-data-[loop=pulse]:[--esi-loop:esi-cube-pulse] in-data-[loop=pulse]:[--esi-step:450ms]'
const orders = ['[--esi-n:0]', '[--esi-n:1]', '[--esi-n:2]']
const layerOutline =
	'M42.2538 2.046C41.4408 1.6325 40.3965 1.6677 39.2612 2.2424L7.9616 18.1934C5.3895 19.5039 3.301 23.1064 3.301 26.2322V64.3226C3.301 66.0677 3.9458 67.2943 4.962 67.8199L1.8363 66.229C0.8201 65.7104 0.1753 64.4771 0.1753 62.732V24.6412C0.1753 21.5085 2.2638 17.913 4.8359 16.6024L36.1355 0.6515C37.2778 0.0698 38.322 0.0416 39.128 0.4551L42.2538 2.046Z'
const layerFace =
	'M42.2545 2.0456C43.2707 2.5643 43.9155 3.7979 43.9155 5.543V43.6337C43.9155 46.7665 41.827 50.3616 39.2549 51.6722L7.9554 67.6235C6.813 68.2052 5.7687 68.2331 4.9628 67.8196C3.9465 67.301 3.3018 66.0673 3.3018 64.3222V26.2318C3.3018 23.0991 5.3903 19.5036 7.9624 18.193L39.2619 2.2421C40.4043 1.6604 41.4486 1.6321 42.2545 2.0456Z'
const layers = [
	{ x: 0, y: 0, opacity: 0.4, strokeOpacity: 0.2, order: '[--esi-n:0]' },
	{
		x: 13.65,
		y: 6.04,
		opacity: 0.6,
		strokeOpacity: 0.2,
		order: '[--esi-n:1]'
	},
	{
		x: 27.32,
		y: 12.08,
		opacity: 0.8,
		strokeOpacity: 0.3,
		order: '[--esi-n:2]'
	}
]

const gridLines = [
	{ x1: 40, y1: 0, x2: 40, y2: 140 },
	{ x1: 110, y1: 0, x2: 110, y2: 140 },
	{ x1: 180, y1: 0, x2: 180, y2: 140 },
	{ x1: 0, y1: 25, x2: 220, y2: 25 },
	{ x1: 0, y1: 70, x2: 220, y2: 70 },
	{ x1: 0, y1: 115, x2: 220, y2: 115 }
]
const cubes = [
	{ x: 89, y: 82, outline: 0.28, edges: 0.18 },
	{ x: 110, y: 70, outline: 0.38, edges: 0.25 },
	{ x: 131, y: 58, outline: 0.5, edges: 0.35 }
]
const dots = [
	{ cx: 40, cy: 70, opacity: 0.1 },
	{ cx: 180, cy: 70, opacity: 0.1 },
	{ cx: 110, cy: 25, opacity: 0.07 }
]

function hexagon(x: number, y: number) {
	return [
		[x, y - 24],
		[x + 21, y - 12],
		[x + 21, y + 12],
		[x, y + 24],
		[x - 21, y + 12],
		[x - 21, y - 12]
	]
		.map(point => point.join(','))
		.join(' ')
}

const tileLines = [0, 1, 2, 3].flatMap(n => [
	{ x1: 80 + 14 * n, y1: 27 + 7 * n, x2: 38 + 14 * n, y2: 48 + 7 * n },
	{ x1: 80 - 14 * n, y1: 27 + 7 * n, x2: 122 - 14 * n, y2: 48 + 7 * n }
])
const columns = [
	{ x: 52, y: 45, height: 16, order: '[--esi-n:0]' },
	{ x: 78, y: 58, height: 34, order: '[--esi-n:1]' },
	{ x: 104, y: 71, height: 24, order: '[--esi-n:2]' }
]
const dropGuides = [
	{ x: 52, y1: 32, y2: 64 },
	{ x: 108, y1: 36, y2: 68 },
	{ x: 84, y1: 48, y2: 80 }
]

function columnOutline(x: number, y: number, height: number) {
	const top = y - height
	return `M${x - 10} ${y}V${top}L${x} ${top - 5}L${x + 10} ${top}V${y}M${x - 10} ${top}L${x} ${top + 5}L${x + 10} ${top}M${x} ${top + 5}V${y + 5}`
}

function columnBase(x: number, y: number) {
	return `${x},${y - 5} ${x + 10},${y} ${x},${y + 5} ${x - 10},${y}`
}

export function FolderIcon(props: ComponentPropsWithoutRef<'svg'>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
		</svg>
	)
}

export function KeyIcon(props: ComponentPropsWithoutRef<'svg'>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
			<path d="m21 2-9.6 9.6" />
			<circle cx="7.5" cy="15.5" r="5.5" />
		</svg>
	)
}

export function BuildingIcon(props: ComponentPropsWithoutRef<'svg'>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path d="M10 12h4" />
			<path d="M10 8h4" />
			<path d="M14 21v-3a2 2 0 0 0-4 0v3" />
			<path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
			<path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
		</svg>
	)
}

export function RecordIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	const fadeId = useId()

	return (
		<div
			{...props}
			className={`h-24 w-52 ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 208 96"
				fill="none"
				className="block size-full overflow-visible"
			>
				<style>{keyframes}</style>
				<defs>
					<linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
						<stop
							className="[stop-color:var(--es-background)]"
							offset="0"
							stopOpacity="0"
						/>
						<stop
							className="[stop-color:var(--es-background)]"
							offset="1"
						/>
					</linearGradient>
				</defs>
				<g className={`[--esi-n:0] ${recordLoop}`}>
					<rect
						className="fill-[color-mix(in_srgb,var(--es-border)_20%,var(--es-surface))] stroke-(color:--es-border)"
						x="24.5"
						y="0.5"
						width="159"
						height="31"
						rx="6.5"
					/>
				</g>
				<g className={`[--esi-n:1] ${recordLoop}`}>
					<rect
						className="fill-[color-mix(in_srgb,var(--es-border)_12%,var(--es-surface))] stroke-(color:--es-border)"
						x="12.5"
						y="12.5"
						width="183"
						height="31"
						rx="6.5"
					/>
				</g>
				<g className={`[--esi-n:2] ${recordLoop}`}>
					<rect
						className="fill-(--es-surface) stroke-(color:--es-border) [filter:drop-shadow(0_2px_3px_rgb(0_0_0/0.025))]"
						x="0.5"
						y="24.5"
						width="207"
						height="63"
						rx="6.5"
					/>
					<rect
						className={`[--esi-n:0] ${recordLine}`}
						x="17"
						y="40"
						width="32"
						height="32"
						rx="4"
					/>
					<rect
						className={`[--esi-n:1] ${recordLine}`}
						x="61"
						y="45"
						width="97.5"
						height="9"
						rx="3"
					/>
					<rect
						className={`opacity-65 [--esi-n:2] ${recordLine}`}
						x="61"
						y="60"
						width="65"
						height="7"
						rx="3"
					/>
				</g>
				<rect y="72" width="208" height="24" fill={`url(#${fadeId})`} />
			</svg>
		</div>
	)
}

export function ProjectIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	return (
		<div
			{...props}
			className={`h-32 w-54 text-current ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 220 140"
				fill="none"
				stroke="currentColor"
				className="block size-full"
			>
				<style>{keyframes}</style>
				{gridLines.map(line => (
					<line
						key={`${line.x1}-${line.y1}`}
						{...line}
						strokeOpacity="0.05"
						strokeWidth="0.5"
					/>
				))}
				{cubes.map((cube, index) => (
					<g
						key={cube.x}
						className={`${orders[index]} ${cubeVariants} ${variantLoop}`}
					>
						<polygon
							points={hexagon(cube.x, cube.y)}
							strokeOpacity={cube.outline}
							strokeWidth="0.75"
							strokeLinejoin="round"
						/>
						<path
							d={`M${cube.x} ${cube.y}l-21 -12M${cube.x} ${cube.y}l21 -12M${cube.x} ${cube.y}v24`}
							strokeOpacity={cube.edges}
							strokeWidth="0.5"
						/>
					</g>
				))}
				<path
					className={`[--esi-n:3] in-data-loop:[--esi-march:esi-march] ${cubeVariants} motion-safe:[animation:var(--esi-loop,none)_3.6s_cubic-bezier(0.77,0,0.175,1)_calc(var(--esi-step,0ms)*var(--esi-n))_infinite,var(--esi-march,none)_3.2s_linear_infinite]`}
					d="M148 22 L155 26 L148 30 L141 26 Z"
					strokeOpacity="0.18"
					strokeWidth="0.5"
					strokeDasharray="2 2"
				/>
				{dots.map((dot, index) => (
					<circle
						className={`${orders[index]} motion-safe:in-data-loop:animate-[esi-dot_2.7s_cubic-bezier(0.77,0,0.175,1)_calc(var(--esi-n)*900ms)_infinite]`}
						key={`${dot.cx}-${dot.cy}`}
						cx={dot.cx}
						cy={dot.cy}
						r="1.5"
						fill="currentColor"
						stroke="none"
						opacity={dot.opacity}
					/>
				))}
			</svg>
		</div>
	)
}

export type IconStackProps = IllustrationProps & {
	icon?: ReactNode
}

export function IconStack({
	icon,
	loop = false,
	className = '',
	...props
}: IconStackProps) {
	return (
		<div
			{...props}
			className={`relative h-24 w-22 text-current ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 72 81"
				fill="none"
				className="size-full overflow-visible"
			>
				<style>{keyframes}</style>
				<ellipse
					className="fill-current blur-[4px] [fill-opacity:0.055]"
					cx="36"
					cy="76"
					rx="30"
					ry="7"
				/>
				{layers.map(layer => (
					<g
						key={layer.x}
						className={`${layer.order} ${stackLoop}`}
						opacity={layer.opacity}
						transform={`translate(${layer.x} ${layer.y})`}
						stroke="currentColor"
						strokeOpacity={layer.strokeOpacity}
						strokeWidth="0.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path
							className="fill-(--es-surface)"
							d={layerOutline}
						/>
						<path className="fill-(--es-surface)" d={layerFace} />
					</g>
				))}
			</svg>
			{icon && (
				<div
					className={`pointer-events-none absolute top-[57%] left-[70%] flex text-(color:--es-muted) [transform:translate(-50%,-50%)_scaleX(0.9)_skewY(-26deg)] [--esi-k:1.185] [--esi-n:2] [&_svg]:size-5 ${stackLoop}`}
				>
					{icon}
				</div>
			)}
		</div>
	)
}

export function SearchIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	return (
		<div
			{...props}
			className={`${frame} ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg viewBox="0 0 160 96" fill="none" stroke="currentColor">
				<style>{keyframes}</style>
				{tileLines.map(line => (
					<line
						key={`${line.x1}-${line.x2}`}
						{...line}
						strokeOpacity="0.16"
						strokeWidth="0.5"
						strokeLinecap="round"
					/>
				))}
				<g className="motion-safe:in-data-loop:animate-[esi-scan_8s_cubic-bezier(0.65,0,0.35,1)_infinite]">
					<polygon
						className={march}
						points="80,41 94,48 80,55 66,48"
						fill="currentColor"
						fillOpacity="0.05"
						strokeOpacity="0.6"
						strokeWidth="0.75"
						strokeDasharray="2 2"
						strokeLinejoin="round"
					/>
					<circle
						cx="80"
						cy="48"
						r="17"
						fill="currentColor"
						fillOpacity="0.03"
						strokeOpacity="0.5"
						strokeWidth="0.9"
					/>
					<path
						d="M70 39.5a13 13 0 0 1 8-4.4"
						strokeOpacity="0.25"
						strokeWidth="0.75"
						strokeLinecap="round"
					/>
					<path
						d="M92.4 60.4 104 72"
						strokeOpacity="0.6"
						strokeWidth="2.2"
						strokeLinecap="round"
					/>
				</g>
			</svg>
		</div>
	)
}

export function ChartIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	return (
		<div
			{...props}
			className={`${frame} ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 160 96"
				fill="none"
				stroke="currentColor"
				strokeLinejoin="round"
			>
				<style>{keyframes}</style>
				<polygon
					points="20,43 48,29 136,73 108,87"
					strokeOpacity="0.16"
					strokeWidth="0.5"
				/>
				<path
					d="M34 36 122 80"
					strokeOpacity="0.08"
					strokeWidth="0.5"
				/>
				{columns.map(column => (
					<g key={column.x}>
						<polygon
							points={columnBase(column.x, column.y)}
							fill="currentColor"
							fillOpacity="0.07"
							strokeOpacity="0.45"
							strokeWidth="0.75"
						/>
						<path
							className={`${column.order} ${wave}`}
							d={columnOutline(column.x, column.y, column.height)}
							strokeOpacity="0.4"
							strokeWidth="0.6"
							strokeDasharray="2 2"
						/>
					</g>
				))}
			</svg>
		</div>
	)
}

export function UploadIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	return (
		<div
			{...props}
			className={`${frame} ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 160 96"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<style>{keyframes}</style>
				<polygon
					points="74,45 122,69 86,87 38,63"
					strokeOpacity="0.16"
					strokeWidth="0.5"
				/>
				<polygon
					className={march}
					points="76,52 108,68 84,80 52,64"
					strokeOpacity="0.4"
					strokeWidth="0.6"
					strokeDasharray="2 2"
				/>
				{dropGuides.map(guide => (
					<line
						key={guide.x}
						x1={guide.x}
						y1={guide.y1}
						x2={guide.x}
						y2={guide.y2}
						strokeOpacity="0.2"
						strokeWidth="0.5"
						strokeDasharray="0.5 2.5"
					/>
				))}
				<g className={lift}>
					<polygon
						points="76,20 108,36 84,48 52,32"
						fill="currentColor"
						fillOpacity="0.06"
						strokeOpacity="0.6"
						strokeWidth="0.75"
					/>
					<path
						d="M73.6 28.4 91.2 37.2M68.2 31.1 82.6 38.3"
						strokeOpacity="0.3"
						strokeWidth="1.5"
					/>
				</g>
			</svg>
		</div>
	)
}

const timeline = [
	{ y: 18, width: 58 },
	{ y: 38, width: 42 },
	{ y: 58, width: 50 },
	{ y: 78, width: 34 }
]
const signalArcs = [
	{ d: 'M61.6 57.6A26 26 0 0 1 98.4 57.6', opacity: 0.4, delay: '350ms' },
	{ d: 'M53.1 49.1A38 38 0 0 1 106.9 49.1', opacity: 0.3, delay: '700ms' },
	{ d: 'M44.6 40.6A50 50 0 0 1 115.4 40.6', opacity: 0.2, delay: '1050ms' }
]
const days = [0, 1, 2, 3, 4, 5]
	.flatMap(column => [0, 1, 2, 3].map(row => ({ column, row })))
	.filter(day => day.column !== 3 || day.row !== 1)

export function ActivityIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	return (
		<div
			{...props}
			className={`${frame} ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 160 96"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<style>{keyframes}</style>
				<path
					d="M52 8V14.5M52 21.5V34.5M52 41.5V54.5M52 61.5V74.5M52 81.5V88"
					strokeOpacity="0.25"
					strokeWidth="0.6"
				/>
				{timeline.map(event => (
					<g key={event.y}>
						<circle
							cx="52"
							cy={event.y}
							r="3.5"
							strokeOpacity="0.5"
							strokeWidth="0.75"
						/>
						<rect
							x="64"
							y={event.y - 4}
							width={event.width}
							height="8"
							rx="4"
							strokeOpacity="0.35"
							strokeWidth="0.6"
							strokeDasharray="2 2"
						/>
					</g>
				))}
				<circle
					className="motion-safe:in-data-loop:animate-[esi-travel_4s_linear_infinite]"
					cx="52"
					cy="28"
					r="1.6"
					fill="currentColor"
					fillOpacity="0.8"
					stroke="none"
				/>
			</svg>
		</div>
	)
}

export function InboxIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	return (
		<div
			{...props}
			className={`${frame} ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 160 96"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<style>{keyframes}</style>
				<path
					d="M41 51A50 50 0 0 0 57 64M103 64A50 50 0 0 0 119 51"
					strokeOpacity="0.3"
					strokeWidth="0.6"
					strokeDasharray="2 2"
				/>
				<path
					d="M32 40A56 56 0 0 0 38 50M122 50A56 56 0 0 0 128 40"
					strokeOpacity="0.18"
					strokeWidth="0.6"
					strokeDasharray="2 2"
				/>
				<circle
					cx="80"
					cy="18"
					r="1.5"
					fill="currentColor"
					fillOpacity="0.6"
					stroke="none"
				/>
				<g className="origin-[80px_18px] motion-safe:in-data-loop:animate-[esi-ring_3.6s_ease-in-out_infinite]">
					<path
						d="M80 18V33"
						strokeOpacity="0.5"
						strokeWidth="0.75"
					/>
					<path
						d="M63 62c4-3 6-8 6-18a11 11 0 0 1 22 0c0 10 2 15 6 18Z"
						fill="currentColor"
						fillOpacity="0.05"
						strokeOpacity="0.55"
						strokeWidth="0.75"
					/>
					<path
						d="M76 66a4 4 0 0 0 8 0"
						strokeOpacity="0.55"
						strokeWidth="0.75"
					/>
				</g>
			</svg>
		</div>
	)
}

export function CommentsIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	return (
		<div
			{...props}
			className={`${frame} ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 160 96"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<style>{keyframes}</style>
				<path
					d="M39 14h44a9 9 0 0 1 9 9v12a9 9 0 0 1-9 9H50l-9 8v-8h-2a9 9 0 0 1-9-9V23a9 9 0 0 1 9-9Z"
					fill="currentColor"
					fillOpacity="0.05"
					strokeOpacity="0.55"
					strokeWidth="0.75"
				/>
				{[0, 1, 2].map(dot => (
					<circle
						key={dot}
						className="motion-safe:in-data-loop:animate-[esi-type_1.4s_ease-in-out_infinite]"
						style={{ animationDelay: `${dot * 160}ms` }}
						cx={51 + dot * 10}
						cy="29"
						r="2"
						fill="currentColor"
						fillOpacity="0.6"
						stroke="none"
					/>
				))}
				<path
					className={march}
					d="M79 50h42a9 9 0 0 1 9 9v10a9 9 0 0 1-9 9h-2v8l-9-8H79a9 9 0 0 1-9-9V59a9 9 0 0 1 9-9Z"
					strokeOpacity="0.4"
					strokeWidth="0.6"
					strokeDasharray="2 2"
				/>
			</svg>
		</div>
	)
}

export function OfflineIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	return (
		<div
			{...props}
			className={`${frame} ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 160 96"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<style>{keyframes}</style>
				<circle
					cx="80"
					cy="76"
					r="2.5"
					fill="currentColor"
					fillOpacity="0.7"
					stroke="none"
				/>
				<path
					d="M70.1 66.1A14 14 0 0 1 89.9 66.1"
					strokeOpacity="0.6"
				/>
				{signalArcs.map(arc => (
					<path
						key={arc.d}
						className="motion-safe:in-data-loop:animate-[esi-signal_3.6s_ease-in-out_infinite]"
						style={{ animationDelay: arc.delay }}
						d={arc.d}
						strokeOpacity={arc.opacity}
						strokeWidth="0.8"
						strokeDasharray="2 2.5"
					/>
				))}
			</svg>
		</div>
	)
}

export function TrashIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	return (
		<div
			{...props}
			className={`${frame} ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 160 96"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<style>{keyframes}</style>
				<polygon
					points="72,35 98,48 72,61 46,48"
					fill="currentColor"
					fillOpacity="0.04"
					strokeOpacity="0.55"
					strokeWidth="0.75"
				/>
				<path
					d="M46 48V72L72 85L98 72V48M72 61V85"
					strokeOpacity="0.55"
					strokeWidth="0.75"
				/>
				<path d="M72 35V47" strokeOpacity="0.2" strokeWidth="0.5" />
				<polygon
					className={march}
					points="72,43 82,48 72,53 62,48"
					strokeOpacity="0.4"
					strokeWidth="0.6"
					strokeDasharray="2 2"
				/>
				<g className={lift}>
					<polygon
						points="106,8 132,21 106,34 80,21"
						fill="currentColor"
						fillOpacity="0.06"
						strokeOpacity="0.55"
						strokeWidth="0.75"
					/>
					<path
						d="M80 21V25L106 38L132 25V21M106 34V38"
						strokeOpacity="0.55"
						strokeWidth="0.75"
					/>
				</g>
			</svg>
		</div>
	)
}

export function CalendarIllustration({
	loop = false,
	className = '',
	...props
}: IllustrationProps) {
	return (
		<div
			{...props}
			className={`${frame} ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 160 96"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<style>{keyframes}</style>
				<polygon
					points="69,17.2 141.6,53.5 91,78.8 18.4,42.5"
					fill="currentColor"
					fillOpacity="0.03"
					strokeOpacity="0.4"
					strokeWidth="0.75"
				/>
				<path
					d="M18.4 42.5v4L91 82.8L141.6 57.5v-4M91 78.8v4"
					strokeOpacity="0.4"
					strokeWidth="0.75"
				/>
				{days.map(day => (
					<circle
						key={`${day.column}-${day.row}`}
						cx={69 + 11 * (day.column - day.row)}
						cy={26 + 5.5 * (day.column + day.row)}
						r="1"
						fill="currentColor"
						fillOpacity="0.3"
						stroke="none"
					/>
				))}
				<polygon
					className={march}
					points="91,44.5 98,48 91,51.5 84,48"
					strokeOpacity="0.4"
					strokeWidth="0.6"
					strokeDasharray="2 2"
				/>
				<path
					d="M84 38V48M98 38V48M91 41.5V51.5"
					strokeOpacity="0.2"
					strokeWidth="0.5"
					strokeDasharray="0.5 2"
				/>
				<polygon
					className={lift}
					points="91,34.5 98,38 91,41.5 84,38"
					fill="currentColor"
					fillOpacity="0.12"
					strokeOpacity="0.7"
					strokeWidth="0.75"
				/>
			</svg>
		</div>
	)
}

export const keyIllustrationVariants = ['keyhole', 'ring', 'matrix'] as const

export type KeyIllustrationVariant = (typeof keyIllustrationVariants)[number]

export type KeyIllustrationProps = IllustrationProps & {
	variant?: KeyIllustrationVariant
}

const keyDots = [
	'..XXXX...............',
	'.XXXXXX..............',
	'XXX..XXX.............',
	'XX....XXXXXXXXXXXXXXX',
	'XX....XXXXXXXXXXXXXXX',
	'XXX..XXX.....XX.XX.XX',
	'.XXXXXX......XX.XX..X',
	'..XXXX...............'
].flatMap((row, y) => [...row].map((dot, x) => ({ x, y, lit: dot === 'X' })))

function KeyholeKey() {
	return (
		<>
			<rect
				width="40"
				height="52"
				rx="6"
				transform="matrix(1 .5 0 1 84 3)"
				strokeOpacity="0.18"
				strokeWidth="0.5"
			/>
			<g transform="matrix(1 .5 0 1 78 6)">
				<rect
					width="40"
					height="52"
					rx="6"
					fill="currentColor"
					fillOpacity="0.05"
					strokeOpacity="0.5"
					strokeWidth="0.75"
				/>
				<path
					d="M17.2 27.2a5 5 0 1 1 5.6 0L24.5 38h-9Z"
					fill="currentColor"
					fillOpacity="0.08"
					strokeOpacity="0.6"
					strokeWidth="0.75"
				/>
			</g>
			<g
				className="motion-safe:in-data-loop:animate-[esi-insert_3.2s_cubic-bezier(0.77,0,0.175,1)_infinite]"
				transform="matrix(-1 .5 0 1 86 46)"
			>
				<path
					className={march}
					d="M30 -2.5H0V2.5H6V6H10V2.5H14V5H18V2.5H30"
					strokeOpacity="0.55"
					strokeWidth="0.7"
					strokeDasharray="2 2"
				/>
				<circle
					className={march}
					cx="40"
					cy="0"
					r="10"
					strokeOpacity="0.55"
					strokeWidth="0.7"
					strokeDasharray="2 2"
				/>
				<circle
					cx="43"
					cy="0"
					r="3.2"
					strokeOpacity="0.35"
					strokeWidth="0.6"
				/>
			</g>
		</>
	)
}

function RingKey() {
	return (
		<>
			<circle
				cx="80"
				cy="20"
				r="11"
				strokeOpacity="0.5"
				strokeWidth="0.75"
			/>
			<g className="origin-[80px_20px] motion-safe:in-data-loop:animate-[esi-swing_4s_ease-in-out_infinite]">
				<circle
					className={march}
					cx="80"
					cy="40"
					r="10"
					strokeOpacity="0.55"
					strokeWidth="0.7"
					strokeDasharray="2 2"
				/>
				<path
					className={march}
					d="M83 49.5V60H88V64H83V68H87V72H83V84L80 87L77 84V49.5"
					strokeOpacity="0.55"
					strokeWidth="0.7"
					strokeDasharray="2 2"
				/>
				<circle
					cx="80"
					cy="36"
					r="3"
					strokeOpacity="0.35"
					strokeWidth="0.6"
				/>
			</g>
		</>
	)
}

function MatrixKey() {
	return (
		<>
			{keyDots.map(dot => (
				<circle
					key={`${dot.x}-${dot.y}`}
					className={
						dot.lit
							? 'motion-safe:in-data-loop:animate-[esi-fade_2.4s_cubic-bezier(0.77,0,0.175,1)_infinite]'
							: undefined
					}
					style={{ animationDelay: `${dot.x * 90}ms` }}
					cx={20 + dot.x * 6}
					cy={27 + dot.y * 6}
					r={dot.lit ? 1.2 : 0.7}
					fill="currentColor"
					fillOpacity={dot.lit ? 0.65 : 0.14}
					stroke="none"
				/>
			))}
		</>
	)
}

export function KeyIllustration({
	variant = 'keyhole',
	loop = false,
	className = '',
	...props
}: KeyIllustrationProps) {
	return (
		<div
			{...props}
			className={`${frame} ${className}`}
			data-loop={loop === true ? 'float' : loop || undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 160 96"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<style>{keyframes}</style>
				{variant === 'keyhole' && <KeyholeKey />}
				{variant === 'ring' && <RingKey />}
				{variant === 'matrix' && <MatrixKey />}
			</svg>
		</div>
	)
}
