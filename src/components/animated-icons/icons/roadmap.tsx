import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './roadmap.css'

export function AnimatedRoadmapIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="roadmap" {...props}>
			<path d="M3 3v18" />
			<g data-part="bars" data-stagger="">
				<path d="M7 6.5h6" />
				<path d="M10 12h10" />
				<path d="M7 17.5h8" />
			</g>
		</AnimatedIconFrame>
	)
}
