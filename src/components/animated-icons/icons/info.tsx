import {
	AnimatedIconFrame,
	type AnimatedIconProps,
	dotPath
} from '../icon-frame'
import './info.css'

export function AnimatedInfoIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="info" {...props}>
			<circle cx="12" cy="12" r="10" />
			<path data-part="bar" d="M12 16v-4" />
			<path data-part="dot" d={dotPath(12, 8.25)} />
		</AnimatedIconFrame>
	)
}
