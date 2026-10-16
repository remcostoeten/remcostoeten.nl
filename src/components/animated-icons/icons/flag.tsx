import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './flag.css'

export function AnimatedFlagIcon(props: AnimatedIconProps) {
	return (
		<AnimatedIconFrame name="flag" {...props}>
			<path d="M4 7v14" />
			<path
				data-part="cloth"
				d="M11.758 3.909c-3.306-1.684-5.907-.698-7.204.31c-.234.182-.35.273-.452.48C4 4.909 4 5.102 4 5.49v9.243c.97-1.098 3.879-2.8 7.758-.823c3.466 1.765 6.416 1.033 7.812.27c.193-.105.29-.158.36-.276s.07-.246.07-.502V5.874c0-.829 0-1.243-.197-1.393c-.198-.15-.66-.022-1.583.234c-1.58.438-3.878.51-6.462-.806"
			/>
		</AnimatedIconFrame>
	)
}
