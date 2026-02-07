'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function DebounceDemo() {
	const [value, setValue] = useState('')
	const [debouncedValue, setDebouncedValue] = useState('')

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const newValue = e.target.value
		setValue(newValue)
		setTimeout(function updateDebounced() {
			setDebouncedValue(newValue)
		}, 500)
	}

	return (
		<div className="p-6 space-y-3">
			<input
				type="text"
				value={value}
				onChange={handleChange}
				placeholder="Type something..."
				className={cn(
					'w-full px-3 py-2 text-sm bg-transparent',
					'border border-border/50 focus:border-border',
					'outline-none placeholder:text-muted-foreground/40'
				)}
			/>
			<div className="flex justify-between text-xs">
				<span className="text-muted-foreground/50">Debounced:</span>
				<span className="text-muted-foreground font-mono">
					{debouncedValue || '—'}
				</span>
			</div>
		</div>
	)
}
