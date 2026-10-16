import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './attachment.css'

export function AnimatedAttachmentIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="attachment" {...props}>
			<path
				data-part="clip"
				d="M5.823 12L4.28 10.456a4.367 4.367 0 1 1 6.177-6.177l9.265 9.265a4.368 4.368 0 0 1-6.177 6.177l-3.474-3.475a2.73 2.73 0 0 1 3.86-3.86l1.93 1.93"
			/>
		</AnimatedIconFrame>
	)
}
