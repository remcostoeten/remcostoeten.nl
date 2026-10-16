import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './bell.css'

type Props = AnimatedIconProps & {
	hasNotification?: boolean
}

export function AnimatedBellIcon({ hasNotification = false, ...props }: Props) {
	return (
		<AnimatedIconFrame
			name="bell"
			data-notification={hasNotification ? '' : undefined}
			{...props}
		>
			<path
				data-part="body"
				d="M19.231 18H4.77a1.769 1.769 0 0 1-1.25-3.02l.602-.603A3 3 0 0 0 5 12.256V9.5a7 7 0 0 1 14 0v2.756a3 3 0 0 0 .879 2.121l.603.603a1.77 1.77 0 0 1-1.25 3.02"
			/>
			<path data-part="clapper" d="M15.5 18a3.5 3.5 0 1 1-7 0" />
			{hasNotification ? (
				<circle data-part="dot" cx="18.5" cy="5.5" r="3" />
			) : null}
		</AnimatedIconFrame>
	)
}
