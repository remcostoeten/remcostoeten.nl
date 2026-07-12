'use client'

import { cn } from '@/shared/lib/cn'

type TSegmentedOption<TValue extends string> = {
	value: TValue
	label: string
	hint: string
}

type Props<TValue extends string> = {
	label: string
	value: TValue
	options: readonly TSegmentedOption<TValue>[]
	onChange: (value: TValue) => void
}

export function Segmented<TValue extends string>({
	label,
	value,
	options,
	onChange
}: Props<TValue>) {
	return (
		<div
			role="group"
			aria-label={label}
			className="inline-flex items-center rounded-md border border-border/50 p-0.5"
		>
			{options.map(option => (
				<button
					key={option.value}
					type="button"
					aria-pressed={option.value === value}
					title={option.hint}
					onClick={() => onChange(option.value)}
					className={cn(
						'h-7 rounded-[5px] px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
						option.value === value
							? 'bg-accent text-accent-foreground'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					{option.label}
				</button>
			))}
		</div>
	)
}

type TChipProps = {
	pressed: boolean
	label: string
	hint: string
	onToggle: () => void
}

export function ToggleChip({ pressed, label, hint, onToggle }: TChipProps) {
	return (
		<button
			type="button"
			aria-pressed={pressed}
			title={hint}
			onClick={onToggle}
			className={cn(
				'inline-flex h-7 items-center rounded-md border px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
				pressed
					? 'border-border bg-accent text-accent-foreground'
					: 'border-border/50 text-muted-foreground hover:text-foreground'
			)}
		>
			{label}
		</button>
	)
}
