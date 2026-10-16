import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './board.css'

export function AnimatedBoardIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="board" {...props}>
			<g data-part="columns" data-stagger="">
				<rect x="3" y="4" width="5" height="16" rx="1.5" />
				<rect x="9.5" y="4" width="5" height="11" rx="1.5" />
				<rect x="16" y="4" width="5" height="13.5" rx="1.5" />
			</g>
		</AnimatedIconFrame>
	)
}
