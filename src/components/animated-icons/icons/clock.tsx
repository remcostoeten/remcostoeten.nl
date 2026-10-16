import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './clock.css'

export function AnimatedClockIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="clock" {...props}>
			<circle cx="12" cy="12" r="10" />
			<path data-part="hand-long" d="M12 8v4" />
			<path data-part="hand-short" d="M12 12l2 2" />
		</AnimatedIconFrame>
	)
}
