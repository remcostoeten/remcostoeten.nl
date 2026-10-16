import {
	AnimatedIconFrame,
	type AnimatedIconProps,
	dotPath
} from '../icon-frame'
import './alert-circle.css'

export function AnimatedAlertCircleIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="alert-circle" {...props}>
			<circle data-part="ring" cx="12" cy="12" r="10" />
			<path data-part="bar" d="M12 8v4" />
			<path data-part="dot" d={dotPath(12, 15.75)} />
		</AnimatedIconFrame>
	)
}
