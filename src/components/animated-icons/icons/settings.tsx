import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './settings.css'

export function AnimatedSettingsIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="settings" {...props}>
			<path d="M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z" />
			<path data-part="track-left" strokeDasharray="7 20" d="M8.5 7v7" />
			<path
				data-part="track-right"
				strokeDasharray="7 20"
				d="M15.5 17v-7"
			/>
			<circle data-part="knob-left" cx="8.5" cy="15.5" r="1.5" />
			<circle data-part="knob-right" cx="15.5" cy="8.5" r="1.5" />
		</AnimatedIconFrame>
	)
}
