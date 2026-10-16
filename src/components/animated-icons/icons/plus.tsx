import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './plus.css'

export function AnimatedPlusIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="plus" {...props}>
			<g data-part="cross">
				<path d="M12.001 5v14.002" />
				<path d="M19.002 12.002H5" />
			</g>
		</AnimatedIconFrame>
	)
}
