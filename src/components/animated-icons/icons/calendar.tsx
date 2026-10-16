import {
	AnimatedIconFrame,
	type AnimatedIconProps,
	dotPath
} from '../icon-frame'
import './calendar.css'

export function AnimatedCalendarIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="calendar" {...props}>
			<path d="M13 4h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172S21 17.771 21 14v-2c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4M3 10h18" />
			<g data-stagger="">
				<path data-part="ring" d="M8 2v4" />
				<path data-part="ring" d="M16 2v4" />
			</g>
			<g data-part="days" data-stagger="">
				<path d={dotPath(7.5, 14)} />
				<path d={dotPath(12, 14)} />
				<path d={dotPath(16.5, 14)} />
				<path d={dotPath(7.5, 18)} />
				<path d={dotPath(12, 18)} />
			</g>
		</AnimatedIconFrame>
	)
}
