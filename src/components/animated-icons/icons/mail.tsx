import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './mail.css'

export function AnimatedMailIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="mail" {...props}>
			<rect
				data-part="body"
				x="2.5"
				y="4.5"
				width="19"
				height="15"
				rx="3"
			/>
			<path
				data-part="flap"
				d="m3 7 7.47 5.13a2.7 2.7 0 0 0 3.06 0L21 7"
			/>
		</AnimatedIconFrame>
	)
}
