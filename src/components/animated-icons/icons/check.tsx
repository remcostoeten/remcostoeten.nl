import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './check.css'

export function AnimatedCheckIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="check" {...props}>
			<path data-part="tick" d="m5 14l3.5 3.5L19 6.5" />
		</AnimatedIconFrame>
	)
}
