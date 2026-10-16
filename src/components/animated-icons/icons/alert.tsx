import {
	AnimatedIconFrame,
	type AnimatedIconProps,
	dotPath
} from '../icon-frame'
import './alert.css'

export function AnimatedAlertIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="alert" {...props}>
			<path
				data-part="triangle"
				d="M13.925 21h-3.85c-4.63 0-6.945 0-7.799-1.506c-.853-1.506.331-3.503 2.7-7.496l1.925-3.245C9.176 4.918 10.313 3 12 3s2.824 1.918 5.1 5.753l1.924 3.245c2.369 3.993 3.553 5.99 2.7 7.496C20.87 21 18.555 21 13.925 21Z"
			/>
			<g data-part="mark">
				<path d="M12 9v4" />
				<path d={dotPath(12, 16.75)} />
			</g>
		</AnimatedIconFrame>
	)
}
