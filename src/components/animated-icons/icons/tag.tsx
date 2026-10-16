import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './tag.css'

export function AnimatedTagIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="tag" {...props}>
			<g data-part="tag">
				<path
					strokeLinecap="butt"
					strokeLinejoin="miter"
					d="M2.774 11.144c-1.003 1.12-1.024 2.81-.104 4a34 34 0 0 0 6.186 6.186c1.19.92 2.88.899 4-.104a92 92 0 0 0 8.516-8.698a1.95 1.95 0 0 0 .47-1.094c.164-1.796.503-6.97-.902-8.374s-6.578-1.066-8.374-.901a1.95 1.95 0 0 0-1.094.47a92 92 0 0 0-8.698 8.515Z"
				/>
				<path d="m7 14l3 3" />
				<circle cx="17.5" cy="6.5" r="1.5" />
			</g>
		</AnimatedIconFrame>
	)
}
