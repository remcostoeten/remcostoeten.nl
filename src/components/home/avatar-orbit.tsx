'use client'

import * as m from 'motion/react-m'
import { useReducedMotion, useScroll, useTransform } from 'motion/react'
import React from 'react'

export function AvatarOrbit() {
	const shouldReduceMotion = useReducedMotion()
	const maskId = React.useId()
	const { scrollY } = useScroll()
	const rotate = useTransform(scrollY, value => value * 0.25)

	return (
		<m.svg
			className="pointer-events-none absolute -inset-1.5 overflow-visible"
			viewBox="0 0 68 68"
			fill="none"
			style={shouldReduceMotion ? undefined : { rotate }}
			aria-hidden="true"
		>
			<mask id={maskId} maskUnits="userSpaceOnUse">
				<m.circle
					cx={34}
					cy={34}
					r={33.5}
					stroke="white"
					strokeWidth={3}
					initial={shouldReduceMotion ? false : { pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
				/>
			</mask>
			<circle
				cx={34}
				cy={34}
				r={33.5}
				mask={`url(#${maskId})`}
				className="stroke-border"
				strokeWidth={1}
				strokeDasharray="2 3"
			/>
			<m.circle
				cx={67.5}
				cy={34}
				r={1.5}
				className="fill-foreground/50"
				initial={shouldReduceMotion ? false : { opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1, duration: 0.3 }}
			/>
		</m.svg>
	)
}
