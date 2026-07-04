import type { SVGProps } from 'react'
import './animated-icons.css'

type Props = SVGProps<SVGSVGElement> & {
	size?: number
}

function iconProps({ size = 24, className, ...rest }: Props) {
	return {
		width: size,
		height: size,
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: 2,
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
		className: className ? `ai-icon ${className}` : 'ai-icon',
		...rest,
	} as const
}

/**
 * @description Magnifier with a replace arrow inside the lens, spins on hover.
 * Animates on its own hover, or on hover of a parent with the `ai-trigger` class.
 * @example
 * ```tsx
 * <button className='ai-trigger'>
 * 	<FindReplaceIcon size={20} />
 * 	Find & replace
 * </button>
 * ```
 */
export function FindReplaceIcon(props: Props) {
	return (
		<svg {...iconProps(props)}>
			<g className='fr-magnifier'>
				<circle cx='11' cy='11' r='8' />
				<path d='m21 21-4.35-4.35' />
			</g>
			<g className='fr-arrow'>
				<path d='M7.8 11.6a3.4 3.4 0 1 1 6.4 0' />
				<path d='M12.9 10.4 14.2 11.7l1.3-1.3' />
			</g>
		</svg>
	)
}

/**
 * @description Eye with an eye-off slash that draws through on hover while the pupil hides.
 */
export function VisibilityIcon(props: Props) {
	return (
		<svg {...iconProps(props)}>
			<path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z' />
			<circle className='eye-pupil' cx='12' cy='12' r='3' />
			<path className='eye-slash' pathLength={100} d='M5 4 19.5 20' />
		</svg>
	)
}

/**
 * @description Plus over minus, the plus flips 180° while the minus contracts on hover.
 */
export function DiffIcon(props: Props) {
	return (
		<svg {...iconProps(props)}>
			<g className='diff-plus'>
				<path d='M12 4v9' />
				<path d='M7.5 8.5h9' />
			</g>
			<path className='diff-minus' d='M7.5 19.5h9' />
		</svg>
	)
}

/**
 * @description Map pin that lifts, drops with a squash, and lands with a ground ripple on hover.
 */
export function CoordinateIcon(props: Props) {
	return (
		<svg {...iconProps(props)}>
			<ellipse className='pin-ripple' cx='12' cy='21' rx='2.4' ry='0.9' />
			<g className='pin'>
				<path d='M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0Z' />
				<circle cx='12' cy='10' r='3' />
			</g>
		</svg>
	)
}

/**
 * @description Circle that retracts into its radius line, then redraws as the line sweeps 360° on hover.
 */
export function RadiusIcon(props: Props) {
	return (
		<svg {...iconProps(props)}>
			<circle className='radius-circle' pathLength={100} cx='12' cy='12' r='8' />
			<path className='radius-line' d='M12 12h7.2' />
		</svg>
	)
}
