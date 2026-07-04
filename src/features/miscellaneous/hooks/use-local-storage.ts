'use client'

import { useCallback, useEffect, useState } from 'react'

type TSetValue<T> = (value: T | ((previous: T) => T)) => void

/**
 * SSR-safe persisted state. Reads from localStorage after mount and writes
 * synchronously on every update. The third tuple member reports hydration so
 * consumers can avoid flashing default state.
 */
export function useLocalStorage<T>(
	key: string,
	initialValue: T
): [T, TSetValue<T>, boolean] {
	const [value, setValue] = useState<T>(initialValue)
	const [hydrated, setHydrated] = useState(false)

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(key)
			if (stored !== null) setValue(JSON.parse(stored) as T)
		} catch (error) {
			console.warn(`Could not read localStorage key "${key}"`, error)
		}
		setHydrated(true)
	}, [key])

	const set = useCallback<TSetValue<T>>(
		update => {
			setValue(previous => {
				const next =
					typeof update === 'function'
						? (update as (p: T) => T)(previous)
						: update
				try {
					window.localStorage.setItem(key, JSON.stringify(next))
				} catch (error) {
					console.warn(
						`Could not write localStorage key "${key}"`,
						error
					)
				}
				return next
			})
		},
		[key]
	)

	return [value, set, hydrated]
}
