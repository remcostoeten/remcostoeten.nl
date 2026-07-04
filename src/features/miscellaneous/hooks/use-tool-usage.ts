'use client'

import { useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'

const RECENT_KEY = 'misc-tools:recent'
const MAX_RECENT = 6

export function useRecentTools() {
	const [recent, setRecent, hydrated] = useLocalStorage<string[]>(
		RECENT_KEY,
		[]
	)

	const markUsed = useCallback(
		(slug: string) => {
			setRecent(previous =>
				[slug, ...previous.filter(item => item !== slug)].slice(
					0,
					MAX_RECENT
				)
			)
		},
		[setRecent]
	)

	return { recent, markUsed, hydrated }
}
