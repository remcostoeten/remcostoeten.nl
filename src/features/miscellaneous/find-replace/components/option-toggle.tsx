'use client'

import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = {
	pressed: boolean
	label: string
	hint: string
	onToggle: () => void
	children: ReactNode
	disabled?: boolean
}

export function OptionToggle({
	pressed,
	label,
	hint,
	onToggle,
	children,
	disabled = false
}: Props) {
	return (
		<button
			type="button"
			aria-pressed={pressed}
			aria-label={label}
			title={hint}
			disabled={disabled}
			onClick={onToggle}
			className={cn(
				'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40',
				pressed
					? 'border-border bg-accent text-accent-foreground'
					: 'border-border/50 text-muted-foreground hover:text-foreground'
			)}
		>
			{children}
		</button>
	)
}
