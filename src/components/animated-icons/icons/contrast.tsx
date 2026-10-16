import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './contrast.css'

export function AnimatedContrastIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="contrast" {...props}>
			<circle data-part="ring" cx="12" cy="12" r="9" />
			<path
				data-part="half"
				d="M12 3a9 9 0 0 1 0 18z"
				fill="currentColor"
				stroke="none"
			/>
		</AnimatedIconFrame>
	)
}
