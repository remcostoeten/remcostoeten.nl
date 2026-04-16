'use client'

import { useEffect } from 'react'

export function ThemeInitializer() {
	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		const systemDark = window.matchMedia(
			'(prefers-color-scheme: dark)'
		).matches
		if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [])

	return null
}