import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './user.css'

export function AnimatedUserIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="user" {...props}>
			<path
				data-part="body"
				d="M20 21a7.53 7.53 0 0 0-7.005-6.934L12 14q-.531.015-1 .038c-3.7.181-6.716 3.268-7 6.962"
			/>
			<circle data-part="head" cx="12" cy="7" r="4" />
		</AnimatedIconFrame>
	)
}
