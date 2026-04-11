type Props = {
	children?: React.ReactNode
	glowColor?: string
	glowSize?: string
}

export function OuterAuthGlow({
	children,
	glowColor = 'rgba(78, 201, 176, 0.22)',
	glowSize = '12px'
}: Props) {
	return (
		<span
			className="fixed inset-0 overflow-hidden pointer-events-none z-[9998]"
			style={{
				boxShadow: `inset 0 0 ${glowSize} ${glowColor}`
			}}
		>
			{children}
		</span>
	)
}
