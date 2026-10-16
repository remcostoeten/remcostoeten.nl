import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './dashboard.css'

export function AnimatedDashboardIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="dashboard" {...props}>
			<g data-part="tiles" data-stagger="">
				<rect x="3" y="3" width="8" height="10" rx="2" />
				<rect x="13" y="3" width="8" height="6" rx="2" />
				<rect x="3" y="15" width="8" height="6" rx="2" />
				<rect x="13" y="11" width="8" height="10" rx="2" />
			</g>
		</AnimatedIconFrame>
	)
}
