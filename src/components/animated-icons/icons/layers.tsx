import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './layers.css'

export function AnimatedLayersIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="layers" {...props}>
			<g data-part="layers" data-stagger="">
				<path d="M12 3l9 4.5l-9 4.5l-9-4.5z" />
				<path d="M3 12l9 4.5l9-4.5" />
				<path d="M3 16.5L12 21l9-4.5" />
			</g>
		</AnimatedIconFrame>
	)
}
