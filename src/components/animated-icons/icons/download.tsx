import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './download.css'

export function AnimatedDownloadIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="download" {...props}>
			<path data-part="arrow" d="M12 3.5v11M8 10.5l4 4l4-4" />
			<path
				data-part="tray"
				d="M4 15v2.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V15"
			/>
		</AnimatedIconFrame>
	)
}
