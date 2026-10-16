import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './more.css'

export function AnimatedMoreIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="more" {...props}>
			<g data-part="dots" data-stagger="">
				<path d="M6.004 12.5V12M7.004 12.5a1 1 0 1 0-2 0a1 1 0 0 0 2 0" />
				<path d="M12.004 12.5V12M13.004 12.5a1 1 0 1 0-2 0a1 1 0 0 0 2 0" />
				<path d="M18.004 12.5V12M19.004 12.5a1 1 0 1 0-2 0a1 1 0 0 0 2 0" />
			</g>
		</AnimatedIconFrame>
	)
}
