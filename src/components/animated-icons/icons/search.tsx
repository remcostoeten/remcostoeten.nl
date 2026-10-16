import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './search.css'

export function AnimatedSearchIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="search" {...props}>
			<g data-part="glass">
				<path data-part="handle" pathLength={1} d="M17 17l4 4" />
				<path d="M19 11a8 8 0 1 0-16 0a8 8 0 0 0 16 0" />
			</g>
		</AnimatedIconFrame>
	)
}
