import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './key.css'

export function AnimatedKeyIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="key" {...props}>
			<g data-part="key">
				<circle cx="7.5" cy="12" r="3.75" />
				<path d="M11.25 12H21M18 12v3M14.75 12v2.5" />
			</g>
		</AnimatedIconFrame>
	)
}
