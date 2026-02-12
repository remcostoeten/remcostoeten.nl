'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

type DeferredRenderProps = {
	children: ReactNode
	fallback: ReactNode
	rootMargin?: string
	className?: string
}

export function DeferredRender({
	children,
	fallback,
	rootMargin = '400px 0px',
	className
}: DeferredRenderProps) {
	const [isVisible, setIsVisible] = useState(false)
	const anchorRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (isVisible) return
		const target = anchorRef.current
		if (!target) return
		if (typeof IntersectionObserver === 'undefined') {
			setIsVisible(true)
			return
		}

		const observer = new IntersectionObserver(
			entries => {
				if (entries.some(entry => entry.isIntersecting)) {
					setIsVisible(true)
					observer.disconnect()
				}
			},
			{ rootMargin }
		)

		observer.observe(target)
		return () => observer.disconnect()
	}, [isVisible, rootMargin])

	return (
		<div ref={anchorRef} className={className}>
			{isVisible ? children : fallback}
		</div>
	)
}
