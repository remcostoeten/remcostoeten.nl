'use client'

import nextDynamic from 'next/dynamic'
import { ActivitySectionSkeleton } from '@/components/ui/skeletons/section-skeletons'

export const ActivitySectionClient = nextDynamic(
	() =>
		import('@/components/landing/activity/section').then(m => ({
			default: m.ActivitySection
		})),
	{ loading: () => <ActivitySectionSkeleton />, ssr: false }
)
