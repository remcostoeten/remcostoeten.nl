import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './sidebar.css'

export function AnimatedSidebarIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="sidebar" {...props}>
			<path d="M2.5 12c0-4.243 0-6.364 1.318-7.682S7.257 3 11.5 3h1c4.243 0 6.364 0 7.682 1.318S21.5 7.757 21.5 12s0 6.364-1.318 7.682S16.743 21 12.5 21h-1c-4.243 0-6.364 0-7.682-1.318S2.5 16.243 2.5 12" />
			<path data-part="rail" d="M9 3v18" />
		</AnimatedIconFrame>
	)
}
