import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './lock.css'

export function AnimatedLockIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="lock" {...props}>
			<path data-part="shackle" d="M8 10.5V7.75a4 4 0 0 1 8 0v2.75" />
			<rect
				data-part="body"
				x="4.75"
				y="10.5"
				width="14.5"
				height="10.5"
				rx="2.5"
			/>
			<path data-part="keyhole" d="M12 14.75v2" />
		</AnimatedIconFrame>
	)
}
