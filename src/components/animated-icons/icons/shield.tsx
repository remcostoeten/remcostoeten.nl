import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './shield.css'

export function AnimatedShieldIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="shield" {...props}>
			<path
				data-part="shield"
				d="M12 3l7 2.8v5.7c0 4.3-3 8.3-7 9.5c-4-1.2-7-5.2-7-9.5V5.8z"
			/>
			<path data-part="mark" pathLength={1} d="M9 12l2 2l4-4" />
		</AnimatedIconFrame>
	)
}
