import { AnimatedIconFrame, type AnimatedIconProps } from '../icon-frame'
import './heart.css'

const heartPath =
	'M19.463 3.994c-2.682-1.645-5.023-.982-6.429.074c-.576.433-.864.65-1.034.65s-.458-.217-1.034-.65C9.56 3.012 7.219 2.349 4.537 3.994C1.018 6.153.222 13.274 8.34 19.284C9.886 20.427 10.659 21 12 21s2.114-.572 3.66-1.717c8.118-6.008 7.322-13.13 3.803-15.289'

type Props = AnimatedIconProps & {
	filled?: boolean
}

export function AnimatedHeartIcon({ filled = false, ...props }: Props) {
	return (
		<AnimatedIconFrame
			name="heart"
			data-filled={filled ? '' : undefined}
			{...props}
		>
			<g data-part="heart">
				<path data-part="fill" d={heartPath} />
				<path d={heartPath} />
			</g>
		</AnimatedIconFrame>
	)
}
