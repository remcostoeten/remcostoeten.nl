import {
	AnimatedIconFrame,
	type AnimatedIconProps,
	dotPath
} from '../icon-frame'
import './comment.css'

export function AnimatedCommentIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="comment" {...props}>
			<path
				data-part="bubble"
				d="M21.5 12a9.5 9.5 0 0 1-9.5 9.5c-1.628 0-3.16-.41-4.5-1.131c-1.868-1.007-3.125-.071-4.234.097a.53.53 0 0 1-.456-.156a.64.64 0 0 1-.117-.703c.436-1.025.835-2.969.29-4.607a9.5 9.5 0 0 1-.483-3a9.5 9.5 0 1 1 19 0"
			/>
			<g data-part="dots" data-stagger="">
				<path d={dotPath(8, 12)} />
				<path d={dotPath(12, 12)} />
				<path d={dotPath(16, 12)} />
			</g>
		</AnimatedIconFrame>
	)
}
