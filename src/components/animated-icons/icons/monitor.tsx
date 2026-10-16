import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './monitor.css'

export function AnimatedMonitorIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="monitor" {...props}>
			<rect
				data-part="screen"
				x="3"
				y="4"
				width="18"
				height="12.5"
				rx="2.5"
			/>
			<path data-part="stand" d="M12 16.5V20M8.5 20h7" />
		</AnimatedIconFrame>
	)
}
