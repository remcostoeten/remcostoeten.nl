'use client'

import nextDynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { ActivitySectionSkeleton } from '@/components/ui/skeletons/section-skeletons'

const ActivitySection = nextDynamic(
	() =>
		import('@/components/landing/activity/section').then(m => ({
			default: m.ActivitySection
		})),
	{ loading: () => <ActivitySectionSkeleton />, ssr: false }
)

type IntersectionLike = Pick<IntersectionObserverEntry, 'isIntersecting'>

export function shouldLoadActivitySection(entry: IntersectionLike) {
	return entry.isIntersecting
}

export function ActivitySectionClient() {
	const [shouldLoad, setShouldLoad] = useState(false)
	const sentinelRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (shouldLoad) return

		const sentinel = sentinelRef.current
		if (!sentinel) return

		if (!('IntersectionObserver' in window)) {
			setShouldLoad(true)
			return
		}

		const observer = new IntersectionObserver(
			entries => {
				if (entries.some(shouldLoadActivitySection)) {
					setShouldLoad(true)
					observer.disconnect()
				}
			},
			{ rootMargin: '100px 0px' }
		)

		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [shouldLoad])

	return (
		<div ref={sentinelRef}>
			{shouldLoad ? <ActivitySection /> : <ActivitySectionSkeleton />}
		</div>
	)
}
