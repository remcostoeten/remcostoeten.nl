import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './arrow-right.css'

export function AnimatedArrowRightIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="arrow-right" {...props}>
			<path data-part="shaft" strokeDasharray="13.5 20" d="M5 12H21.5" />
			<path data-part="head" d="M13 18s6-4.419 6-6s-6-6-6-6" />
		</AnimatedIconFrame>
	)
}
