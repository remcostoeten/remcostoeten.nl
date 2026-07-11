'use client'

import { useEffect, useState } from 'react'

const FALLBACK_YEAR = 2026

export function useCurrentYear() {
	const [year, setYear] = useState(FALLBACK_YEAR)

	useEffect(() => {
		setYear(new Date().getFullYear())
	}, [])

	return year
}
