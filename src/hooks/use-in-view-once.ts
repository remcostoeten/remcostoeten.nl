'use client'

import { useEffect, useState, type RefObject } from 'react'

/**
 * Motion-free replacement for `useInView(ref, { once: true, margin })` from
 * motion/react, so always-mounted components don't pull the motion runtime
 * into the bundle.
 */
export function useInViewOnce(ref: RefObject<Element | null>, margin: string) {
	const [inView, setInView] = useState(false)

	useEffect(() => {
		if (inView || !ref.current) return

		const observer = new IntersectionObserver(
			entries => {
				if (entries.some(entry => entry.isIntersecting)) {
					setInView(true)
					observer.disconnect()
				}
			},
			{ rootMargin: margin }
		)
		observer.observe(ref.current)
		return () => observer.disconnect()
	}, [inView, ref, margin])

	return inView
}
