'use client'

import { useEffect, useState } from 'react'

/**
 * Motion-free replacement for `useReducedMotion` from motion/react, so
 * always-mounted components don't pull the motion runtime into the bundle.
 */
export function useReducedMotion() {
	const [reduced, setReduced] = useState(false)

	useEffect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)')
		setReduced(query.matches)
		const onChange = (event: MediaQueryListEvent) =>
			setReduced(event.matches)
		query.addEventListener('change', onChange)
		return () => query.removeEventListener('change', onChange)
	}, [])

	return reduced
}
