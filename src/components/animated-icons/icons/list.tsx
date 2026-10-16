import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './list.css'

export function AnimatedListIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="list" {...props}>
			<g data-part="rows" data-stagger="">
				<path d="M8 6h12M4 6h.01" />
				<path d="M8 12h12M4 12h.01" />
				<path d="M8 18h12M4 18h.01" />
			</g>
		</AnimatedIconFrame>
	)
}
