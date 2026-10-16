import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './filter.css'

export function AnimatedFilterIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="filter" {...props}>
			<path
				data-part="track-top-start"
				strokeDasharray="3 18"
				d="M3 7H21"
			/>
			<path
				data-part="track-top-end"
				strokeDasharray="6 18"
				d="M21 7H3"
			/>
			<path
				data-part="track-bottom-start"
				strokeDasharray="6 18"
				d="M3 17H21"
			/>
			<path
				data-part="track-bottom-end"
				strokeDasharray="3 18"
				d="M21 17H3"
			/>
			<path
				data-part="knob-top"
				strokeLinecap="butt"
				strokeLinejoin="miter"
				d="M6 7c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C7.602 4 8.068 4 9 4s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C12 5.602 12 6.068 12 7s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C10.398 10 9.932 10 9 10s-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C6 8.398 6 7.932 6 7Z"
			/>
			<path
				data-part="knob-bottom"
				strokeLinecap="butt"
				strokeLinejoin="miter"
				d="M12 17c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C13.602 14 14.068 14 15 14s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C18 15.602 18 16.068 18 17s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C16.398 20 15.932 20 15 20s-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C12 18.398 12 17.932 12 17Z"
			/>
		</AnimatedIconFrame>
	)
}
