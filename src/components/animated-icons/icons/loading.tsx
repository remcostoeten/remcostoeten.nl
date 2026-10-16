import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './loading.css'

export function AnimatedLoadingIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="loading" {...props}>
			<g data-part="spokes">
				<path d="M12 3v3" />
				<path d="M18.364 5.637l-2.122 2.121" strokeOpacity={0.22} />
				<path d="M21 12h-3" strokeOpacity={0.3} />
				<path d="M18.364 18.364l-2.122-2.122" strokeOpacity={0.4} />
				<path d="M12 18v3" strokeOpacity={0.52} />
				<path d="M7.758 16.242l-2.121 2.122" strokeOpacity={0.64} />
				<path d="M6 12H3" strokeOpacity={0.76} />
				<path d="M7.758 7.758L5.637 5.637" strokeOpacity={0.88} />
			</g>
		</AnimatedIconFrame>
	)
}
