import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './close.css'

export function AnimatedCloseIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="close" {...props}>
			<g data-part="cross">
				<path d="M18 6L6 18" />
				<path d="M18 18L6 6" />
			</g>
		</AnimatedIconFrame>
	)
}
