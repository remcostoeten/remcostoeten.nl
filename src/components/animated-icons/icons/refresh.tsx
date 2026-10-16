import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './refresh.css'

export function AnimatedRefreshIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="refresh" {...props}>
			<g data-part="loop">
				<path d="M16.5 8H18c1.414 0 2.121 0 2.56-.44C21 7.121 21 6.414 21 5V3.5" />
				<path d="M3 12a9 9 0 0 1 9-9c3.571 0 6.095 1.73 8 4.083M21 12a9 9 0 0 1-9 9c-3.571 0-6.095-1.73-8-4.084" />
				<path d="M7.5 16H6c-1.414 0-2.121 0-2.56.44C3 16.877 3 17.584 3 19v1.5" />
			</g>
		</AnimatedIconFrame>
	)
}
