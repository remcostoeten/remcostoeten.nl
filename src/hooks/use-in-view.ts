'use client'

import { useEffect, useState, type RefObject } from 'react'

/**
 * @name useInView
 * @description Tracks whether an element is currently inside the viewport,
 * unlike `useInViewOnce`, which latches after the first intersection.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null)
 * const inView = useInView(ref, '200px')
 */
export function useInView(ref: RefObject<Element | null>, margin: string) {
	const [inView, setInView] = useState(false)

	useEffect(() => {
		const node = ref.current
		if (!node) return

		const observer = new IntersectionObserver(
			([entry]) => setInView(entry.isIntersecting),
			{ rootMargin: margin }
		)
		observer.observe(node)
		return () => observer.disconnect()
	}, [ref, margin])

	return inView
}
