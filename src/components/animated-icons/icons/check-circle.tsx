import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './check-circle.css'

export function AnimatedCheckCircleIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="check-circle" {...props}>
			<path
				data-part="ring"
				d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10Z"
			/>
			<path data-part="mark" pathLength={1} d="M8 12.5l2.5 2.5L16 9" />
		</AnimatedIconFrame>
	)
}
