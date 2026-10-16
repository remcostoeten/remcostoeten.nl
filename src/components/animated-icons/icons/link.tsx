import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './link.css'

export function AnimatedLinkIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="link" {...props}>
			<path
				data-part="link-start"
				d="m9.143 10.691l.207-.207a5.067 5.067 0 1 1 7.166 7.166l-2.866 2.866a5.067 5.067 0 1 1-7.166-7.166l.464-.464"
			/>
			<path
				data-part="link-end"
				d="m17.052 11.114l.464-.464a5.067 5.067 0 1 0-7.166-7.166L7.484 6.35a5.067 5.067 0 1 0 7.166 7.166l.207-.207"
			/>
		</AnimatedIconFrame>
	)
}
