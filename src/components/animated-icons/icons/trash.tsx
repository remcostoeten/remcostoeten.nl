import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './trash.css'

export function AnimatedTrashIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="trash" strokeLinejoin="miter" {...props}>
			<g data-part="bin">
				<path d="m19.5 5.5l-.62 10.025c-.158 2.561-.237 3.842-.88 4.763a4 4 0 0 1-1.2 1.128c-.957.584-2.24.584-4.806.584c-2.57 0-3.855 0-4.814-.585a4 4 0 0 1-1.2-1.13c-.642-.922-.72-2.205-.874-4.77L4.5 5.5" />
				<g data-stagger="">
					<path data-part="slot" pathLength={1} d="M9.5 16.5v-6" />
					<path data-part="slot" pathLength={1} d="M14.5 16.5v-6" />
				</g>
			</g>
			<g data-part="lid">
				<path d="M3 5.5h18" />
				<path d="M16.056 5.5l-.683-1.408c-.453-.936-.68-1.403-1.071-1.695a2 2 0 0 0-.275-.172C13.594 2 13.074 2 12.035 2c-1.066 0-1.599 0-2.04.234a2 2 0 0 0-.278.18c-.395.303-.616.788-1.058 1.757L8.053 5.5" />
			</g>
		</AnimatedIconFrame>
	)
}
