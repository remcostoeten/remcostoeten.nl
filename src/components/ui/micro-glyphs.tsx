import { cn } from '@/shared/lib/cn'

export function DrawArrow({ className }: { className?: string }) {
	return (
		<svg
			className={cn(
				'size-3 shrink-0 overflow-visible transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none',
				className
			)}
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.25}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path
				d="M11 6 H1"
				pathLength={1}
				className="[stroke-dasharray:1] [stroke-dashoffset:0.45] transition-[stroke-dashoffset] duration-300 ease-out group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0] motion-reduce:transition-none"
			/>
			<path d="M7 2 L11 6 L7 10" />
		</svg>
	)
}

export function ToggleGlyph({
	isOpen,
	className
}: {
	isOpen: boolean
	className?: string
}) {
	return (
		<svg
			className={cn(
				'size-2.5 shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none',
				isOpen && 'rotate-180',
				className
			)}
			viewBox="0 0 10 10"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.25}
			strokeLinecap="round"
			aria-hidden="true"
		>
			<path d="M1 5 H9" />
			<path
				d="M5 1 V9"
				className={cn(
					'origin-center transition-transform duration-300 ease-out [transform-box:fill-box] motion-reduce:transition-none',
					isOpen && 'scale-y-0'
				)}
			/>
		</svg>
	)
}
