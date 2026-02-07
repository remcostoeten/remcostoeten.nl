'use client'

import { useState, useEffect } from 'react'

export function LocalStorageDemo() {
	const [count, setCount] = useState(0)
	const [hydrated, setHydrated] = useState(false)

	useEffect(function hydrate() {
		const stored = localStorage.getItem('demo-count')
		if (stored) setCount(parseInt(stored, 10))
		setHydrated(true)
	}, [])

	function increment() {
		const newCount = count + 1
		setCount(newCount)
		localStorage.setItem('demo-count', String(newCount))
	}

	function reset() {
		setCount(0)
		localStorage.removeItem('demo-count')
	}

	if (!hydrated) return <div className="p-6 h-[88px]" />

	return (
		<div className="p-6 space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-sm text-muted-foreground">
					Persisted count:
				</span>
				<span className="font-mono text-foreground">{count}</span>
			</div>
			<div className="flex gap-2">
				<button
					onClick={increment}
					className="px-3 py-1.5 text-xs border border-border/50 hover:bg-muted/30 transition-colors"
				>
					Increment
				</button>
				<button
					onClick={reset}
					className="px-3 py-1.5 text-xs border border-border/50 hover:bg-muted/30 transition-colors text-muted-foreground"
				>
					Reset
				</button>
			</div>
		</div>
	)
}
